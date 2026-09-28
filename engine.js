/*
 * engine.js — generic text-adventure engine (no DOM).
 *
 * Consumes a declarative game definition object and exposes a pure
 * command-in / text-out interface, so the same engine can power
 * Adventure, or any other console maze game, from a data file alone.
 *
 * Game definition shape:
 * {
 *   meta:      { title, intro, maxScore, deathMessage, noWayMessage?,
 *                darkMessage?, darkDeathMessage?, darkDeathChance?,
 *                maxCarry?, customScoring?, vocabulary?, abbreviations? },
 *
 * vocabulary lists words the game answers to outside game.verbs (anything its
 * onCommand hook handles), so the parser can complete abbreviations of them.
 * abbreviations adds game-specific shorthand to the engine's own table.
 *   startRoom: 'roomId',
 *   rooms:     { id: { name, description, dark?, exits: { dir: exit } } },
 *   items:     { id: { name, aliases?, description, location, portable?,
 *                      treasure?, points?, depositPoints?, lightSource?,
 *                      prop?, stateTexts?, alsoAt?, scenery?, hereText?,
 *                      takeMessage?, cantTake?, onTake?, onDrop? } },
 *   treasury:  'roomId',
 *   magicWords:{ word: fn(engine) },
 *   motionSynonyms: { word: exitKey },           // extra movement vocabulary
 *   specials:  { name: fn(engine, spec) },       // custom travel handlers
 *   verbs:     [ { words: [...], handler(engine, noun, words) } ],
 *   hooks:     { onEnterRoom?, onTurn?, onStart?, onDeath?, onCommand?,
 *                computeScore?, fixtureLines? }
 *
 * fixtureLines(engine) -> string[] lets a game announce non-item fixtures in
 * the room description, after the item lines.
 * }
 *
 * An exit is a room id string, a spec, or an ordered ARRAY of specs — the
 * first spec whose gates pass is taken (original Adventure "fallthrough"
 * travel). Spec fields:
 *   to        destination room id (or fn(engine) -> id)
 *   pct       percentage gate (0-100): passes pct% of the time
 *   when      list of clauses, all must hold:
 *               ['carry', itemId] | ['here', itemId] | ['propNot', id, v]
 *   if        fn(engine) -> bool (hand-written gate)
 *   msg       text printed when the spec is taken
 *   die       true: this movement kills the player
 *   special   name of a handler in game.specials (it does everything)
 *   blockedMessage / message  (legacy single-spec fields, still honored)
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AdventureEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DIRECTIONS = {
    north: 'north', n: 'north',
    south: 'south', s: 'south',
    east: 'east', e: 'east',
    west: 'west', w: 'west',
    northeast: 'northeast', ne: 'northeast',
    northwest: 'northwest', nw: 'northwest',
    southeast: 'southeast', se: 'southeast',
    southwest: 'southwest', sw: 'southwest',
    up: 'up', u: 'up',
    down: 'down', d: 'down',
    in: 'in',
    out: 'out'
  };

  const NOISE = new Set(['the', 'a', 'an', 'to', 'at', 'of', 'with', 'into', 'on', 'from', 'please', 'go', 'walk', 'run', 'move', 'travel', 'head']);

  /* Verb shorthand. Single letters can never be found by prefix search, and
     a few two-letter forms are genuinely ambiguous (EX is both EXAMINE and
     EXIT), so those are settled here by fiat. Everything else is left to
     unique-prefix matching against the game's own vocabulary. A game adds its
     own with meta.abbreviations, and an entry is only honoured if the word it
     expands to is a verb this game actually knows. */
  const VERB_ABBREV = {
    l: 'look', x: 'examine', ex: 'examine',
    t: 'take', g: 'get',
    dr: 'drop',
    i: 'inventory', inv: 'inventory',
    z: 'wait',
    q: 'quit',
    h: 'help',
    o: 'open',
    r: 'read',
    sc: 'score'
  };

  /* Verbs the engine itself answers to; the abbreviation vocabulary starts here. */
  const STANDARD_VERBS = ['look', 'examine', 'inspect', 'describe', 'take', 'get', 'grab',
    'carry', 'keep', 'catch', 'steal', 'capture', 'tote', 'pick', 'drop', 'put', 'leave',
    'discard', 'dump', 'inventory', 'score', 'wait', 'restart', 'help', 'back', 'say'];

  const ALL_WORDS = new Set(['all', 'everything', 'every']);
  const EXCEPT_WORDS = new Set(['except', 'but', 'excepting']);
  const MIN_PREFIX = 2;

  class Engine {
    constructor(game) {
      this.game = game;
      this.listeners = [];
      this.rng = Math.random;
      this.reset();
    }

    /* ------------------------------------------------ state */
    reset() {
      const g = this.game;
      this.state = {
        room: g.startRoom,
        prevRoom: null,
        itemLocations: {},           // itemId -> roomId | 'inventory' | 'nowhere'
        props: {},                   // itemId -> integer state (original PROP)
        seen: {},                    // itemId -> true once described/held
        flags: {},
        visited: {},                 // roomId -> true
        exitsUsed: {},               // "roomA>dir" -> roomB  (for automap)
        moves: 0,
        score: 0,
        scoredTake: {},
        scoredDeposit: {},
        dead: false,
        won: false,
        wasDark: false
      };
      for (const id in g.items) {
        this.state.itemLocations[id] = g.items[id].location;
        this.state.props[id] = g.items[id].prop || 0;
      }
      this.state.visited[g.startRoom] = true;
      if (g.hooks && g.hooks.onStart) g.hooks.onStart(this);
    }

    onOutput(fn) { this.listeners.push(fn); }
    print(text) { if (text) this.listeners.forEach(fn => fn(text)); }

    /* ------------------------------------------------ queries */
    room() { return this.game.rooms[this.state.room]; }
    flag(name) { return !!this.state.flags[name]; }
    setFlag(name, v) { this.state.flags[name] = v === undefined ? true : v; }
    item(id) { return this.game.items[id]; }
    prop(id) { return this.state.props[id]; }
    setProp(id, v) { this.state.props[id] = v; }
    itemsAt(loc) {
      return Object.keys(this.game.items).filter(id =>
        this.state.itemLocations[id] === loc ||
        (this.state.itemLocations[id] !== 'nowhere' && this.game.items[id].alsoAt === loc));
    }
    inventory() {
      return Object.keys(this.game.items).filter(id => this.state.itemLocations[id] === 'inventory');
    }
    here(itemId) {
      const loc = this.state.itemLocations[itemId];
      return loc === this.state.room || loc === 'inventory' ||
        (loc !== 'nowhere' && this.item(itemId) && this.item(itemId).alsoAt === this.state.room);
    }
    carrying(itemId) { return this.state.itemLocations[itemId] === 'inventory'; }
    moveItem(itemId, loc) { this.state.itemLocations[itemId] = loc; }

    hasLight() {
      if (!this.room().dark) return true;
      return this.inventory().concat(this.itemsAt(this.state.room))
        .some(id => this.item(id).lightSource && (this.item(id).lit || this.flag('lit:' + id)));
    }

    /* ------------------------------------------------ scoring */
    addScore(points) { if (points) this.state.score += points; }

    checkTreasure(itemId) {
      if (this.game.meta.customScoring) return;
      const it = this.item(itemId);
      if (!it.treasure) return;
      if (this.carrying(itemId) && !this.state.scoredTake[itemId]) {
        this.state.scoredTake[itemId] = true;
        this.addScore(it.points || 5);
      }
      const treasury = this.game.treasury;
      if (treasury && this.state.itemLocations[itemId] === treasury && !this.state.scoredDeposit[itemId]) {
        this.state.scoredDeposit[itemId] = true;
        this.addScore(it.depositPoints || 7);
        this.print('You\'ve earned points for safely depositing a treasure!');
        this.checkWin();
      }
    }

    checkWin() {
      const g = this.game;
      if (!g.treasury || g.meta.customScoring) return;
      const treasures = Object.keys(g.items).filter(id => g.items[id].treasure);
      if (treasures.every(id => this.state.itemLocations[id] === g.treasury)) {
        this.state.won = true;
        this.print(g.meta.winMessage || 'All treasures are safely stored. You\'ve won the game!');
      }
    }

    score() {
      const hooks = this.game.hooks;
      if (hooks && hooks.computeScore) return hooks.computeScore(this);
      return this.state.score;
    }

    /* Death: hand to the game's onDeath hook (reincarnation etc.) if any. */
    kill(message) {
      if (message) this.print(message);
      const hooks = this.game.hooks;
      if (hooks && hooks.onDeath) { hooks.onDeath(this); return; }
      this.die();
    }

    die(message) {
      this.state.dead = true;
      if (message) this.print(message);
      else if (this.game.meta.deathMessage) this.print(this.game.meta.deathMessage);
      this.print('*** You\'ve died. Type RESTART to try again. ***');
    }

    /* ------------------------------------------------ describing */
    describeRoom(full) {
      const r = this.room();
      if (!this.hasLight()) {
        return this.game.meta.darkMessage ||
          'It\'s pitch dark. You\'re likely to fall into a pit or worse. (Perhaps you need a source of light.)';
      }
      let out = '— ' + r.name + ' —';
      if (full || !this.state.visited[this.state.room + '#desc']) {
        out += '\n' + (typeof r.description === 'function' ? r.description(this) : r.description);
        this.state.visited[this.state.room + '#desc'] = true;
      }
      const items = this.itemsAt(this.state.room).filter(id => !this.item(id).hidden);
      for (const id of items) {
        const it = this.item(id);
        this.state.seen[id] = true;
        let line = null;
        if (typeof it.hereText === 'function') line = it.hereText(this);
        else if (it.hereText) line = it.hereText;
        else if (it.stateTexts) line = it.stateTexts[this.state.props[id]];
        else if (!it.scenery) line = 'There\'s ' + it.name + ' here.';
        if (line) out += '\n' + line;
      }
      /* Fixtures are not items, so the game announces its own: anything the
         room will answer to gets a presence line, not just what you can take. */
      const g = this.game;
      if (g.hooks && g.hooks.fixtureLines) {
        for (const line of g.hooks.fixtureLines(this)) out += '\n' + line;
      }
      return out;
    }

    /* A stock message, from meta if the game supplies one. A game may give a
       plain string, or a list to pick from — the refusals are the lines a
       player reads a hundred times, and one of them repeated is a wall. */
    metaText(key, fallback) {
      const m = this.game.meta[key];
      if (Array.isArray(m) && m.length) return m[Math.floor(this.rng() * m.length)];
      return m || fallback;
    }

    /* ------------------------------------------------ movement */
    specPasses(spec) {
      if (spec.pct !== undefined && !(this.rng() * 100 < spec.pct)) return false;
      if (spec.when) {
        for (const clause of spec.when) {
          if (clause[0] === 'carry' && !this.carrying(clause[1])) return false;
          if (clause[0] === 'here' && !this.here(clause[1])) return false;
          if (clause[0] === 'propNot' && this.prop(clause[1]) === clause[2]) return false;
        }
      }
      if (spec.if && !spec.if(this)) return false;
      return true;
    }

    resolveExit(dir) {
      const r = this.room();
      const raw = r.exits && r.exits[dir];
      if (!raw) return null;
      if (typeof raw === 'string') return [{ to: raw }];
      return Array.isArray(raw) ? raw : [raw];
    }

    go(dir) {
      const specs = this.resolveExit(dir);
      // moving while blind in the dark risks a pit
      const dark = !this.hasLight();
      if (dark && this.state.wasDark &&
        this.rng() < (this.game.meta.darkDeathChance !== undefined ? this.game.meta.darkDeathChance : 0.35)) {
        this.kill(this.game.meta.darkDeathMessage || 'You fell into a pit and broke every bone in your body!');
        return;
      }
      if (!specs) {
        this.print(this.room().noExitMessage || this.metaText('noWayMessage', 'You can\'t go that way.'));
        return;
      }
      for (const spec of specs) {
        if (!this.specPasses(spec)) continue;
        if (spec.special) {
          const fn = this.game.specials && this.game.specials[spec.special];
          if (spec.msg) this.print(spec.msg);
          if (fn) fn(this, spec);
          return;
        }
        if (spec.die) {
          this.kill(spec.msg || spec.message);
          return;
        }
        if (spec.if && !spec.to && (spec.blockedMessage || spec.msg)) {
          // legacy conditional with no destination
          this.print(spec.blockedMessage || spec.msg);
          return;
        }
        let to = spec.to;
        if (typeof to === 'function') to = to(this);
        if (!to) {                      // message-only spec: print and stay
          this.print(spec.msg || spec.message || spec.blockedMessage);
          return;
        }
        if (spec.msg || spec.message) this.print(spec.msg || spec.message);
        this.moveTo(to, dir);
        return;
      }
      // every spec's gate failed (legacy blockedMessage support)
      const blocked = specs.find(s => s.blockedMessage);
      this.print((blocked && blocked.blockedMessage) ||
        this.room().noExitMessage || this.metaText('noWayMessage', 'You can\'t go that way.'));
    }

    moveTo(to, dir) {
      const from = this.state.room;
      if (to !== from) this.state.prevRoom = from;
      this.state.room = to;
      if (dir) this.state.exitsUsed[from + '>' + dir] = to;
      this.state.visited[to] = true;
      this.state.wasDark = !this.hasLight();
      this.print(this.describeRoom(false));
      const hooks = this.game.hooks;
      if (hooks && hooks.onEnterRoom) hooks.onEnterRoom(this, to);
    }

    teleport(roomId, message) {
      if (message) this.print(message);
      this.moveTo(roomId, null);
    }

    goBack() {
      const prev = this.state.prevRoom;
      if (!prev) { this.print('Sorry, but I no longer seem to remember how it was you got here.'); return; }
      const exits = this.room().exits || {};
      for (const dir in exits) {
        const specs = this.resolveExit(dir);
        if (specs && specs.some(s => s.to === prev)) { this.go(dir); return; }
      }
      this.print('You can\'t get there from here.');
    }

    /* ------------------------------------------------ vocabulary */
    /* Every word this game will accept as a verb or a direction. Built once,
       from the engine's own verbs plus whatever the game declares, so
       abbreviation is driven by the game rather than hard-coded per title. */
    vocabulary() {
      if (this._vocab) return this._vocab;
      const g = this.game;
      const v = new Set(STANDARD_VERBS);
      for (const w of Object.keys(DIRECTIONS)) v.add(w);
      for (const w of Object.keys(g.motionSynonyms || {})) v.add(w);
      for (const def of (g.verbs || [])) for (const w of (def.words || [])) v.add(w);
      for (const w of ((g.meta && g.meta.vocabulary) || [])) v.add(w);
      this._vocab = v;
      return v;
    }

    /* Expand an abbreviation to the verb it stands for. A word the game
       already knows is never touched, and neither is a magic word — you have
       to say those in full. */
    canonicalVerb(word) {
      if (!word) return word;
      const vocab = this.vocabulary();
      if (vocab.has(word)) return word;
      if ((this.game.magicWords || {})[word]) return word;

      const table = Object.assign({}, VERB_ABBREV, (this.game.meta || {}).abbreviations || {});
      if (table[word] && vocab.has(table[word])) return table[word];

      if (word.length < MIN_PREFIX) return word;
      const matches = [];
      for (const w of vocab) if (w.length > word.length && w.startsWith(word)) matches.push(w);
      if (!matches.length) return word;
      matches.sort((a, b) => a.length - b.length);
      /* Several hits are still unambiguous when they share a common root that
         is itself a word — NORT is NORTH, not a choice between NORTHEAST and
         NORTHWEST. Anything else is a real ambiguity and is left alone. */
      return matches.every(m => m.startsWith(matches[0])) ? matches[0] : word;
    }

    /* ------------------------------------------------ item lookup */
    findItem(noun) {
      if (!noun) return null;
      const matches = [];
      for (const id in this.game.items) {
        const it = this.game.items[id];
        const names = [id.toLowerCase()].concat((it.aliases || []).map(a => a.toLowerCase()));
        if (names.includes(noun)) matches.push(id);
      }
      if (!matches.length) {
        // fall back to matching words of the display name
        for (const id in this.game.items) {
          const it = this.game.items[id];
          if (it.name && it.name.toLowerCase().replace(/^(a|an|the)\s+/, '').split(/\s+/).includes(noun)) matches.push(id);
        }
      }
      if (!matches.length) return null;
      return matches.find(id => this.here(id)) || matches[0];
    }

    /* ------------------------------------------------ standard verbs */
    /* Run fn with output diverted, and hand back what it would have printed.
       TAKE ALL needs each item's own reply so it can label the line with the
       thing it belongs to. */
    capture(fn) {
      const saved = this.listeners;
      const out = [];
      this.listeners = [t => out.push(t)];
      try { fn(); } finally { this.listeners = saved; }
      return out.join('\n');
    }

    /* Bare name, no leading article: the label at the head of a TAKE ALL line. */
    label(id) {
      const it = this.item(id);
      return (it.name || id).replace(/^(a|an|the)\s+/i, '');
    }

    /* Items in ALL: portable, actually on the floor here, not scenery, not
       hidden. Fixtures and things you cannot pick up are passed over in
       silence rather than answered one refusal at a time. */
    bulkTakeable() {
      return this.itemsAt(this.state.room).filter(id => {
        const it = this.item(id);
        return it.portable && !it.scenery && !it.hidden &&
          this.state.itemLocations[id] === this.state.room;
      });
    }

    /* ALL EXCEPT x y — the ids named after the EXCEPT. */
    exceptions(words) {
      const skip = new Set();
      const i = (words || []).findIndex(w => EXCEPT_WORDS.has(w));
      if (i < 0) return skip;
      for (const w of words.slice(i + 1)) {
        const id = this.findItem(w);
        if (id) skip.add(id);
      }
      return skip;
    }

    takeItem(id) {
      const it = this.item(id);
      if (it.onTake && it.onTake(this) === false) return false;
      if (!it.portable || (this.state.itemLocations[id] !== this.state.room)) {
        this.print(it.cantTake || this.metaText('cantTakeMessage', 'You can\'t take that.'));
        return false;
      }
      const max = this.game.meta.maxCarry;
      if (max && this.inventory().length >= max) {
        this.print(this.metaText('carryFullMessage',
          'You can\'t carry anything more. You\'ll have to drop something first.'));
        return false;
      }
      this.moveItem(id, 'inventory');
      this.state.seen[id] = true;
      this.print(it.takeMessage || 'OK');
      this.checkTreasure(id);
      return true;
    }

    doTake(noun, words) {
      if (!noun) { this.print('Take what?'); return; }
      if (ALL_WORDS.has(noun)) { this.doTakeAll(words); return; }
      const id = this.findItem(noun);
      if (id && this.carrying(id)) { this.print('You\'re already carrying it!'); return; }
      if (!id || !this.here(id)) { this.print('I see no ' + noun + ' here.'); return; }
      this.takeItem(id);
    }

    doTakeAll(words) {
      if (!this.hasLight()) {
        this.print(this.game.meta.darkMessage ||
          'It\'s pitch dark. You\'re likely to fall into a pit or worse. (Perhaps you need a source of light.)');
        return;
      }
      const skip = this.exceptions(words);
      const here = this.bulkTakeable().filter(id => !skip.has(id));
      if (!here.length) { this.print('There\'s nothing here to take.'); return; }
      const max = this.game.meta.maxCarry;
      const lines = [];
      for (const id of here) {
        if (max && this.inventory().length >= max) {
          lines.push(this.metaText('carryFullMessage',
            'You can\'t carry anything more. You\'ll have to drop something first.'));
          break;
        }
        const said = this.capture(() => this.takeItem(id));
        lines.push(this.label(id) + ': ' + (said || 'Taken.'));
        if (this.state.dead || this.state.won) break;
      }
      this.print(lines.join('\n'));
    }

    dropItem(id) {
      const it = this.item(id);
      if (it.onDrop && it.onDrop(this) === false) return false;
      this.moveItem(id, this.state.room);
      this.print(it.dropMessage || 'OK');
      this.checkTreasure(id);
      return true;
    }

    doDrop(noun, words) {
      if (!noun) { this.print('Drop what?'); return; }
      if (ALL_WORDS.has(noun)) { this.doDropAll(words); return; }
      const id = this.findItem(noun);
      if (!id || !this.carrying(id)) { this.print('You aren\'t carrying it!'); return; }
      this.dropItem(id);
    }

    doDropAll(words) {
      const skip = this.exceptions(words);
      const held = this.inventory().filter(id => !skip.has(id));
      if (!held.length) { this.print('You\'re not carrying anything.'); return; }
      const lines = [];
      for (const id of held) {
        const said = this.capture(() => this.dropItem(id));
        lines.push(this.label(id) + ': ' + (said || 'Dropped.'));
        if (this.state.dead || this.state.won) break;
      }
      this.print(lines.join('\n'));
    }

    doInventory() {
      const inv = this.inventory();
      if (!inv.length) { this.print('You\'re not carrying anything.'); return; }
      this.print('You\'re currently holding the following:\n' +
        inv.map(id => '  ' + this.item(id).name).join('\n'));
      const g = this.game;
      if (g.hooks && g.hooks.onInventory) g.hooks.onInventory(this);
    }

    doExamine(noun) {
      if (!noun) { this.print(this.describeRoom(true)); return; }
      const id = this.findItem(noun);
      if (!id || !this.here(id)) { this.print('I see no ' + noun + ' here.'); return; }
      const it = this.item(id);
      let desc = typeof it.description === 'function' ? it.description(this) : it.description;
      if (!desc && it.stateTexts) desc = it.stateTexts[this.state.props[id]];
      this.print(desc || 'You see nothing special.');
    }

    doScore() {
      const max = this.game.meta.maxScore;
      const hooks = this.game.hooks;
      const score = this.score();
      this.print('Your score is ' + score + (max ? ' of a possible ' + max : '') +
        ', in ' + this.state.moves + ' moves.');
      /* A game with a rank ladder gets to name what that score makes you. */
      if (hooks && hooks.rankFor) {
        this.print('That gives you the rank of ' + hooks.rankFor(score) + '.');
      }
    }

    /* ------------------------------------------------ save / load */
    serialize() { return JSON.stringify(this.state); }

    deserialize(json) {
      const data = JSON.parse(json);
      Object.assign(this.state, data);
    }

    /* ------------------------------------------------ parser */
    parse(input) {
      const raw = String(input || '').trim().toLowerCase();
      if (!raw) return;
      if (this.state.dead || this.state.won) {
        if (raw === 'restart') { this.reset(); this.print(this.game.meta.intro); this.print(this.describeRoom(true)); return; }
        if (raw === 'score') { this.doScore(); return; }
        this.print('The game is over. Type RESTART to play again.');
        return;
      }

      this.state.moves++;

      // Noise words are dropped, except any the game declares meaningful
      // (MOVE ROCKS, WALK to a named place, and the like).
      const keep = this.game.meta.keepWords;
      const keepSet = keep ? new Set(keep) : null;
      const words = raw.split(/[\s,]+/).filter(w => !NOISE.has(w) || (keepSet && keepSet.has(w)));
      if (!words.length) { this.print('I beg your pardon?'); return; }
      /* Expand the verb in place, so game handlers and the switch below both
         see the full word however little of it was typed. */
      words[0] = this.canonicalVerb(words[0]);
      const verb = words[0];
      const noun1 = words[1] || null;

      // pending-question / interception hook gets first crack
      const hooks = this.game.hooks;
      if (hooks && hooks.onCommand && hooks.onCommand(this, words)) { this.afterTurn(); return; }

      // movement: compass words, then game motion vocabulary
      if (verb === 'back') { this.goBack(); this.afterTurn(); return; }
      const motion = DIRECTIONS[verb] || (this.game.motionSynonyms || {})[verb];
      if (motion) { this.go(motion); this.afterTurn(); return; }

      // magic words
      const magic = this.game.magicWords || {};
      if (magic[verb]) { magic[verb](this); this.afterTurn(); return; }
      if (verb === 'say' && noun1) {
        if (magic[noun1]) { magic[noun1](this); this.afterTurn(); return; }
        const m2 = DIRECTIONS[noun1] || (this.game.motionSynonyms || {})[noun1];
        if (m2) { this.go(m2); this.afterTurn(); return; }
      }

      // game-specific verbs first (they may override standard ones)
      for (const v of (this.game.verbs || [])) {
        if (v.words.includes(verb)) {
          if (v.handler(this, noun1, words) !== false) { this.afterTurn(); return; }
        }
      }

      switch (verb) {
        case 'look': case 'l': this.print(this.describeRoom(true)); break;
        case 'examine': case 'x': case 'inspect': case 'describe': this.doExamine(noun1); break;
        case 'take': case 'get': case 'grab': case 'carry': case 'keep': case 'catch': case 'steal': case 'capture': case 'tote': case 'pick':
          this.doTake(noun1 === 'up' ? words[2] : noun1, words); break;
        case 'drop': case 'put': case 'leave': case 'discard': case 'dump':
          this.doDrop(noun1 === 'down' ? words[2] : noun1, words); break;
        case 'inventory': case 'i': case 'inv': this.doInventory(); break;
        case 'score': this.doScore(); break;
        case 'wait': case 'z': this.print('Time passes...'); break;
        case 'restart': this.reset(); this.print(this.game.meta.intro); this.print(this.describeRoom(true)); break;
        case 'help': case '?':
          this.print(this.game.meta.help ||
            'Move with compass directions (N, S, E, W, NE, UP, DOWN, IN, OUT). Useful verbs: LOOK, EXAMINE, TAKE, DROP, OPEN, UNLOCK, LIGHT, INVENTORY, SCORE, SAVE, MAP. Magic words may exist...');
          break;
        default:
          this.print(this.metaText('unknownVerbMessage', 'I don\'t know how to "%s" something.')
            .replace('%s', verb));
      }
      this.afterTurn();
    }

    afterTurn() {
      const hooks = this.game.hooks;
      if (!this.state.dead && !this.state.won && hooks && hooks.onTurn) hooks.onTurn(this);
      this.state.wasDark = !this.state.dead && !this.hasLight();
      /* The classic sign-off: once it is over, one way or the other, say what
         it came to. A game whose onDeath hook reincarnates you has not ended,
         so this fires exactly once, at the real end. */
      if ((this.state.won || this.state.dead) && !this.state.signedOff) {
        this.state.signedOff = true;
        this.doScore();
      }
    }

    start() {
      this.print(this.game.meta.intro);
      this.print(this.describeRoom(true));
    }
  }

  Engine.DIRECTIONS = DIRECTIONS;
  return Engine;
});

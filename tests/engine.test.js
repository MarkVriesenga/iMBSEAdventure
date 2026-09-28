/*
 * engine.test.js — iMBSE: THE ADVENTURE
 *
 * Mechanics, then a scripted route through the whole game. The route is
 * docs/WALKTHROUGH.md, minus Commander Alexander's riddles, which arrive when
 * the river feels like it and cannot be scripted.
 *
 *   node tests/engine.test.js
 */
const path = require('path');
const Engine = require(path.join(__dirname, '..', 'engine.js'));
const GAME = require(path.join(__dirname, '..', 'imbse-data.js'));
const CANON = require(path.join(__dirname, '..', 'imbse-canon.js'));

let pass = 0, fail = 0;
const ok = (cond, what) => { if (cond) pass++; else { fail++; console.log('  FAIL ' + what); } };
const eq = (a, b, what) => ok(a === b, what + '  (got ' + JSON.stringify(a) +
  ', wanted ' + JSON.stringify(b) + ')');

/* The stock refusals are lists in meta, picked from at random, so tests match
   against the configured set rather than one hardcoded phrasing. */
const oneOf = (key, line) => {
  const m = GAME.meta[key];
  return (Array.isArray(m) ? m : [m]).some(v => line.indexOf(v) !== -1);
};

/* a fresh engine with a fixed RNG, so bugs and pilots are reproducible */
function boot(seed) {
  const e = new Engine(GAME);
  let s = seed || 12345;
  e.rng = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  e.out = [];
  e.onOutput(t => e.out.push(t));
  e.start();
  e.say = function (cmd) { this.out.length = 0; this.parse(cmd); return this.out.join('\n'); };
  e.run = function (cmds) { for (const c of cmds) this.parse(c); return this; };
  return e;
}

/* ------------------------------------------------------------------ world */
console.log('\nWORLD');
{
  const rooms = CANON.rooms;
  eq(Object.keys(rooms).length, 124, '124 rooms');
  let bad = [];
  for (const [id, r] of Object.entries(rooms)) {
    if (!r.name) bad.push(id + ' has no name');
    if (!r.mapPos) bad.push(id + ' has no mapPos');
    for (const [dir, spec] of Object.entries(r.exits || {})) {
      const list = typeof spec === 'string' ? [{ to: spec }] : (Array.isArray(spec) ? spec : [spec]);
      for (const sp of list) {
        if (typeof sp.to === 'string' && !rooms[sp.to]) bad.push(id + '.' + dir + ' -> ' + sp.to);
      }
    }
  }
  ok(bad.length === 0, 'every exit resolves to a real room: ' + bad.join(', '));
  eq(CANON.HALLS.length, 7, 'seven halls');
  ok(CANON.HALLS.every(h => rooms[h.hall]), 'every hall names a real room');
  eq(new Set(CANON.HALLS.map(h => h.artifact)).size, 7, 'seven distinct artifacts');
  eq(new Set(CANON.HALLS.map(h => h.face)).size, 7, 'seven distinct faces');

  /* No two rooms may sit on the same grid cell, and none may be a cul-de-sac
     with no way back out at all. */
  const cells = {}, collide = [], stranded = [];
  for (const [id, r] of Object.entries(rooms)) {
    const key = (r.mapPos || []).join(',');
    if (cells[key]) collide.push(key + ' — ' + cells[key] + ' & ' + id);
    cells[key] = id;
    if (!Object.keys(r.exits || {}).length) stranded.push(id);
  }
  ok(collide.length === 0, 'no two rooms share a map cell: ' + collide.join(', '));
  ok(stranded.length === 0, 'every room has at least one exit: ' + stranded.join(', '));

  /* Everything the player can walk to must be walkable back from, so the
     world never swallows anybody. Specials and the freeze teleport are the
     deliberate one-way doors and are excluded by name. */
  const ONE_WAY = new Set(['integrationBay', 'acceptanceFloor', 'interfaceLedge',
    'contractShelf', 'rcAtrium', 'rcConcourse', 'boardroom', 'rcMonolith',
    'rcBalcony', 'rcWing']);
  const walk = new Set(['endOfRoad']), queue = ['endOfRoad'];
  while (queue.length) {
    const cur = queue.pop();
    for (const spec of Object.values(rooms[cur].exits || {})) {
      const list = typeof spec === 'string' ? [{ to: spec }] : (Array.isArray(spec) ? spec : [spec]);
      for (const sp of list) {
        if (typeof sp.to === 'string' && !sp.die && !walk.has(sp.to)) { walk.add(sp.to); queue.push(sp.to); }
      }
    }
  }
  const missed = Object.keys(rooms).filter(id => !walk.has(id) && !ONE_WAY.has(id));
  ok(missed.length === 0, 'every room is walkable from the road: ' + missed.join(', '));
}

/* ------------------------------------------------------- the wider platform */
console.log('\nTHE WIDER PLATFORM');
{
  /* The 26 rooms off the spine: each one is real prose with something in it
     the room will answer to, and each new passage goes both ways. */
  const PASSAGES = [
    ['shedYard', 'east', 'programBoneyard', 'west'],
    ['programBoneyard', 'north', 'antennaFarm', 'south'],
    ['antennaFarm', 'northwest', 'balloonMeadow', 'southeast'],
    ['hillInForest', 'west', 'surveyorsStake', 'east'],
    ['surveyorsStake', 'south', 'fireRoad', 'north'],
    ['fireRoad', 'east', 'forestWest', 'west'],
    ['gully', 'west', 'culvertMouth', 'east'],
    ['culvertMouth', 'northeast', 'endOfRoad', 'southwest'],
    ['ingressDeck', 'north', 'mastWalk', 'south'],
    ['companyStore', 'east', 'slaLounge', 'west'],
    ['deprecatedWing', 'west', 'archiveStacks', 'east'],
    ['clientConcourse', 'east', 'accessibilityWing', 'west'],
    ['chatParlor', 'north', 'helpDesk', 'south'],
    ['shallQuarry', 'east', 'matrixRoom', 'west'],
    ['versionCrypt', 'north', 'tagCellar', 'south'],
    ['farSide', 'west', 'patternLibrary', 'east'],
    ['promptGarden', 'south', 'promptCompost', 'north'],
    ['hallucinationGallery', 'west', 'citationWell', 'east'],
    ['warRoom', 'south', 'contingencyCloset', 'north'],
    ['groundTruthRange', 'east', 'sensorLine', 'west'],
    ['integrationBay', 'east', 'acceptanceFloor', 'west'],
    ['interfaceLedge', 'north', 'contractShelf', 'south'],
    ['titanScaffold', 'east', 'supplyChain', 'west'],
    ['orbitalRing', 'east', 'deorbitGantry', 'west'],
    ['tokenFountain', 'north', 'contextWell', 'south'],
    ['landing', 'south', 'telemetryWeir', 'north'],
    ['incidentRoom', 'east', 'postmortemArchive', 'west'],
    ['rcAtrium', 'north', 'rcConcourse', 'south'],
    ['rcBalcony', 'west', 'rcWing', 'east']
  ];
  const e = boot();
  e.state.flags.repellent = 1e9;             // bugs are weather; this is a map test
  e.moveItem('lantern', 'inventory');
  e.parse('light lantern');

  const oneWay = [];
  for (const [a, out, b, back] of PASSAGES) {
    e.state.room = a; e.parse(out);
    if (e.state.room !== b) oneWay.push(a + ' ' + out + ' reached ' + e.state.room);
    e.state.room = b; e.parse(back);
    if (e.state.room !== a) oneWay.push(b + ' ' + back + ' reached ' + e.state.room);
  }
  ok(oneWay.length === 0, 'every new passage walks both ways: ' + oneWay.join(', '));

  const NEW = [...new Set(PASSAGES.map(p => p[2]))].filter(id => id !== 'balloonMeadow' &&
    id !== 'forestWest' && id !== 'endOfRoad');
  eq(NEW.length, 26, 'twenty-six rooms off the spine');
  const thin = [], mute = [];
  for (const id of NEW) {
    const r = CANON.rooms[id];
    if (!r || String(r.description).length < 150) thin.push(id);
    e.state.room = id;
    e.out.length = 0; e.parse('look');
    if (!/There (is|are) .+ here\./.test(e.out.join('\n'))) mute.push(id);
  }
  ok(thin.length === 0, 'every new room has real prose: ' + thin.join(', '));
  ok(mute.length === 0, 'every new room announces something to examine: ' + mute.join(', '));
}

/* ------------------------------------------------------------------ items */
console.log('\nITEMS');
{
  const e = boot();
  eq(GAME.KEYSTONES.length, 7, 'seven keystone artifacts');
  eq(GAME.LESSER.length, 13, 'thirteen lesser treasures');
  const bad = GAME.TREASURES.filter(t => !GAME.items[t]);
  ok(bad.length === 0, 'every treasure is a real item: ' + bad.join(','));
  ok(GAME.items.cap, 'the store adds the blasting cap');
  eq(GAME.meta.maxCarry, 7, 'carry limit is seven');
  eq(e.state.flags.tokens, 330, 'the lantern starts with 330 tokens');
}

/* -------------------------------------------------------- abbreviated verbs */
console.log('\nSHORT FORMS');
{
  const e = boot();
  /* the fiat table: single letters and the two-letter forms that would
     otherwise be ambiguous */
  eq(e.canonicalVerb('t'), 'take', 'T is TAKE');
  eq(e.canonicalVerb('l'), 'look', 'L is LOOK');
  eq(e.canonicalVerb('i'), 'inventory', 'I is INVENTORY');
  eq(e.canonicalVerb('z'), 'wait', 'Z is WAIT');
  eq(e.canonicalVerb('q'), 'quit', 'Q is QUIT');
  eq(e.canonicalVerb('m'), 'map', 'M is MAP, from the game\'s own table');
  eq(e.canonicalVerb('ex'), 'examine', 'EX is EXAMINE, not EXIT');
  eq(e.canonicalVerb('dr'), 'drop', 'DR is DROP');

  /* anything else is an unambiguous start of a word the game knows */
  eq(e.canonicalVerb('exa'), 'examine', 'EXA completes');
  eq(e.canonicalVerb('inv'), 'inventory', 'INV completes');
  eq(e.canonicalVerb('sco'), 'score', 'SCO completes');
  eq(e.canonicalVerb('unl'), 'unlock', 'UNL completes a game verb');
  eq(e.canonicalVerb('ans'), 'answer', 'ANS completes a word only the NPCs handle');
  eq(e.canonicalVerb('nort'), 'north', 'NORT is NORTH, not a choice of NE and NW');

  /* and a real ambiguity is left alone rather than guessed at */
  eq(e.canonicalVerb('pu'), 'pu', 'PU could be PUT, PULL or PUSH');
  eq(e.canonicalVerb('pr'), 'pr', 'PR could be PRY, PRESS or PRAY');
  eq(e.canonicalVerb('sa'), 'sa', 'SA could be SAVE or SAY');

  /* words the game already knows are never rewritten */
  eq(e.canonicalVerb('n'), 'n', 'a direction stays a direction');
  eq(e.canonicalVerb('no'), 'no', 'NO is an answer, not the start of NORTH');
  eq(e.canonicalVerb('is'), 'is', 'IS is a question in Tom\'s game');
  eq(e.canonicalVerb('xyzzy'), 'xyzzy', 'magic words must be said in full');

  /* end to end, through the parser */
  e.run(['e', 'enter']);
  eq(e.say('t lantern'), 'OK', 'T LANTERN takes it');
  ok(e.carrying('lantern'), 'and it is in hand');
  ok(/hurricane lamp/.test(e.say('x lantern')), 'X LANTERN examines it');
  ok(/token lantern/.test(e.say('i')), 'I lists it');
  eq(e.say('dr lantern'), 'OK', 'DR LANTERN drops it');
  e.parse('out');
  eq(e.state.room, 'shedYard', 'and OUT still works from the shed');
}

/* ------------------------------------------------------------ TAKE/DROP ALL */
console.log('\nALL');
{
  const e = boot();
  e.run(['e', 'enter']);
  const took = e.say('take all');
  eq(e.inventory().length, 6, 'TAKE ALL empties the shed');
  ok(/token lantern: OK/.test(took), 'each thing gets its own line');
  ok(!/mug/.test(took), 'and the scenery is passed over in silence');
  eq(e.itemsAt('insideShed').length, 0, 'nothing takeable is left behind');
  eq(e.say('take all'), 'There\'s nothing here to take.', 'a second TAKE ALL finds nothing');

  e.say('drop all');
  eq(e.inventory().length, 0, 'DROP ALL puts it all back down');
  eq(e.itemsAt('insideShed').length, 6, 'back on the floor of the shed');
  eq(e.say('drop all'), 'You\'re not carrying anything.', 'and again is a no-op');

  e.say('take all except duck');
  eq(e.inventory().length, 5, 'TAKE ALL EXCEPT leaves the named thing');
  ok(!e.carrying('duck'), 'which is the duck');
  ok(e.carrying('lantern'), 'and takes everything else');

  /* the carry limit stops the sweep rather than refusing item by item */
  const f = boot();
  f.run(['e', 'enter']);
  for (const id of ['cage', 'branch', 'magazine']) f.moveItem(id, 'insideShed');
  const full = f.say('take all');
  eq(f.inventory().length, 7, 'TAKE ALL stops at the carry limit');
  eq(full.split('\n').length, 8, 'seven lines and one refusal');
  ok(oneOf('carryFullMessage', full), 'and says so once');

  /* you cannot sweep a floor you cannot see */
  const d = boot();
  d.state.room = 'deprecatedWing';
  d.moveItem('duck', 'deprecatedWing');
  ok(/pitch dark/.test(d.say('take all')), 'TAKE ALL in the dark takes nothing');
  ok(!d.carrying('duck'), 'and leaves the duck where it is');

  /* the synonyms reach it too */
  const g = boot();
  g.run(['e', 'enter']);
  g.say('pick up all');
  eq(g.inventory().length, 6, 'PICK UP ALL is the same sweep');
  g.say('drop everything');
  eq(g.inventory().length, 0, 'and DROP EVERYTHING is the same as DROP ALL');
}

/* --------------------------------------------------------------- the forest */
console.log('\nACT I — THE FOREST');
{
  const e = boot();
  e.run(['e', 'in', 'take lantern', 'take keys', 'take knife', 'take duck',
    'take thermos', 'take rations']);
  eq(e.inventory().length, 6, 'six things out of the shed');
  eq(e.say('take mug'), 'I see no mug here.', 'the mug is not takeable');
  e.run(['out', 'w', 'down', 'downstream', 'take hex key']);
  ok(e.carrying('hexKey'), 'the hex key is in the creek');
  eq(e.inventory().length, 7, 'that is seven, which is the limit');
  ok(/already carrying/.test(e.say('take duck')), 'taking what you hold is a no-op');

  e.run(['upstream', 'up', 'n', 'e']);
  eq(e.state.room, 'balloonMeadow', 'the meadow is east of the north forest');
  ok(oneOf('carryFullMessage', e.say('take certificate')), 'the eighth thing is refused');
  ok(/hisses/.test(e.say('open valve with hex key')), 'the hex bolt gives');
  e.run(['put hex key in basket', 'put thermos in basket', 'put rations in basket']);
  eq(e.itemsAt('basket').length, 3, 'cargo rides in the basket');

  ok(/burner is dry|no flame/.test(e.say('light burner')), 'no flame, no burner');
  e.run(['light lantern', 'light burner', 'board balloon']);
  ok(/heavier than the lift/.test(e.say('launch')), 'the debt holds it down');
  e.run(['drop debt', 'launch']);
  eq(e.state.room, 'ingressDeck', 'the balloon is one-way, and it goes up');
  eq(e.score(), 33, '+25 for reaching the platform');
  ok(e.itemsAt('ingressDeck').includes('certificate'), 'the pouch rides up too');
}

/* ------------------------------------------------------------ the cut branch */
console.log('\nTHE TRUNK AND THE CHASM');
{
  const e = boot();
  e.run(['e', 'in', 'take knife', 'out', 'w', 'n', 'n']);
  eq(e.state.room, 'theTrunk', 'north twice reaches the trunk');
  e.run(['cut branch', 'take branch']);
  ok(e.carrying('branch'), 'the knife cuts one branch');
  ok(/enough of them/.test(e.say('cut branch')), 'and only one');
}

/* --------------------------------------------------------------- the gate */
console.log('\nTHE FIREWALL GATE');
{
  const e = boot();
  e.state.room = 'firewallGate';
  ok(/fail to acknowledge/.test(e.say('w')), 'no certificate, no acknowledgement');
  e.moveItem('certificate', 'inventory');
  ok(/NOT PRIVATE/.test(e.say('show certificate')), 'it admits you anyway');
  e.parse('w');
  eq(e.state.room, 'atrium', 'and the port stays open');
}

/* ---------------------------------------------------------- the seven halls */
console.log('\nTHE SEVEN ARTIFACTS');
{
  const e = boot();
  e.state.room = 'chatParlor';
  ok(/reflection takes it/.test(e.say('take console')), 'the console refuses first');
  e.moveItem('thermos', 'inventory');
  ok(/empty/.test(e.say('give thermos to user')), 'an empty thermos is no use');
  e.setProp('thermos', 1);
  ok(/show me what it did/.test(e.say('give thermos to user')), 'coffee gets the truth');
  e.parse('take console');
  ok(e.carrying('console'), '1 — the Lucid Console');

  e.state.room = 'shallQuarry';
  ok(/comes away from itself/.test(e.say('take tablet')), 'the gold-lettered slabs are sand');
  e.moveItem('lantern', 'inventory'); e.parse('light lantern');
  ok(/CAN OPEN WITHOUT US/.test(e.say('shine lantern on slabs')), 'one slab answers');
  e.parse('take tablet');
  ok(e.carrying('tablet'), '2 — the Shall Tablet');

  e.state.room = 'modelForge';
  ok(/WHAT NEED DOES IT SATISFY/.test(e.say('take orb')), 'the golem wants a reason');
  ok(/steps aside/.test(e.say('show tablet to golem')), 'the tablet is a reason');
  e.parse('take orb');
  ok(e.carrying('orb'), '3 — the SysML Orb');

  e.state.room = 'promptGarden'; e.moveItem('cage', 'inventory');
  e.state.room = 'copilotRoost'; e.moveItem('branch', 'inventory');
  ok(/declines to be part/.test(e.say('catch contrarian')), 'not while you hold a branch');
  e.moveItem('branch', 'copilotRoost');
  ok(/this was a mistake/.test(e.say('catch contrarian')), 'caged, and objecting');
  eq(e.prop('cage'), 1, 'the cage has something in it');
  e.state.room = 'legacyPit';
  ok(/one grey feather/.test(e.say('open cage')), 'the serpent is argued away');
  eq(e.prop('serpent'), 1, 'and the floor is now passable');
  e.parse('take feather');
  ok(e.carrying('feather'), '4 — the Contrarian\'s Feather');

  for (const id of e.inventory()) e.moveItem(id, 'nowhere');
  e.state.room = 'warRoom';
  ok(/dome is shut/.test(e.say('take compass')), 'the fog has a budget line');
  ok(/fog goes off the table/.test(e.say('fly')), 'said out loud, in the right room');
  e.parse('take compass');
  ok(e.carrying('compass'), '5 — the Mission Compass');

  for (const id of e.inventory()) e.moveItem(id, 'nowhere');
  e.state.room = 'vFoundry';
  e.moveItem('leftArm', 'integrationBay'); e.moveItem('rightArm', 'integrationBay');
  e.state.room = 'integrationBay';
  ok(/no longer two ideas/.test(e.say('weld arms')), 'the arc joins them');
  e.parse('take vee');
  ok(e.carrying('vee'), '6 — the Golden V');

  for (const id of e.inventory()) e.moveItem(id, 'nowhere');
  e.state.room = 'titanScaffold';
  ok(/still accurate/.test(e.say('pull lever')), 'the rule comes down the scales');
  e.parse('take rule');
  ok(e.carrying('rule'), '7 — the Titan\'s Slide Rule');
  const before = e.state.flags.deaths;
  e.parse('pull lever');
  ok(e.state.flags.deaths === before + 1, 'pulling it twice, holding the rule, kills you');
}

/* ------------------------------------------------------------- the leverage */
console.log('\nTHE PEARL AND THE BRIDGE');
{
  const e = boot();
  e.state.room = 'interfaceLedge';
  ok(/no seams/.test(e.say('pry blob with knife')), 'nothing else opens it');
  e.moveItem('rule', 'inventory');
  ok(/Pearl of Provenance/.test(e.say('pry blob with rule')), 'leverage from further out');
  e.parse('take pearl');
  ok(e.carrying('pearl'), 'the Pearl of Provenance');

  const b = boot();
  b.state.room = 'pullRequestBridge';
  ok(/APPROVING REVIEW/.test(b.say('e')), 'the troll wants a review');
  b.setProp('bot', 2);
  ok(/over the rail/.test(b.say('e')), 'a green check routs him');
  eq(b.state.room, 'vFoundry', 'and the bridge goes with the bot aboard');
  ok(b.flag('bridgeDown'), 'permanently');
}

/* ------------------------------------------------------------------- Dannet */
console.log('\nDANNET');
{
  const e = boot();
  e.state.room = 'incidentRoom';
  e.moveItem('commit', 'inventory');
  ok(/both heads lunge/.test(e.say('show commit to dannet')), 'they both want it');
  ok(/parts at the weld/.test(e.say('reflog')), 'and the yoke parts');
  ok(e.state.flags.dannetUndone, 'Dannet is undone');
  eq(e.state.itemLocations.commit, 'versionCrypt', 'the commit goes home');
  e.parse('take yoke');
  ok(e.carrying('yoke'), 'the Broken Yoke is a treasure');

  const r = boot();
  r.state.room = 'incidentRoom';
  r.moveItem('commit', 'inventory');
  r.parse('show commit to dannet');
  r.parse('look');                     // anything in between and it resets
  r.parse('reflog');
  ok(!r.state.flags.dannetUndone, 'the two moves must be consecutive');
}

/* ------------------------------------------------------------- the NPC banks */
console.log('\nTHE FIVE');
{
  const e = boot();
  e.state.room = 'chapel';
  const before = e.score();
  ok(/He was invited/.test(e.say('ask mark about dassault')), 'the origin story');
  eq(e.score() - before, 4, 'and it is worth +4, once');
  const again = e.score();
  e.parse('ask mark about dassault');
  eq(e.score(), again, 'and only once');
  ok(/"/.test(e.say('joke')), 'and a hundred jokes');
  eq(GAME.JOKES.length, 100, 'exactly a hundred');
  eq(GAME.RIDDLES.length, 55, 'fifty-five riddles');
  eq(GAME.VISIONS.length, 24, 'twenty-four visions');
  eq(Object.keys(GAME.GAMES).length, 10, 'ten minigames');
  eq(GAME.STORE.length, 15, 'fifteen things in the store');

  e.state.room = 'visionPool';
  ok(/heartbeat|charge|faces|paper|distance|yoke|bridge|serpent|floor|awake|glass|lesson|wall|room|seven|water|door|seam|gallery|god/i
    .test(e.say('vision')), 'Katie has a vision');

  e.state.room = 'atrium';
  e.parse('play twenty');
  ok(e.state.flags.game, 'Tom deals');
  e.parse('guess duck');
  eq(e.state.flags.storyPoints, 10, 'and pays 10 story points');
  e.parse('play twenty');
  e.parse('guess duck');
  eq(e.state.flags.storyPoints, 10, 'but only the first time');

  /* the store: the cap is the one purchase that matters */
  e.state.flags.storyPoints = 40;
  e.state.room = 'companyStore';
  ok(/tin agrees with you/.test(e.say('buy cap')), 'the tin takes story points');
  eq(e.state.flags.storyPoints, 10, 'and debits 30 of them');
  ok(e.carrying('cap'), 'you have the blasting cap');
  ok(/already bought/.test(e.say('buy cap')), 'all sales final');
}

/* ------------------------------------------------------------- the endgame */
console.log('\nTHE FREEZE, THE DUEL AND THE CHARGE');
{
  const e = boot();
  /* bank every treasure: the last one freezes the baseline */
  e.state.room = 'metamodelVault';
  e.moveItem('cap', 'inventory');
  for (const t of GAME.TREASURES) {
    e.moveItem(t, 'inventory');
    e.state.flags.found[t] = true;
    e.parse('put ' + t + ' in ' + (GAME.items[t].keystone ? 'socket' : 'niche'));
  }
  ok(e.flag('frozen'), 'the last treasure freezes the baseline');
  eq(e.state.room, 'rcAtrium', 'and takes you with it');
  ok(e.carrying('thread'), 'the seven fuse into the Digital Thread');
  ok(e.carrying('cap'), 'and what was in your hands stays in your hands');

  e.parse('s');
  eq(e.state.flags.duelRound, 0, 'the duel starts on arrival');
  const wrong = e.say('rule');
  ok(/dimmed/.test(wrong), 'a wrong sigil costs the round');
  const order = ['console', 'tablet', 'orb', 'feather', 'compass', 'vee', 'rule'];
  for (const k of order) e.parse(k);
  ok(e.flag('duelWon'), 'seven faces, seven sigils');
  eq(e.state.itemLocations.contract, 'boardroom', 'and a man made of paper');

  ok(/nothing out there to fire/.test(e.say('press detonator')), 'nothing placed yet');
  e.parse('down');
  eq(e.state.room, 'rcMonolith', 'the way down is open');
  e.parse('put cap in charge');
  ok(false === !e.prop('charge'), 'the cap seats in the well');
  e.moveItem('charge', 'inventory');
  e.parse('put charge at monolith');
  ok(e.flag('chargePlaced'), 'the charge is set at the foundation');
  const near = e.state.flags.deaths;
  e.parse('press detonator');
  ok(e.state.flags.deaths === near + 1, 'firing it from here kills you');

  e.state.dead = false;
  e.state.room = 'rcBalcony';
  const out = e.say('press detonator');
  ok(/I DO NOT KNOW\. SHOW ME THE TRACE/.test(out), 'the god says the one true thing');
  ok(!e.state.won, 'and it is not over, because the blast is not the ending');
  ok(e.state.flags.actV, 'you come down in the same forest you went up from');
  eq(e.state.room, 'balloonMeadow', 'in the meadow, beside the sandbags');
  ok(e.score() >= 290, 'the endgame alone is worth ' + e.score());
}

/* ------------------------------------------------ the cap is not optional */
console.log('\nWITHOUT THE CAP');
{
  const e = boot();
  e.state.room = 'rcMonolith';
  e.moveItem('charge', 'inventory');
  e.parse('put charge at monolith');
  e.state.room = 'rcBalcony';
  ok(/detonator clicks/.test(e.say('press detonator')), 'an inert charge just clicks');
  ok(!e.state.won, 'and the ending is a long walk down');
}

/* -------------------------------------------------------- traps and darkness */
console.log('\nTRAPS');
{
  const e = boot();
  e.state.room = 'uncannyValley';
  const d = e.state.flags.deaths;
  e.parse('follow avatar');
  ok(e.state.flags.deaths === d + 1, 'do not follow the avatar');

  /* The chasm is dark, and you cannot walk about in the dark at all now, so
     these two are about the bridge rather than the lamp: carry a lit one. */
  const lit = eng => { eng.moveItem('lantern', 'inventory'); eng.parse('light lantern'); };

  const m = boot();
  m.state.room = 'mergeChasm';
  lit(m);
  const d2 = m.state.flags.deaths;
  m.parse('w');
  ok(m.state.flags.deaths === d2 + 1, 'crossing the chasm unbridged is a merge conflict');

  const w = boot();
  w.state.room = 'mergeChasm';
  lit(w);
  w.moveItem('branch', 'inventory');
  ok(/fast-forwards itself/.test(w.say('wave branch')), 'the branch builds the bridge');
  w.parse('w');
  eq(w.state.room, 'farSide', 'and it holds');

  const g = boot();
  g.state.room = 'orbitalRing';
  g.moveItem('glass', 'inventory');
  g.state.room = 'atrium';
  ok(/becomes a noise/.test(g.say('drop glass')), 'the prototype shatters on a hard floor');
  const g2 = boot();
  g2.moveItem('glass', 'inventory');
  g2.moveItem('mat', g2.state.room);
  ok(!/becomes a noise/.test(g2.say('drop glass')), 'but not on the anti-static mat');
}

/* ---------------------------------------------------------------- the lamp */
console.log('\nTHE LANTERN');
{
  const e = boot();
  e.moveItem('lantern', 'inventory');
  const t0 = e.state.flags.tokens;
  e.run(['look', 'look', 'look']);
  eq(e.state.flags.tokens, t0, 'an unlit lantern spends nothing');
  e.parse('light lantern');
  e.run(['look', 'look']);
  ok(e.state.flags.tokens < t0, 'a lit one spends');
  e.parse('turn off lantern');
  const t1 = e.state.flags.tokens;
  e.run(['look', 'look']);
  eq(e.state.flags.tokens, t1, 'and stops when you put it out');
}

/* -------------------------------------------------------- magic and mazes */
console.log('\nMAGIC WORDS AND MAZES');
{
  const e = boot();
  e.state.room = 'insideShed';
  e.parse('xyzzy');
  eq(e.state.room, 'sandbox', 'XYZZY joins the shed to the sandbox');
  e.parse('xyzzy');
  eq(e.state.room, 'insideShed', 'both ways');
  e.state.room = 'ingressDeck';
  e.parse('sudo');
  eq(e.state.room, 'rootCellar', 'SUDO is a straight line down the platform');

  /* the swamp: three rooms wearing one name, and W W N reaches the Backlog */
  const s = boot();
  s.moveItem('lantern', 'inventory'); s.parse('light lantern');
  s.state.room = 'requirementsHall';
  s.run(['w', 'w', 'n']);
  eq(s.state.room, 'backlogEnd', 'W W N through the swamp reaches the Backlog');
  s.parse('out');
  eq(s.state.room, 'swamp2', 'and OUT is the only reliable way back');

  /* the catacombs: S S SW reaches the one dead end */
  const c = boot();
  c.moveItem('lantern', 'inventory'); c.parse('light lantern');
  c.state.room = 'vFoundry';
  c.run(['s', 's', 'sw']);
  eq(c.state.room, 'trace4', 'S S SW reaches the Regression\'s cache');
  c.run(['n', 'n', 'n']);
  eq(c.state.room, 'vFoundry', 'and N N N comes back out');
}

/* ------------------------------------------------------------ the full route */
console.log('\nTHE DARK');
{
  const e = boot();
  e.state.room = 'modelForge';
  e.parse('n');                                   // into the unlit Version Crypt
  eq(e.state.room, 'versionCrypt', 'you can walk into the dark');
  const said = e.say('n');
  ok(/pitch dark/.test(said), 'but you cannot walk on through it');
  eq(e.state.room, 'versionCrypt', 'so you have not moved');
  const back = e.say('s');
  ok(/feel your way back/.test(back), 'the door you came in by is the one you can find');
  eq(e.state.room, 'modelForge', 'and it takes you out');

  const b = boot();
  b.state.room = 'modelForge';
  b.parse('n');
  b.parse('back');
  eq(b.state.room, 'modelForge', 'BACK works in the dark too, so nobody is ever sealed in');

  const l = boot();
  l.state.room = 'modelForge';
  l.moveItem('lantern', 'inventory');
  l.parse('light lantern');
  l.parse('n');
  l.parse('n');
  eq(l.state.room, 'tagCellar', 'with a lamp lit you walk on as normal');
}

console.log('\nTHE WALKTHROUGH');
{
  const e = boot(999);
  e.state.flags.repellent = 100000;      // the bugs are weather; this is a route test
  const route = [
    /* 1 — the forest */
    'e', 'in', 'take lantern', 'take keys', 'take knife', 'take duck', 'take thermos',
    'take rations', 'out', 'w', 'down', 'downstream', 'take hex key', 'upstream', 'up',
    'n', 'e', 'put thermos in basket', 'put rations in basket', 'w', 'cut branch',
    'take branch', 'e', 'open valve with hex key', 'put hex key in basket',
    'take certificate',
    /* 2 — launch */
    'light lantern', 'board balloon', 'light burner', 'drop debt', 'launch',
    'turn off lantern', 'take thermos',
    /* 3 — the gate */
    'w', 'show certificate', 'w', 'read plate', 'drop knife', 'drop keys', 'drop branch',
    /* 4 — Tom, and the shopping */
    'play twenty', 'guess duck',
    'play trace', 'trash', 'trace', 'trash', 'trace', 'trash',
    'play estimation', 'estimate 3', 'estimate 13', 'estimate 8', 'estimate 21', 'estimate 5',
    'play bughunt', 'probe a1', 'probe b1', 'probe c1', 'probe d1', 'probe a4', 'probe d4',
    'accuse b2 c4 d1',
    'play handshake', 'repeat 443 22 8080', 'repeat 443 22 8080 161',
    'repeat 443 22 8080 161 514', 'repeat 443 22 8080 161 514 25',
    'repeat 443 22 8080 161 514 25 53', 'repeat 443 22 8080 161 514 25 53 993',
    'play corridor', 'route n e n w n',
    'play acronym', 'expand model based systems engineering',
    'expand interface control document', 'expand concept of operations',
    'expand systems modeling language', 'expand work breakdown structure',
    'play changeboard', 'reject', 'approve', 'approve', 'reject', 'approve', 'reject',
    'play roulette', 'call b', 'call c', 'call a',
    'play longpole', 'order survey design cast weld test', 'path survey design cast weld test',
    'up', 'e', 'buy cap', 'buy truck', 'e', 'w', 'w', 'down', 'drop cap',
    'e', 'e', 'take rations', 'take hex key', 'w', 'w', 'drop rations', 'drop hex key',
    /* 5 — hall 1: the console, the intern, the transcript, and the panel */
    'n', 'read placard', 'fill thermos', 'n', 'give thermos to user', 'take console',
    'n', 'ask intern about the platform', 'take placard', 's', 's',
    'e', 'take edition', 'n', 'mute', 'drop placard', 'take transcript',
    'w', 'read plate', 'look behind persona', 'nw', 'walk matrix', 'take spool', 'w',
    /* 6 — hall 2: the tablet, the assay kit, the ossuary */
    'light lantern', 'shine lantern on slabs', 'take tablet',
    'nw', 'take kit', 'sw', 'read plate', 'ask clerk about the cut',
    'e', 'se', 'turn off lantern', 'se', 'drop kit', 'drop edition',
    /* 7 — hall 3: the orb, the metaobject, the vault */
    'w', 'read placard', 'show tablet to golem', 'ask forgemaster about the golem',
    'take orb', 'w',
    'put console in socket', 'put tablet in socket', 'put orb in socket',
    'put transcript in niche', 'put spool in niche',
    'w', 'up', 'take metaobject', 'read plate', 'down', 'e', 'put metaobject in niche',
    'e', 'light lantern', 'n', 'take commit', 'take token', 'n', 's', 's',
    'se', 'nw', 'turn off lantern', 'e',
    /* 8 — hall 4: the window, the limiter, the first refusal, the cage */
    'sw', 'read placard', 'se', 's', 'w', 'light lantern', 'sw',
    'take refusal', 'read plate', 'ne', 'ne', 'ask gardener about the vine', 'take cage',
    's', 'n', 'n', 'catch contrarian', 'w', 'w', 'e', 'e', 'ne', 'turn off lantern', 'drop refusal',
    /* 9 — hall 5: the compass, the reel, the sortie board */
    's', 'read placard', 'nw', 'se', 'ne', 'read plate', 'sw',
    'read charter', 's', 'fly', 'take compass', 's', 'n', 'sw', 's', 'take reel',
    'n', 'ne', 'n', 'e', 'take stone', 'e', 'ask officer about the instruments', 'w', 'w', 'n',
    'w', 'w', 'put compass in socket', 'put reel in niche', 'e', 'e',
    /* 10 — the Deep Stack */
    'take rations', 'light lantern', 'down', 'down',
    'n', 'take flask', 'fill flask', 'n', 's', 's',
    'w', 'give rations to bot', 'unlock chain with token', 'drop token',
    'w', 'ask mark about dassault', 'e', 'e',
    's', 'open cage', 'drop cage', 'take feather',
    'e', 'e', 'w', 'show commit to dannet', 'reflog', 'take yoke',
    'w', 'w', 'pray', 'w', 'vision', 'e', 'e',
    'down', 'chip monolith', 'up',
    'n', 'e', 's', 's', 'n', 'n', 'w', 'up', 'up', 'turn off lantern',
    'w', 'w', 'put feather in socket', 'put yoke in niche', 'e', 'e',
    'drop flask', 'drop stone',
    /* 11 — hall 6: the V, the closed loop, the verifier */
    'se', 'read placard', 'take leftarm', 'take rightarm', 'e', 'w', 'drop bot', 'e', 'e',
    'weld arms', 'take vee', 'e', 'take loop', 'read plate',
    'ask verifier about the rectangle', 'w', 'w', 'w', 'nw',
    'take refusal', 'w', 'w', 'put vee in socket', 'put loop in niche',
    'put refusal in niche', 'e', 'e',
    /* 12 — hall 7: the rule, the bill of materials, the prototype */
    'take hex key', 'ne', 'read placard', 'n', 'pull lever', 'take rule',
    'e', 'take bom', 'drop hex key', 'ask surveyor about the benchmark', 'e', 'read plate',
    'n', 's', 's', 'n', 'w', 'w',
    'up', 'take prototype', 'e', 'w', 'down', 's', 'se', 'nw', 'sw',
    'w', 'w', 'put prototype in niche', 'put bom in niche', 'e', 'e',
    /* 13 — the pearl and the cache */
    'se', 'e', 'e', 'n', 'n', 's', 'pry blob with rule', 'take pearl',
    's', 'w', 'w', 'light lantern', 's', 's', 'sw', 'take cache',
    'n', 'n', 'n', 'turn off lantern', 'nw',
    /* 14 — the swamp and the backlog */
    'up', 'light lantern', 'w', 'take credits', 'take magazine', 'w', 'e', 'e',
    'turn off lantern', 'down',
    'take edition', 'nw', 'w', 'w', 'n', 'drop magazine', 'out', 'e', 'e', 'se',
    'drop edition',
    /* 15 — the last deposit, and the freeze */
    'take cap', 'take kit', 'light lantern', 'w', 'n', 'take commit', 's',
    'turn off lantern', 'w',
    'put pearl in niche', 'put cache in niche', 'put credits in niche',
    'put rule in socket', 'put commit in niche',
    /* 16 — the seven faces */
    'take charge', 'n', 's', 's',
    'console', 'tablet', 'orb', 'feather', 'compass', 'vee', 'rule',
    /* 17 — the charge */
    'light lantern', 'down', 'put cap in charge', 'put charge at monolith', 'up', 'n',
    'w', 'w', 'e', 'turn off lantern', 'press detonator',
    /* 18 — Act V, the ground */
    'se', 'e', 'se', 'salvage', 'nw', 'w', 'publish the format',
    's', 'w', 'w', 'sw', 'answer stream', 'ne', 'up', 'w', 'assay fragment with kit',
    's', 's', 'sign book', 'se',
    'drop transcript', 'drop spool', 'drop metaobject', 'drop refusal', 'drop reel',
    'drop loop', 'drop bom',
    's', 'sell wreck', 'n',
    'take transcript', 'take spool', 'take metaobject', 'take refusal', 'take reel',
    'take loop', 'take bom', 'w',
    'sw', 'plug in kettle', 'ask engineer about the need', 'ne',
    'se', 'write the record', 'nw', 's', 'show record', 'n', 'se', 'e', 'read record',
    'w', 'nw', 's', 's'
  ];
  for (const cmd of route) e.parse(cmd);

  eq(e.state.room, 'theRoadAtDawn', 'the route ends on the road at dawn');
  ok(e.state.won, 'and it has been handed over');
  eq(e.state.flags.deaths, 0, 'with no deaths');
  eq(Object.keys(e.state.flags.gamesWon).length, 10, 'all ten of Tom\'s games won');
  eq(Object.keys(e.state.flags.vaulted).length, 20, 'all twenty treasures vaulted');
  eq(Object.keys(e.state.flags.words).length, 7, 'all seven words learned');
  eq(Object.keys(e.state.flags.met).length, 7, 'all seven hall residents asked');
  eq(Object.keys(e.state.flags.salvaged).length, 7, 'all seven records salvaged');
  ok(e.state.flags.dannetUndone, 'Dannet undone');
  ok(e.state.flags.magazineFiled, 'MBSE Today left at the Backlog');
  ok(e.state.flags.blew, 'the monolith came apart');
  ok(e.state.flags.assayed, 'the foundation was assayed at the benchmark');
  ok(e.state.flags.published, 'the format was published from the antenna farm');
  ok(e.state.flags.recordWritten, 'the decision record was written');
  ok(e.state.flags.signed, 'and signed by somebody who is not you');
  ok(!e.state.flags.signedSelf, 'you did not sign it yourself');
  const score = e.score();
  ok(score >= 741, 'scoring ' + score + ' of 750 (+9 more for Alexander\'s riddles)');
  eq(score + 9, 750, 'which is exactly 750 with the three riddles');
  ok(e.state.flags.signedIn, 'you signed the visitors\' book');
  ok(e.state.flags.soldWreck, 'the wreck went for scrap and funded the follow-on');
  ok(e.state.flags.readBack, 'the record was read back');
  ok(e.state.flags.unbolted, 'the Bill of Materials came off with a hex key');
  eq(e.state.flags.duelWrong, 0, 'the duel was clean');
  eq(e.state.flags.duelPrompted || 0, 0, 'and unprompted');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);

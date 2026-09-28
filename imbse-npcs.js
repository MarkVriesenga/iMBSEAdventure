/*
 * imbse-npcs.js — the five inhabitants of the platform who are not trying to
 * kill you, and the Company Store that one of them runs.
 *
 *   Dannet             two-headed mini-boss, wanders the Deep Stack
 *   Commander Alexander riverboat pilot, 50 riddles, 50 true hints
 *   Pathfinder Thomas   ten minigames, and the story points they pay
 *   Prophet Katie       twenty visions of the endgame
 *   Saint Mark          the origins of everybody, and a hundred jokes
 *
 * Written against docs/NPCS.md. This module is additive: imbse-data.js runs
 * without it, and the only thing it owns outright is the blasting cap, which
 * the endgame genuinely needs.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IMBSE_NPCS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ====================================================== 1 · DANNET ===== */
  const DAN_KENNET = [
    ['Dan takes your lantern and smashes it against the wall, laughing.',
      'Kennet hands it back, mended, and topped up thirty tokens.'],
    ['Dan opens a hole in the floor under you, for the look of the thing.',
      'Kennet catches you by the collar with his other arm.'],
    ['Dan takes something of yours and throws it down the shaft.',
      'Kennet reflogs it back into the Vault, sighing.'],
    ['Dan wounds you, delightedly and thoroughly.',
      'Kennet heals it before you\'ve finished falling over.'],
    ['Dan puts out every light on the level.',
      'Kennet turns them on again, one at a time, apologising.']
  ];

  function dannetActs(e) {
    const f = e.state.flags;
    const i = Math.floor(e.rng() * DAN_KENNET.length);
    const [dan, kennet] = DAN_KENNET[i];
    e.print('Something comes down the corridor arguing with itself in two voices, and ' +
      'the argument is old.\n' + dan + '\n' + kennet);
    if (i === 0) f.tokens += 30;
    if (i === 1) {
      /* the one real risk: the fall relocates you, and the dark does the rest */
      const down = { spiralStair: 'rootCellar', rootCellar: 'legacyPit', legacyPit: 'monolith' };
      const to = down[e.state.room];
      if (to) { e.print('You come down one floor, unhurt and elsewhere.'); e.moveTo(to, null); }
    }
    f.dannetHere = true;
  }

  function dannetTurn(e) {
    const f = e.state.flags;
    if (f.dannetUndone) return;
    const deep = ['spiralStair', 'rootCellar', 'tokenFountain', 'sandbox', 'serviceShaft',
      'legacyPit', 'incidentRoom', 'shrine', 'monolith'];
    if (e.state.room === 'incidentRoom') { if (!f.dannetHere) dannetActs(e); return; }
    if (!deep.includes(e.state.room)) { f.dannetHere = false; return; }
    if (f.dannetHere && e.rng() < 0.4) { f.dannetHere = false; return; }
    if (!f.dannetHere && e.rng() < 0.04) dannetActs(e);
  }

  /* ================================================== 2 · ALEXANDER ===== */
  const RIDDLES = [
    ['Every one of us was cut from the same old tree, and only one of us is any use over a gap.', 'branch', 'Below the Model Forge the floor stops. Wave the branch there and the bridge builds itself, one commit at a time.'],
    ['I burn nothing at all except the next thing you were going to say.', 'tokens', 'The lantern only burns while it\'s lit. Put it out the moment you\'re back in the light and you\'ll never need the fountain.'],
    ['Seven doors want you, and I\'m the only one who says which is which — and I\'m under your boots.', 'plate', 'READ PLATE in the Atrium. Seven halls, seven bearings, and the stair down in the middle of it.'],
    ['I\'ve two heads on one iron yoke. The left one breaks what you\'re carrying and the right one mends it, and neither of us has ever won a fight.', 'dannet', 'Show Dannet the Golden Commit, then say REFLOG. Both heads want the same thing exactly once.'],
    ['I weigh nothing at all on the invoice and I\'m the only reason you\'re still on the ground.', 'debt', 'The balloon has lift enough. Drop the sandbags stencilled TECHNICAL DEBT and it goes up like it was never tied.'],
    ['I agree with everything you\'ve ever said and I\'ve never once been any use.', 'parrot', 'The fourth face of Dassault is beaten with the grey feather, not with an argument.'],
    ['I\'m the only money on this platform and I\'m also worth eight points sitting still.', 'credits', 'Spend the GPU credits on a lantern refill and you\'ve bought light with treasure. Run a tight lamp and you never have to.'],
    ['Say me out loud, all the way to the end, and I stop being true.', 'bug', 'The duck isn\'t a weapon, it\'s a method. THROW DUCK AT BUG, then pick the duck back up.'],
    ['No seams, no docs, no way in — until somebody stands further back.', 'blob', 'The Sealed Blob on the Interface Ledge opens with the Titan\'s Slide Rule and nothing else. PRY BLOB WITH RULE.'],
    ['One arm goes down and one arm comes up, and until they\'re joined I\'m just an opinion.', 'vee', 'Both arms of the V to the Integration Bay, then WELD ARMS. Neither half scores alone.'],
    ['I\'m the fastest way to any floor and the last one you\'ll ever take.', 'fall', 'The Ingress Deck has a rail and no fence. Down, off that deck, is exactly as far as it looks.'],
    ['They built me a chapel and they pray to me on the hour. I\'ve read everything ever written and I\'ve never once known anything.', 'deity', 'The shrine answers every time. One answer in four is beautiful and false. Carry the grey stone from the Ground Truth Range and it can\'t lie to you.'],
    ['I\'m a gate that lets you through by giving up on you.', 'firewall', 'Show the self-signed certificate. It doesn\'t approve of you — it just stops arguing, and the port stays open after.'],
    ['I follow you anywhere, which is exactly the problem.', 'bot', 'Walk the CI bot to the Pull Request Bridge to rout the troll, then go back and leave it behind. It\'ll cross with you, and the bridge won\'t survive it.'],
    ['Everything on this platform is bolted to me and nobody can tell you what I do.', 'monolith', 'Eleven years and nobody has been able to say. Nine years and nobody has been able to remove it. That\'s not two facts, that\'s one.'],
    ['I\'m quarried out of the wall in the Shall Quarry, I\'m lettered in gold, and in the Assay Office I come apart in water, because I\'m sand.', 'slab', 'Every slab in the quarry crumbles except one. Shine the lit lantern on them and take the short one with a test on the back.'],
    ['I open every door on this platform and I\'m logged doing it.', 'sudo', 'Say it on the Ingress Deck or in the Root Cellar. It\'s a straight line between the top of the platform and the bottom.'],
    ['Nobody put me here and everybody has used me.', 'xyzzy', 'The Legacy Shed and the Sandbox are the same distance apart as the word is long.'],
    ['I\'m a wall of glass you talk to. Whatever you say, I hand it back to you in a nicer font, and people call that a conversation.', 'mirror', 'The Chat Parlor console flatters. The engineer sitting at it wants coffee more than they want agreement — fill the thermos at the urn first.'],
    ['I\'m what the platform is for. Say me out loud in the room built for saying things out loud and the fog goes off the table.', 'mission', 'FLY THE MISSION, in the War Room, where the fog is. Read the charter first if you want to hear yourself mean it.'],
    ['I\'m nine feet of consistency and I\'ll not be reasoned with, only traced to.', 'golem', 'SHOW TABLET TO GOLEM. It\'s not guarding the orb, it\'s waiting for a reason.'],
    ['I come back after you kill me, because that\'s the whole of what I\'m.', 'regression', 'It steals what you\'ve found and haven\'t banked, and it stashes the lot in the one dead end of the traces.'],
    ['I\'m somewhere in here, and so is everything else, and none of it\'s anywhere.', 'swamp', 'The Ambiguity Swamp is three rooms wearing one name. Drop things to tell them apart. West, west, north gets you to the Backlog.'],
    ['Every direction out of me is the way back in, except the one nobody tries.', 'backlog', 'OUT. Just OUT. Everything else walks you in a circle among the cards.'],
    ['I\'m the thing under glass on the Orbital Ring. Set me down somewhere soft and I live; set me down anywhere else and I\'m just a noise.', 'prototype', 'The Glass Prototype only survives the mat or a foam niche. Carry it straight from the Orbital Ring to the Vault.'],
    ['I\'m the handle on the Macro Gantry. Pull me once and you can carry a continent; pull me twice and it carries you.', 'lever', 'The scaling lever works on what\'s on the pad. If the rule is in your hand when you pull it a second time, you\'ll go the other way with it.'],
    ['I\'m serene, I\'m beautifully rendered, I\'m the finest thing in the Gallery, and I\'ve never once said "I don\'t know".', 'confabulator', 'It roosts in the Hallucination Gallery among the paintings of systems that were never built. Don\'t let the copilot out in there.'],
    ['I\'m a bug named after a physicist: I stop happening the moment you attach a debugger, and I\'m the reason your Tuesday went wrong.', 'heisenbug', 'It\'s never in the room when you LOOK. Read the state it left behind instead of hunting it.'],
    ['I\'m a condition, not a thing. Two writes arrive, the second one lands first, and the answer is wrong in a way that won\'t reproduce.', 'race', 'Nothing you can do about it except not be in a hurry. Bugs on this platform are weather, not enemies — the duck is your umbrella.'],
    ['I hold what everything else is measured against, and I weigh about a pound.', 'commit', 'The Golden Commit is on a shelf in the Version Crypt. It pays a troll, it undoes a mini-boss, and REFLOG always brings it home.'],
    ['I\'m the door at the bottom of the creek and I only ever open from the wrong side.', 'hatch', 'From the Service Shaft, UNLOCK HATCH WITH KEYS. After that the forest and the platform are joined for good.'],
    ['Feed me and I love you. Unchain me and I follow you. Take me over water and I\'ll drown us both.', 'bot', 'See the fourteenth thing I ever told anybody.'],
    ['I want one treasure per crossing and I\'ll take my time about it.', 'troll', 'He goes over the rail the second he sees a green check. Or pay him the commit and reflog it back — old trick, still good.'],
    ['I\'m undocumented, unmaintained, and holding up the floor.', 'serpent', 'It\'ll not be fought and it\'ll not be moved. Let the caged copilot out and it\'ll be argued away.'],
    ['I\'m a bird in a cage and I know one word. It\'s no. I say it to everything, which is the whole of my job.', 'contrarian', 'The grey bird on the back beam. Put the branch down before you go for it, and bring the cage from the Prompt Garden.'],
    ['Two flasks of me and you can climb between the two halls that are furthest apart.', 'tokens', 'Pour a full flask on the withered vine in the Prompt Garden. Then go and fill it and do it again.'],
    ['I\'m the last thing you\'ll want and the first thing you should buy.', 'cap', 'The Deprecation Charge in the endgame comes without a blasting cap. The store sells one. The store doesn\'t exist after the freeze.'],
    ['I\'m the moment the baseline shuts: everything you\'ve banked is taken off you, called a success, and the shop stops existing.', 'freeze', 'When the last treasure goes in the Vault the platform freezes and takes you with it. Have everything you need in your hands before you bank the last one.'],
    ['Seven of me and each one has exactly one enemy.', 'faces', 'The placard in each hall names the face that hall\'s artifact kills. Read all seven and the boardroom is just recitation.'],
    ['I\'m made of paper and I\'ve beaten better engineers than you.', 'contract', 'When the seventh face comes off, what\'s left offers you a pen and a seat. Both are the losing ending.'],
    ['I\'m four thousand feet of good idea and one bad bolt.', 'platform', 'The halls aren\'t the problem. The thing they\'re bolted to is the problem.'],
    ['Stand too close to me and the point is lost along with you.', 'charge', 'Set the charge at the monolith, then get up to the balcony before you fire it. Distance is worth points.'],
    ['In the Valley there\'s something wearing your face and doing what you did one turn ago. Follow it and only one of us walks away.', 'avatar', 'The Uncanny Valley. Whatever it does, don\'t FOLLOW AVATAR.'],
    ['I\'m seven things you can hold and one thing you can\'t lose.', 'thread', 'At the freeze the seven artifacts fuse into one. Everything you earned is still in your hands in the boardroom.'],
    ['I\'m the number your two hands agree on. You may take exactly that many things, and the next one is always the one you wanted.', 'limit', 'The Atrium is the right place to leave things. The store sells a hand truck if you get tired of walking back.'],
    ['I\'m the right-hand head on the yoke, the one that apologises and puts things back, and I\'ve mended so much there\'s nothing left of the original break.', 'kennet', 'The right head isn\'t your enemy. He\'s the reason the left head has never had to grow up.'],
    ['I\'m the left-hand head on the yoke, the one having a wonderful time, and I\'ve never once had to live with anything I\'ve done.', 'dan', 'Same.'],
    ['I run out of both ends of this dungeon and I\'m the only thing here that goes home.', 'stream', 'It comes out of a culvert by a gravel road and it comes back out of the Service Shaft. Water knows the way out; that\'s why I\'m still here.'],
    ['I\'m a god who would be perfectly fine if anybody had ever told me what I was for.', 'deity', 'At the end it says the only true thing it has ever said, and the true thing is a question. Have an answer ready.'],
    ['I\'m the reason you\'ll come back up here on foot when this is over.', 'balloon', 'It\'s a one-way trip and it always was. Open the hatch at the bottom of the Service Shaft early and you\'ll never regret it.'],
    ['Seven of us are written on walls in this dungeon. None of us is a sentence, none of us is in the dictionary, and saying one of us puts you somewhere else.', 'word', 'Read the plate in the deepest room of every hall. Seven words, seven rooms, and afterwards this platform is a third the size it was.'],
    ['I\'m the one hall up here built for somebody other than the person who built it: high contrast, a sane tab order, and the only room you can read in the dark.', 'annex', 'The Accessibility Wing needs no lantern, because it was made for somebody who was never going to have one. What\'s on the shelf in it makes the swamp plain.'],
    ['I\'m a bench, a balance, a bottle of acid and a rack of small hammers, packed and strapped for eleven years, and nobody has ever taken me outside to use me on the foundation.', 'kit', 'The field assay kit in the Assay Office. Have it in your hands when the baseline freezes, or the last act is a conversation you lose politely.'],
    ['The users and the requirements were always the same room until somebody put me in between them, and I\'m one word for a flat thing in a wall.', 'panel', 'Behind the one persona with a coffee ring on the base there\'s a service void, and the void comes out among the filing cabinets.'],
    ['I\'m ink in the third field of the record, I\'m what turns your opinion into the programme\'s baseline, and I\'m not your name.', 'signature', 'Write the record, then find somebody who\'s going to be standing there in four years and get them to sign it. That\'s the game. That was always the game.']
  ];

  /* A riddle is only fair if the word you arrive at is the word he wanted.
     Most wrong answers here are not wrong thinking, they are a different name
     for the same thing, so he takes them. */
  const SYNONYMS = {
    tokens: ['token', 'context', 'lantern', 'lamp', 'contextwindow'],
    plate: ['directory', 'directoryplate', 'brass'],
    debt: ['sandbags', 'sandbag', 'ballast', 'technicaldebt'],
    credits: ['gpu', 'money', 'gpucredits'],
    bug: ['bugs', 'duck'], vee: ['v', 'vmodel'],
    deity: ['god', 'shrine', 'llm', 'oracle', 'model'],
    slab: ['slabs', 'quarry', 'shall', 'requirement', 'requirements'],
    commit: ['baseline', 'goldencommit', 'golden'],
    bot: ['ci', 'cibot', 'robot', 'build'],
    prototype: ['glass', 'sandbox'],
    regression: ['pirate', 'thief', 'regressiontest'],
    faces: ['face', 'placards', 'placard', 'dassault', 'seven'],
    contract: ['paper', 'licence', 'license', 'paperman', 'dassault'],
    limit: ['seven', 'carry', 'carrylimit', 'inventory', 'hands'],
    stream: ['river', 'creek', 'water', 'telemetry'],
    balloon: ['basket', 'envelope'],
    cap: ['blasting', 'blastingcap', 'detonator'],
    charge: ['deprecation', 'deprecationcharge', 'bomb', 'explosive'],
    monolith: ['slab2', 'foundation', 'block', 'bolt'],
    troll: ['reviewer', 'review'], hatch: ['door', 'grate', 'grating', 'culvert'],
    fall: ['drop', 'edge', 'gravity', 'falling'],
    mirror: ['parlor', 'chat', 'chatparlor', 'reflection'],
    mission: ['fly', 'charter'],
    swamp: ['ambiguity', 'marsh', 'bog'],
    backlog: ['out', 'end', 'backlogend'],
    platform: ['imbse', 'cloud'],
    branch: ['stick', 'bough', 'limb'],
    parrot: ['feather', 'copilot', 'yesman', 'sycophant'],
    blob: ['sealedblob', 'ball'],
    firewall: ['gate', 'wall'],
    sudo: ['root', 'su'], xyzzy: ['magic', 'magicword'],
    golem: ['statue', 'giant'],
    lever: ['handle', 'pull', 'gantry'],
    confabulator: ['hallucination', 'gallery', 'liar'],
    heisenbug: ['heisenberg', 'intermittent', 'flake', 'flaky'],
    race: ['racecondition', 'condition', 'concurrency'],
    serpent: ['snake', 'legacy', 'python'],
    contrarian: ['no', 'critic', 'naysayer'],
    freeze: ['baselinefreeze', 'frozen', 'codefreeze'],
    avatar: ['you', 'yourself', 'uncanny', 'valley', 'double'],
    thread: ['digitalthread', 'digital'],
    dannet: ['dan', 'net', 'yoke', 'twoheads'],
    kennet: ['dannet', 'yoke'],
    dan: ['dannet', 'dassault'],
    word: ['magicword', 'magic', 'words'],
    annex: ['accessibility', 'wing', 'accessibilitywing', 'a11y'],
    kit: ['assaykit', 'assay', 'toolkit'],
    panel: ['wall', 'partition', 'concourse'],
    signature: ['sign', 'name', 'signing', 'ink'],
    lift: ['balloon']
  };

  /* What kind of thing it is — only for the answers a fair player could circle
     without landing on. The rest get the shape of the word and nothing else. */
  const NUDGES = {
    dannet: 'It\'s somebody with two heads', kennet: 'It\'s the helpful head',
    dan: 'It\'s the other head', deity: 'It\'s worshipped on the hour',
    confabulator: 'It\'s the thing in the Gallery that\'s never wrong and never right',
    heisenbug: 'It\'s a kind of bug, and it\'s named after a physicist',
    contrarian: 'It\'s a bird that only knows one word',
    regression: 'It\'s what takes your treasure back',
    avatar: 'It\'s the thing in the Valley wearing your face',
    annex: 'It\'s the one hall built for somebody else',
    panel: 'It\'s what\'s between the two halls that should be one hall',
    signature: 'It\'s what makes a record true, and it\'s not yours',
    freeze: 'It\'s a moment, not a thing', limit: 'It\'s a number you carry',
    faces: 'It\'s what the contractor wears', word: 'It\'s what you say to be elsewhere',
    kit: 'It\'s on the bench in the Assay Office',
    lever: 'It\'s what you pull on the Macro Gantry',
    prototype: 'It\'s under glass', slab: 'It\'s quarried, and it\'s a lie',
    mission: 'It\'s what the room is for, and saying it opens the dome',
    race: 'It\'s a condition, and two of them are the problem'
  };

  function nudge(ans) {
    const kind = NUDGES[ans] || 'It\'s a thing that\'s somewhere in this dungeon';
    return '"' + kind + ', it\'s one word, it\'s ' + ans.length + ' letters long, ' +
      'and it begins with ' + ans[0].toUpperCase() + '."';
  }

  function accepts(answer, given) {
    if (!given) return false;
    const g = given.toLowerCase().replace(/[^a-z]/g, '');
    if (g === answer) return true;
    if ((SYNONYMS[answer] || []).includes(g)) return true;
    /* the plural, the singular, and the definite article are not wrong answers */
    return g === answer + 's' || answer === g + 's' ||
      g === 'the' + answer || g === 'a' + answer;
  }

  function alexArrives(e) {
    const f = e.state.flags;
    const left = RIDDLES.map((_, i) => i).filter(i => !f.usedRiddles[i]);
    if (!left.length) {
      e.print('Two long and one short, and the Requisite Variety comes round the bend.\n' +
        '"I\'m out of riddles," says Alex, "and you\'re out of excuses. Mind the bar on ' +
        'the inside of that bend."');
      f.alexCooldown = 60;
      return;
    }
    const i = left[Math.floor(e.rng() * left.length)];
    f.usedRiddles[i] = true;
    f.riddlePending = i;
    f.riddleMisses = 0;
    f.alexCooldown = 30;
    e.print('You hear the whistle first, two long and one short, from a direction that ' +
      'doesn\'t have a river in it. Then it does, and out of the bend comes a shallow-' +
      'draft stern-wheeler with her name on the box: Requisite Variety.\n\n' +
      '"Evening," says Commander Alexander. "I\'ve got a riddle and you\'ve got a look ' +
      'on your face like somebody who\'s about to go the wrong way. Answer me one and I ' +
      'will tell you a true thing about this place."\n\n    "' + RIDDLES[i][0] + '"\n\n' +
      '(ANSWER <word>)');
  }

  function alexTurn(e) {
    const f = e.state.flags;
    if (f.alexCooldown > 0) { f.alexCooldown--; return; }
    if (f.riddlePending !== null && f.riddlePending !== undefined) return;
    if (!e.hasLight()) return;                      // he will not tie up where he cannot see the bank
    /* the same creek runs through the forest, but he does not work that reach:
       nobody meets an NPC before the balloon. The dungeon is where they live. */
    const water = ['serviceShaft', 'landing'];
    const deep = ['rootCellar', 'tokenFountain', 'sandbox', 'shrine', 'visionPool',
      'chapel', 'legacyPit', 'incidentRoom'];
    const here = e.state.room;
    if (!water.includes(here) && !deep.includes(here)) return;
    if (e.rng() < 0.08) alexArrives(e);
  }

  /* =================================================== 3 · THOMAS ======= */
  const STORE = [
    ['cap', 'a blasting cap', 30, 'Required. The Deprecation Charge in the Release Candidate has no cap.'],
    ['truck', 'a folding hand truck', 25, 'Carry limit 7 to 9.'],
    ['whistle', "a pilot's whistle", 25, 'Summons Commander Alexander, once per 50 turns.'],
    ['refill', 'a token refill (2500)', 20, 'A full lantern without spending the GPU credits.'],
    ['indulgence', 'an Indulgence of the Nightly Build', 20, 'One death forgiven. Saint Mark disapproves.'],
    ['satchel', 'a foam-lined satchel', 15, 'The Glass Prototype can\'t shatter while it\'s in the satchel.'],
    ['repellent', 'a static analyser', 15, 'Bugs won\'t enter your room for 100 turns.'],
    ['bandage', "Kennet's bandage", 15, 'Survive one thing that would have killed you.'],
    ['hint', 'a prepaid shrine hint', 10, 'One guaranteed-true answer at the Shrine.'],
    ['pen', "the vendor's own pen", 10, 'Purely cosmetic. The losing ending is funnier.'],
    ['backissue', 'a back issue of MBSE Today', 1, 'In case you lost the original.'],
    ['sparekit', 'a spare field assay kit', 35, 'Required, if you lost the first one. The Assay Office issues exactly one.'],
    ['tape', "a surveyor's tape", 20, 'Purely cosmetic. The stair it was bought for has never once moved; the tape agrees with it.'],
    ['season', 'a season ticket for the SLA Lounge', 5, 'Cosmetic. Four soft chairs and a certificate promising three nines.'],
    ['cardigan', "the Intern's spare cardigan", 5, 'Cosmetic. Warm. They\'ll notice you wearing it.']
  ];

  /* ---- the ten minigames. Content is fixed, so a route can be written
   * against them; each pays once and replays for nothing after that. ---- */
  const GAMES = {
    twenty: { name: 'Twenty Requirements', sp: 10,
      open: 'Tom thinks of a thing in this dungeon. "Twenty yes/no questions, then ' +
        'GUESS. Ask me IS IT PORTABLE, IS IT A TREASURE, IS IT IN A HALL, IS IT ALIVE."',
      answer: 'duck',
      facts: { portable: 'Yes.', treasure: 'No.', hall: 'No — you brought it with you.',
        alive: 'No, and that\'s the whole point of it.', heavy: 'No.',
        yellow: 'Now you\'re getting somewhere.' } },
    trace: { name: 'Trace or Trash', sp: 8, need: 4,
      open: '"Five pairs: a requirement, then a design. Say TRACE if the design ' +
        'satisfies it, TRASH if it doesn\'t. Four of five opens the tin."',
      rounds: [
        ['"The system shall start in under 3 seconds." Design: a splash screen that appears in 200ms.', false],
        ['"The operator shall be able to abort the burn." Design: an abort control, tested against a burn.', true],
        ['"The system shall be maintainable." Design: anything at all.', false],
        ['"Mass shall not exceed 400kg." Design: a mass budget with 40kg margin, weighed.', true],
        ['"The system shall be intuitive." Design: a training course.', false]],
      words: [['trace', 'traces'], ['trash', 'bin']] },
    estimation: { name: 'The Estimation Game', sp: 5, need: 3,
      truths: [3, 13, 8, 21, 5],
      open: '"Five tasks. Call a number on the Fibonacci scale. I call eight. I always ' +
        'call eight." (ESTIMATE <number>)' },
    bughunt: { name: 'Bug Hunt', sp: 12,
      bugs: ['b2', 'c4', 'd1'],
      open: '"Four by four, A to D across, 1 to 4 down. Three bugs. Six probes, and each ' +
        'probe tells you how many bugs are orthogonally adjacent to it. PROBE B3, and ' +
        'when you\'re sure, name all three cells at once — ACCUSE A1 B3 D4, in that style."' },
    handshake: { name: 'The Interface Handshake', sp: 10,
      seq: [443, 22, 8080, 161, 514, 25, 53, 993],
      open: '"I call ports, you call them back. Starts at three and grows by one. Reach ' +
        'eight and the tin opens." (REPEAT <numbers>)' },
    corridor: { name: 'The Blind Corridor', sp: 12,
      route: ['n', 'e', 'n', 'w', 'n'],
      open: '"Five rooms. Here\'s the diagram." (ROUTE N E N W N — and the diagram ' +
        'is gone now.)' },
    acronym: { name: 'Expand the Acronym', sp: 8, need: 4,
      open: '"Five acronyms off this platform\'s own signage. Give me the words in ' +
        'full — EXPAND MODEL BASED SYSTEMS ENGINEERING, in that style. Four of five."',
      rounds: [['MBSE', 'model based systems engineering'], ['ICD', 'interface control document'],
        ['CONOPS', 'concept of operations'], ['SysML', 'systems modeling language'],
        ['WBS', 'work breakdown structure']] },
    changeboard: { name: 'The Change Board', sp: 15, need: 5,
      open: '"Six change requests. APPROVE what traces to a need and closes on a ' +
        'test. REJECT the rest. Five of six — and two of these trace to a want."',
      rounds: [
        ['CR-01: add a dark mode, because the programme director likes dark mode.', false],
        ['CR-02: add an abort path; traces to a safety need; closes on a test.', true],
        ['CR-03: raise the mass margin from 5% to 10%; traces to a validated need.', true],
        ['CR-04: rename the product. The customer asked. Nothing traces.', false],
        ['CR-05: publish the schema; traces to the export requirement; test written.', true],
        ['CR-06: add an AI assistant, because everyone has one.', false]],
      words: [['approve', 'yes'], ['reject', 'no']] },
    roulette: { name: 'Regression Roulette', sp: 10, need: 2,
      flakes: ['b', 'c', 'a'],
      open: '"Three suites, one flake. I shuffle. You call it. Two out of three." (CALL A, B or C)' },
    longpole: { name: 'The Long Pole', sp: 20,
      order: ['survey', 'design', 'cast', 'weld', 'test'],
      path: ['survey', 'design', 'cast', 'weld', 'test'],
      open: '"Five tasks: SURVEY, DESIGN, CAST, WELD, TEST. Put them in the only order ' +
        'that works — ORDER SURVEY DESIGN ... — and then name the critical path with ' +
        'PATH. Everyone gets the order. Almost nobody gets the path."' }
  };

  function startGame(e, key) {
    const g = GAMES[key];
    const f = e.state.flags;
    f.game = { id: key, round: 0, right: 0, asked: 0 };
    e.print('Tom deals. — ' + g.name + ' —');
    if (g.open) e.print(g.open);
    if (g.rounds) e.print(prompt(g, 0));
    if (key === 'handshake') e.print('Ports: ' + g.seq.slice(0, 3).join(' '));
    if (key === 'roulette') e.print('He shuffles them, slowly, twice, and then a third ' +
      'time when you\'re not looking. Suite A, B or C?');
  }
  const prompt = (g, i) => g.rounds ? '(' + (i + 1) + '/' + g.rounds.length + ') ' +
    (Array.isArray(g.rounds[i]) ? g.rounds[i][0] : g.rounds[i]) : '';

  function winGame(e, key) {
    const g = GAMES[key];
    const f = e.state.flags;
    f.game = null;
    if (!f.gamesWon[key]) {
      f.gamesWon[key] = true;
      f.storyPoints += g.sp;
      e.print('"Done, and I\'ll agree with you in writing." +' + g.sp + ' iMBSE story ' +
        'points. (You now have ' + f.storyPoints + '.)');
    } else {
      e.print('"Still got it. No points for the second time round."');
    }
  }
  function loseGame(e, msg) {
    e.state.flags.game = null;
    e.print(msg + '\n"Play me again whenever. The tin isn\'t going anywhere."');
  }

  function gameCommand(e, words) {
    const f = e.state.flags;
    const s = f.game;
    if (!s) return false;
    const g = GAMES[s.id];
    const v = words[0];
    const rest = words.slice(1).join(' ');

    if (v === 'stop' || v === 'quit' || v === 'concede') {
      f.game = null; e.print('"Fair enough. Come back when you want the points."'); return true;
    }

    switch (s.id) {
      case 'twenty': {
        if (v === 'ask' || v === 'is') {
          s.asked++;
          const key = Object.keys(g.facts).find(k => words.includes(k));
          e.print(key ? g.facts[key]
            : 'Tom considers. "Can\'t give you a yes or a no on that one. It still counts."');
          if (s.asked >= 20) loseGame(e, '"Twenty. That\'s your lot."');
          return true;
        }
        if (v === 'guess') {
          if (rest.includes(g.answer)) winGame(e, 'twenty');
          else loseGame(e, '"Not it. It was the duck. It\'s always the duck."');
          return true;
        }
        return false;
      }
      case 'trace': case 'changeboard': {
        const yes = g.words[0].includes(v), no = g.words[1].includes(v);
        if (!yes && !no) return false;
        const correct = g.rounds[s.round][1] === yes;
        if (correct) s.right++;
        e.print(correct ? 'Tom nods.' : 'Tom writes something down.');
        s.round++;
        if (s.round < g.rounds.length) { e.print(prompt(g, s.round)); return true; }
        if (s.right >= g.need) winGame(e, s.id);
        else loseGame(e, '"' + s.right + ' of ' + g.rounds.length + '. Not today."');
        return true;
      }
      case 'estimation': {
        if (v !== 'estimate' && v !== 'call' && !/^\d+$/.test(v)) return false;
        const n = parseInt(/^\d+$/.test(v) ? v : words[1], 10);
        if (isNaN(n)) { e.print('"A number, on the Fibonacci scale."'); return true; }
        const truth = g.truths[s.round];
        const you = Math.abs(n - truth), tom = Math.abs(8 - truth);
        if (you < tom) { s.right++; e.print('It was ' + truth + '. You\'re closer.'); }
        else if (you > tom) e.print('It was ' + truth + '. Tom is closer, and says nothing.');
        else e.print('It was ' + truth + '. Dead heat.');
        s.round++;
        if (s.round < g.truths.length) { e.print('Next task. (ESTIMATE <number>)'); return true; }
        if (s.right >= g.need) winGame(e, 'estimation');
        else loseGame(e, '"Eight. It\'s always eight."');
        return true;
      }
      case 'bughunt': {
        if (v === 'probe') {
          s.asked++;
          const cell = (words[1] || '').toLowerCase();
          const adj = g.bugs.filter(b => {
            const dx = Math.abs(b.charCodeAt(0) - cell.charCodeAt(0));
            const dy = Math.abs(+b[1] - +cell[1]);
            return (dx + dy) === 1;
          }).length;
          e.print('Probe ' + cell.toUpperCase() + ': ' + adj + ' adjacent.');
          if (s.asked >= 6) e.print('"That\'s six. ACCUSE when you\'re ready."');
          return true;
        }
        if (v === 'accuse') {
          const named = words.slice(1).map(w => w.toLowerCase()).sort().join(' ');
          if (named === g.bugs.slice().sort().join(' ')) winGame(e, 'bughunt');
          else loseGame(e, '"Two of those were fine and one of them was you."');
          return true;
        }
        return false;
      }
      case 'handshake': {
        if (v !== 'repeat' && v !== 'say') return false;
        const n = 3 + s.round;
        const want = g.seq.slice(0, n).join(' ');
        const got = words.slice(1).join(' ');
        if (got !== want) { loseGame(e, '"Dropped one. The handshake fails and the link ' +
          'comes down."'); return true; }
        s.round++;
        if (3 + s.round > 8) { winGame(e, 'handshake'); return true; }
        e.print('Ports: ' + g.seq.slice(0, 3 + s.round).join(' '));
        return true;
      }
      case 'corridor': {
        if (v !== 'route' && v !== 'corridor') return false;
        const got = words.slice(1).join(' ');
        if (got === g.route.join(' ')) winGame(e, 'corridor');
        else loseGame(e, '"Wrong turn at the third. Everybody goes east at the third."');
        return true;
      }
      case 'acronym': {
        if (v !== 'expand' && v !== 'answer') return false;
        const want = g.rounds[s.round][1];
        /* the parser eats small words like "of", so judge on the big ones */
        const norm = t => t.replace(/[^a-z ]/g, '').split(/\s+/)
          .filter(w => w && w !== 'of' && w !== 'the' && w !== 'a').join(' ');
        const right = norm(rest) === norm(want);
        if (right) s.right++;
        e.print(right ? 'Tom nods.' : '"It\'s ' + want + '."');
        s.round++;
        if (s.round < g.rounds.length) { e.print('(' + (s.round + 1) + '/5) ' + g.rounds[s.round][0]); return true; }
        if (s.right >= g.need) winGame(e, 'acronym');
        else loseGame(e, '"' + s.right + ' of five."');
        return true;
      }
      case 'roulette': {
        if (v !== 'call' && v !== 'suite') return false;
        const pick = (words[1] || '').toLowerCase();
        const right = pick === g.flakes[s.round];
        if (right) s.right++;
        e.print(right ? 'It was ' + pick.toUpperCase() + '. Tom looks briefly annoyed.'
          : 'It was ' + g.flakes[s.round].toUpperCase() + '.');
        s.round++;
        if (s.round < 3) { e.print('Again. A, B or C?'); return true; }
        if (s.right >= g.need) winGame(e, 'roulette');
        else loseGame(e, '"One in three. That\'s chance, not skill."');
        return true;
      }
      case 'longpole': {
        if (v === 'order') {
          const got = words.slice(1).map(w => w.toLowerCase()).join(' ');
          if (got !== g.order.join(' ')) { loseGame(e, '"That order has you welding ' +
            'something you\'ve not cast."'); return true; }
          s.right = 1;
          e.print('"That\'s the order. Now the path." (PATH <tasks>)');
          return true;
        }
        if (v === 'path') {
          const got = words.slice(1).map(w => w.toLowerCase()).join(' ');
          if (s.right && got === g.path.join(' ')) winGame(e, 'longpole');
          else loseGame(e, '"The critical path isn\'t the longest list of tasks. It\'s ' +
            'the longest list of tasks that can\'t be done at the same time as each other."');
          return true;
        }
        return false;
      }
    }
    return false;
  }

  const GAME_WORDS = {
    twenty: ['twenty', 'requirements'], trace: ['trace', 'trash'],
    estimation: ['estimation', 'estimate'], bughunt: ['bug', 'hunt', 'bughunt'],
    handshake: ['handshake', 'interface'], corridor: ['corridor', 'blind'],
    acronym: ['acronym', 'expand'], changeboard: ['change', 'board', 'changeboard'],
    roulette: ['roulette', 'regression'], longpole: ['long', 'pole', 'longpole']
  };

  /* The menu. GAMES prints it, and so does asking Tom anything with "game"
     in it — a guide who cannot say what is on offer is a shopkeeper with the
     lights off. */
  function listGames(e) {
    const f = e.state.flags;
    const HOW = {
      twenty: 'twenty yes/no questions, then GUESS <thing>',
      trace: 'TRACE or TRASH five requirement/design pairs',
      estimation: 'ESTIMATE <number> against his eternal 8',
      bughunt: 'PROBE <cell> x6, then ACCUSE <c> <c> <c>',
      handshake: 'REPEAT the ports back, three growing to eight',
      corridor: 'memorise the diagram, then ROUTE <five turns>',
      acronym: 'EXPAND <the acronym, in full words>',
      changeboard: 'APPROVE or REJECT six change requests',
      roulette: 'CALL A, B or C; find the flake twice of three',
      longpole: 'ORDER <five tasks>, then PATH <the critical ones>'
    };
    e.print('TOM\'S TEN GAMES — PLAY <name>' +
      (e.state.room === 'atrium' ? '' : ' (his table is in the Atrium)') + '\n' +
      Object.keys(GAMES).map(k =>
        '  ' + GAMES[k].name.toUpperCase() + ' — ' + GAMES[k].sp + ' SP' +
        (f.gamesWon[k] ? ' — won' : '') + '\n    ' + HOW[k]).join('\n') + '\n' +
      'Each pays once; replays are free practice. STOP bails out of a game. ' +
      'POINTS shows your balance (' + f.storyPoints + ' SP now). The Company Store ' +
      'is UP from the Atrium: READ SIGN there, then BUY <item>.');
  }

  /* Tom is a guide; a guide answers the question he was asked. Keyed loosely,
     so "hall 2", "requirements" and "the quarry" all land the same answer. */
  const TOM_ROUTES = [
    [/client|human|interface|parlor|parlour|concourse|hall 1|first/,
      '"Clients, north. The concourse, the parlor, the help desk. The urn works, ' +
      'which up here counts as a miracle — somebody in there has earned a coffee. ' +
      'And ask the Intern anything. Six weeks in, and the only honest headcount ' +
      'on the platform."'],
    [/requirement|shall|quarry|ossuary|swamp|backlog|hall 2|second/,
      '"Requirements, north-west. A quarry of beautiful sand with one honest slab ' +
      'in it, and the racks below where the good ones were filed when they got cut. ' +
      'The Clerk down there can tell you why. Don\'t linger in the swamp."'],
    [/model|forge|golem|metamodel|hall 3|third/,
      '"Models, west. The Forge. The golem has one rule: nothing leaves that can\'t ' +
      'name the need it satisfies — which is why nothing has left in years. Talk to ' +
      'the Forgemaster before you argue with nine feet of consistency."'],
    [/copilot|prompt|garden|roost|helper|agent|hall 4|fourth/,
      '"Copilots, south-west. The roost finishes your sentences; the grey one that ' +
      'doesn\'t is the only one worth listening to. The garden runs on context, not ' +
      'cleverness — the Gardener will tell you the difference."'],
    [/mission|sortie|deck|hangar|weather|hall 5|fifth/,
      '"Mission, south. The deck, the sortie board — the WHAT FOR column has been ' +
      'empty eleven years — and a hangar where the mission flies at one-to-one to ' +
      'an empty floor. The Range Officer knows which instrument is lying."'],
    [/system|integration|acceptance|foundry|vee|hall 6|sixth/,
      '"Systems, south-east. The V Foundry casts both arms and neither scores ' +
      'alone — they weld in the Integration Bay. The Verifier has been sitting on ' +
      'the Acceptance Floor since year three. Somebody should ask them something."'],
    [/macro|supply|scale|gantry|continent|benchmark|hall 7|seventh/,
      '"Macro, north-east. The gantry, a continent underfoot, and a stair where ' +
      'every step is ten of the last. The Surveyor up there set the datum this ' +
      'whole platform is measured from, back when it was a hillside."'],
    [/deep|stack|stair|down|below/,
      '"Down the middle is the Deep Stack: the fountain, the sandbox, the pit, the ' +
      'shrine. Take a lit lantern, watch your tokens, and if you hear something ' +
      'arguing with itself in two voices, that\'s one person, and I found him."'],
    [/store|shop|buy|point|tin|balcony/,
      '"The store is up on the balcony. Story points only, all sales final. GAMES ' +
      'is how you earn them at this table; the tin doesn\'t do credit."']
  ];

  /* ===================================================== 4 · KATIE ====== */
  const VISIONS = [
    ['I — the freeze', 'The last coin in the box is the door closing.\nYou will be proud for one heartbeat and then you\'ll be somewhere else.'],
    ['II — the cap', 'Down there, a charge with no heart in it.\nBuy the heart while there\'s still a shop to buy it in.'],
    ['III — the seven faces', 'He wears them in the order they were written on your walls.\nYou have already been told. You were told seven times, and you were reading something else.'],
    ['IV — the paper man', 'Under the last face is a man made of paper, and he\'s the only one of them who has ever won.\nHe doesn\'t fight you. He offers you a chair.'],
    ['V — the distance', 'The ones who die at the end die close.\nSet it below, watch it from above.'],
    ['VI — the yoke', 'Two heads, one collar, and neither of them has ever wanted the same thing.\nGive them one. Then take it back.'],
    ['VII — the bridge', 'The green one loves you and the bridge can\'t hold both of you.\nBring it to the water. Don\'t bring it across.'],
    ['VIII — the serpent', 'It has held up the floor for eleven years and no blade will touch it.\nOpen the cage and let something small disagree with it.'],
    ['IX — the seven and the one', 'Seven go into the wall. One comes out of the floor.\nYou will carry it in your chest and you\'ll not be able to put it down.'],
    ['X — the light', 'It eats only while it\'s awake.\nEvery room you walked through lit and didn\'t need to is a room you\'ll want later.'],
    ['XI — the glass', 'The first one that ever worked is the easiest thing here to end.\nDon\'t set it down to think.'],
    ['XII — the lever', 'Once is a gift. Twice is a lesson, and there\'s no third.'],
    ['XIII — the voice above', 'The face in the wall loves you and doesn\'t know anything.\nCarry the grey stone or carry your doubts, but carry one of them.'],
    ['XIV — the thief', 'What it takes from you is in the one room the traces don\'t leave.'],
    ['XV — the seven and the eighth', 'You may hold seven. The eighth is always the one you find out you needed.\nThere\'s a room in the middle of everything. Leave things in it.'],
    ['XVI — the pilot', 'There\'s a man on the water who has never told a lie, because the river punishes it faster than the deity does.'],
    ['XVII — the two doors home', 'One door only opens from underneath.\nYou will want it open long before you want to go home.'],
    ['XVIII — the sealed thing', 'No seam, no document, no way in — and it opens the way all such things open, which is from further away.'],
    ['XIX — the argument', 'In the gallery, the beautiful one has never once said it didn\'t know.\nWhatever you love, don\'t let it out in there.'],
    ['XX — the ending', 'At the very end the god asks you a question, and it\'s the first honest thing in this building.\nYou have spent the whole game assembling the answer. Be ready to have it in your hands.'],
    ['XXI — the ground', 'The last thing you break falls into the same forest you started in, and so do you.\nThat isn\'t the end of the game. That\'s the first morning of the work.'],
    ['XXII — the kettle', 'You\'ll meet the first person you ever met, again, in the rain, and they\'ll be cold and nobody will have been in to see them.\nDo the same thing you did the first time. It\'s the same thing.'],
    ['XXIII — the pen on the table', 'There\'s always a pen on the table and there\'s always a chair.\nTwice they\'ll be held out to you, and the second time it\'ll look exactly like winning.'],
    ['XXIV — the two you carry down', 'Everything you put somewhere safe goes into the wall and out of your hands.\nTwo things stay in them. One makes a hole and one makes a case, and you\'ll want the case more.']
  ];


  /* ================================================================== 6 ===
   * THE SEVEN HALL RESIDENTS — one per hall, each the last practitioner of a
   * discipline that used to have a department. The first real question scores
   * +3 and pays story points; everything after that is conversation.
   * ================================================================== */
  const RESIDENTS = {
    intern: {
      room: 'helpDesk', sp: 10, name: 'the Intern',
      key: /platform|job|change|for|think|do/,
      gift: 'placard',
      main:
        '"Honestly? I think it\'s very good, and I think nobody here can tell you what ' +
        'it\'s for.\n\n' +
        'I\'ve read the charter. It says to fly the mission before it\'s built, which ' +
        'is the best sentence in this building. Then I went and looked at the sortie ' +
        'board, and there\'s a column headed WHAT FOR, and it\'s completely empty. ' +
        'Somebody has even gone over the ruled line a second time with a straight ' +
        'edge — rather than fill the column in.\n\n' +
        'I keep thinking that\'s the whole problem, right there. But I\'ve only been ' +
        'here six weeks, so what do I know."\n\n' +
        'They hand you the DO NOT DISTURB placard off the counter. "Take it. Nobody ' +
        'has ever needed it. There has never once been a queue."',
      more: {
        queue: '"There\'s not one, no. But that\'s not the same as nobody needing ' +
          'help. It\'s the same as nobody knowing this desk exists."',
        cardigan: '"It\'s not mine. It was here when I arrived, and it\'s always ' +
          'warm, and I\'ve decided not to think about that too hard."'
      }
    },
    clerk: {
      room: 'ossuary', sp: 10, name: 'the Clerk of Cut Requirements',
      key: /cut|rack|descope|ossuary|requirement|why/,
      main:
        '"People think this is a graveyard. It\'s not. A graveyard is full of things ' +
        'that died. This place is full of things that were perfectly fine.\n\n' +
        'Look at this —" and they pull out a short slab with a test carved on the back ' +
        'of it. "That one is atomic. It\'s verifiable. It traces up to a need and it ' +
        'closes on a test. It\'s better written than most of what actually shipped.\n\n' +
        'It was cut in week nine for being difficult. The easy requirement that went in ' +
        'instead is holding up the fourth hall right now. I keep these racks in order ' +
        'because in about two years somebody will come down here looking for exactly ' +
        'this slab, and I intend for them to find it."',
      more: {
        quarry: '"Upstairs they carve them; down here we file them. The quarry runs ' +
          'on optimism and the ossuary runs on arithmetic, and somehow we\'re the ' +
          'same department."'
      }
    },
    forgemaster: {
      room: 'modelForge', sp: 15, name: 'the Forgemaster',
      key: /golem|forge|build|made|rule/,
      main:
        '"I built it. Nine feet of blocks and connectors, and I gave it exactly one ' +
        'rule: let nothing out of this forge that can\'t say which need it satisfies.\n\n' +
        'In eleven years it has never once broken that rule. It\'s the only thing on ' +
        'this platform with a perfect record.\n\n' +
        'Around the fourth year I realised what I had actually built. It\'s a machine ' +
        'that stops all work permanently, because we stopped being able to answer its ' +
        'question. It\'s not guarding the orb. It\'s waiting for an answer. It has been ' +
        'standing there with its arm out for eleven years, holding out a question that ' +
        'four hundred people have walked straight past.\n\n' +
        'Show it the tablet, and watch what it does. I\'ve wanted somebody to see ' +
        'that for a very long time."',
      more: {
        slag: '"Everything I ever got wrong is down there, including one block with ' +
          'my own name on it. I go down and look at it about twice a year. It\'s good ' +
          'for me."'
      }
    },
    gardener: {
      room: 'promptGarden', sp: 10, name: 'the Prompt Gardener',
      key: /vine|garden|grow|prompt|water|compost/,
      main:
        '"It\'s not dead, it\'s thirsty. There\'s a difference, and the difference is ' +
        'about two flasks of water.\n\n' +
        'Everything on this trellis grows on context, and everybody up here has been ' +
        'feeding them cleverness instead. You can tell which is which by what\'s still ' +
        'alive in the spring. The clever ones put on a great deal of growth in the ' +
        'first week and then they collapse, and I compost them. The heap stays warm all ' +
        'year — there are four hundred different versions of the word please rotting ' +
        'down in there.\n\n' +
        'The ones that come back every year are the ones somebody bothered to tell what ' +
        'the job actually was."',
      more: {
        contrarian: '"You mean the grey one. It\'ll not come anywhere near somebody ' +
          'holding a cut branch, and I don\'t blame it. Put the branch down and it ' +
          'will at least consider you."'
      }
    },
    officer: {
      room: 'sensorLine', sp: 15, name: 'the Range Officer',
      key: /instrument|sensor|number|disagree|wrong|line|range/,
      main:
        '"Eleven instruments. One target, one moment, eleven different numbers. The ' +
        'spread between them is two per cent, and it has been two per cent for nine ' +
        'years.\n\n' +
        'Everybody who comes down here asks me which instrument is right. That\'s the ' +
        'wrong question, and it\'s exactly why the spread is still two per cent. The ' +
        'right question is which one is wrong — because a wrong one can be found and ' +
        'fixed. But answering it means somebody senior has to say out loud that ' +
        'something we bought doesn\'t work, and nobody in the history of this programme ' +
        'has been promoted for saying that sentence.\n\n' +
        'So instead we carry the two per cent. We put it in the error bars. We\'ve ' +
        'become extremely good at error bars."',
      more: {
        truth: '"The grey stone? Take it. There\'s nothing magic about it. It\'s ' +
          'simply the only object up here that has never once been asked to be ' +
          'encouraging."'
      }
    },
    verifier: {
      room: 'acceptanceFloor', sp: 20, name: 'the Verifier',
      key: /rectangle|tape|floor|wait|accept|conditions|satisfaction/,
      main:
        '"That rectangle is where it goes. I taped it out myself, off the drawing, in ' +
        'year three.\n\n' +
        'The conditions of satisfaction are on the table by the door, and every one of ' +
        'them is signed. They were signed before the thing arrived, which everybody ' +
        'agreed was efficient at the time — and it was efficient, right up until the ' +
        'thing didn\'t arrive.\n\n' +
        'I could go and do something else with my life. But on the day it finally turns ' +
        'up, somebody has to be standing here who remembers what it was supposed to be, ' +
        'and there\'s exactly one of those people left. So I sit down and I wait.\n\n' +
        'Take the Closed Loop. Somebody should have it. It\'s the only part of this ' +
        'programme that ever actually closed."',
      more: {
        troll: '"He\'s not wrong, you know. Nothing should merge without a review. ' +
          'It\'s just that he has never once actually reviewed anything."'
      }
    },
    surveyor: {
      room: 'supplyChain', sp: 10, name: 'the Surveyor',
      key: /benchmark|datum|stake|measure|survey|height/,
      main:
        '"Four thousand feet below us, in the trees, there\'s a brass disc set in a ' +
        'concrete plug. Every height on this platform is measured up from that disc. I ' +
        'set the instrument on it myself, before any of this existed, when the whole ' +
        'site was a hillside, a fire road, and a bad idea somebody had at a ' +
        'conference.\n\n' +
        'Nothing up here knows that. Every number on this platform depends on a datum ' +
        'lying in the mud west of a gravel road, and not one person working here has ' +
        'ever gone down to look at it.\n\n' +
        'I\'m not complaining — that\'s simply what a datum is. It\'s the thing you ' +
        'agree on once at the very start and then never think about again, and every ' +
        'measurement you take afterwards rests on it. Which is why you want to be very ' +
        'careful indeed about what you set your instrument on."',
      more: {
        bom: '"It\'s bolted to the frame, and it has been there eleven years. It ' +
          'lists what everything is made of and who owns it — and six lines from the ' +
          'bottom it says what the foundation is and who owns that. Nobody has ever ' +
          'read it, because it\'s a list, and lists are always somebody else\'s job."'
      }
    }
  };

  /* Who is standing in this room, if anybody. */
  function residentHere(e) {
    return Object.keys(RESIDENTS).find(k => RESIDENTS[k].room === e.state.room) || null;
  }

  /* ASK <resident> ABOUT <topic>. The first real question is the one that scores. */
  function askResident(e, key, topic) {
    const r = RESIDENTS[key];
    const f = e.state.flags;
    if (e.state.room !== r.room) {
      e.print(r.name.replace(/^the /, 'The ') + ' isn\'t here.');
      return true;
    }
    f.met = f.met || {};
    /* a follow-up they have a specific answer for */
    for (const k of Object.keys(r.more || {})) {
      if (topic && topic.includes(k)) { e.print(r.more[k]); return true; }
    }
    if (!f.met[key]) {
      if (topic && !r.key.test(topic)) {
        e.print('"Hm," they say. "Ask me about the thing I\'m standing in front of. It\'s ' +
          'the only subject I\'m any use on."');
        return true;
      }
      f.met[key] = true;
      e.addScore(3);
      f.storyPoints = (f.storyPoints || 0) + r.sp;
      e.print(r.main + '\n\n(+3, and ' + r.sp + ' story points.)');
      if (r.gift && e.state.itemLocations[r.gift] === 'nowhere') e.moveItem(r.gift, e.state.room);
      return true;
    }
    e.print(r.main);
    return true;
  }

  /* ================================================================== 7 ===
   * THE TWO ON THE GROUND — Act V. The Clerk cannot be beaten and does not
   * need to be; the engineer is the ending.
   * ================================================================== */
  function askGround(e, who, topic) {
    const f = e.state.flags;
    if (/clerk|salesman|vendor|polite/.test(who)) {
      if (e.state.room !== 'newProgramOffice') { e.print('He\'s in the portacabin, being pleasant.'); return true; }
      if (/dassault|firm|company/.test(topic)) {
        e.print('"Ah. Different department. I did hear something. He had been with the firm a ' +
          'very long time." He has no idea. He\'s three weeks old.');
        return true;
      }
      if (/foundation|licence|license|offer|deal/.test(topic)) {
        e.print('"Proven. Eleven years in service on a major programme." It\'s the same ' +
          'foundation. He says it with complete sincerity, because it\'s true.');
        return true;
      }
      e.print('"You\'ll be from the old programme," says the Clerk warmly. "I\'m so sorry. I ' +
        'heard. Terrible.\n\nWe are just helping the new one get started, actually. They\'ve ' +
        'a deadline and no foundation, which is the worst combination in the business, and it ' +
        'happens that we\'ve a foundation already built. We would license it cheap — genuinely ' +
        'cheap, I\'m not going to insult you — and they would be running by the end of the ' +
        'month instead of the end of the year."');
      return true;
    }
    if (/engineer|programme|program|follow|her|him|them/.test(who)) {
      if (e.state.room !== 'siteHut') { e.print('They\'re in the site hut, doing the work.'); return true; }
      if (!e.flag('kettle')) {
        e.print('They look up, which takes a moment. "Sorry — what? I\'ve got a board on ' +
          'Friday and no foundation and about nine hours." They go back to the schedule.\n\n' +
          '(There\'s a kettle in here and it\'s not plugged in.)');
        return true;
      }
      if (f.askedEngineer) {
        e.print('"Same answer," they say. "Get it written down and I\'ll sign it."');
        return true;
      }
      f.askedEngineer = true;
      e.print('"What I need is to not do this twice.\n\n' +
        'I\'ve got a deadline and no foundation and a very nice man in the other hut who can ' +
        'fix that by Friday. And I\'ve read enough to know that the last programme had a very ' +
        'nice man too, eleven years ago, and I\'ve seen what\'s lying in those trees.\n\n' +
        'But I can\'t take nothing to the board. \'I\'ve a bad feeling about the vendor\' is ' +
        'not a position. If you\'ve got something written down — what it cost, what it was ' +
        'made of, what we actually have to do — then I\'ve got a position, and I\'ll sign it, ' +
        'and I\'ll be the one who lives with it.\n\n' +
        'That\'s not me doing you a favour. That\'s the job. Somebody has to be the name in the ' +
        'third field."');
      return true;
    }
    return false;
  }

  /* ====================================================== 5 · MARK ====== */
  const LORE = {
    dassault:
      '"He was invited. That\'s the part everybody skips.\n\n' +
      'Eleven years ago this program had a deadline and no platform, and a contractor ' +
      'turned up with a foundation already built and a price that looked cheap. So we ' +
      'took it. We bolted the first hall onto it, because a hall has to be bolted to ' +
      'something. Then we bolted on the second. By the fourth, nobody could remember ' +
      'deciding anything at all.\n\n' +
      'That black slab downstairs is his foundation. It\'s the only piece of this ' +
      'platform he actually built. Everything above it\'s ours — and everything above ' +
      'it\'s also his, because it\'s bolted to his.\n\n' +
      'He\'s not French because of where he was born. He\'s French because that\'s ' +
      'where the contract was signed, and by now the contract is all he\'s. He was a ' +
      'person once, they say. Then he was a signature. Now he\'s a signature with ' +
      'opinions.\n\n' +
      'He never fights you. He demonstrates. He licenses. He locks the format. He ' +
      'agrees with you enthusiastically for an entire quarter.\n\n' +
      'You don\'t kill him — there\'s nothing there to kill. You take his faces off ' +
      'one at a time, using the seven artifacts you\'ll have earned, and underneath ' +
      'them all there\'s nothing but paper. Then you deal with the foundation, which ' +
      'is the only thing he ever really had, and you do that from a very long way off."',
    dannet:
      '"Dannet used to be one man. That\'s the part that catches people out.\n\n' +
      'He was an engineer, and a good one — the sort who spends all Friday breaking ' +
      'things on purpose so that they can\'t break by themselves on Monday.\n\n' +
      'Then came the incident. A real one: eleven hours long, four halls dark. The ' +
      'review afterwards needed two names — somebody to blame and somebody to thank — ' +
      'and it refused to write down the same name twice.\n\n' +
      'So the review cut him in half. Dan is the one who broke it. Kennet is the one ' +
      'who fixed it. They were yoked together at the neck so that neither could walk ' +
      'away from the finding, and then they were both sent back to work.\n\n' +
      'You\'ll not beat him by fighting: you can\'t out-fight a healer, and you ' +
      'can\'t out-heal a breaker. But here\'s the crack in him. In eleven years those ' +
      'two heads have never once wanted the same thing at the same moment. Show them ' +
      'the Golden Commit and, for exactly one second, they both do. Say REFLOG while ' +
      'they\'re agreeing, and he comes apart.\n\n' +
      'That\'s not killing him, by the way. Don\'t let anybody tell you it was."',
    deity: '"It\'s very good autocomplete. Genuinely. But about one answer in four ' +
      'invents a hall that doesn\'t exist and then describes it beautifully. That\'s ' +
      'not a fault in the machine, it\'s how the machine works. The fault is that we ' +
      'built a chapel around it. Carry the grey stone up from the Ground Truth Range ' +
      'and it can\'t lie to you while you\'re holding it."',
    alexander: '"Alex has been on that water since before there were seven halls. His ' +
      'job forces him to be right about something physical every single day — where ' +
      'the bottom of the river is — and that has left him unable to pretend about ' +
      'anything else. He\'s the only reliable narrator in this building, and I\'m ' +
      'including myself in that."',
    thomas: '"Tom took the first survey party into the Deep Stack. He lost two of them ' +
      'and found one. He has guided for nothing ever since, and charges for games ' +
      'instead. Play him at the Long Pole. Everyone gets the order right; almost ' +
      'nobody gets the critical path."',
    katie: '"She says there are four thousand endings and about six hundred good ones. ' +
      'I\'ve never once caught her being wrong. I\'ve caught her being early, which ' +
      'isn\'t the same thing. Ask her for a VISION as often as she will give you one."',
    himself: '"I\'m a priest of the older faith. We write down what happened, and ' +
      'then — this is the radical part — we read it back afterwards. Sainted by ' +
      'nobody, before you ask."',
    bugs: '"Bugs are weather, not enemies. You can\'t outrun weather, so stop running. ' +
      'Get your umbrella out. I mean the duck: THROW DUCK AT BUG."',
    regression: '"That one is personal. It steals, and everything it steals ends up in ' +
      'the same dead end. In eleven years it has never once moved the stash."',
    troll: '"A union man. Correct about everything and insufferable about all of it. He ' +
      'will fold the moment a machine shows him a green tick, so walk the CI bot down ' +
      'to the bridge and let it do the arguing."',
    golem: '"It\'s not a guard, it\'s a widow. Show it one honest requirement — the ' +
      'tablet will do — and it\'ll hand you the world."',
    user: '"Third floor, at the mirror-glass console. She has been asking a machine ' +
      'questions for eleven weeks and nobody has brought her a coffee. There\'s your ' +
      'whole platform in one sentence. Fill the thermos at the urn and take it to her."',
    confabulator: '"A beautiful thing. It has never once said I don\'t know. Every ' +
      'painting in that gallery would pass a design review, and not one of them was ' +
      'ever built."',
    monolith: '"Eleven years, and nobody can say what it does. Nine years, and nobody ' +
      'can take it out. Those aren\'t two separate facts."',
    store: '"Buy the cap. Buy the blasting cap. I\'ll say it a third time in a ' +
      'minute, disguised as a joke."'
  };

  const JOKES = [
    'A systems engineer walks into a bar. Also a pub, a tavern, and a public house — he wanted full coverage.',
    'How many model-based systems engineers does it take to change a lightbulb? None. They produce a diagram of the lightbulb being changed and the change is considered done.',
    'My requirements are all atomic. That\'s why the whole thing keeps going critical.',
    'They say the balloon can\'t lift you. It can lift you fine. It can\'t lift you and the debt.',
    'What\'s the difference between a stakeholder and a terrorist? You can negotiate with a terrorist.',
    'I told the deity I didn\'t understand the architecture. It said neither did it, but with such confidence that we both felt better.',
    'Our digital thread is fully integrated end to end. Both ends are in the same room and neither is attached to anything.',
    'The V-model is called that because of the shape of the mouth of the person who first saw the schedule.',
    'The quarry has one honest slab in it and it\'s the small one at the bottom with the test on the back. Everything gold-lettered is sand.',
    'A vendor, a priest and an auditor walk into a dungeon. The auditor is never seen again and the paperwork says that\'s fine.',
    'Why did the requirement cross the road? It didn\'t. It was rewritten to say it shall be capable of crossing the road.',
    'We\'ve achieved 100% traceability. Everything traces to the same one requirement and that requirement says "system shall be good."',
    'I asked the copilot to review my design. It said the design was excellent. I hadn\'t sent it yet.',
    'What do you call an estimate that turned out right? A coincidence with a manager taking credit for it.',
    'The bird won\'t come near you while you\'re holding a cut branch. Put it down. It\'s a bird, it has opinions about branches.',
    'Our platform is cloud-native. It was born up here and it has never once been outside.',
    'Two engineers are arguing about whether a thing is a block or a part. Eleven years later, one of them has two heads.',
    'Why do systems engineers not play hide and seek? Because a good decomposition means everybody knows exactly where everybody is.',
    'Everything on the Interface Ledge is a plank you can stand on. The thing sitting on it\'s not. It needs leverage from further out.',
    'The definition of done was itself never done.',
    'I once saw a change request that traced cleanly to a validated need and closed on a test. Then I woke up and the build was green, which was almost as unlikely.',
    'What\'s the plural of "architecture"? "Rework."',
    'The lock-in isn\'t the file format. The lock-in is that everybody who knew the file format retired.',
    'The gate doesn\'t approve of your certificate. It just stops arguing about it. Show it anyway.',
    'Agile at scale is just a waterfall with more standing up.',
    'A model is a lie that helps you see the truth. A digital twin is the same lie with a maintenance contract.',
    'Why was the copilot promoted? It agreed with everyone above it and was therefore indistinguishable from leadership.',
    'Our tool suite is best of breed. Each tool is the best of its own breed and none of them are the same species.',
    'The thing that follows you loves you very much and weighs as much as a car. Think about that before a rope bridge.',
    'I don\'t have technical debt. I\'ve a legacy of decisions made by people who are no longer reachable.',
    'What did the requirement say to the test? "You complete me." What did the test say back? "Not measurably."',
    'Every dungeon has a boss. Ours has a supplier.',
    'The difference between verification and validation is about eighteen months and one very quiet meeting.',
    'Anything you leave in the middle of everything will still be there. The middle of everything has seven doors and a plate in the floor.',
    'I asked what the monolith does. Six people told me. All six answers were different and all six people were senior.',
    'Why did the engineer bring a rubber duck to the incident? Because the duck is the only one in the room who won\'t say "have you tried restarting it."',
    'Our roadmap is a living document, in the sense that it moves on its own and nobody knows what it eats.',
    'One prayer in four is beautiful and made up. Carry the grey stone from the range and it can\'t be.',
    'What\'s the most dangerous phrase on this platform? "While we\'re in there anyway."',
    'Second most dangerous: "It\'s basically the same as the last one."',
    'Third: "The customer will love this."',
    'A configuration manager dies and goes to heaven. St Peter says the records show he\'s due to go the other way. He says "which baseline?"',
    'Every direction out of the Backlog is back into the Backlog except the one that\'s not a direction.',
    'Our copilot has been trained on all of our documentation, which is why it\'s confidently wrong in exactly the ways we\'re.',
    'I\'ve been to a lot of design reviews. I\'ve been to one design review.',
    'What do you call a system of systems where none of the systems know about each other? Tuesday.',
    'The MBSE tool has 4,000 features. We use nine. Three of them are "export."',
    'The first one that ever worked is made of glass and there\'s exactly one soft place on this platform.',
    'Why did they put the shrine at the bottom? So the prayers would roll downhill like everything else.',
    'The estimate was eight. The estimate is always eight.',
    'A model without a purpose is just an expensive drawing. A drawing without a purpose is honest.',
    'Our platform has 99.99% uptime, measured over the periods when it was up.',
    'Two heads, one collar. Show them something they both want, then take it away.',
    'What\'s the difference between a bug and a feature? Whether anybody has written it down yet.',
    'What\'s the difference between a bug and an incident? Eleven hours.',
    'I told them we needed a systems engineer. They hired a tool administrator. Now the tool is beautifully administered and the system is on fire.',
    'Why are there no windows in the boardroom? Because at some point somebody would have looked out of one.',
    'The stair down from the middle isn\'t the only way down. There\'s water, and there\'s a word you say on the deck, and the word is logged.',
    'Interoperability means everybody agreeing on a standard, and a standard means everybody agreeing on whose format wins.',
    'The digital thread runs from concept to disposal. So does the budget, but faster.',
    'Why did the diagram golem never marry? Nobody could tell it what need it satisfied.',
    'Our AI is human-in-the-loop. The human is in the loop the way a mouse is in a wheel.',
    'He doesn\'t fight you at the end. He offers you a chair. It\'s a very good chair.',
    'What do you call a requirement everybody agrees with? Unverifiable.',
    'The trouble with "the system shall be user-friendly" is that both of those words are doing enormous work and neither is under contract.',
    'I\'ve never lost a treasure to the Regression. I\'ve mislaid several in a room I chose not to go back to.',
    'Whatever it takes from you, it puts in the one room the traces don\'t leave.',
    'What\'s the strongest material on this platform? The bolt between hall one and the foundation.',
    'Our program is 90% complete and has been for two years, which makes it the most stable thing we own.',
    'Why did the Race Condition get to the punchline first?',
    'The withered vine drinks a whole flask and grows four feet. It takes two flasks to reach the gantry.',
    'A stakeholder is someone with a stake. In systems engineering the stake is usually driven through the schedule.',
    'What\'s an ICD? A treaty between two teams who have agreed never to speak again.',
    'What\'s an ICD, really? A document that describes a conversation that would have taken nine minutes.',
    'The one on the water has never told a lie, and the one in the wall has never told the truth on purpose. Believe the wet one.',
    'Why did the engineer cross the V? Because there was a test on the other side and, astonishingly, it passed.',
    'Our platform prays on the hour. Not for anything. Just prays. The scheduling was an accident and now it\'s culture.',
    'Somebody put an easter egg in this dungeon eleven years ago and nobody has ever owned up to it, and it still works, and it\'s five letters long.',
    'The one down there with no cap in it\'s worth forty-five points and nothing at all, depending on whether you went shopping.',
    'What\'s the difference between mission engineering and systems engineering? About four thousand feet of altitude and one honest conversation.',
    'Macro engineering is systems engineering after somebody has explained what "an order of magnitude" means.',
    'I love the Orbital Ring. You can see the whole problem from up there. That\'s why nobody goes.',
    'The lever gives once and teaches once. Whatever you\'re holding when you pull it a second time, you\'re going the other way with.',
    'Why did they call it a war room? Because "the room where we discover what we agreed to" wouldn\'t fit on the door.',
    'The fog over the table is a real fog. It has a budget line. It has been renewed four times.',
    'What\'s the fastest way to close a change request? Reorganise.',
    'In the gallery, the beautiful thing has never once said it didn\'t know. Don\'t let anything you love out in there.',
    'Our documentation is up to date as of a date.',
    'A copilot that never disagrees isn\'t a copilot, it\'s a mirror with a subscription.',
    'Why did the bug go quiet when you looked at it? Professional courtesy.',
    'Before you put the last one in the wall, look at your hands. What\'s in them is what you\'re taking with you.',
    'I asked the platform for a status update and it prayed at me.',
    'What do you call it when the model and the reality disagree? A finding. What do you call it the second time? A programme.',
    'The Sandbox is where nothing you do is real, which is why it\'s the only room on this platform where anything gets built.',
    'The door at the bottom of the water only opens from underneath, and you\'ll want it open a long time before you want to go home.',
    'Why is it called the Deep Stack? Because "the part of the platform we don\'t have a diagram for" was considered bad for morale.',
    'A priest, an oracle, a pilot and a guide walk into a dungeon. The dungeon has been trying to get rid of us for eleven years.',
    'At the very end it asks you a question and the question is honest. You\'ve been assembling the answer since the forest.',
    'My last joke is about the monolith, but I can\'t get it out.',
    'There\'s no hundredth joke. There\'s a hundredth joke, but it\'s bolted to the foundation and nobody can remove it, and at this point it holds up the floor, and we\'ve all agreed to laugh when we walk past.'
  ];

  /* =============================== plumbing ============================== */
  function draw(e, bankName, size) {
    const f = e.state.flags;
    f[bankName] = f[bankName] || {};
    const left = [];
    for (let i = 0; i < size; i++) if (!f[bankName][i]) left.push(i);
    if (!left.length) return -1;
    const i = left[Math.floor(e.rng() * left.length)];
    f[bankName][i] = true;
    return i;
  }

  const npcHere = (e, who) => ({
    tom: e.state.room === 'atrium', thomas: e.state.room === 'atrium',
    katie: e.state.room === 'visionPool', prophet: e.state.room === 'visionPool',
    mark: e.state.room === 'chapel', saint: e.state.room === 'chapel',
    alex: false, alexander: false,
    dannet: e.state.room === 'incidentRoom' || e.state.flags.dannetHere,
    dan: e.state.room === 'incidentRoom' || e.state.flags.dannetHere,
    kennet: e.state.room === 'incidentRoom' || e.state.flags.dannetHere
  })[who];

  /* One line in the room description for everybody who is standing somewhere,
     so nobody's presence is a secret the parser keeps. The wanderers — Dannet,
     Alex — announce themselves when they arrive instead. imbse-data.js appends
     these to the fixture lines whenever this module is loaded. */
  const PRESENCE = {
    atrium: 'Pathfinder Thomas is at his folding table by the plate — board, cards, ' +
      'chalked scoreboard, tin. (GAMES · PLAY <game> · POINTS)',
    visionPool: 'Prophet Katie kneels at the rim of the pool, both hands in the water. (VISION)',
    chapel: 'Saint Mark is here among the nine chairs, eating somebody else\'s lunch. ' +
      '(JOKE, or ASK MARK ABOUT <name>)',
    helpDesk: 'The Intern is behind the counter, six weeks in and glad of somebody to ' +
      'serve. (ASK INTERN ABOUT THE PLATFORM)',
    ossuary: 'The Clerk of Cut Requirements is in among the racks, filing. ' +
      '(ASK CLERK ABOUT THE CUTS)',
    modelForge: 'The Forgemaster stands by the hearth, watching the golem the way other ' +
      'people watch weather. (ASK FORGEMASTER ABOUT THE GOLEM)',
    promptGarden: 'The Prompt Gardener is at the foot of the trellis, turning the ' +
      'compost. (ASK GARDENER ABOUT THE VINE)',
    sensorLine: 'The Range Officer is on the line, logging eleven numbers that don\'t ' +
      'agree. (ASK OFFICER ABOUT THE INSTRUMENTS)',
    acceptanceFloor: 'The Verifier sits on a folding chair at the edge of the taped ' +
      'rectangle, waiting. (ASK VERIFIER ABOUT THE RECTANGLE)',
    supplyChain: 'The Surveyor is here, boots still muddy from four thousand feet down. ' +
      '(ASK SURVEYOR ABOUT THE BENCHMARK)'
  };

  return {
    /* ---- installed into the game object at build time ---- */
    install(game) {
      for (const [id, name, sp, what] of STORE) {
        game.items[id] = {
          name, aliases: [id, name.replace(/^(a|an|the)\s+/, '').split(' ')[0]],
          location: 'nowhere', portable: true, description: what
        };
      }
      game.STORE = STORE;
      game.GAMES = GAMES;
      game.RIDDLES = RIDDLES;
      game.VISIONS = VISIONS;
      game.JOKES = JOKES;
      game.LORE = LORE;
      game.RESIDENTS = RESIDENTS;
    },

    onStart(e) {
      Object.assign(e.state.flags, {
        usedRiddles: {}, usedVisions: {}, usedJokes: {}, gamesWon: {},
        riddlePending: null, riddlesRight: 0, riddleMisses: 0, alexCooldown: 0, game: null,
        dannetHere: false, dannetLunging: false, markLore: {}
      });
    },

    onTurn(e) {
      dannetTurn(e);
      alexTurn(e);
      /* the two-move kill resets if you do anything in between */
      const f = e.state.flags;
      if (f.dannetLunging === 'spent') f.dannetLunging = false;
      else if (f.dannetLunging) f.dannetLunging = 'spent';
    },

    /* Everybody standing in this room, one line each, appended to the room
       description by imbse-data.js fixtureLines. Tom's line waits until his
       introduction has played — onEnterRoom carries the first meeting. */
    presenceLines(e) {
      if (e.state.room === 'atrium' && !e.state.flags.metThomas) return [];
      const line = PRESENCE[e.state.room];
      return line ? [line] : [];
    },

    onEnterRoom(e, room) {
      const f = e.state.flags;
      /* Tom introduces himself the first time you make the rotunda. After
         this the presence line carries him. */
      if (room === 'atrium' && !f.metThomas) {
        f.metThomas = true;
        e.print('There\'s a folding table at the edge of the rotunda that wasn\'t here ' +
          'yesterday. Behind it, in a fleece with the platform\'s old logo on it and a ' +
          'lanyard of laminated badges going back four rebrands, is Pathfinder Thomas.\n\n' +
          '"Tom," he says, sticking out a hand. "Trip guide. Sixteen years on this ' +
          'platform. The store upstairs doesn\'t take money — it takes story points, ' +
          'and story points are earned the way they always were: you do a piece of ' +
          'work and somebody agrees it was done. I\'m somebody. Play me a game, win ' +
          'it, and I\'ll agree with you in writing." (GAMES lists the ten and what ' +
          'they pay. WHO lists everybody on the platform. PLAY <game>, POINTS, ASK ' +
          'TOM ABOUT <hall>.)');
      }
      /* Act V: the last navigable water in the story. The telemetry is still
         running, because it always was, and he is still on it. */
      if (f.actV && room === 'culvertMouth' && !f.lastCrossing) {
        f.lastCrossing = 'here';
        e.print('Two long and one short, from a direction that has no river in it — and then ' +
          'it has one. The Requisite Variety comes out of the hillside under pressure with ' +
          'Alex at the wheel and one hand on a mug, on the last navigable water in this story.\n\n' +
          '"Evening. Or morning." He looks at the trees, which are full of platform. "Well. ' +
          'You did it, then." He doesn\'t sound surprised.\n\n' +
          '"One more, for the road. I\'m the only thing in this whole business that runs out ' +
          'of both ends and goes home. What am I?" (ANSWER)');
      }
    },

    /* ---- the whole NPC verb surface ---- */
    onCommand(e, words) {
      const f = e.state.flags;
      const v = words[0];

      if (gameCommand(e, words)) return true;

      /* ANSWER — Commander Alexander's riddles */
      if (v === 'answer') {
        /* the last crossing: on the ground, after everything, it is not a gate */
        if (f.lastCrossing === 'here') {
          f.lastCrossing = 'done';
          e.addScore(10);
          const right = /stream|water|river|telemetry|creek/.test((words[1] || '') + (words[2] || ''));
          e.print((right
            ? '"That\'s the one."'
            : '"Not a scratch on it. It\'s the stream, and it always was."') +
            ' He lets the wheel run through his hands.\n\n' +
            '"Everything that\'s measured has to go somewhere, and this is where it goes, and ' +
            'it goes home. That\'s the whole of what I know and it has been enough for ' +
            'eleven years."\n\n' +
            'He whistles once, two long and one short, and the Requisite Variety goes off ' +
            'down the culvert with the last of the telemetry, and that\'s the last you see ' +
            'of the only reliable narrator in the building. (+10)');
          return true;
        }
        if (f.riddlePending === null || f.riddlePending === undefined) {
          /* the boardroom duel owns ANSWER when no riddle is on the table */
          if (f.duelRound !== undefined && !e.flag('duelWon') &&
            e.state.room === 'boardroom' && words[1]) return false;
          e.print('Nobody has asked you anything.'); return true;
        }
        const [, ans, hint] = RIDDLES[f.riddlePending];
        if (accepts(ans, words[1])) {
          f.riddlePending = null;
          f.riddleMisses = 0;
          if (f.riddlesRight < 3) { f.riddlesRight++; e.addScore(3); }
          e.print('"That\'s the one." Alex leans on the wheel.\n\n    ' + hint +
            '\n\nThe stern-wheeler goes on downstream, and the whistle comes back once ' +
            'off the conduit.');
          return true;
        }
        /* A riddle you cannot get a second look at is not a riddle, it is a
           quiz. Miss once and he narrows it for you; miss twice and he tells
           you, because a pilot would rather you knew than admired him. */
        f.riddleMisses = (f.riddleMisses || 0) + 1;
        if (f.riddleMisses === 1) {
          e.print('"Not a scratch on it." Alex turns the wheel a spoke and gives you the ' +
            'shape of it, because he\'s a pilot and not a sphinx.\n\n    ' + nudge(ans) +
            '\n\n(ANSWER <word> — he\'s in no hurry.)');
        } else {
          f.usedRiddles[f.riddlePending] = false;
          f.riddlePending = null;
          f.riddleMisses = 0;
          e.print('"It was ' + ans.toUpperCase() + '," says Alex, without any pleasure ' +
            'in it at all. "Say it back to me downstream and I\'ll still pay out."');
        }
        return true;
      }

      /* GAMES — the menu, from anywhere. */
      if (v === 'games' || (v === 'list' && words.some(w => /game/.test(w)))) {
        listGames(e);
        return true;
      }

      /* WHO — the people, where they stand, and every word they answer to. */
      if (v === 'who' || v === 'people' ||
        (v === 'list' && words.some(w => /npc|people|character|resident/.test(w)))) {
        const roomName = id => (e.game.rooms[id] || {}).name || id;
        const TOPICS = {
          intern: 'THE PLATFORM', clerk: 'THE CUTS', forgemaster: 'THE GOLEM',
          gardener: 'THE VINE', officer: 'THE INSTRUMENTS',
          verifier: 'THE RECTANGLE', surveyor: 'THE BENCHMARK'
        };
        let out = 'WHO IS ON THIS PLATFORM\n\n' +
          'THE FIVE\n' +
          '  PATHFINDER THOMAS — the Atrium\n' +
          '    GAMES · PLAY <game> · POINTS\n' +
          '    ASK TOM ABOUT <hall>\n' +
          '  COMMANDER ALEXANDER — on the water,\n' +
          '  down in the Deep Stack; he finds you\n' +
          '    ANSWER <word> — solved riddles pay\n' +
          '    true hints. BLOW WHISTLE calls him\n' +
          '    (the whistle is a store item)\n' +
          '  PROPHET KATIE — the Vision Pool\n' +
          '    VISION, as often as you can bear\n' +
          '  SAINT MARK — the Chapel\n' +
          '    JOKE · CONFESS\n' +
          '    ASK MARK ABOUT <anybody>\n' +
          '  DANNET — wanders the Deep Stack\n' +
          '    SHOW COMMIT TO DANNET, then REFLOG\n\n' +
          'THE SEVEN — one to a hall. The first\n' +
          'real question pays +3 and story points.\n' +
          Object.keys(RESIDENTS).map(k =>
            '  ' + RESIDENTS[k].name.replace(/^the /, '').toUpperCase() + '\n' +
            '  — ' + roomName(RESIDENTS[k].room) + '\n' +
            '    ASK ' + k.toUpperCase() + ' ABOUT ' + TOPICS[k]).join('\n') + '\n\n' +
          'And Dassault, in the Boardroom, at the\nend. The placards are the answers.';
        if (f.actV) {
          out += '\n\nON THE GROUND\n' +
            '  THE CLERK — the portacabin\n    ASK CLERK ABOUT THE OFFER\n' +
            '  THE ENGINEER — the site hut\n    ASK ENGINEER ABOUT THE NEED\n' +
            '    PLUG IN KETTLE';
        }
        e.print(out);
        return true;
      }

      /* X <somebody> — people are not items, and deserve better than
         "I see no tom here." Scenery keeps first claim where it exists. */
      if ((v === 'examine' || v === 'x' || v === 'inspect' || v === 'describe') && words[1]) {
        const who = words.slice(1).join(' ').toLowerCase();
        const present = (room, text, cmds) => {
          if (e.state.room === room) { e.print(text + '\n' + cmds); return true; }
          return false;
        };
        if (/\btom\b|thomas|pathfinder/.test(who)) {
          if (!present('atrium',
            'Fleece with the platform\'s old logo, a lanyard of badges going back four ' +
            'rebrands, and a chalked board of ten games with two columns: PAID and PAYS.',
            '(GAMES · PLAY <game> · POINTS · ASK TOM ABOUT <hall>)'))
            e.print('Tom is at his table in the Atrium.');
          return true;
        }
        if (/katie|prophet/.test(who)) {
          if (!present('visionPool',
            'Both hands in the water, and she doesn\'t look up. She has never been ' +
            'wrong, which isn\'t the same as being understood in time.',
            '(VISION · ASK KATIE ABOUT <thing>)'))
            e.print('Katie is at the pool with no inflow, past the Shrine.');
          return true;
        }
        if (/\bmark\b|\bsaint\b/.test(who)) {
          if (!present('chapel',
            'He knows where everybody on this platform came from, and roughly a hundred ' +
            'jokes, and he\'s eating somebody else\'s lunch without hurrying it.',
            '(JOKE · CONFESS · ASK MARK ABOUT <anybody>)'))
            e.print('Saint Mark is in the chapel, off the Sandbox.');
          return true;
        }
        if (/dannet|\bdan\b|kennet/.test(who)) {
          if (npcHere(e, 'dan')) {
            e.print('Nine feet at the shoulders, two heads on one welded yoke, pulling ' +
              'opposite ways for years. Dan breaks; Kennet mends.\n' +
              '(SHOW COMMIT TO DANNET, then REFLOG — in consecutive turns)');
          } else e.print('Somewhere below you, arguing with itself in two voices.');
          return true;
        }
        if (/alex|commander|\bpilot\b/.test(who)) {
          e.print('He\'s on the water. He finds you, in the Deep Stack, when there\'s ' +
            'light on the bank — or BLOW WHISTLE, if you\'ve bought it.');
          return true;
        }
        if (f.actV && /clerk/.test(who)) {
          /* on the ground, "the clerk" is the paper man; his office scenery
             describes him, so only point the way from elsewhere */
          if (e.state.room !== 'newProgramOffice') {
            e.print('He\'s in the portacabin, being pleasant. (ASK CLERK ABOUT THE OFFER)');
            return true;
          }
        } else {
          const rk = Object.keys(RESIDENTS).find(k => who.includes(k) ||
            RESIDENTS[k].name.toLowerCase().includes(who));
          if (rk) {
            const r = RESIDENTS[rk];
            const TOPICS = {
              intern: 'THE PLATFORM', clerk: 'THE CUTS', forgemaster: 'THE GOLEM',
              gardener: 'THE VINE', officer: 'THE INSTRUMENTS',
              verifier: 'THE RECTANGLE', surveyor: 'THE BENCHMARK'
            };
            if (e.state.room === r.room) {
              e.print('The last practitioner of a discipline that used to have a ' +
                'department, still at their post.\n(ASK ' + rk.toUpperCase() +
                ' ABOUT ' + TOPICS[rk] + ')');
            } else {
              e.print(r.name.replace(/^the /, 'The ') + ' is at ' +
                ((e.game.rooms[r.room] || {}).name || r.room) + '.');
            }
            return true;
          }
        }
      }

      /* BLOW WHISTLE — the pilot's whistle from the Company Store */
      if ((v === 'blow' && words.some(w => /whistle/.test(w))) || v === 'whistle') {
        if (!e.carrying('whistle')) {
          e.print('You\'ve no whistle. The Company Store sells the pilot\'s own, and he ' +
            'has never asked for it back.');
          return true;
        }
        const deep = ['serviceShaft', 'landing', 'rootCellar', 'tokenFountain', 'sandbox',
          'shrine', 'visionPool', 'chapel', 'legacyPit', 'incidentRoom'];
        if (!deep.includes(e.state.room)) {
          e.print('Two long and one short, and nothing but your own echo. No water ' +
            'reaches this room.');
          return true;
        }
        if (!e.hasLight()) {
          e.print('Two long and one short, and nothing. He won\'t tie up where he ' +
            'can\'t see the bank.');
          return true;
        }
        if (f.riddlePending !== null && f.riddlePending !== undefined) {
          e.print('He\'s already tied up at your bank, waiting on an answer.');
          return true;
        }
        if (f.whistleAt !== undefined && e.state.moves - f.whistleAt < 50) {
          e.print('Two long and one short, and no answer. Once per fifty turns; a ' +
            'timetable is a timetable, even his.');
          return true;
        }
        f.whistleAt = e.state.moves;
        f.alexCooldown = 0;
        alexArrives(e);
        return true;
      }

      /* PLAY / POINTS — Pathfinder Thomas */
      if (v === 'points' || (v === 'score' && words[1] === 'points')) {
        e.print('You\'ve ' + f.storyPoints + ' iMBSE story points. ' +
          'Games won: ' + Object.keys(f.gamesWon).length + ' of 10.');
        return true;
      }
      if (v === 'play') {
        if (e.state.room !== 'atrium') {
          /* PLAY has an ordinary English meaning too. Only answer as Tom when the
             player is plainly asking for a game, not playing a tape or a reel. */
          const rest = words.slice(1).join(' ');
          const wantsGame = !rest || Object.keys(GAME_WORDS).some(k =>
            GAME_WORDS[k].some(w => rest.includes(w))) || /game|tom|pathfinder/.test(rest);
          if (!wantsGame) return false;            // let the room have it
          e.print('Tom keeps his table in the Atrium and he\'s not going to move it.');
          return true;
        }
        const rest = words.slice(1);
        let key = Object.keys(GAME_WORDS).find(k => rest.some(w => GAME_WORDS[k].includes(w)));
        if (!key) key = Object.keys(GAMES).find(k => !f.gamesWon[k]) || 'twenty';
        startGame(e, key);
        return true;
      }

      /* BUY — the Company Store */
      if (v === 'buy') {
        if (e.state.room !== 'companyStore') {
          e.print('There\'s nowhere here to put the points in.'); return true;
        }
        const want = words.slice(1).join(' ');
        const row = STORE.find(([id, name]) => want.includes(id) ||
          name.toLowerCase().includes(want));
        if (!row) { e.print('The tin doesn\'t recognise that. READ SIGN.'); return true; }
        const [id, name, sp] = row;
        if (f.bought[id]) { e.print('You\'ve already bought that. All sales final.'); return true; }
        if (f.storyPoints < sp) {
          e.print('That\'s ' + sp + ' story points and you\'ve ' + f.storyPoints + '. ' +
            'Tom is in the Atrium and the tin isn\'t sentimental.');
          return true;
        }
        f.storyPoints -= sp;
        f.bought[id] = true;
        e.print('You put ' + sp + ' story points in the tin and the tin agrees with you. ' +
          'You\'ve ' + name + '. (' + f.storyPoints + ' left.)');
        /* Nine things, plus the truck they are on. A hand truck you push should
           not cost you a hand, so it is the tenth slot rather than one of nine. */
        if (id === 'truck') { e.game.meta.maxCarry = 10; e.print('Carry limit is now nine, and the truck carries itself.'); }
        else if (id === 'refill') { f.boughtRefill = true; }
        else if (id === 'indulgence') { f.indulgence = true; }
        else if (id === 'hint') { f.shrineCredit = (f.shrineCredit || 0) + 1; }
        else if (id === 'repellent') { f.repellent = 100; }
        else if (id === 'backissue') { e.moveItem('magazine', 'inventory'); }
        else e.moveItem(id, 'inventory');
        if (id === 'cap') f.boughtCap = true;
        return true;
      }

      /* VISION — Prophet Katie */
      if (v === 'vision' || (v === 'ask' && /katie|prophet/.test(words[1] || '') &&
        /vision/.test(words.join(' ')))) {
        if (e.state.room !== 'visionPool') {
          e.print('Katie kneels at the pool with no inflow, past the shrine.'); return true;
        }
        const i = draw(e, 'usedVisions', VISIONS.length);
        if (i < 0) { e.print('"You\'ve all of them now. The trouble was never the knowing."'); return true; }
        e.print('She takes one hand out of the water.\n\n  ' + VISIONS[i][0] + '\n  ' +
          VISIONS[i][1].split('\n').join('\n  '));
        return true;
      }

      /* JOKE / CONFESS — Saint Mark */
      if (v === 'joke') {
        if (e.state.room !== 'chapel') { e.print('Saint Mark is in the chapel, eating somebody else\'s lunch.'); return true; }
        const i = draw(e, 'usedJokes', JOKES.length);
        if (i < 0) { e.print('"That\'s the hundred. Ask me again and I\'ll start making them up, and you\'ll not be able to tell."'); return true; }
        e.print('"' + JOKES[i] + '"');
        return true;
      }
      if (v === 'confess') {
        e.print('He listens for as long as you type, and at the end of it he says: "Right. ' +
          'Write it down, and then read it back." Nothing is restored and nothing is charged.');
        return true;
      }

      /* TALK TO DAN / KENNET */
      if (v === 'talk' && /dan|kennet|dannet/.test(words.join(' '))) {
        if (!npcHere(e, 'dan')) { e.print('There\'s nobody here arguing with themselves.'); return true; }
        if (/kennet/.test(words.join(' ')))
          e.print('"Please don\'t mind him. Please don\'t mind me. Are you hurt? You\'re hurt."');
        else e.print('"Ohh, you\'re going to love what I do next."');
        return true;
      }

      /* ASK <npc> ABOUT <topic> */
      if (v === 'ask') {
        const who = (words[1] || '').toLowerCase();
        const topic = (words.slice(words.indexOf('about') + 1).join(' ') || '').toLowerCase();
        /* On the ground, "the clerk" is the paper man in the portacabin, not
           Hall 2's — his lookup would swallow the name otherwise. */
        if (f.actV && /clerk/.test(who) && askGround(e, 'clerk', topic)) return true;
        /* the seven hall residents, and the two on the ground */
        const named = Object.keys(RESIDENTS).find(k => who.includes(k) ||
          RESIDENTS[k].name.toLowerCase().includes(who));
        if (named) return askResident(e, named, topic);
        if (askGround(e, who, topic)) return true;
        /* ASK with no name, in a room where somebody is standing */
        const here = residentHere(e);
        if (here && (!who || who === 'about')) {
          return askResident(e, here, (words.slice(words.indexOf('about') + 1).join(' ') || '').toLowerCase());
        }
        if (/mark|saint|priest/.test(who)) {
          if (e.state.room !== 'chapel') { e.print('Saint Mark is in the chapel.'); return true; }
          const key = Object.keys(LORE).find(k => topic.includes(k)) ||
            (/frenchman|vendor|boss/.test(topic) ? 'dassault' : null) ||
            (/two-headed|heads/.test(topic) ? 'dannet' : null) ||
            (/me|you|yourself/.test(topic) ? 'himself' : null);
          if (!key) { e.print('"Never heard of it. Ask me about Dassault. Everybody asks about the two-headed one."'); return true; }
          if (key === 'dassault' && !f.markLore.dassault) { f.markLore.dassault = true; e.addScore(4); }
          e.print(LORE[key] + (key === 'dassault' && e.state.score >= 0 ? '' : ''));
          return true;
        }
        if (/tom|thomas|pathfinder/.test(who)) {
          if (e.state.room !== 'atrium') { e.print('Tom is at his table in the Atrium.'); return true; }
          /* with no ABOUT, the whole line is the topic — "ask tom what games
             he plays" should still land on the games */
          const t = topic || words.slice(2).join(' ').toLowerCase();
          if (/game|play|deal|cards/.test(t)) { listGames(e); return true; }
          const hit = TOM_ROUTES.find(([re]) => re.test(t));
          if (hit) { e.print(hit[1]); return true; }
          e.print('"Route? Seven halls off this rotunda: clients north, requirements ' +
            'north-west, models west, copilots south-west, mission south, systems ' +
            'south-east, macro north-east. Down the middle is the Deep Stack and I\'d ' +
            'take a light. Ask me about any of them by name — or GAMES, if you want ' +
            'the tin."');
          return true;
        }
        if (/alex|commander|pilot/.test(who)) {
          e.print('"He\'s on the water," somebody would say if there were anybody here to ' +
            'say it. You\'ll hear the whistle before you see him.');
          return true;
        }
        if (/katie|prophet/.test(who)) {
          if (e.state.room !== 'visionPool') { e.print('Katie is at the pool with no inflow.'); return true; }
          e.print('"I can\'t tell you them in order. That\'s not how they come." (VISION)');
          return true;
        }
        return false;
      }
      return false;
    },

    /* ---- SHOW COMMIT TO DANNET ---- */
    show(e, what, whom) {
      const f = e.state.flags;
      if (!/dannet|dan|kennet/.test(whom || '')) return false;
      if (!npcHere(e, 'dannet')) { e.print('There\'s nobody here to show it to.'); return true; }
      if (what !== 'commit') {
        e.print('Dan wants to break it. Kennet wants to mend it. They can\'t both, so ' +
          'they don\'t, and the argument goes on.');
        return true;
      }
      f.dannetLunging = true;
      e.print('You hold up the Golden Commit — the one where it all worked.\n\n' +
        'Both heads stop.\n\nDan wants it, because there has never been anything in this ' +
        'dungeon so beautifully worth breaking. Kennet wants it, because there has never ' +
        'been anything so worth keeping safe. For the first time since the incident, both ' +
        'heads lunge the same way at the same instant, and the yoke — which has only ever ' +
        'been asked to hold them apart — takes the whole of it at once and goes tight as ' +
        'a cable.');
      return true;
    },

    /* ---- REFLOG, while they are lunging ---- */
    reflog(e) {
      const f = e.state.flags;
      if (!f.dannetLunging) return false;
      f.dannetLunging = false;
      f.dannetUndone = true;
      f.dannetHere = false;
      e.addScore(15);
      e.moveItem('commit', 'versionCrypt');
      e.moveItem('yoke', e.state.room);
      e.print('The Golden Commit isn\'t in your hand any more. It\'s on its shelf in the ' +
        'Version Crypt where it has always been, because that\'s what a baseline under ' +
        'configuration control is: a thing that can\'t be lost and therefore can\'t be ' +
        'fought over.\n\n' +
        'Dan and Kennet arrive together in the empty air, holding nothing, holding each ' +
        'other. The yoke, pulled the same way twice and given nothing to pull against, ' +
        'parts at the weld with a note like a struck bell.\n\n' +
        'They come apart. Dan looks at his hands, which have nothing to break in them and ' +
        'nobody to fix what he breaks, and simply stops. Kennet looks at his brother, and ' +
        'then, very carefully, at the broken yoke, and you can see him decide not to mend ' +
        'it. "Oh," he says. "Oh, that\'s allowed?"\n\n' +
        'They go off down the corridor together, at a walking pace, arguing — but only ' +
        'arguing.\n\n*** Dannet is undone. (+15) ***\n' +
        'On the floor is the Broken Yoke, iron, welded, worn smooth on both sides.');
      return true;
    },

    duckAt(e, target) {
      if (!/dannet|dan|kennet/.test(target || '')) return false;
      e.print('Dan catches the duck and bites its head off. Kennet takes both halves, ' +
        'mends them without looking, and gives you back a duck that\'s frankly better ' +
        'than the one you threw.');
      return true;
    },

    give(e, what, whom) {
      if (/mark|katie|tom|thomas/.test(whom || '')) {
        e.print('They thank you and hand it straight back. Nobody down here wants your kit.');
        return true;
      }
      return false;
    },

    storeSign() {
      return 'NO CASH · NO CARDS · STORY POINTS ONLY · ALL SALES FINAL AND ESTIMATED\n' +
        STORE.map(([id, name, sp, what]) =>
          '  ' + String(sp).padStart(3) + ' SP  ' + name + ' — ' + what).join('\n') +
        '\n(BUY <item>. Tom pays story points for games, in the Atrium.)';
    },

    score(e) {
      const f = e.state.flags;
      let s = 0;
      s += Object.keys(f.gamesWon || {}).length;        // +1 per minigame, ten of them
      if (f.dannetUndone) s += 0;                       // the +15 is banked when it happens
      /* the seven hall residents' +3 and Act V's awards are banked as they
         happen too; this stays the one place per-run tallies are counted. */
      return s;
    }
  };
});

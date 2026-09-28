/*
 * imbse-data.js — the logic of iMBSE: THE ADVENTURE.
 *
 * Items, puzzles, the bugs, the five acts, the duel and the 700-point scoring,
 * layered on the world in imbse-canon.js. The five inhabitants are bolted on
 * from imbse-npcs.js, which is optional: without it the game is playable and
 * the spine still works, but the blasting cap cannot be bought and the ending
 * is a long walk down.
 *
 * All generic mechanics live in engine.js.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./imbse-canon.js'),
      (function () { try { return require('./imbse-npcs.js'); } catch (e) { return null; } })());
  } else {
    root.IMBSE_GAME = factory(root.IMBSE_CANON, root.IMBSE_NPCS || null);
  }
})(typeof self !== 'undefined' ? self : this, function (CANON, NPCS) {
  'use strict';

  const { rooms, motionSynonyms, HALLS, TEXT, RANKS } = CANON;

  /* ============================== constants ============================== */
  const KEYSTONES = ['console', 'tablet', 'orb', 'feather', 'compass', 'vee', 'rule'];
  const LESSER = ['credits', 'commit', 'glass', 'pearl', 'cache', 'yoke',
    /* the expansion: one per deepened hall, and Act V's evidence pack */
    'transcript', 'spool', 'metaobject', 'refusal', 'reel', 'loop', 'bom'];
  /* the seven that come down with the platform and are salvaged again on the ground */
  const RECORDS = ['transcript', 'spool', 'metaobject', 'refusal', 'reel', 'loop', 'bom'];
  /* hall -> [word, room] : say the word, be in the room. Learned by READ PLATE there. */
  const WORDS = {
    persona: 'personaGallery', shall: 'ossuary', schema: 'metamodelLoft',
    prompt: 'fineTuningCellar', sortie: 'sortieBoard', verify: 'acceptanceFloor',
    scale: 'magnitudeStair'
  };
  /* the seven hall residents: id -> [room, story points, display name] */
  const RESIDENTS = {
    intern: ['helpDesk', 10, 'the Intern'],
    clerk: ['ossuary', 10, 'the Clerk of Cut Requirements'],
    forgemaster: ['modelForge', 15, 'the Forgemaster'],
    gardener: ['promptGarden', 10, 'the Prompt Gardener'],
    officer: ['sensorLine', 15, 'the Range Officer'],
    verifier: ['acceptanceFloor', 20, 'the Verifier'],
    surveyor: ['supplyChain', 10, 'the Surveyor']
  };
  const ACT_V = ['scatterField', 'wreckOfTheHalls', 'newProgramOffice', 'siteHut',
    'recordsOffice', 'signingTent', 'theRoadAtDawn'];
  const TREASURES = KEYSTONES.concat(LESSER);
  const VAULT = 'metamodelVault';
  const LAMP_LIFE = 330;
  const LAMP_FULL = 2500;
  const MAX_DEATHS = 3;

  /* Rooms the bugs may wander: everything from the spiral stair down. */
  const DEEP = ['spiralStair', 'rootCellar', 'tokenFountain', 'sandbox', 'serviceShaft',
    'landing', 'legacyPit', 'incidentRoom', 'shrine', 'visionPool', 'chapel', 'monolith',
    'contextWell', 'telemetryWeir', 'postmortemArchive'];

  /* ================================ items ================================ */
  const items = {

    /* ---- Act I kit ---- */
    lantern: {
      name: 'the token lantern', aliases: ['lantern', 'lamp', 'light', 'torch'],
      location: 'insideShed', portable: true, lightSource: true, prop: 0,
      description: e => 'A hurricane lamp with a context window where the wick should be. ' +
        'It\'s currently ' + (e.prop('lantern') ? 'lit, and burning tokens.' : 'out.') +
        ' There are ' + e.state.flags.tokens + ' tokens left in it.',
      stateTexts: ['There\'s a token lantern here.', 'There\'s a lit token lantern here.']
    },
    keys: {
      name: 'a ring of keys', aliases: ['keys', 'key', 'keyring', 'ring'],
      location: 'insideShed', portable: true,
      description: 'Somebody\'s whole career on one split ring. One of them is stamped SERVICE.'
    },
    knife: {
      name: 'a pocket knife', aliases: ['knife', 'pocketknife', 'blade'],
      location: 'insideShed', portable: true,
      description: 'Sharp enough for one green branch, which is all it\'s ever asked for.'
    },
    duck: {
      name: 'a rubber duck', aliases: ['duck', 'rubber'],
      location: 'insideShed', portable: true,
      description: 'Yellow. Patient. The only member of the incident call who won\'t ' +
        'ask whether you\'ve tried restarting it.'
    },
    thermos: {
      name: 'a steel thermos', aliases: ['thermos', 'flask2', 'coffee'],
      location: 'insideShed', portable: true, prop: 0,
      description: e => e.prop('thermos') ? 'A steel thermos, full of very good coffee.'
        : 'A steel thermos. Empty, and slightly accusing about it.',
      stateTexts: ['There\'s a steel thermos here.', 'There\'s a steel thermos here, full of coffee.']
    },
    rations: {
      name: 'a bag of field rations', aliases: ['rations', 'food', 'bag'],
      location: 'insideShed', portable: true,
      description: 'Enough for one person for three days, or one build bot for one minute.'
    },
    hexKey: {
      name: 'a hex key', aliases: ['hexkey', 'hex', 'allen', 'wrench'],
      location: 'creekBed', portable: true,
      description: 'A hex key, caught in the gravel. It fits exactly one bolt in this game.'
    },
    branch: {
      name: 'a green branch', aliases: ['branch', 'bough', 'stick'],
      location: 'nowhere', portable: true,
      description: 'Green, springy, and cut from the trunk every branch in this forest came from.'
    },
    certificate: {
      name: 'a self-signed certificate', aliases: ['certificate', 'cert'],
      location: 'balloonMeadow', portable: true, prop: 0,
      hereText: 'There\'s a self-signed certificate in the basket\'s document pouch.',
      description: 'Issued by you, to you, and attested by you. It\'s not nothing.'
    },
    debt: {
      name: 'sandbags stencilled TECHNICAL DEBT', aliases: ['debt', 'sandbags', 'sandbag', 'ballast'],
      location: 'balloonMeadow', portable: true, scenery: true,
      hereText: 'There are sandbags stencilled TECHNICAL DEBT here.',
      description: 'Nobody remembers filling them. Everybody remembers being told they were fine.'
    },
    basket: {
      name: 'the wicker basket', aliases: ['basket', 'balloon', 'envelope', 'burner', 'valve', 'tether'],
      location: 'balloonMeadow', portable: false, scenery: true,
      hereText: 'There\'s a wicker basket here, under a great striped envelope.',
      cantTake: 'The balloon is a vehicle, not luggage.',
      description: e =>
        'A wicker basket under a striped envelope. The fuel valve is ' +
        (e.flag('valve') ? 'open and hissing.' : 'secured with a hex bolt.') +
        ' The burner is ' + (e.flag('burner') ? 'roaring, and the envelope stands up over you.' : 'cold.') +
        (e.here('debt') ? ' Sandbags stencilled TECHNICAL DEBT hang from the rim.' : '') +
        ' There\'s a document pouch on the inside of the rim.'
    },

    /* ---- the seven keystone artifacts ---- */
    console: {
      name: 'the Lucid Console', aliases: ['console', 'lucid'], keystone: true,
      location: 'chatParlor', portable: true, hidden: true,
      onTake: e => e.flag('userHelped') ||
        (e.print('Your reflection takes it at the same moment and you both put it back.'), false),
      description: 'A console of plain glass that shows you what it did, not what you said.'
    },
    tablet: {
      name: 'the Shall Tablet', aliases: ['tablet', 'shall', 'slab2'], keystone: true,
      location: 'shallQuarry', portable: true, hidden: true,
      onTake: e => e.flag('tabletFound') ||
        (e.print('It comes away in your hands, and then it comes away from itself. ' +
          '"World-class" turns out to be sand.'), false),
      description: 'THE SYSTEM SHALL DELIVER THE MISSION MODEL TO THE CUSTOMER IN A FORMAT ' +
        'THE CUSTOMER CAN OPEN WITHOUT US. There\'s a test carved on the back of it.'
    },
    orb: {
      name: 'the SysML Orb', aliases: ['orb', 'sysml', 'sphere'], keystone: true,
      location: 'modelForge', portable: true, hidden: true,
      onTake: e => e.flag('golemSatisfied') ||
        (e.print('The golem\'s arm comes down across the plinth. "WHAT NEED DOES IT ' +
          'SATISFY." It\'s not a question it\'s capable of dropping.'), false),
      description: 'A sphere of open schema, every element in it named and every name published.'
    },
    feather: {
      name: "the Contrarian's Feather", aliases: ['feather', 'grey', 'gray'], keystone: true,
      location: 'nowhere', portable: true,
      description: 'One grey feather. It\'s heavier than it looks, in the way a no is.'
    },
    compass: {
      name: 'the Mission Compass', aliases: ['compass', 'needle'], keystone: true,
      location: 'warRoom', portable: true, hidden: true,
      onTake: e => e.flag('fogGone') ||
        (e.print('The dome is shut, and the fog over the table has a budget line.'), false),
      description: 'Its needle doesn\'t point north. It points at what you\'re for.'
    },
    vee: {
      name: 'the Golden V', aliases: ['vee', 'v', 'golden'], keystone: true,
      location: 'nowhere', portable: true,
      description: 'Decomposition down one side, verification up the other, and one weld ' +
        'at the bottom holding the whole argument together.'
    },
    rule: {
      name: "the Titan's Slide Rule", aliases: ['rule', 'slide', 'sliderule'], keystone: true,
      location: 'nowhere', portable: true,
      description: 'Eight inches long, graduated in orders of magnitude, and still accurate.'
    },

    /* ---- the thirteen lesser treasures ---- */
    credits: {
      name: 'a book of GPU credits', aliases: ['credits', 'gpu', 'book'], lesser: true,
      location: 'deprecatedWing', portable: true,
      description: 'The only money on this platform, and worth eight points sitting still.'
    },
    commit: {
      name: 'the Golden Commit', aliases: ['commit', 'baseline'], lesser: true,
      location: 'versionCrypt', portable: true,
      description: 'The one where it all worked. Gold all the way through.'
    },
    glass: {
      name: 'the Glass Prototype', aliases: ['prototype', 'glass'], lesser: true,
      location: 'orbitalRing', portable: true,
      description: 'The first one. The one that worked. Blown in a single piece.'
    },
    pearl: {
      name: 'the Pearl of Provenance', aliases: ['pearl', 'provenance'], lesser: true,
      location: 'nowhere', portable: true,
      description: 'One small perfect record of where everything came from.'
    },
    cache: {
      name: "the Regression's Cache", aliases: ['cache', 'stash', 'heap'], lesser: true,
      location: 'trace4', portable: true,
      description: 'Everything the Regression has ever taken, in a heap, including ' +
        'several things you\'ve not lost yet.'
    },
    yoke: {
      name: 'the Broken Yoke', aliases: ['yoke'], lesser: true,
      location: 'nowhere', portable: true,
      description: 'Iron, welded, and worn smooth on both sides.'
    },

    /* ---- tools and scenery ---- */
    mat: {
      name: 'an anti-static mat', aliases: ['mat', 'antistatic'],
      location: 'uncannyValley', portable: true,
      description: 'Black, soft, and earthed. The only forgiving surface on this platform.'
    },
    cage: {
      name: 'a context cage', aliases: ['cage', 'context'],
      location: 'promptGarden', portable: true, prop: 0,
      description: e => e.prop('cage') ? 'A context cage with a small grey bird in it, ' +
        'telling you this was a mistake.' : 'A context cage, empty, hanging open.',
      stateTexts: ['There\'s a context cage here.',
        'There\'s a context cage here, with a small grey bird in it.']
    },
    flask: {
      name: 'a scuffed flask', aliases: ['flask', 'tokens'],
      location: 'tokenFountain', portable: true, prop: 0,
      description: e => e.prop('flask') ? 'A scuffed flask, full of moving light.'
        : 'A scuffed flask. Empty.',
      stateTexts: ['There\'s a scuffed flask chained to the rim.',
        'There\'s a scuffed flask here, full of moving light.']
    },
    token: {
      name: 'an API token on a lanyard', aliases: ['token', 'api', 'lanyard'],
      location: 'versionCrypt', portable: true,
      description: 'Scope: everything. Expiry: never. Somebody should look into that.'
    },
    stone: {
      name: 'a plain grey stone', aliases: ['stone', 'truth', 'ground'],
      location: 'groundTruthRange', portable: true,
      description: 'Nothing is written on it. That\'s the whole of its value.'
    },
    magazine: {
      name: 'a pile of "MBSE Today"', aliases: ['magazine', 'magazines', 'mbse', 'today', 'issues'],
      location: 'deprecatedWing', portable: true,
      description: 'Back issues. Somebody meant to come back for them.'
    },
    leftArm: {
      name: 'the left arm of the V', aliases: ['leftarm', 'left'],
      location: 'vFoundry', portable: true, heavy: true,
      description: 'Need, function, design, going down. Cast in gold and never joined to anything.'
    },
    rightArm: {
      name: 'the right arm of the V', aliases: ['rightarm', 'right'],
      location: 'vFoundry', portable: true, heavy: true,
      description: 'Test, verification, the thing actually working, coming back up.'
    },
    blob: {
      name: 'the Sealed Blob', aliases: ['blob', 'binary'],
      location: 'interfaceLedge', portable: false, prop: 0,
      cantTake: 'It has no seams, no handles and no documentation. It has, however, mass.',
      description: 'A giant binary, seamless, undocumented, and shut tighter than a drum.',
      hereText: e => e.prop('blob')
        ? 'The Sealed Blob lies open, its one perfect record taken out of it.'
        : 'The Sealed Blob sits on the ledge, seamless and shut.'
    },
    bot: {
      name: 'a CI bot', aliases: ['bot', 'ci', 'robot'],
      location: 'sandbox', portable: false, prop: 0,
      cantTake: 'It weighs as much as a car. It\'ll follow you, though, if you free it.',
      description: e => ['A CI bot, chained to a runner, patient, enormous and hungry.',
        'A CI bot, chained to a runner, fed and fond of you.',
        'A CI bot, free of its runner and following you about.'][e.prop('bot')],
      hereText: e => [null, null, 'The CI bot is here, following you.'][e.prop('bot')] ||
        'Chained to a runner in the corner is a CI bot.'
    },
    charge: {
      name: 'a Deprecation Charge', aliases: ['charge', 'ordnance'],
      location: 'nowhere', portable: true, prop: 0,
      description: e => e.prop('charge')
        ? 'A Deprecation Charge with a blasting cap seated in the well. It\'s ready.'
        : 'A Deprecation Charge, old ordnance, well kept, and entirely inert: the cap ' +
          'well is empty.'
    },
    detonator: {
      name: 'a detonator', aliases: ['detonator', 'plunger'],
      location: 'nowhere', portable: true,
      description: 'A brass plunger with eleven years of dust in the threads.'
    },
    thread: {
      name: 'the Digital Thread', aliases: ['thread', 'sigils', 'sigil'],
      location: 'nowhere', portable: true,
      cantTake: 'It\'s behind your sternum. You couldn\'t put it down if you wanted to.',
      description: 'Seven sigils on one thread: console, tablet, orb, feather, compass, ' +
        'vee, rule. It settles behind your sternum with the weight of seven things that ' +
        'can all be traced.'
    },
    contract: {
      name: 'a contract, and a pen', aliases: ['contract', 'pen', 'paper'],
      location: 'nowhere', portable: false,
      cantTake: 'He\'s still holding it out. That\'s the point of it.',
      description: 'A man made entirely of paper, folded flat, holding out a pen and a ' +
        'seat on the board.'
    },

    /* ================= THE EXPANSION — seven new lesser treasures =========
     * One per deepened hall, and the same seven you go back for in Act V,
     * where they stop being treasure and start being evidence.
     */
    transcript: {
      name: 'the First Transcript', aliases: ['transcript', 'tape', 'firsttranscript'],
      lesser: true, location: 'nowhere', portable: true,
      description: 'One reel, dated early. The only conversation in the archive where ' +
        'somebody said "I don\'t know" and then waited to find out.'
    },
    spool: {
      name: 'the Golden Thread Spool', aliases: ['spool', 'thread2', 'golden'],
      lesser: true, location: 'matrixRoom', portable: true,
      hereText: 'At the far corner of the grid, wound on a reel, is the Golden Thread Spool.',
      /* You can see it from the door. Getting to it means stepping only on cells
         that trace, which the game will do for you the moment you reach for it. */
      onTake(e) {
        if (e.state.flags.walkedMatrix) return true;
        e.state.flags.walkedMatrix = true;
        e.print('You can\'t simply cross to it: most of these cells are empty, and an empty ' +
          'cell isn\'t a floor.\n\nSo you walk the one path where every cell traces up to a ' +
          'need and down onto a test. There aren\'t many. Twice the obvious step is a cell ' +
          'somebody filled in on a Friday, and twice the floor isn\'t there.');
        return true;
      },
      description: 'One continuous thread, concept to disposal, wound on a reel and still ' +
        'warm. There are no joins in it, which is the whole of the claim.'
    },
    metaobject: {
      name: 'the Metaobject', aliases: ['metaobject', 'meta', 'object'],
      lesser: true, location: 'metamodelLoft', portable: true,
      description: 'Small, cold, and considerably heavier than it looks. It\'s a model of ' +
        'itself, all the way down, which makes it the only object on this platform that\'s ' +
        'certainly accurate.'
    },
    refusal: {
      name: 'the First Refusal', aliases: ['refusal', 'no', 'box'],
      lesser: true, location: 'fineTuningCellar', portable: true,
      description: 'The first time a helper ever said no, in a box, labelled and dated. It ' +
        'was logged at the time as a fault.'
    },
    reel: {
      name: 'the Rehearsal Reel', aliases: ['reel', 'rehearsal', 'film'],
      lesser: true, location: 'rehearsalHangar', portable: true,
      description: 'The mission, flown before it existed. It\'s the entire claim of this ' +
        'programme and the only recording of it.'
    },
    loop: {
      name: 'the Closed Loop', aliases: ['loop', 'closed'],
      lesser: true, location: 'acceptanceFloor', portable: true,
      description: 'A need, a design, a build and a test, cast in one piece. There\'s no way ' +
        'into it and no way out of it, which is what closed means.'
    },
    bom: {
      name: 'the Bill of Materials', aliases: ['bom', 'bill', 'materials', 'list'],
      lesser: true, location: 'supplyChain', portable: true,
      /* It has been bolted to the frame for eleven years, with the same hex bolts
         as every gas valve in the programme, including the one on a balloon. */
      onTake(e) {
        if (e.state.flags.unbolted) return true;
        if (!e.carrying('hexKey')) {
          e.print('It doesn\'t come off. It\'s bolted to the frame at four corners with hex ' +
            'bolts, the same size as every gas fitting in this programme, and it has been ' +
            'there long enough that nobody has thought of it as removable.\n\n' +
            'You\'d need a hex key. There\'s one in the balloon basket on the Ingress ' +
            'Deck, where you left it, being useless.');
          return false;
        }
        e.state.flags.unbolted = true;
        e.addScore(10);
        e.print('Four bolts, and the hex key that opened a fuel valve in a meadow four ' +
          'thousand feet down turns every one of them.\n\n' +
          'It\'s the first thing anybody has taken off this platform with a tool rather ' +
          'than a process. (+10)');
        return true;
      },
      description: 'What this platform is made of, what each part cost, and who owns it. ' +
        'Six lines from the bottom, the foundation. It has been bolted to the frame for ' +
        'eleven years and it\'s a list, and lists are somebody else\'s job.'
    },

    /* ================= THE EXPANSION — tools that are not treasure ========= */
    assayKit: {
      name: 'a field assay kit', aliases: ['kit', 'assay', 'assaykit'],
      location: 'assayOffice', portable: true,
      description: 'Packed, strapped, and never once taken out of the building. A bench in ' +
        'a box: balance, reagents, and a printer that runs off two copies of everything ' +
        'because it assumes you\'ll want to give one to somebody.'
    },
    plainLanguage: {
      name: 'the Plain Language Edition', aliases: ['edition', 'plain', 'manual', 'language'],
      location: 'accessibilityWing', portable: true,
      description: 'The manual, rewritten so that anybody can read it. It\'s shorter than ' +
        'the original by two thirds and contains everything the original contained.'
    },
    placard: {
      name: 'a DO NOT DISTURB placard', aliases: ['placard', 'sign', 'disturb'],
      location: 'nowhere', portable: true,
      description: 'Cardboard, with a string loop. Nobody has ever needed it, because there ' +
        'has never been a queue.'
    },
    fragment: {
      name: 'a fragment of the monolith', aliases: ['fragment', 'chip', 'shard', 'piece', 'sample'],
      location: 'nowhere', portable: true,
      description: 'Black, heavier than it should be, and completely uninformative. It stays ' +
        'uninformative until there\'s a bench under it and a kit beside it.'
    },
    need: {
      name: 'the Validated Need', aliases: ['need', 'validated', 'page'],
      location: 'nowhere', portable: true,
      description: 'One page, in somebody else\'s words, signed by them, and dated eleven ' +
        'years ago. It\'s good. Nothing that was built afterwards is in it.'
    },
    assayReport: {
      name: 'the Assay', aliases: ['report', 'figure'],
      location: 'nowhere', portable: true,
      description: 'One page. What the last foundation cost, in the only units that were ' +
        'ever real. It\'s the most expensive page in the forest.'
    },
    decisionRecord: {
      name: 'the Decision Record', aliases: ['record', 'decision', 'form'],
      location: 'nowhere', portable: true,
      description: 'Decision, reason, and one empty field asking who\'s going to live with ' +
        'it. Two of the three are filled in.'
    }
  };

  /* ---- things you can only ever look at ----
   * Scenery lives per room rather than as items: a placard stands in all seven
   * halls at once and the engine's alsoAt only stretches to one extra room.
   *
   * An entry is either bare examine text, or { name, text, aliases? }. A named
   * entry announces itself in the room description as "There is <name> here.",
   * so nothing the room will answer to has to be guessed out of the prose.
   * Bare strings are the extra nouns — synonyms, and the second look at a
   * thing already announced — which answer but do not add a line of their own.
   */
  const SCENERY = {
    endOfRoad: {
      sign: { name: 'a program sign',
        text: 'iMBSE PROGRAM — MODEL BEFORE METAL. And, in marker: and pray after.' },
      gate: { name: 'a chain-link gate',
        text: 'Chain-link, open so long the weeds have grown through it.' },
      creek: { name: 'a creek', text: 'It\'s not water. It\'s telemetry, every drop a ' +
        'reading from something that\'s still running somewhere.' } },
    balloonMeadow: {
      tether: { name: 'a nylon tether', text: 'Nylon, and tied to an iron ring set in ' +
        'concrete. It\'ll part when there\'s enough lift to part it.' } },
    theTrunk: {
      trunk: { name: 'a very old trunk',
        text: 'The bark is a mass of old scars, each one where a branch was taken.' },
      tree: 'Every branch in this forest came from this trunk.' },
    gully: {
      creek: 'Telemetry, still moving, cutting the gully a reading at a time. Every drop ' +
        'of it\'s on its way somewhere with a number.',
      water: 'It\'s not water. It has never been water. It\'s readings.' },
    insideShed: {
      mug: 'The coffee is cold and the mug has dried to the shelf. Whoever it was left ' +
        'mid-shift, eleven years ago, and didn\'t come back for it.',
      coffee: 'Cold, and older than most of the platform above you.' },
    firewallGate: {
      wall: 'Rule over rule over rule, each one burning, none of them able to see you. ' +
        'That\'s not mercy. That\'s scope.',
      rules: 'Every one of them was added after something happened. Nothing has ever ' +
        'been taken out.',
      gap: 'Numbered 443. Everything that ever got in got in through here, politely, ' +
        'with papers. (SHOW CERTIFICATE.)' },
    atrium: {
      plate: { name: 'a brass directory plate', aliases: ['directory'], text: TEXT.plate },
      stair: { name: 'a spiral stair',
        text: 'A spiral stair goes down into the dark from the middle of the plate.' },
      dome: { name: 'a frosted dome',
        text: 'Frosted glass. Every so often the lights dim and the platform prays.' },
      sigils: 'One over each arch, lit from inside: the seven trades this platform was ' +
        'built to hold. The plate underfoot says which is which.',
      arches: 'Seven of them around the rotunda, each with its sigil lit over the keystone.' },
    clientConcourse: {
      urn: { name: 'an espresso urn',
        text: 'An espresso urn, muttering to itself. FILL THERMOS.' },
      teletype: { name: 'a teletype',
        text: 'At the far end, one teletype that still works. Nobody is using it.' } },
    chatParlor: {
      user: { name: 'a weary engineer',
        text: 'A weary engineer at a console of mirror-glass. Nobody has brought them a coffee.' },
      mirror: { name: 'a console of mirror-glass',
        text: 'Every question comes back as a beautifully phrased version of itself.' },
      engineer: 'They don\'t look up. They\'ve been doing this for some time.' },
    uncannyValley: {
      avatar: { name: 'an avatar of you', text: 'It\'s doing what you did one turn ago, ' +
        'at your height, in your posture, with your hands. It\'s very nearly right.' } },
    shallQuarry: {
      slabs: { name: 'a field of lettered slabs', text: 'Hundreds of candidate ' +
        'requirements, beautifully lettered. Almost all of them are sand.' },
      slab: 'It comes away in your hands, and then it comes away from itself. ' +
        '"World-class" turns out to be sand.' },
    modelForge: {
      golem: { name: 'a schema golem', text: 'Nine feet of stacked blocks and connectors, ' +
        'with a port for a head. It\'s not hostile. It\'s consistent, which is worse.' },
      hearth: { name: 'a hearth of white light', text: 'A hearth of white light, and the ' +
        'ringing of diagrams being beaten into shape.' } },
    metamodelVault: {
      sockets: { name: 'a ring of seven sockets', aliases: ['socket'],
        text: 'Seven sockets in a ring at chest height. PUT <artifact> IN SOCKET.' },
      niches: { name: 'a shelf of lesser niches', aliases: ['niche'],
        text: 'A shelf of lesser niches, each lined with foam. PUT <treasure> IN NICHE.' },
      thread: { name: 'a thread of light', text: 'A single thread of light out of the ' +
        'floor, through the ring, into the ceiling. It\'s thinner than it should be.' } },
    copilotRoost: {
      contrarian: { name: 'one grey contrarian bird', aliases: ['bird'],
        text: 'One grey bird on the back beam, saying nothing. The others give it room.' },
      copilots: { name: 'a roost of copilots',
        text: 'Small helpful things that finish your sentences before you\'ve them.' } },
    promptGarden: {
      vine: { name: 'a withered prompt vine', text: 'A withered prompt vine going up a ' +
        'light shaft. It hasn\'t been given the context.' } },
    hallucinationGallery: {
      confabulator: { name: 'the Confabulator', text: 'Enormous, serene, and beautifully ' +
        'rendered. It has never in its life said I don\'t know.' },
      portraits: { name: 'portraits of systems never built', plural: true, text: 'Systems that were ' +
        'never built, every one of them plausible and none of them real.' } },
    missionDeck: {
      charter: { name: 'the Charter, framed', text: TEXT.charter },
      floor: { name: 'a glass floor', text: 'Glass, and under the glass the world, ' +
        'turning, with the mission drawn on it in light.' } },
    warRoom: {
      fog: { name: 'a bank of fog',
        text: 'It has been there so long it has been given a budget line.' },
      table: { name: 'a table the size of a runway',
        text: 'The size of a runway, covered in pieces that move by themselves.' },
      dome: { name: 'a glass dome', text: 'A glass dome at the head of the table.' } },
    groundTruthRange: {
      butts: { name: 'a line of target butts',
        text: 'Where models are made to meet the world at four hundred yards.' } },
    /* The two arms are items and announce themselves; this is the pair noun. */
    vFoundry: {
      arms: 'Two golden arms, cast and left in the sand. They\'ve never been joined.' },
    pullRequestBridge: {
      troll: { name: 'the Reviewer Troll', text: 'The Reviewer Troll, arms folded. ' +
        '"NOTHING MERGES WITHOUT AN APPROVING REVIEW."' },
      bridge: { name: 'a rope bridge',
        text: 'Rope, and review comments, and a long drop under both.' } },
    titanScaffold: {
      lever: { name: 'a brass scaling lever',
        text: 'A brass scaling lever with two positions and no labels.' },
      pad: { name: 'a scaffold pad', text: 'Something forty feet long is lying on it, ' +
        'graduated in orders of magnitude.' } },
    macroGantry: {
      model: { name: 'a model of a continent', text: 'A continent, complete to the level ' +
        'of individual power lines. Somewhere down there is the forest, the road and the shed.' } },
    tokenFountain: {
      fountain: { name: 'a fountain of moving light', text: 'A basin of moving light. ' +
        'FILL FLASK, or FILL LANTERN if you can pay for it.' },
      basin: 'A basin of moving light, pouring from a source described only in the singular.' },
    sandbox: {
      chain: { name: 'a runner chain',
        text: 'A runner chain, and a lock that wants an API token.' } },
    legacyPit: {
      serpent: { name: 'an enormous serpent of undocumented code', text: 'An enormous ' +
        'serpent of undocumented code, coil on coil, still running, maintained by ' +
        'nobody, and load-bearing.' } },
    shrine: {
      deity: { name: 'a face of light', text: 'A face of light, enormous and serene, ' +
        'composed entirely of everything anyone has ever written down.' },
      face: 'It\'s composed of everything anyone has ever written down. It knows nothing.' },
    visionPool: {
      pool: 'Full, still, and fed by nothing. The whole of the platform\'s telemetry ' +
        'goes past it and none of it goes in. The visions come out of order, which Katie ' +
        'says is how they come. (VISION)',
      water: 'Still enough to read by, if what you wanted to read was the future.' },
    incidentRoom: {
      whiteboard: { name: 'a whiteboard', text: 'The timeline of the incident, still up, ' +
        'eleven years on. One name to blame and one name to thank, and they couldn\'t ' +
        'both be him.' },
      timeline: 'Eleven hours. Four halls dark. One engineer.' },
    monolith: {
      monolith: { name: 'a single black slab', text: 'A single black slab. Nobody has ' +
        'been able to say what it does for eleven years, and nobody has been able to ' +
        'remove it for nine.' },
      slab: 'It goes up through every floor above this one. Everything is bolted to it.' },
    rcMonolith: {
      monolith: { name: 'the same black slab', aliases: ['slab'], text: 'The same slab, ' +
        'in the same place. This is the original. Everything else was the copy.' } },
    boardroom: {
      dassault: { name: 'a man with no face',
        text: 'A man with no face — a set of them, worn one at a time.' },
      slide: { name: 'the last slide', text: 'A slide. It\'s the last slide, and it has ' +
        'been the last slide for some time.' } },
    sinkhole: {
      hatch: { name: 'a steel service hatch',
        text: 'A steel service hatch, streaked with rust, padlocked from the far side.' } },
    serviceShaft: {
      hatch: { name: 'a steel service hatch',
        text: 'A steel service hatch. The padlock is on this side of it.' } },
    companyStore: {
      grille: { name: 'a rolled-down grille', text: 'Rolled down, and it makes no difference.' },
      tin: { name: 'a prize tin', text: 'You put the points in and the tin agrees with you.' },
      sign: 'NO CASH · NO CARDS · STORY POINTS ONLY · ALL SALES FINAL AND ESTIMATED. ' +
        'READ SIGN gets you the stock and the prices.' },
    observabilityBalcony: {
      dashboards: 'Green, mostly. Every one of them is measuring something faithfully, ' +
        'and not one of them can say whether any of it mattered. The Company Store is east.' },
    backlogEnd: {
      cards: 'Every one of them was urgent once. The oldest are load-bearing now. ' +
        'Somewhere under them is the way this room was meant to work.' },

    /* ---- the wider platform: rooms off the spine ---- */
    programBoneyard: {
      nameplates: { name: 'a stack of unscrewed nameplates', aliases: ['nameplate', 'plates'],
        text: 'Five of them, face down, in the order they came off. The top one still has ' +
          'the screws taped to the back, because somebody expected to put it up again.' },
      programs: 'Each one further through than the last. None of them finished.' },
    antennaFarm: {
      dishes: { name: 'a field of dishes', aliases: ['dish', 'masts', 'mast', 'antenna'],
        text: 'All pointed at the same patch of cloud, all still receiving, all still ' +
          'writing it down. Listening is the cheap half.' } },
    surveyorsStake: {
      benchmark: { name: 'a brass benchmark disc', aliases: ['disc', 'stake', 'plug'],
        text: 'An elevation and a date, stamped in brass. Everything above you is measured ' +
          'from this, and nothing above you has ever come down to check.' } },
    fireRoad: {
      road: { name: 'a graded cut', aliases: ['cut', 'firebreak'],
        text: 'Graded once, driven never. The argument against it was that nothing had ' +
          'happened yet, which was also the argument for it.' } },
    culvertMouth: {
      grating: { name: 'a cut grating', aliases: ['grate', 'culvert'],
        text: 'Cut through and bent back, from the inside, by somebody who wanted out ' +
          'rather than in.' } },
    mastWalk: {
      envelope: { name: 'the dead envelope', aliases: ['balloon', 'skin'],
        text: 'Your balloon, hanging off the mast below you, going down by the yard. It ' +
          'brought you up. It\'s not taking you back.' },
      underside: 'Conduit, cable and rust. The part nobody photographs.' },
    slaLounge: {
      certificate2: { name: 'a framed certificate', aliases: ['certificate', 'framed', 'nines', 'sla'],
        text: 'THREE NINES, it says. In pencil under the glass: 8h 45m 57s a year, and it ' +
          'is underlined twice.' } },
    archiveStacks: {
      shelves: { name: 'rolling shelves', plural: true, aliases: ['shelf', 'rails', 'aisle'],
        text: 'Wound tight, so only one aisle opens at a time. Everything ever decided is ' +
          'in here, and the open aisle is never the one you want.' } },
    accessibilityWing: {
      reader: { name: 'a screen reader', aliases: ['screen', 'chair'],
        text: 'Talking quietly and correctly to an empty chair. It has been right for ' +
          'years and nobody has been in to hear it.' } },
    helpDesk: {
      bell: { name: 'a counter bell', aliases: ['counter', 'sign', 'cardigan'],
        text: 'The bell works. The cardigan on the chair is still warm. The queue display ' +
          'reads NOW SERVING 0 OF 0, and has been honest all day.' } },
    matrixRoom: {
      grid: { name: 'a wall-sized grid', aliases: ['matrix', 'wall', 'cells'],
        text: 'Requirements down, tests across. The filled cells are in a hand that got ' +
          'faster and faster and then, in the middle of a row, stopped.' } },
    tagCellar: {
      bottles: { name: 'racked bottles', plural: true, aliases: ['bottle', 'rack', 'wine'],
        text: 'Two of them are v2.0. The labels are identical, the dates are identical, ' +
          'and the cellar book has been torn out at that page.' } },
    patternLibrary: {
      book: { name: 'one open book', aliases: ['desk', 'page', 'shelves'],
        text: 'KNOW WHEN NOT TO. The page is soft at the corner from being turned to, and ' +
          'the shelves either side of it are completely undisturbed.' } },
    promptCompost: {
      heap: { name: 'a warm heap', aliases: ['compost', 'prompts', 'please'],
        text: 'Superseded prompts going quietly back to tokens. Something is growing out ' +
          'of the top of it that nobody planted and nobody can account for.' } },
    citationWell: {
      well: { name: 'a stone well', aliases: ['bucket', 'rope', 'well'],
        text: 'ALL CLAIMS DRAWN HERE. The rope goes down a very long way. The bucket is ' +
          'dry, and has always been dry.' } },
    contingencyCloset: {
      binders: { name: 'numbered binders', plural: true, aliases: ['binder', 'plans', 'shelves'],
        text: 'Every one of them complete, signed off, and about something that didn\'t ' +
          'happen. You look for the number that\'s missing. There\'s no gap.' } },
    sensorLine: {
      instruments: { name: 'a line of instruments', aliases: ['sensors', 'sensor', 'gauges'],
        text: 'All aimed at one target, all reporting slightly different numbers. Nobody ' +
          'will reconcile them, because reconciling them names a wrong one.' } },
    acceptanceFloor: {
      rectangle: { name: 'a taped rectangle', aliases: ['tape', 'floor', 'sheet'],
        text: 'Exactly the size of the thing that should be standing in it. On the table ' +
          'by the door, CONDITIONS OF SATISFACTION — empty rectangle, signed sheet.' } },
    contractShelf: {
      planks: { name: 'a rank of published interfaces', aliases: ['interfaces', 'plank', 'brackets'],
        text: 'Stamped, dated, stable, and each one strong enough to stand on. Under them ' +
          'is everything they promised to hide, and it\'s still down there.' } },
    supplyChain: {
      conveyor: { name: 'a conveyor', aliases: ['belt', 'parts', 'sticker'],
        text: 'The same parts going out as came in, with a different sticker. Followed far ' +
          'enough in either direction it leaves the model, which isn\'t a scale the gantry has.' } },
    deorbitGantry: {
      lever: { name: 'a release lever', aliases: ['rail', 'procedure', 'plate'],
        text: 'The procedure is printed, numbered and completely clear. Step one has never ' +
          'been performed, because nothing up here has ever been finished with.' } },
    contextWell: {
      shaft: { name: 'a shaft of light', aliases: ['light', 'floors'],
        text: 'The light doesn\'t come from the top. It comes from two thirds of the way ' +
          'up, from a floor that\'s not on the directory plate.' } },
    telemetryWeir: {
      gauge: { name: 'a stream gauge', aliases: ['weir', 'logbook', 'hut'],
        text: 'It measures faithfully into a logbook nobody opens, in a hut nobody has ' +
          'unlocked since the last person who understood the rating curve retired.' } },
    postmortemArchive: {
      boxes: { name: 'box files', plural: true, aliases: ['box', 'files', 'postmortem'],
        text: 'NO BLAME, every spine. The action items at the back of each one are the ' +
          'causes at the front of the next, all the way along the shelf.' } },
    rcConcourse: {
      teletype2: { name: 'a stopped teletype', aliases: ['teletype', 'terminals'],
        text: 'Stopped mid-line, mid-word. There\'s enough of the word left to see that it ' +
          'was going to be YOU.' } },
    rcWing: {
      covers: { name: 'rows of dust covers', plural: true, aliases: ['cover', 'sheets', 'candidates'],
        text: 'Every release candidate there has ever been, standing in rows under dust, ' +
          'each one waiting to be the one. You\'re in the row.' } },

    /* ---- the five rooms that arrived with prose and nothing to look at ---- */
    archiveStacks: {
      shelves: { name: 'rolling shelves', plural: true, aliases: ['shelf', 'aisle', 'rails', 'wheel'],
        text: 'Wound tight against each other so that only one aisle can be open at a time. ' +
          'You can wind any aisle open you like. The one you want is always the one that\'s ' +
          'shut, and this isn\'t superstition, it\'s how one aisle at a time works.' },
      decisions: e => 'Everything the programme ever decided is in here, filed by the date ' +
        'it was decided rather than the thing it was about, which is why nobody comes.\n\n' +
        'The aisle that happens to be open is 2014. There\'s one folder in it with a spine ' +
        'worn soft: PLATFORM FOUNDATION — SOURCING. Inside is a single sheet, a comparison ' +
        'of two options, and the cheaper one is circled, and under the circle somebody has ' +
        'written "revisit in Q3" and initialled it, and there\'s no Q3 in this box or any ' +
        'other box on this shelf.' },
    tagCellar: {
      bottles: { name: 'racked bottles', plural: true, aliases: ['bottle', 'rack', 'label', 'wine', 'versions'],
        text: e => 'Each with a version on the label and a date under it. Most of them turn ' +
          'out to be the same wine. Two of them are both v2.0, and neither will say which ' +
          'came first, and both are somebody\'s production.\n\n' +
          (e.state.flags.found.commit
            ? 'One rack is empty, and the label is still on it: the one where it all worked.'
            : 'One rack isn\'t like the others. The bottle in it\'s gold all the way ' +
              'through, and the label says only: THE ONE WHERE IT ALL WORKED. It\'s not ' +
              'here — it\'s one floor south, in the crypt, on a shelf.') } },
    contingencyCloset: {
      binders: { name: 'numbered binders', plural: true, aliases: ['binder', 'plans', 'plan', 'shelves'],
        text: e => 'A plan for every thing that didn\'t happen: each one complete, each one ' +
          'signed off, each one numbered. There\'s no binder for the thing that did.\n\n' +
          'You pull one at random. CONTINGENCY 41: LOSS OF SUPPLIER. It\'s nine pages and ' +
          'it\'s good, and on page four somebody has written, in pencil, in the margin, in a ' +
          'hand that got faster and then stopped: ' +
          (e.state.flags.met.clerk
            ? '"the foundation is the supplier. we can\'t contingency the floor."'
            : '"see BOM, six lines from the bottom."') } },
    postmortemArchive: {
      boxes: { name: 'box files, floor to ceiling', plural: true, aliases: ['box', 'file', 'files', 'incidents', 'spine'],
        text: 'One per incident, each with a spine label, a date and the words NO BLAME. Pull ' +
          'any two down at random and they\'re the same document. The action items at the back ' +
          'of each one are the causes at the front of the next.' } },

    /* ================= THE EXPANSION ================= */

    /* ---- hall 1 ---- */
    onboardingFunnel: {
      panel: { name: 'a progress panel', aliases: ['progress', 'step', 'tour'],
        text: 'STEP 3 OF 4. It has said so for some distance. There\'s no step 4, and the ' +
          'way out is to stop reading it. (SKIP)' } },
    sessionArchive: {
      spools: { name: 'wall after wall of spools', plural: true, aliases: ['spool', 'reels', 'archive', 'tapes'],
        text: e => e.flag('storm:muted')
          ? 'In the silence one reel is audible, because it\'s the only one in the room ' +
            'where somebody said "I don\'t know" and then waited.'
          : 'Fourteen thousand conversations running at once. It sounds like weather. ' +
            'Nothing in here can be made out while the hall is this loud.' } },
    personaGallery: {
      personas: { name: 'a curve of cut-out users', plural: true, aliases: ['persona', 'cutouts', 'cutout', 'users'],
        text: 'Each has a name, an age, a goal and a frustration printed at the hip. None ' +
          'of them has ever been met. One has a coffee ring on the base.' },
      ring: 'Somebody set a cup down on that one. It\'s not a cut-out — it\'s a photograph, ' +
        'of somebody real, and it\'s worth looking behind.',
      plate: { name: 'a plate on the plinth', text: 'One word, engraved: PERSONA.' } },
    notificationStorm: {
      alerts: { name: 'a storm of alerts', plural: true, aliases: ['alert', 'notifications', 'storm'],
        text: 'They arrive at eye level in order of arrival, which isn\'t order of ' +
          'importance, and there\'s no order of importance.' } },

    /* ---- hall 2 ---- */
    elicitationBooth: {
      questions: { name: 'a list of questions', aliases: ['question', 'list'],
        text: 'The first one is: "What would you do if this didn\'t exist?" It\'s a good ' +
          'question. Sit down and wait, and the booth will do the rest.' },
      chairs: 'Two, facing. The far one has never been sat in.' },
    assayOffice: {
      bench: { name: 'an assay bench', aliases: ['balance', 'acid', 'hammers'],
        text: 'A balance, a bottle of acid and a rack of small hammers. The gold-lettered ' +
          'slabs come apart in water. The short ones don\'t.' } },
    ossuary: {
      racks: { name: 'racks of cut requirements', plural: true, aliases: ['rack', 'bones', 'requirements'],
        text: 'Stacked like long bones, each labelled with the release it didn\'t make. ' +
          'Some of them are good. That was never what they were cut for.' },
      plate: { name: 'a plate at the end of the rack', text: 'One word, stamped: SHALL.' } },

    /* ---- hall 3 ---- */
    metamodelStair: {
      landings: { name: 'four landings', plural: true, aliases: ['landing', 'stair', 'levels'],
        text: 'At each one, the thing you\'re looking at describes the thing below it. ' +
          'Halfway up you stop being able to say which floor you\'re on.' } },
    metamodelLoft: {
      stand: { name: 'a stand', aliases: ['plinth'],
        text: 'Where the model describes itself and stops.' },
      plate: { name: 'a plate on the stand', text: 'One word, engraved: SCHEMA.' } },
    slagPit: {
      block: { name: 'a half-finished block', aliases: ['slag', 'diagrams'],
        text: 'Enormous, unfinished, with a name on it that four people in this building ' +
          'would still recognise. Everything the forge couldn\'t use is down here.' } },

    /* ---- hall 4 ---- */
    contextWindow: {
      capacity: { name: 'a capacity notice', aliases: ['notice', 'door', 'window'],
        text: 'CAPACITY: 4. It\'s not advice. Anything over four you\'ll set down outside ' +
          'the door yourself, politely, and not remember doing it.' } },
    rateLimiter: {
      turnstile: { name: 'a turnstile', aliases: ['gate', 'queue'],
        text: 'It admits one person every so often. The so-often was set by somebody who ' +
          'has never stood in this queue. An API token gets you waved through.' } },
    agentYard: {
      agents: { name: 'a yard of small agents', plural: true, aliases: ['agent', 'helpers', 'errands'],
        text: 'Watch any one of them and it\'s doing the errand of the one in front. Watch ' +
          'the one in front and it\'s doing yours.' } },
    fineTuningCellar: {
      shelf: { name: 'a shelf by the door', aliases: ['box'],
        text: 'One box on it, labelled and dated in somebody\'s careful hand.' },
      plate: { name: 'a plate on the box', text: 'One word, inked: PROMPT.' } },

    /* ---- hall 5 ---- */
    sortieBoard: {
      board: { name: 'the sortie board', aliases: ['sorties', 'chalk', 'column'],
        text: 'Every mission the platform has flown, time out and time back, in chalk. The ' +
          'column headed WHAT FOR is ruled and empty, and somebody has gone over the rule a ' +
          'second time with a straight edge rather than fill it in.' },
      plate: { name: 'a plate under the board', text: 'One word, chalked over and still ' +
        'legible: SORTIE.' } },
    weatherDeck: {
      weather: { name: 'weather', aliases: ['cloud', 'rain', 'exhaust', 'forecast'],
        text: e => 'Entirely of our own manufacture, and still weather: you can be rained on, ' +
          'at four thousand feet, by your own exhaust.\n\nFrom up here you can see the ' +
          'whole system of it, and Saint Mark is right that the bugs are weather rather than ' +
          'enemies. Forecast, below the Atrium: ' +
          (e.state.flags.repellent > 0
            ? 'clear — the static analyser is still running.'
            : 'unsettled. The duck isn\'t an umbrella, it\'s an argument: when a bug ' +
              'finds you, THROW DUCK AT BUG, and pick it back up after.') } },
    debriefRoom: {
      chart: { name: 'a full flip chart', aliases: ['flipchart', 'chairs', 'circle'],
        text: 'Nine chairs in a circle and every page used. What happened, said out loud by ' +
          'the people it happened to. Nothing downstream of it has ever changed.' } },
    rehearsalHangar: {
      mission: { name: 'the mission, flying', aliases: ['hangar', 'projector', 'rehearsal'],
        text: 'At one to one, before anything was built. It starts when you walk in and ' +
          'stops when you leave, and it has done that for eleven years to an empty floor.' } },

    /* ---- hall 7 ---- */
    continentalFloor: {
      continent: { name: 'a continent underfoot', aliases: ['floor', 'model', 'powerline', 'forest'],
        text: 'A city is a smudge and a power line is a hair, and crossing the room takes ' +
          'about eight minutes and about four hundred miles.\n\nIf you get down on your ' +
          'knees at the western end you can find it: a pine forest, a gravel road, a tin ' +
          'shed, and a brass disc set in concrete west of the road with an elevation stamped ' +
          'on it. Every height on this platform is measured from that disc. Nothing up here ' +
          'has ever been down there to look at it.' } },
    magnitudeStair: {
      steps: { name: 'ten steps', plural: true, aliases: ['step', 'stair', 'orders'],
        text: 'Each one is ten of the last. Up: the platform is a component. Up: the ' +
          'programme is a line item. Up: you can\'t see any of this, and you can see very ' +
          'clearly what it was for.' },
      plate: { name: 'a plate on the top step', text: 'One word, cut deep: SCALE.' } },
    longNowRoom: {
      clock: { name: 'a clock that ticks once a year', aliases: ['dial', 'schedule'],
        text: e => 'A dial that turns once a century, beside a maintenance schedule in a ' +
          'hand that expected to be dead before the next entry. It\'s the only instrument up ' +
          'here that\'s honest about time, and it\'s content to be honest about yours:\n\n' +
          '  turns taken       ' + e.state.moves + '\n' +
          '  lantern context   ' + (e.state.flags.tokens || 0) + ' tokens\n' +
          '  banked            ' + Object.keys(e.state.flags.vaulted || {}).length +
            ' of ' + TREASURES.length + '\n' +
          '  written off       ' + Object.keys(e.state.flags.lost || {}).length + '\n' +
          '  words learned     ' + Object.keys(e.state.flags.words || {}).length + ' of 7' } },
    ballastYard: {
      ballast: { name: 'stacks of ballast', plural: true, aliases: ['mass', 'process', 'stack'],
        text: 'The mass you have to add to a thing to make it behave at the size you\'ve ' +
          'decided it\'s. Most of it\'s process.' } },

    /* ---- act V, second pass ---- */
    siteGate: {
      book: { name: "a visitors' book", aliases: ['visitors', 'lectern', 'sign', 'fence'],
        text: 'Ruled columns: name, organisation, purpose, time in, time out. Everybody who ' +
          'has any business here has signed it. There\'s no column for people who came out ' +
          'of a tree. (SIGN BOOK.)' } },
    tarpaulin: {
      pallets: { name: 'pallets of sorted wreckage', plural: true, aliases: ['pallet', 'wreckage', 'rows', 'tarp'],
        text: 'Laid out in rows, by kind, carefully, by somebody who then went home. Models ' +
          'here, traces there, tests at the end. It\'s the best-organised the platform has ' +
          'been in eleven years and it\'s on pallets in a field.' } },
    weighbridge: {
      dealer: { name: 'a man with a number', aliases: ['scrap', 'buyer', 'readout', 'plate'],
        text: 'He buys by the tonne and doesn\'t care what it was. The number is fair. It\'s ' +
          'what four thousand feet of platform weighs, and it would fund the follow-on for a ' +
          'year. (SELL WRECK.)' } },
    readingRoom: {
      boxes2: { name: 'ninety years of lodged decisions', plural: true, aliases: ['boxes', 'decisions', 'lamps', 'table', 'cardigan'],
        text: 'In boxes along the wall, each one a thing somebody wrote down and somebody ' +
          'else later read. This is the older faith: you write down what happened, and then ' +
          'you read it back. There\'s a cardigan over the back of a chair. It\'s still warm.' } },
    countyRoad: {
      shelter: { name: 'a bus shelter', aliases: ['bus', 'timetable', 'perspex', 'tarmac'],
        text: 'First bus at ten past six. You could be on it with the thread still in you ' +
          'and nobody would know. (BOARD BUS.)' } },

    /* ---- act V ---- */
    scatterField: {
      wreckage: { name: 'the platform, arriving', aliases: ['models', 'traces', 'grass', 'field'],
        text: 'Models and traces and tests coming down through the branches in a format ' +
          'anybody can open. The forest is taking it extremely calmly.' } },
    wreckOfTheHalls: {
      halls: { name: 'seven halls in the bracken', plural: true, aliases: ['hall', 'wreck', 'niches', 'vault'],
        text: 'Lying open like a diagram finally laid out properly. The vault came down with ' +
          'them and its thirteen niches are tipped out; everything you put somewhere safe is ' +
          'in the wet grass, safe. (SALVAGE)' } },
    newProgramOffice: {
      clerk: { name: 'a very polite person', aliases: ['salesman', 'licence', 'license', 'offer'],
        text: 'Well-briefed, entirely pleasant, and made of paper. When the wind gets under ' +
          'the door he moves slightly with it and doesn\'t appear to notice.' },
      kettle: 'Theirs is plugged in.' },
    siteHut: {
      engineer: { name: 'the follow-on programme\'s engineer', aliases: ['work', 'schedule'],
        text: 'Doing the actual work: a schedule, a scope, and a list of things nobody has ' +
          'decided. Nobody has been in here today.' },
      kettle: { name: 'a kettle, not plugged in', aliases: ['plug', 'lead'],
        text: 'It\'s not plugged in. It would take a second.' } },
    recordsOffice: {
      form: { name: 'a form on the counter', aliases: ['counter', 'shelf', 'lodge'],
        text: 'A field for the decision, a field for the reason, and a field for who\'s ' +
          'going to live with it. Things become true here by being written down and lodged.' } },
    signingTent: {
      table: { name: 'a trestle table', aliases: ['pen', 'chairs', 'gazebo'],
        text: 'Two chairs on one side and one on the other, because that\'s how the room was ' +
          'booked. There\'s a pen on the table. There\'s always a pen on the table.' } },
    theRoadAtDawn: {
      road: { name: 'the gravel road', aliases: ['dawn', 'sandbags'],
        text: 'At the hour when it stops being night. The sandbags stencilled TECHNICAL DEBT ' +
          'are where you dropped them.' } }
  };
  for (const h of HALLS) {
    SCENERY[h.hall] = SCENERY[h.hall] || {};
    SCENERY[h.hall].placard = { name: 'a scorched placard', text: h.placard };
  }

  /* The three swamp rooms are identical on purpose. The Plain Language Edition
     names them, which is the whole joke about plain language. */
  const SWAMP_NAMES = {
    swamp1: 'This is the reach nearest the Hall of Requirements: east takes you out.',
    swamp2: 'This is the middle reach. North of here is the Backlog, End of.',
    swamp3: 'This is the far reach. Nothing you want is south of it.'
  };

  /* Both forms of a scenery entry, read through one door. */
  const sceneryText = (entry, e) => {
    if (typeof entry === 'string') return entry;
    if (typeof entry === 'function') return entry(e);
    const t = entry.text;
    return (typeof t === 'function') ? t(e) : t;
  };
  const sceneryNouns = (key, entry) =>
    [key].concat((typeof entry === 'object' && entry.aliases) || []);
  const findScenery = (e, noun) => {
    const here = SCENERY[e.state.room] || {};
    for (const key of Object.keys(here)) {
      const entry = here[key];
      const hit = sceneryNouns(key, entry)
        .some(n => n === noun || n + 's' === noun || n === noun + 's');
      if (hit) return sceneryText(entry, e);
    }
    return null;
  };

  /* ============================= small helpers ============================= */
  const after = (words, prep) => {
    const i = words.indexOf(prep);
    return i > 0 ? words.slice(i + 1).join(' ') : null;
  };
  const before = (words, prep) => {
    const i = words.indexOf(prep);
    return i > 1 ? words.slice(1, i).join(' ') : (words[1] || null);
  };
  /* "PUT HEX KEY IN BASKET" hands us a phrase; the engine matches single words */
  const resolve = (e, phrase) => {
    if (!phrase) return null;
    const direct = e.findItem(phrase);
    if (direct) return direct;
    const parts = String(phrase).split(/\s+/);
    for (const w of parts) { const id = e.findItem(w); if (id) return id; }
    return null;
  };
  const isTreasure = id => TREASURES.includes(id);

  /* =========================================================== the epilogue
   * Every ending on this platform used to stop on its own last line, which is
   * a fine way to end a paragraph and a poor way to end a programme. What a
   * player wants at the end is to be told what became of the things they
   * touched — so this reads the flags back and says so, in the order the
   * things happened to them. Only lines that are true get printed.
   */
  function epilogue(e) {
    const f = e.state.flags;
    const n = o => Object.keys(o || {}).length;
    const out = [];
    const say = line => out.push('  · ' + line);

    if (f.blew) {
      say('The Monolith is in about nine hundred pieces and every one of them is ' +
        'documented, which is more than could ever be said for it standing up.');
    }
    if (f.published) {
      say('The dishes at the Antenna Farm are still explaining the format to nobody ' +
        'in particular. They\'ll do this for years. It\'ll eventually work.');
    }
    if (n(f.salvaged) >= 7) {
      say('All seven records came out of the trees intact. Somebody in a county office ' +
        'will open one in thirty years and understand it immediately, which is the ' +
        'entire point and nobody will ever thank you for it.');
    } else if (n(f.salvaged)) {
      say(n(f.salvaged) + ' of the seven records came out of the trees. The rest are ' +
        'in the bracken, going soft, in a format nobody will ever open again.');
    }
    if (f.soldWreck) {
      say('Four thousand feet of platform went out on a lorry, by the tonne, to a man ' +
        'who didn\'t ask what any of it was for. The cheque cleared. It funded the ' +
        'follow-on for about eleven weeks.');
    }
    if (f.assayed) {
      say('The foundation was assayed at the benchmark and came apart in water, on the ' +
        'record, in front of a witness. It had been sand for eleven years and it had ' +
        'been load-bearing for all of them.');
    }
    if (f.magazineFiled) {
      say('MBSE Today is at the Backlog, End of, among the cards that will never be ' +
        'pulled. Its lead feature was about you. It was going to be a very positive piece.');
    }
    if (f.dannetUndone) say('Dannet is one head lighter and considerably better company.');
    if (f.riddlesRight >= 3) {
      say('Commander Alexander got three out of you and paid out on every one. He\'s ' +
        'downstream with the last of the telemetry, telling somebody else the same riddles.');
    } else if (f.riddlesRight) {
      say('Commander Alexander got ' + f.riddlesRight + ' out of you and is still owed ' +
        'the rest. He\'s a patient man and the river is long.');
    }
    if (n(f.gamesWon) >= 10) {
      say('Pathfinder Thomas lost all ten and has recorded the series, in the tin, as ' +
        '"inconclusive — small sample size".');
    } else if (n(f.gamesWon)) {
      say('Pathfinder Thomas is ' + (10 - n(f.gamesWon)) + ' games up on you and has ' +
        'written the score down somewhere it can be found.');
    }
    if (f.storyPoints) {
      say(f.storyPoints + ' iMBSE story points went home in the tin. They\'re not ' +
        'convertible into anything. They never were. That was always the joke.');
    }
    if (e.carrying('duck') || e.state.itemLocations.duck === 'inventory') {
      say('The rubber duck went home in your pocket. It has no opinion about any of ' +
        'this, which is precisely why it was the most effective tool on the platform.');
    }
    if (f.deaths === 0) {
      say('You didn\'t die once, which the deity considers statistically suspicious ' +
        'and has flagged for review.');
    } else {
      say('You died ' + f.deaths + (f.deaths === 1 ? ' time' : ' times') + '. The deity ' +
        'has closed the ticket as "works as designed" and moved on.');
    }
    if (f.signedIn) {
      say('Your name is in the visitors\' book at the site gate, in the first three ' +
        'pages, which in ninety years will make you either a footnote or a suspect.');
    }
    say('Dassault took the licence to a programme in the next county on the following ' +
      'Friday. He has a new face for it. It\'s a very good face. There\'s always ' +
      'another programme, and that\'s not a defeat — it\'s a Tuesday.');

    return '\n— WHAT BECAME OF IT —\n\n' + out.join('\n');
  }

  /* ================================ verbs ================================= */
  const verbs = [

    /* ---- EXAMINE, with room-scoped scenery first ---- */
    { words: ['examine', 'x', 'inspect', 'describe', 'look'], handler(e, noun, words) {
      let n = noun;
      if (words[0] === 'look' && (!n || n === 'around')) return false;
      if (n === 'up' || n === 'in') n = words[2] || n;
      if (!n) return false;
      /* LOOK BEHIND <thing> — the hidden panel, and the habit generally */
      if (n === 'behind' || words.includes('behind')) return openPanel(e);
      const text = findScenery(e, n);
      if (text) { e.print(text); return; }
      return false;                                   // fall through to the engine
    } },

    /* ---- SHOW x TO y ---- */
    { words: ['show', 'wave', 'present'], handler(e, noun, words) {
      const what = resolve(e, before(words, 'to'));
      const whom = after(words, 'to');
      if (words[0] === 'wave') return doWave(e, what);
      if (!what || !e.carrying(what)) { e.print('You aren\'t carrying that.'); return; }
      return doShow(e, what, whom);
    } },

    /* ---- GIVE x TO y ---- */
    { words: ['give', 'offer', 'hand'], handler(e, noun, words) {
      const what = resolve(e, before(words, 'to'));
      const whom = after(words, 'to');
      if (!what || !e.carrying(what)) { e.print('You aren\'t carrying that.'); return; }
      if (what === 'thermos' && e.state.room === 'chatParlor') return giveCoffee(e);
      if (what === 'rations' && e.here('bot')) return feedBot(e);
      if (NPCS && NPCS.give && NPCS.give(e, what, whom)) return;
      e.print('Nobody here wants that.');
    } },

    /* ---- SHINE x ON y ---- */
    { words: ['shine', 'point'], handler(e, noun, words) {
      const what = resolve(e, before(words, 'on')) || 'lantern';
      const target = after(words, 'on') || '';
      if (what !== 'lantern') { e.print('That doesn\'t shine.'); return; }
      if (!e.carrying('lantern') || !e.prop('lantern')) {
        e.print('The lantern isn\'t lit.'); return;
      }
      if (e.state.room === 'shallQuarry' && /slab|stone|quarry|face/.test(target)) {
        if (e.flag('tabletFound')) { e.print('The one honest slab is already out of the face.'); return; }
        e.setFlag('tabletFound');
        e.item('tablet').hidden = false;
        e.print('In token-light exactly one slab answers: a short one, low down, with a ' +
          'test carved on the back of it. It reads THE SYSTEM SHALL DELIVER THE MISSION ' +
          'MODEL TO THE CUSTOMER IN A FORMAT THE CUSTOMER CAN OPEN WITHOUT US.\n' +
          'The Shall Tablet may be taken.');
        return;
      }
      e.print('The light falls on it and nothing is revealed that wasn\'t there before.');
    } },

    /* ---- PRY x WITH y ---- */
    { words: ['pry', 'lever', 'prise', 'force'], handler(e, noun, words) {
      const what = resolve(e, before(words, 'with'));
      const tool = resolve(e, after(words, 'with'));
      if (what !== 'blob' || !e.here('blob')) { e.print('There\'s nothing here to pry.'); return; }
      if (tool !== 'rule' || !e.carrying('rule')) {
        e.print('Nothing you\'re holding will get into it. It has no seams. It would ' +
          'take leverage from a good deal further out.');
        return;
      }
      if (e.prop('blob')) { e.print('It\'s already open.'); return; }
      e.setProp('blob', 1);
      e.moveItem('pearl', 'interfaceLedge');
      e.print('You set eight inches of slide rule against a binary the size of a car and ' +
        'lean on one order of magnitude. The Sealed Blob opens the way undocumented ' +
        'things always open, which is from further away.\nInside is the Pearl of ' +
        'Provenance: one small perfect record of where everything came from.');
    } },

    /* ---- THROW x AT y ---- */
    { words: ['throw', 'chuck', 'toss'], handler(e, noun, words) {
      const what = resolve(e, before(words, 'at'));
      const target = after(words, 'at') || '';
      if (what !== 'duck' || !e.carrying('duck')) {
        e.print('That would achieve nothing and you\'d then be without it.'); return;
      }
      if (NPCS && NPCS.duckAt && NPCS.duckAt(e, target)) return;
      const bug = e.state.flags.bugHere;
      if (!bug) { e.print('There\'s nothing here that needs explaining to.'); return; }
      e.moveItem('duck', e.state.room);
      e.state.flags.bugHere = null;
      e.print('You explain the problem to the duck. Out loud. All the way to the end, ' +
        'including the part you\'ve been skipping. Somewhere in the second sentence you ' +
        'hear it yourself, and the bug — exposed, reproduced, understood — simply stops ' +
        'being the case.');
    } },

    /* ---- PUT x IN/AT y ---- */
    { words: ['put', 'place', 'insert', 'set'], handler(e, noun, words) {
      /* PUT OUT <lamp> is dousing, not dropping */
      if (words.includes('out')) { e.parse('douse'); return; }
      const prep = ['in', 'into', 'at', 'on'].find(p => words.includes(p));
      if (!prep) return false;   // plain drop
      const what = resolve(e, before(words, prep));
      const where = (after(words, prep) || '').replace(/^the\s+/, '');
      if (!what || !e.carrying(what)) { e.print('You aren\'t carrying that.'); return; }

      if (/basket|balloon/.test(where)) return stow(e, what);
      if (/socket|niche|ring|shelf|vault|wall/.test(where)) return vaultIt(e, what, where);
      if (what === 'cap' && /charge|well/.test(where)) return armCharge(e);
      if (what === 'charge' && /monolith|slab|foundation/.test(where)) return setCharge(e);
      e.print('That doesn\'t go there.');
    } },

    /* ---- the sandbags: heaved over the rim, not dropped out of your hands ---- */
    { words: ['drop', 'jettison', 'heave', 'dump', 'discard'], handler(e, noun, words) {
      const id = resolve(e, words.slice(1).join(' '));
      /* The bot is a follower, not cargo: dropping it is telling it to wait. */
      if (id === 'bot' && e.prop('bot') === 2 && e.here('bot')) {
        e.setProp('bot', 1);
        e.moveItem('bot', e.state.room);
        e.print('You tell the bot to wait here. It sits down where it\'s told, which is ' +
          'more than the rest of this platform has ever done.');
        return;
      }
      if (id !== 'debt' || !e.here('debt')) return false;
      e.moveItem('debt', 'nowhere');
      e.print('You heave the sandbags over the rim. TECHNICAL DEBT hits the meadow grass ' +
        'with a sound like a decision, and the basket lifts an inch off the ground.');
    } },

    /* ---- CUT ---- */
    { words: ['cut', 'chop', 'saw'], handler(e, noun) {
      if (/debt|sandbag|ballast/.test(noun || '') && e.here('debt')) {
        e.moveItem('debt', 'nowhere');
        e.print('You cut the sandbags away. TECHNICAL DEBT hits the meadow grass with a ' +
          'sound like a decision, and the basket lifts an inch off the ground.');
        return;
      }
      if (e.state.room !== 'theTrunk' || !/branch|tree|trunk|bough/.test(noun || 'branch')) {
        e.print('There\'s nothing here worth cutting.'); return;
      }
      if (!e.carrying('knife')) { e.print('Not with your bare hands.'); return; }
      if (e.state.itemLocations.branch !== 'nowhere') {
        e.print('One branch off this trunk is enough. It has given up enough of them.');
        return;
      }
      e.moveItem('branch', e.state.room);
      e.print('You take one green branch off the great trunk, and the scar it leaves ' +
        'joins several thousand others.');
    } },

    /* ---- FILL ---- */
    { words: ['fill'], handler(e, noun, words) {
      const n = (words.slice(1).join(' ') || '').toLowerCase();
      if (e.state.room === 'recordsOffice' && /form|record|decision|in/.test(n)) return writeRecord(e);
      const id = resolve(e, noun);
      if (id === 'thermos' && e.state.room === 'clientConcourse') {
        e.setProp('thermos', 1);
        e.print('You fill the thermos at the espresso urn. The urn mutters something ' +
          'that\'s almost a blessing.');
        return;
      }
      if (id === 'flask' && e.state.room === 'tokenFountain') {
        e.setProp('flask', 1);
        e.print('You dip the flask in the basin and it fills with moving light.');
        return;
      }
      if (id === 'lantern' && e.state.room === 'tokenFountain') {
        if (!e.carrying('credits') && !e.flag('boughtRefill')) {
          e.print('The fountain pours for anybody who can pay for it. You can\'t.'); return;
        }
        if (e.carrying('credits')) {
          e.moveItem('credits', 'nowhere');
          e.print('You spend the book of GPU credits on light, which is what it was ' +
            'always for and never quite worth.');
        } else {
          e.setFlag('boughtRefill', false);
          e.print('You redeem the token refill from the Company Store.');
        }
        e.state.flags.tokens = LAMP_FULL;
        e.print('The lantern takes a full context window: ' + LAMP_FULL + ' tokens.');
        return;
      }
      e.print('There\'s nothing here to fill that from.');
    } },

    /* ---- POUR ---- */
    { words: ['pour', 'empty', 'water'], handler(e, noun, words) {
      const what = resolve(e, before(words, 'on')) || e.findItem(noun);
      if (what !== 'flask' || !e.carrying('flask')) { e.print('You\'ve nothing to pour.'); return; }
      if (!e.prop('flask')) { e.print('The flask is empty.'); return; }
      if (e.state.room !== 'promptGarden') {
        e.setProp('flask', 0);
        e.print('The context runs away between the boards and isn\'t missed.');
        return;
      }
      e.setProp('flask', 0);
      const grown = (e.state.flags.vineGrowth || 0) + 1;
      e.state.flags.vineGrowth = grown;
      if (grown === 1) {
        e.print('The vine drinks the whole flask and puts out four feet of growth and a ' +
          'leaf the size of a door.');
      } else if (grown === 2) {
        e.setProp('vine', 1);
        e.print('The vine goes up the shaft and out of sight, and is now climbable. ' +
          'The Prompt Garden and the Macro Gantry are one climb apart.');
      } else {
        e.print('The vine takes it and grows nothing you can use. It\'s already where it ' +
          'was going.');
      }
    } },

    /* ---- WELD ---- */
    { words: ['weld', 'integrate', 'join', 'assemble'], handler(e) {
      if (e.state.room !== 'integrationBay') {
        e.print('There\'s no arc here, and you\'re not going to do this by hand.'); return;
      }
      if (!e.here('leftArm') || !e.here('rightArm')) {
        e.print('You need both arms of the V in this bay. Neither half is worth anything ' +
          'on its own, which is rather the point of it.');
        return;
      }
      e.moveItem('leftArm', 'nowhere');
      e.moveItem('rightArm', 'nowhere');
      e.moveItem('vee', e.state.room);
      e.print('You set the left arm against the right and strike the arc. The join takes, ' +
        'the light goes down the whole length of it, and what you\'re holding is no ' +
        'longer two ideas about engineering but one: the Golden V.');
    } },

    /* ---- PULL ---- */
    { words: ['pull', 'push'], handler(e, noun) {
      if (/panel|wall|void/.test(noun || '')) return openPanel(e);
      /* The gantry's release lever is the printed procedure, and the printed
         procedure is JUMP. Step one has never been performed. */
      if (e.state.room === 'deorbitGantry' && /lever|release|procedure/.test(noun || 'lever')) {
        e.print('You follow the procedure, step by step, for the first time in eleven ' +
          'years. Step four is the rail.');
        e.go('jump');
        return;
      }
      if (e.state.room !== 'titanScaffold' || !/lever|brass/.test(noun || 'lever')) {
        e.print('Nothing here pulls.'); return;
      }
      if (e.carrying('rule')) {
        e.kill('The lever goes the other way. So do you. You go up through the orders of ' +
          'magnitude like a held note, and somewhere around the fourth one there stops ' +
          'being enough of you per cubic metre to continue.');
        return;
      }
      if (e.state.itemLocations.rule !== 'nowhere') {
        e.print('The pad is empty. The lever has nothing to work on.'); return;
      }
      e.moveItem('rule', e.state.room);
      e.print('The rule comes down through the scales like a held note and ends up eight ' +
        'inches long in the palm of your hand, still accurate.');
    } },

    /* ---- CATCH ---- */
    { words: ['catch', 'grab', 'net'], handler(e, noun) {
      if (!/contrarian|bird|grey|gray|copilot/.test(noun || '')) return false;
      if (e.state.room !== 'copilotRoost') { e.print('There\'s no bird here.'); return; }
      if (e.prop('cage')) { e.print('You already have it, and it\'s already objecting.'); return; }
      if (e.carrying('branch')) {
        e.print('It looks at the branch, and at you, and declines to be part of whatever ' +
          'this is.');
        return;
      }
      if (!e.carrying('cage')) {
        e.print('You can hold it for a moment. Without somewhere to keep the context, it ' +
          'is gone.');
        return;
      }
      e.setProp('cage', 1);
      e.print('You get the cage over it. It tells you, from inside the cage, that this ' +
        'was a mistake. It may be right. It usually is.');
    } },

    /* ---- RELEASE / OPEN ---- */
    { words: ['release', 'free', 'let'], handler(e) { return releaseBird(e); } },
    { words: ['open', 'unlock'], handler(e, noun, words) {
      const id = resolve(e, noun);
      const tool = resolve(e, after(words, 'with'));
      if (id === 'cage' || /bird|contrarian|copilot/.test(noun || '')) return releaseBird(e);
      if (/valve|bolt|fuel/.test(noun || '')) {
        if (e.state.room !== 'balloonMeadow') { e.print('There\'s no valve here.'); return; }
        if (!e.carrying('hexKey')) { e.print('The hex bolt doesn\'t care about your hands.'); return; }
        e.setFlag('valve');
        e.print('The hex bolt gives. Gas hisses into the burner line.');
        return;
      }
      if (id === 'hatch' || /hatch|padlock/.test(noun || '')) {
        if (e.state.room !== 'serviceShaft') {
          e.print('The padlock is on the far side of it. From here it\'s just a door in ' +
            'the rock.');
          return;
        }
        if (!e.carrying('keys')) { e.print('It wants a key stamped SERVICE.'); return; }
        e.setProp('hatch', 1);
        e.print('The padlock comes off. The forest and the platform are now joined by ' +
          'something more reliable than a balloon.');
        return;
      }
      if (id === 'chain' || /chain|runner|lock/.test(noun || '')) return unchainBot(e, tool);
      if (id === 'blob') { e.print('It has no seams. It would take leverage.'); return; }
      e.print('That doesn\'t open.');
    } },

    /* ---- LIGHT / EXTINGUISH ---- */
    { words: ['light', 'burn', 'ignite'], handler(e, noun) {
      const id = resolve(e, noun) || 'lantern';
      if (/burner/.test(noun || '')) {
        if (e.state.room !== 'balloonMeadow') { e.print('There\'s no burner here.'); return; }
        if (!e.flag('valve')) { e.print('The burner is dry. The fuel valve is still bolted shut.'); return; }
        if (!e.carrying('lantern') || !e.prop('lantern')) {
          e.print('You\'ve no flame in your hand.'); return;
        }
        e.setFlag('burner');
        e.print('The burner catches with a noise like a held breath, and the envelope ' +
          'stands up over you.');
        return;
      }
      if (id !== 'lantern' || !e.carrying('lantern')) { e.print('You\'ve no lantern.'); return; }
      if (e.prop('lantern')) { e.print('It\'s already lit.'); return; }
      if (e.state.flags.tokens <= 0) { e.print('The context window is empty. Nothing catches.'); return; }
      lightLantern(e);
    } },
    { words: ['extinguish', 'douse', 'off'], handler(e) { return douse(e); } },
    { words: ['turn'], handler(e, noun, words) {
      if (words.includes('off')) return douse(e);
      if (words.includes('on')) {
        if (!e.carrying('lantern')) { e.print('You\'ve no lantern.'); return; }
        if (e.prop('lantern')) { e.print('It\'s already lit.'); return; }
        if (e.state.flags.tokens <= 0) { e.print('The context window is empty.'); return; }
        lightLantern(e);
        return;
      }
      e.print('Turn what, and which way?');
    } },

    /* ---- READ ---- */
    { words: ['read'], handler(e, noun) {
      const n = (noun || '').toLowerCase();
      if (/placard/.test(n)) {
        const h = HALLS.find(x => x.hall === e.state.room);
        if (!h) { e.print('There\'s no placard here.'); return; }
        e.state.flags.placardsRead = e.state.flags.placardsRead || {};
        e.state.flags.placardsRead[h.n] = true;
        e.print(h.placard);
        return;
      }
      if (/plate|directory/.test(n) && e.state.room === 'atrium') { e.print(TEXT.plate); return; }
      /* the seven words: each hall's inner room has a plate with one word on it */
      if (e.state.room === 'readingRoom') return readBack(e);
      if (/plate|word/.test(n)) {
        const word = Object.keys(WORDS).find(w => WORDS[w] === e.state.room);
        if (word) return learnWord(e, word);
      }
      if (/charter/.test(n) && e.state.room === 'missionDeck') { e.print(TEXT.charter); return; }
      if (/sign/.test(n) && e.state.room === 'companyStore') {
        if (NPCS && NPCS.storeSign) { e.print(NPCS.storeSign()); return; }
      }
      const text = findScenery(e, n);
      if (text) { e.print(text); return; }
      e.doExamine(noun);
    } },

    /* ==================================================================
     * THE EXPANSION — verbs the deepened halls and Act V answer to.
     * ================================================================== */

    /* ---- TAKE ALL, in the one place where taking all is the whole verb ---- */
    { words: ['take', 'get', 'grab', 'pick'], handler(e, noun, words) {
      if (e.state.room === 'wreckOfTheHalls' && (!noun || /^(all|everything|every)$/.test(noun))) {
        return e.parse('salvage');
      }
      /* TAKE A PIECE OF THE MONOLITH is the same move as CHIP MONOLITH */
      if ((e.state.room === 'monolith' || e.state.room === 'rcMonolith') &&
        /sample|piece|chip|fragment|shard|bit/.test(noun || '') &&
        e.state.itemLocations.fragment === 'nowhere') {
        return e.parse('chip monolith');
      }
      return false;
    } },

    /* ---- FOLLOW — the rail, the path, the conveyor, the avatar ---- */
    { words: ['follow'], handler(e, noun, words) {
      const n = (words.slice(1).join(' ') || '').toLowerCase();
      if (e.state.room === 'uncannyValley') return false;      // the avatar kills you
      if (e.state.room === 'matrixRoom' && /path|cell|trace|grid/.test(n)) {
        return e.parse('take spool');
      }
      if (e.state.room === 'supplyChain') {
        e.print('You follow the conveyor. It goes in through one wall and out through the ' +
          'other, and far enough either way it leaves the model altogether, which is the ' +
          'one direction this gantry can\'t scale to.');
        return;
      }
      if (/rail|handrail/.test(n)) {
        e.print('There\'s a handrail here and there\'s a handrail on every stair on this ' +
          'platform, because one of Dannet\'s heads keeps taking them off and the other ' +
          'keeps putting them back.');
        return;
      }
      e.print('Follow what? Nothing here\'s going anywhere without you.');
    } },

    /* ---- MAKE / BOIL — the kettle, and the general case ---- */
    { words: ['make', 'boil', 'brew'], handler(e, noun, words) {
      const n = (words.slice(1).join(' ') || '').toLowerCase();
      if (e.state.room === 'siteHut' && /tea|kettle|coffee|brew|drink/.test(n)) {
        return e.parse('plug in kettle');
      }
      if (e.state.room === 'clientConcourse' && /coffee|tea/.test(n)) {
        return e.parse('fill thermos');
      }
      e.print('You can\'t make that here.');
    } },

    /* ---- FILL IN — the form, which is not the same as filling a flask ---- */
    { words: ['complete', 'lodge2'], handler(e) {
      if (e.state.room === 'recordsOffice') return writeRecord(e);
      e.print('There\'s nothing here to complete.');
    } },

    /* ---- SELL / BOARD BUS / READ BACK / SIGN BOOK ---- */
    { words: ['sell', 'weigh'], handler(e) {
      if (e.state.room !== 'weighbridge') { e.print('There\'s nobody here buying.'); return; }
      return sellWreck(e);
    } },
    { words: ['bus'], handler(e) {
      if (e.state.room !== 'countyRoad') { e.print('There\'s no bus here.'); return; }
      return boardBus(e);
    } },

    /* ---- PLAY, in the rooms that have something playable ---- */
    { words: ['play', 'spin', 'run2'], handler(e, noun, words) {
      if (e.state.room === 'sessionArchive') return e.parse('listen');
      if (e.state.room === 'rehearsalHangar') {
        e.print('It\'s already running. It started when you walked in, the way it has ' +
          'started for eleven years, and it\'ll stop when you leave.');
        return;
      }
      return false;
    } },

    /* ---- LISTEN ---- */
    { words: ['listen', 'hear'], handler(e, noun) {
      const room = e.state.room;
      if (room === 'sessionArchive') {
        if (!e.flag('storm:muted')) {
          e.print('Fourteen thousand conversations running at once. It sounds like weather. ' +
            'You\'ll not pick anything out of this until the hall is quiet.');
          return;
        }
        e.print('In the silence one reel is audible, because it\'s the only one in this ' +
          'room where somebody said "I don\'t know" and then waited to find out.');
        return;
      }
      const AMBIENT = {
        notificationStorm: 'Alerts, arriving. None of them is the important one and there\'s ' +
          'no way to tell, because they arrive in order of arrival.',
        chatParlor: 'The console answering, at length, in the user\'s own words, slightly ' +
          'improved. And under it, somebody not typing.',
        tokenFountain: 'Light falling into a basin, from a source only ever described in the ' +
          'singular.',
        chapel: 'A board on the wall going green at 04:00 whether anybody is awake or not.',
        shrine: 'The platform praying, on the hour, to something that\'s answering.',
        legacyPit: 'Something enormous, running, that nobody maintains.',
        monolith: 'Nothing. It\'s the only silent thing on this platform and everything is ' +
          'bolted to it.',
        rehearsalHangar: 'A mission being flown, at one to one, to an empty floor.',
        siteHut: 'A kettle not boiling, and somebody typing who hasn\'t been asked anything.',
        antennaFarm: 'Dishes receiving, with enormous attention, from a sky that\'s empty now.',
        culvertMouth: 'Water under pressure, going somewhere, which is more than most things ' +
          'here can say.',
        weatherDeck: 'Our own weather, arriving on schedule and on budget.',
        longNowRoom: 'One tick. You\'ll not hear the next one.'
      };
      if (AMBIENT[room]) { e.print(AMBIENT[room]); return; }
      if (!e.hasLight()) { e.print('Something breathing, possibly you.'); return; }
      e.print('Nothing worth hearing. The platform hums; it always does.');
    } },

    /* ---- SEARCH — examine, but for people who type SEARCH ---- */
    { words: ['search', 'rummage', 'rifle'], handler(e, noun, words) {
      if (e.state.room === 'personaGallery') return openPanel(e);
      if (e.state.room === 'wreckOfTheHalls') return false;   // SALVAGE handles it
      if (!noun) { e.print(e.describeRoom(true)); return; }
      const text = findScenery(e, noun);
      if (text) { e.print(text); return; }
      e.doExamine(noun);
    } },

    /* ---- USE x ON y — routed to whatever the game actually calls it ---- */
    { words: ['use', 'apply'], handler(e, noun, words) {
      const what = resolve(e, before(words, 'on')) || resolve(e, noun);
      const on = after(words, 'on');
      if (!what) { e.print('Use what?'); return; }
      if (what === 'assayKit' || on === 'fragment' || what === 'fragment') {
        return e.parse('assay fragment with kit');
      }
      if (what === 'rule' && /blob/.test(on || '')) return e.parse('pry blob with rule');
      if (what === 'lantern') return e.parse('light lantern');
      if (what === 'duck') return e.parse('throw duck at bug');
      if (what === 'keys') return e.parse('unlock hatch with keys');
      if (what === 'hexKey') return e.parse('open valve with hex key');
      if (what === 'placard') return e.parse('mute');
      if (what === 'cage') return e.parse('open cage');
      e.print('"Use" is doing a lot of work there. Try the verb for the thing: SHOW, GIVE, ' +
        'POUR, PRY, SHINE, THROW, WAVE, UNLOCK, ASSAY.');
    } },

    /* ---- TALK TO <anyone> ---- */
    { words: ['talk', 'speak', 'greet'], handler(e, noun, words) {
      const who = (after(words, 'to') || words[1] || '').toLowerCase();
      if (/dan|kennet|dannet/.test(who)) return false;          // Dannet has his own scene
      if (!who) { e.print('Talk to whom?'); return; }
      const M = {
        intern: 'helpDesk', clerk: 'ossuary', forgemaster: 'modelForge',
        gardener: 'promptGarden', officer: 'sensorLine', verifier: 'acceptanceFloor',
        surveyor: 'supplyChain'
      };
      const key = Object.keys(M).find(k => who.includes(k));
      if (key) return e.parse('ask ' + key + ' about it');
      if (/engineer|programme|program/.test(who)) return e.parse('ask engineer about the need');
      if (/salesman|polite|vendor/.test(who) || (who === 'clerk' && e.state.flags.actV))
        return e.parse('ask clerk about the offer');
      if (/mark|priest|saint/.test(who)) return e.parse('ask mark about himself');
      if (/tom|thomas|guide/.test(who)) return e.parse('ask tom about the halls');
      if (/katie|prophet|oracle/.test(who)) return e.parse('vision');
      if (/alex|commander|pilot/.test(who)) return e.parse('ask alex about the river');
      if (/user|engineer2/.test(who)) {
        if (e.state.room === 'chatParlor') {
          e.print('They don\'t look up. They\'ve been talking all day and none of it has ' +
            'been to a person. A coffee would say more than you can.');
          return;
        }
      }
      e.print('There\'s nobody of that name here to talk to.');
    } },

    /* ---- SKIP — the only way out of the Onboarding Funnel ---- */
    { words: ['skip', 'next', 'continue'], handler(e, noun, words) {
      if (e.state.room !== 'onboardingFunnel') {
        e.print('There\'s nothing here to skip.'); return;
      }
      if (words[0] !== 'skip') {
        e.print('You\'re taken to the beginning of the tour, which is where you were.');
        return;
      }
      e.setProp('funnel', 1);
      e.print('The corridor gives up on you all at once, with a faint air of having been ' +
        'let down, and there\'s the door.');
    } },

    /* ---- MUTE — the placard on the hall door ---- */
    { words: ['mute', 'silence', 'hang'], handler(e) {
      if (!['sessionArchive', 'notificationStorm', 'clientConcourse', 'accessibilityWing',
        'personaGallery'].includes(e.state.room)) {
        e.print('Nothing here\'s making enough noise to be worth stopping.'); return;
      }
      if (!e.carrying('placard')) {
        e.print('The storm goes on arriving. You\'d need something with authority on it ' +
          '— a sign, say, that nobody has ever needed.'); return;
      }
      if (e.flag('storm:muted')) { e.print('The hall is already quiet.'); return; }
      e.setFlag('storm:muted');
      e.state.flags.stormMutedAt = e.state.moves;
      e.print('You hang the placard on the hall door. The Notification Storm stops at the ' +
        'threshold, politely, the way it never once stopped for anybody\'s work.\n\n' +
        'In the silence, one reel in the archive is audible.');
      e.item('transcript').location = 'sessionArchive';
      if (e.state.itemLocations.transcript === 'nowhere') e.moveItem('transcript', 'sessionArchive');
    } },

    /* ---- LOOK BEHIND / PUSH PANEL — the hidden panel, hall 1 <-> hall 2 ---- */
    { words: ['behind'], handler(e) { return openPanel(e); } },

    /* ---- WALK THE MATRIX ---- */
    { words: ['matrix', 'trace', 'grid'], handler(e, noun, words) {
      const n = (words.slice(1).join(' ') || '').toLowerCase();
      if (e.state.room !== 'matrixRoom') return false;
      if (e.carrying('spool') || e.state.flags.vaulted.spool) {
        e.print('You\'ve walked it. The grid is a wall with some ticks on it now.');
        return;
      }
      return e.doTake('spool', ['take', 'spool']);
    } },

    /* ---- SIT / WAIT — the Elicitation Booth ---- */
    { words: ['sit'], handler(e) {
      if (e.state.room !== 'elicitationBooth') { e.print('There\'s nowhere here worth sitting.'); return; }
      e.state.flags.booth = 1;
      e.print('You sit down in the near chair. The soundproofing closes over the room like ' +
        'a hand. The far chair is empty and the first question is still on the table.');
    } },

    /* ---- CHIP — a piece of the monolith, for the bench that is not up here ---- */
    { words: ['chip', 'break', 'sample'], handler(e, noun) {
      if (e.state.room !== 'monolith' && e.state.room !== 'rcMonolith') {
        e.print('There\'s nothing here worth a piece of.'); return;
      }
      if (e.state.itemLocations.fragment !== 'nowhere') {
        e.print('You\'ve a piece of it already, and one is as uninformative as ten.'); return;
      }
      e.moveItem('fragment', 'inventory');
      e.print('You knock a fragment off the slab. It comes away more easily than eleven ' +
        'years of failing to remove it would suggest, which tells you something, though not ' +
        'yet what.\n\nIt is completely uninformative. It\'ll stay that way until there\'s a ' +
        'bench under it and a kit beside it, and there\'s no bench on this platform.');
    } },

    /* ---- ASSAY x WITH y — the Surveyor's Stake, Act V ---- */
    { words: ['assay', 'test', 'analyse', 'analyze'], handler(e, noun, words) {
      const what = resolve(e, before(words, 'with')) || resolve(e, noun);
      if (!e.carrying('assayKit') && !e.here('assayKit') &&
        !e.carrying('sparekit') && !e.here('sparekit')) {
        e.print('You\'d need the field assay kit, and a bench, and there\'s exactly one ' +
          'of each in this story.'); return;
      }
      if (e.state.room !== 'surveyorsStake') {
        e.print('There\'s nothing flat and true enough here to set a bench on. There\'s one ' +
          'place in this forest that was surveyed before any of it.'); return;
      }
      if (what !== 'fragment' || !e.carrying('fragment')) {
        e.print('The kit is for finding out what a thing is made of. You\'d need a piece ' +
          'of the thing.'); return;
      }
      if (e.flag('assayed')) { e.print('You\'ve the figure. It doesn\'t improve.'); return; }
      e.setFlag('assayed');
      e.addScore(15);
      e.moveItem('fragment', 'nowhere');
      e.moveItem('assayReport', 'inventory');
      e.print(TEXT.assay);
    } },

    /* ---- PUBLISH — the Antenna Farm, Act V ---- */
    { words: ['publish', 'broadcast', 'register', 'lodge'], handler(e, noun, words) {
      const n = (words.slice(1).join(' ') || '').toLowerCase();
      if (/record|decision/.test(n) && e.state.room === 'recordsOffice') return writeRecord(e);
      if (e.state.room !== 'antennaFarm') {
        e.print('There\'s nothing here that talks to anybody who\'s not already listening.');
        return;
      }
      if (!e.flag('actV')) {
        e.print('The dishes are pointed at the platform, and the platform is still up there, ' +
          'and it has never once explained itself.'); return;
      }
      if (e.flag('published')) { e.print('It\'s out. It can\'t be un-out. That\'s the point.'); return; }
      if (!e.carrying('metaobject')) {
        e.print('You could put something out. You\'d want the one object in this forest ' +
          'that\'s certainly accurate on the bench beside you first, or you\'re just another ' +
          'confident broadcast.'); return;
      }
      e.setFlag('published');
      e.addScore(25);
      e.print(TEXT.publication);
    } },

    /* ---- SALVAGE — the wreck of the halls, Act V ---- */
    { words: ['salvage', 'recover'], handler(e, noun) {
      if (e.state.room !== 'wreckOfTheHalls') {
        e.print('There\'s nothing lying about here that used to be somewhere safe.'); return;
      }
      const f = e.state.flags;
      f.salvaged = f.salvaged || {};
      const wanted = noun ? [resolve(e, noun)].filter(Boolean) : RECORDS.filter(r => !f.salvaged[r]);
      if (!wanted.length) {
        e.print('You\'ve everything out of the grass that\'s worth carrying to a table.'); return;
      }
      const lines = [];
      for (const id of wanted) {
        if (!RECORDS.includes(id)) { lines.push('That\'s not one of the seven.'); continue; }
        if (f.salvaged[id]) { lines.push(e.label(id) + ': already out of the grass.'); continue; }
        f.salvaged[id] = true;
        e.addScore(3);
        e.moveItem(id, 'inventory');
        lines.push(e.label(id) + ': out of the wet grass, undamaged. (+3)');
      }
      const n = RECORDS.filter(r => f.salvaged[r]).length;
      lines.push('\n' + n + ' of 7 recovered.' + (n === 7
        ? ' They\'re not treasure any more. They\'re evidence.' : ''));
      e.print(lines.join('\n'));
    } },

    /* ---- WRITE — the Records Office, Act V ---- */
    { words: ['write', 'file'], handler(e) { return writeRecord(e); } },

    /* ---- PLUG — the kettle in the site hut ---- */
    { words: ['plug'], handler(e) {
      if (e.state.room !== 'siteHut') { e.print('There\'s nothing here to plug in.'); return; }
      if (e.flag('kettle')) { e.print('It has boiled once already. They\'ve a mug.'); return; }
      e.setFlag('kettle');
      e.print('You plug the kettle in. It\'s the first thing anybody has done for them since ' +
        'Tuesday, it costs you nothing, and they notice.\n\n' +
        '"Oh," they say. "Thanks. Sorry — long week." They put the schedule down, which is ' +
        'the first time it has been down today.');
    } },

    /* ---- PRESS / SIGN / BOARD / LAUNCH ---- */
    { words: ['press', 'push-button', 'detonate', 'fire'], handler(e, noun) {
      if (/detonator|plunger|charge/.test(noun || 'detonator')) return fireCharge(e);
      e.print('Nothing here has a button.');
    } },
    { words: ['sign'], handler(e, noun, words) {
      if (e.state.room === 'siteGate') return signBook(e);
      /* The tent. The pen is on the table and it is for somebody else. */
      if (e.state.room === 'signingTent') {
        if (!e.state.flags.recordWritten) {
          e.print('There\'s nothing of yours on that table yet.'); return;
        }
        e.print(TEXT.founderEnding);
      e.print(epilogue(e));
        e.state.won = true;
        e.setFlag('signedSelf');
        return;
      }
      if (e.state.room !== 'boardroom' || !(e.flag('duelWon') || e.state.flags.offered)) {
        e.print('There\'s nothing here to sign, which is the best news you\'ve had all day.');
        return;
      }
      e.print(TEXT.contractEnding);
      e.print(epilogue(e));
      e.state.won = true;
      e.setFlag('signedContract');
    } },
    { words: ['board', 'embark'], handler(e) {
      if (e.state.room === 'countyRoad') return boardBus(e);
      if (e.state.room !== 'balloonMeadow') return false;
      return boardBalloon(e);
    } },
    { words: ['launch', 'ascend'], handler(e) {
      if (e.state.room !== 'balloonMeadow') return false;
      return launchBalloon(e);
    } },

    /* ---- the seven answers in the boardroom ---- */
    { words: KEYSTONES.concat(['dassault', 'answer']), handler(e, noun, words) {
      if (e.state.room !== 'boardroom' && e.state.flags.duelRound === undefined) return false;
      /* HELP says ANSWER <word>, so ANSWER CONSOLE must land the same as CONSOLE.
         (Alexander's riddles take ANSWER first, in the NPC hook, when one is open.) */
      let word = words[0];
      if (word === 'answer') {
        if (!words[1]) { e.print('Answer with one of the seven words on the board.'); return; }
        word = words[1];
      }
      return duelAnswer(e, word);
    } },
    { words: ['hint', 'hints', 'help2', 'stuck'], handler(e) { return doHint(e); } },

    /* ---- GOAL: the plot, in plain language, at any point in the game ---- */
    { words: ['goal', 'objective', 'quest', 'mission2'], handler(e) { return doGoal(e); } },

    /* ---- PRAY ---- */
    { words: ['pray', 'kneel'], handler(e) { return pray(e); } },

    /* ---- QUIT tracking ---- */
    { words: ['quit'], handler(e) {
      e.setFlag('quit');
      e.print('You give up. The platform notes it, files it, and carries on praying.');
      e.state.dead = true;
    } }
  ];

  /* =============================== actions =============================== */
  function lightLantern(e) {
    e.setProp('lantern', 1);
    e.setFlag('lit:lantern', true);              // the engine's darkness contract
    e.print('The lantern lights, and begins, very quietly, to spend.');
  }

  function douse(e) {
    if (!e.carrying('lantern')) { e.print('You\'ve no lantern.'); return; }
    if (!e.prop('lantern')) { e.print('It\'s already out.'); return; }
    e.setProp('lantern', 0);
    e.setFlag('lit:lantern', false);
    e.print('The lantern goes out, and stops spending.');
  }

  function doWave(e, what) {
    if (what !== 'branch' || !e.carrying('branch')) {
      e.print('You wave it about. Nothing is impressed.'); return;
    }
    if (e.state.room !== 'mergeChasm') {
      e.print('You wave the branch. It\'s a good branch and this is the wrong place for it.');
      return;
    }
    if (e.prop('bridge')) { e.print('The bridge is already across.'); return; }
    e.setProp('bridge', 1);
    e.print('The branch goes stiff in your hand, and a bridge of crystal fast-forwards ' +
      'itself across the chasm one commit at a time until it reaches the far side and holds.');
  }

  function doShow(e, what, whom) {
    const t = (whom || '').toLowerCase();
    /* the tent: the whole game comes to this one produced document */
    if (what === 'decisionRecord' && e.state.room === 'signingTent') return showRecord(e);
    if (what === 'assayReport' && e.state.room === 'newProgramOffice') {
      e.print('He reads it, and is genuinely sorry, and observes that costs like that are ' +
        'exactly why one wants a proven foundation. Paper isn\'t troubled by paper.');
      return;
    }
    if (what === 'certificate' && e.state.room === 'firewallGate') {
      e.setProp('certificate', 1);
      e.moveItem('certificate', 'nowhere');
      e.print('The gate inspects your certificate at length, finds that you\'ve signed ' +
        'it yourself, and admits you anyway with a warning that appears in the air and ' +
        'stays there: YOUR CONNECTION IS NOT PRIVATE. It keeps the certificate. The port ' +
        'stays open behind you for the rest of the session.');
      return;
    }
    if (what === 'tablet' && e.state.room === 'modelForge') {
      if (e.flag('golemSatisfied')) { e.print('The golem has already stood aside.'); return; }
      e.setFlag('golemSatisfied');
      e.item('orb').hidden = false;
      e.print('It reads the tablet. It reads the test on the back. It steps aside with ' +
        'the enormous relief of a thing that has finally been given a reason.\n' +
        'The SysML Orb may be taken.');
      return;
    }
    if (NPCS && NPCS.show && NPCS.show(e, what, t)) return;
    if (e.state.room === 'boardroom' && KEYSTONES.includes(what)) return duelAnswer(e, what);
    e.print('You hold it up. Nothing here\'s interested.');
  }

  function giveCoffee(e) {
    if (!e.prop('thermos')) {
      e.print('The thermos is empty. There\'s an urn one room south.'); return;
    }
    if (e.flag('userHelped')) { e.print('They\'ve their coffee. Let them drink it.'); return; }
    e.setFlag('userHelped');
    e.setProp('thermos', 0);
    e.moveItem('thermos', 'nowhere');            // they keep it; it has no second use
    e.item('console').hidden = false;
    e.print('They take the coffee, hold it, and then say the first thing they\'ve said ' +
      'all day that wasn\'t a prompt: "I don\'t need it to agree with me. I need it to ' +
      'show me what it did."\nThe mirror-glass goes clear, and clear is a different ' +
      'instrument entirely. The Lucid Console may be taken.');
  }

  function feedBot(e) {
    if (e.prop('bot') > 0) { e.print('It has eaten. It\'s fond of you already.'); return; }
    e.setProp('bot', 1);
    e.moveItem('rations', 'nowhere');
    e.print('It eats, and then it looks at you the way a build looks at you when it has ' +
      'gone green for the first time in a week.');
  }

  function unchainBot(e, tool) {
    if (!e.here('bot')) { e.print('There\'s no chain here.'); return; }
    if (e.prop('bot') === 2) { e.print('It\'s already loose, and already following you.'); return; }
    if (tool !== 'token' || !e.carrying('token')) {
      e.print('The runner lock wants an API token, and won\'t be reasoned with.'); return;
    }
    e.setProp('bot', 2);
    e.print('The API token opens the runner. The bot gets up and follows you and will ' +
      'follow you anywhere, which is a thing you should think about before you take it ' +
      'over a bridge.');
  }

  function releaseBird(e) {
    if (!e.carrying('cage') || !e.prop('cage')) {
      e.print('You\'ve nothing caged.'); return;
    }
    if (e.state.room === 'hallucinationGallery') {
      e.setProp('cage', 0);
      e.print('It flies straight at the Confabulator to argue. There\'s a silence, and a ' +
        'single grey feather comes down, and it\'s not one you can use.');
      return;
    }
    if (e.state.room === 'legacyPit') {
      e.setProp('cage', 0);
      e.setProp('serpent', 1);
      e.moveItem('feather', 'legacyPit');
      e.print('The Contrarian steps out, looks the serpent over, and begins, patiently ' +
        'and in public, to disagree with it. The serpent holds for one turn. Then it ' +
        'goes. The copilot follows it out to keep arguing, and leaves behind, turning ' +
        'over as it comes down, one grey feather.');
      return;
    }
    e.setProp('cage', 0);
    e.print('You open the cage. It leaves, without comment, and without disagreeing with ' +
      'anything, which is a waste of a perfectly good no.');
  }

  /* ---- the balloon ---- */
  function stow(e, what) {
    if (e.state.room !== 'balloonMeadow') { e.print('There\'s no basket here.'); return; }
    e.moveItem(what, 'basket');
    e.print('Stowed. Cargo rides up free.');
  }

  function boardBalloon(e) {
    if (e.flag('aboard')) { e.print('You\'re already in the basket.'); return; }
    const load = e.inventory().length + e.itemsAt('basket').length;
    if (load > 9) {
      e.print('The basket settles onto its skids. You\'re going to have to want less.');
      return;
    }
    e.setFlag('aboard');
    e.print('You climb into the basket. It shifts under you and settles again, unimpressed.');
  }

  function launchBalloon(e) {
    if (!e.flag('aboard')) { e.print('The balloon goes up without you, which helps nobody.'); return; }
    if (!e.flag('valve')) { e.print('The burner is dry. The fuel valve is still bolted shut.'); return; }
    if (!e.flag('burner')) { e.print('The envelope is soft and the basket isn\'t going anywhere.'); return; }
    if (e.here('debt')) {
      e.print('The envelope is full, the burner is roaring, and the basket hasn\'t moved. ' +
        'Something aboard is heavier than the lift.');
      return;
    }
    if (e.carrying('debt')) {
      e.print('The balloon rises three feet, reaches the end of the tether, and hangs ' +
        'there like a question nobody has budgeted for.');
      return;
    }
    e.setFlag('launched');
    e.addScore(25);
    for (const id of e.itemsAt('basket')) e.moveItem(id, 'ingressDeck');
    /* The document pouch is bolted to the basket, so it goes up whether or not
       you thought to empty it. */
    if (e.state.itemLocations.certificate === 'balloonMeadow') e.moveItem('certificate', 'ingressDeck');
    e.print(TEXT.launch);
    e.teleport('ingressDeck');
  }

  /* ---- the vault ---- */
  function vaultIt(e, what, where) {
    if (e.state.room !== VAULT) { e.print('There\'s no socket here, and no shelf either.'); return; }
    const it = e.item(what);
    if (!it.keystone && !it.lesser) {
      e.print('The vault is for things that can be traced. That\'s not one of them.');
      return;
    }
    if (it.keystone && /niche/.test(where)) {
      e.print('That\'s a keystone artifact. It goes in a socket, in the ring.'); return;
    }
    if (it.lesser && /socket/.test(where)) {
      e.print('The sockets are cut for the seven. That one goes in a niche.'); return;
    }
    e.moveItem(what, VAULT);
    e.state.flags.vaulted[what] = true;
    const n = Object.keys(e.state.flags.vaulted).length;
    if (it.keystone) {
      const lit = KEYSTONES.filter(k => e.state.flags.vaulted[k]).length;
      e.print('The socket takes it and lights. ' + lit + ' of seven.');
    } else {
      e.print('The niche takes it. The foam closes round it like it was cut for it.');
    }
    if (n + lostCount(e) >= TREASURES.length) freeze(e);
  }

  /* ---------------------------------------------------------------- loss
   * A release is cut on what it has. If a treasure can no longer reach the
   * vault — shattered, or sealed behind a bridge that is in a chasm — it is
   * written off out loud, and the baseline freezes on the survivors. Losing
   * one costs you its points; it does not cost you the game.
   */
  function lostCount(e) { return Object.keys(e.state.flags.lost || {}).length; }

  function loseTreasure(e, id, why) {
    const f = e.state.flags;
    f.lost = f.lost || {};
    if (f.lost[id] || f.vaulted[id]) return;
    f.lost[id] = true;
    const left = TREASURES.length - Object.keys(f.vaulted).length - lostCount(e);
    e.print('*** ' + items[id].name.replace(/^(a|an|the) /, 'The ') + ' won\'t reach the ' +
      'vault. ' + why + '\n' +
      'The baseline will freeze on what survives: ' + Object.keys(f.vaulted).length +
      ' banked, ' + lostCount(e) + ' written off, ' + left + ' still out there. ***');
    checkFreezeNow(e);
  }

  /* A write-off can be the thing that completes the set. */
  function checkFreezeNow(e) {
    if (e.flag('frozen')) return;
    const f = e.state.flags;
    if (Object.keys(f.vaulted).length + lostCount(e) >= TREASURES.length) freeze(e);
  }

  function freeze(e) {
    e.setFlag('frozen');
    e.addScore(25);
    e.print(TEXT.freeze);
    /* What is in your hands at the freeze is what you take with you, and two
       of those things decide whether Act V is a case or a long walk. */
    e.state.flags.hadKit = e.carrying('assayKit') || e.carrying('sparekit');
    e.state.flags.hadCap = e.carrying('cap') || e.state.flags.bought.cap;
    for (const id of e.inventory()) {
      if (isTreasure(id)) e.moveItem(id, VAULT);
    }
    e.moveItem('thread', 'inventory');
    e.moveItem('charge', 'rcAtrium');
    e.moveItem('detonator', 'rcAtrium');
    e.state.flags.bugHere = null;
    e.teleport('rcAtrium');
    e.print('On the floor beside you, where somebody left it for somebody, are a ' +
      'Deprecation Charge and a detonator. The charge is old ordnance, well kept, and ' +
      'entirely inert: the cap well is empty.');
  }

  /* ==================================================================
   * THE EXPANSION — the seven words, the panel, and Act V.
   * ================================================================== */

  /* One word per hall, on a plate in the room furthest in. Reading it is
     worth 2 and puts the room on the transport network for good. */
  function learnWord(e, word) {
    const f = e.state.flags;
    f.words = f.words || {};
    if (f.words[word]) {
      e.print('The plate still reads ' + word.toUpperCase() + '. You\'ve it.');
      return;
    }
    f.words[word] = true;
    e.addScore(2);
    const n = Object.keys(f.words).length;
    e.print('The plate reads, in one word: ' + word.toUpperCase() + '.\n\n' +
      'You say it, to see. The room doesn\'t change and you don\'t move, and you understand ' +
      'that this is because you\'re already here. (+2)\n\n' +
      '(' + n + ' of 7 words. Say one anywhere on the platform to be in its room, and again ' +
      'to come back.)');
  }

  /* The hidden panel behind the one real persona: hall 1 <-> hall 2. */
  function openPanel(e) {
    if (e.state.room !== 'personaGallery') {
      e.print('There\'s nothing behind that but wall.'); return;
    }
    if (e.prop('panel')) { e.print('The panel is open. It always was, structurally.'); return; }
    e.setProp('panel', 1);
    e.print('Behind the one with the coffee ring — the one that\'s a photograph of somebody ' +
      'real — there\'s a service void, and at the back of the void a panel that gives when ' +
      'you push it.\n\n' +
      'It comes out among filing cabinets. The users and the requirements were always the ' +
      'same room. Somebody put a wall in.');
  }

  /* The Records Office. Two of the three fields are yours to fill. */
  function writeRecord(e) {
    if (e.state.room !== 'recordsOffice') {
      e.print('Anything you write anywhere else is an opinion. This is a place where things ' +
        'become true by being lodged.'); return;
    }
    const f = e.state.flags;
    if (f.recordWritten) { e.print('It\'s written. It wants a name in the third field.'); return; }
    const missing = [];
    if (!e.carrying('assayReport')) missing.push('what the last foundation cost');
    if (!e.carrying('bom')) missing.push('what it was made of and who owned it');
    if (!f.askedEngineer) missing.push('what this programme actually has to do, in their words');
    if (missing.length) {
      e.print('The clerk turns the form round. You can\'t fill it in. You\'re missing:\n' +
        missing.map(m => '  · ' + m).join('\n') +
        '\n\n"We can only lodge what you can evidence," they say, not unkindly. "That\'s ' +
        'rather the point of us."');
      return;
    }
    f.recordWritten = true;
    e.addScore(25);
    e.moveItem('decisionRecord', 'inventory');
    e.print(TEXT.record);
  }

  /* The fall. The blast is no longer the ending; it is the door into Act V. */
  function theGround(e) {
    const f = e.state.flags;
    f.actV = true;
    e.setFlag('actV');
    e.addScore(20);
    /* the thirteen lesser treasures come down with the platform, into the wreck */
    for (const id of LESSER) if (e.state.itemLocations[id] === VAULT) e.moveItem(id, 'nowhere');
    /* what is in your hands comes down in your hands: the thread, the kit, and
       whatever you chipped off the thing you were standing on */
    const KEEP = ['thread', 'assayKit', 'sparekit', 'fragment'];
    for (const id of e.inventory()) if (!KEEP.includes(id)) e.moveItem(id, 'nowhere');
    if (!e.carrying('assayKit')) e.moveItem('assayKit', 'nowhere');
    /* the monolith came down too. If you never chipped it, there is more of it
       in the bracken than anybody could carry. */
    if (e.state.itemLocations.fragment !== 'inventory') e.moveItem('fragment', 'wreckOfTheHalls');
    e.state.props.signed = 0;
    e.teleport('balloonMeadow');
    e.print(TEXT.ground);
    if (!f.hadKit) {
      e.print('\n(You\'re not carrying the field assay kit. It went into the wall with ' +
        'everything else, and there\'s no wall any more.)');
    }
  }

  /* The visitors' book. You have no standing here; signing in is the first
     honest thing you do on the ground, and it is what lets the tent take you
     seriously later. */
  function signBook(e) {
    const f = e.state.flags;
    if (f.signedIn) { e.print('You\'re in the book. Time out is still blank.'); return; }
    f.signedIn = true;
    e.addScore(5);
    e.print('Name. Organisation — you think about that one for a while, and write NONE, ' +
      'which is true. Purpose: you write HANDOVER, which is either the truth or the most ' +
      'ambitious thing anybody has written in this book.\n\n' +
      'It takes nine seconds and it\'s the reason anybody in the tent will listen to you ' +
      'later. Standing isn\'t a feeling. It\'s a line in a book. (+5)');
  }

  /* The weighbridge. The whole platform, by the tonne, for real money the
     follow-on could use — and the evidence goes with it. */
  function sellWreck(e) {
    const f = e.state.flags;
    if (f.soldWreck) { e.print('It\'s gone. He was very quick about it.'); return; }
    const holding = RECORDS.filter(r => e.carrying(r));
    if (holding.length) {
      e.print('He looks at what you\'re carrying. "Those an\'ll go in the weight," he says, ' +
        'not unkindly. "It\'s all tonnes to me."\n\n' +
        'You\'d be selling the evidence with the scrap. Put the records somewhere else ' +
        'first if you mean to do this.');
      return;
    }
    f.soldWreck = true;
    e.addScore(10);
    e.print('You take the number. The platform goes on lorries over the next fortnight and ' +
      'the money goes to a programme that has a deadline and no foundation, which is the ' +
      'most useful thing four thousand feet of anything has done in eleven years.\n\n' +
      '"Anything in it worth keeping?" he asks, halfway through the paperwork.\n\n' +
      '"It\'s all on paper now," you say, and find that you mean it. (+10)');
  }

  /* The Reading Room. A record that nobody reads back is just paper. */
  function readBack(e) {
    const f = e.state.flags;
    if (!f.signed) {
      e.print('There\'s nothing of yours in these boxes. A record is lodged at the counter ' +
        'next door, and it\'s not lodged until somebody has signed it.');
      return;
    }
    if (f.readBack) { e.print('It has been read. That\'s the whole of the older faith.'); return; }
    f.readBack = true;
    e.addScore(10);
    e.print('You take your own record out of the box it has been in for nine minutes, and ' +
      'sit down at the long table under the lamp, and read it back.\n\n' +
      'It\'s short. It says what was decided, and why, and who\'s going to live with it, ' +
      'and the name in the third field isn\'t yours. There\'s nothing clever in it anywhere.\n\n' +
      'Somewhere four thousand feet up and eleven years ago there was a priest of the older ' +
      'faith who said that the radical part wasn\'t the writing down. It was this. (+10)');
  }

  /* The County Road. You can simply go. It is a real ending and it is not
     contemptible, which is what makes it a temptation. */
  function boardBus(e) {
    const f = e.state.flags;
    if (f.signed) {
      e.print('The bus comes at ten past six and you\'re not going to be on it. There\'s a ' +
        'road east and it goes past a tent with your name nowhere on it and a record in it ' +
        'with somebody else\'s.');
      return;
    }
    if (!f.busWarned) {
      f.busWarned = true;
      e.print('The bus comes at ten past six.\n\nYou could be on it with the thread still ' +
        'behind your sternum and four thousand feet of open format lying in a wood behind ' +
        'you, and in four years a programme you never met will be bolted to a foundation ' +
        'somebody licensed cheap on a Friday.\n\nNobody would blame you. Say BOARD BUS ' +
        'again if that\'s the ending you\'re having.');
      return;
    }
    e.print('You get on the bus.\n\nIt is warm, and nearly empty, and it goes past the end ' +
      'of the fire road at twenty past, and there\'s a light on in the portacabin, and ' +
      'somebody is standing in the doorway of a smaller hut with a mug, looking at the ' +
      'trees.\n\nYou did the work. You did all of the work. You simply didn\'t hand it to ' +
      'anybody, and a thing that\'s not handed over is a thing that didn\'t happen.\n\n' +
      '*** An ending. The one that gets taken most often. ***');
    e.state.won = true;
  }

  /* The Signing Tent. Three ways this goes and only one of them is the work. */
  function showRecord(e) {
    const f = e.state.flags;
    if (!f.recordWritten || !e.carrying('decisionRecord')) {
      e.print('You\'ve nothing to show. The Clerk waits, pleasantly, for as long as you ' +
        'like; it\'s Tuesday, and he signs on Friday.');
      return;
    }
    if (!f.askedEngineer) {
      e.print('The Clerk reads it, is genuinely sorry about the figure, and points out that ' +
        'costs like that are exactly why one wants a proven foundation.\n\n' +
        'Nobody comes to the entrance of the tent. You didn\'t ask anybody to.');
      return;
    }
    f.signed = true;
    e.setProp('signed', 1);
    e.addScore(45);
    e.print(TEXT.signature);
  }

  /* ---- GOAL ----
   * The plot restated in plain language wherever you are standing, with the
   * seven halls ticked off. Nothing here is a spoiler: it is the same four
   * steps the opening screen gives, plus what you have already done.
   */
  function doGoal(e) {
    const f = e.state.flags;
    const mark = h => f.vaulted[h.artifact] ? 'V' : (f.found[h.artifact] ? 'F' : ' ');
    /* Kept inside 45 columns: the console is that narrow at its smallest. */
    const lines = HALLS.map(h =>
      '  ' + h.n + ' [' + mark(h) + '] ' + h.artifactName +
      (f.placardsRead && f.placardsRead[h.n] ? ' · ' + h.answer : ''));
    const vaulted = KEYSTONES.filter(k => f.vaulted[k]).length;
    e.print('YOUR JOB, IN FOUR STEPS\n' +
      '  1. Get the balloon onto the platform.\n' +
      '  2. Find the seven keystone artifacts,\n' +
      '     one in each of the seven halls.\n' +
      '  3. Put each one in its socket in the\n' +
      '     Digital Thread Vault.\n' +
      '  4. Answer Dassault\'s seven faces with\n' +
      '     those same seven artifacts.\n' +
      '\n' +
      'THE SEVEN HALLS\n' +
      lines.join('\n') + '\n' +
      '  [ ] not found · [F] found · [V] vaulted\n' +
      '  A word after the name is its placard,\n' +
      '  and its answer in the boardroom.\n' +
      '\n' +
      vaulted + ' of 7 sockets lit. READ PLACARD in each\n' +
      'hall for the word that beats its face.');
  }

  /* ---- HINT, room by room ----
   * The prose is allowed to be oblique; HINT is not. Each entry answers one
   * question — "what should I be doing in this room?" — for the state you are
   * actually in, and goes quiet once the room is finished with. Nothing here
   * gives away a treasure the player has not reached; it names the verb.
   */
  const at = (e, id, room) => e.state.itemLocations[id] === room;
  const HINTS = {
    /* ---------------------------------------------- the expansion: hall 1 */
    onboardingFunnel: () =>
      'The tour won\'t end and there\'s no step 4. SKIP is the only way through it; ' +
      'anything else puts you back at the beginning, brightly.',
    sessionArchive: e => e.flag('storm:muted')
      ? (at(e, 'transcript', 'sessionArchive')
          ? 'It\'s quiet enough to hear one reel now. TAKE TRANSCRIPT.'
          : 'You\'ve the First Transcript. The Gallery of Personas is west.')
      : 'Fourteen thousand conversations at once. You\'ll not hear anything in here until ' +
        'the hall is quiet, and the Help Desk has a sign nobody has ever needed.',
    personaGallery: e => e.prop('panel')
      ? 'The panel is open: north-west is the Card Index, in Requirements.'
      : 'READ PLATE for the word. Then: one of these cut-outs has a coffee ring on the base, ' +
        'which means somebody real once stood there. LOOK BEHIND it.',
    notificationStorm: () =>
      'Every alert ever raised, still arriving, and it costs you a token a turn. The DO NOT ' +
      'DISTURB placard from the Help Desk will MUTE it for fifty turns.',
    helpDesk: e => e.state.flags.met.intern
      ? 'You\'ve the placard. It silences the Notification Storm.'
      : 'There\'s somebody behind that counter who has read everything and been asked ' +
        'nothing. ASK INTERN ABOUT THE PLATFORM.',
    accessibilityWing: () =>
      'This room is legible without a lantern, which no other room down here\'s. TAKE ' +
      'EDITION: the Plain Language Edition makes the Ambiguity Swamp plain.',

    /* ---------------------------------------------- hall 2 */
    elicitationBooth: e => e.state.flags.gotNeed
      ? 'You\'ve the Validated Need. It doesn\'t survive the freeze; the lesson does.'
      : 'Two chairs and a question. SIT, and then WAIT three turns without saying anything. ' +
        'That\'s the whole of elicitation and always was.',
    assayOffice: e => at(e, 'assayKit', 'assayOffice')
      ? 'TAKE KIT. The field assay kit must be in your hands when the baseline freezes, or ' +
        'the last act has no evidence in it.'
      : 'You\'ve the kit. Don\'t put it down and forget it.',
    ossuary: () =>
      'READ PLATE for the word. ASK CLERK ABOUT THE CUT — everything on these racks was ' +
      'fine, which isn\'t what it was cut for.',
    matrixRoom: e => at(e, 'spool', 'nowhere')
      ? 'The grid is walkable. There\'s exactly one path where every cell traces up to a ' +
        'need and down onto a test: WALK THE MATRIX. The reel is at the far corner.'
      : 'You\'ve the Spool. South-east is the panel back into the Gallery of Personas.',

    /* ---------------------------------------------- hall 3 */
    metamodelStair: () => 'UP. Four landings, and at the top the model describes itself.',
    metamodelLoft: e => at(e, 'metaobject', 'metamodelLoft')
      ? 'TAKE METAOBJECT, and READ PLATE for the word.'
      : 'You\'ve it. DOWN, and east to the vault.',
    slagPit: () =>
      'Everything the forge got wrong. Nothing here\'s takeable and nothing here\'s a ' +
      'mistake you\'ve not already made. North-west is the forge.',
    tagCellar: () =>
      'Two bottles are both v2.0 and neither will say which came first. Nothing to take. ' +
      'South is the crypt and the Golden Commit.',

    /* ---------------------------------------------- hall 4 */
    contextWindow: () =>
      'The capacity is four and it\'s not advice. Come through here holding more than four ' +
      'things and it puts the oldest ones down outside the door — including, if you\'re ' +
      'careless, your lantern. Go through light.',
    rateLimiter: e => e.carrying('token')
      ? 'The API token in your hand gets you waved straight through.'
      : 'The turnstile grumbles at every move, but it has never once held anybody. ' +
        'Carry the API token from the Version Crypt and it doesn\'t even grumble.',
    agentYard: () =>
      'South-west is the Fine-Tuning Cellar and it\'s dark. North-east is the Prompt Garden.',
    fineTuningCellar: e => at(e, 'refusal', 'fineTuningCellar')
      ? 'TAKE REFUSAL — the first time a helper ever said no, filed as a fault. And READ ' +
        'PLATE for the word.'
      : 'You\'ve it. North-east, and light your lantern before you came in here.',
    promptCompost: () =>
      'Warm, and nothing in it\'s takeable. Something is growing out of the top that nobody ' +
      'planted, which is the most honest thing in this hall.',
    citationWell: () =>
      'ALL CLAIMS DRAWN HERE, and the bucket has never been wet. Nothing to take. It\'s a ' +
      'joke about your sources and it\'s at your expense.',

    /* ---------------------------------------------- hall 5 */
    sortieBoard: () => 'READ PLATE for the word. The column headed WHAT FOR is empty and ruled twice.',
    weatherDeck: () => 'Outside, on the platform\'s own weather. Nothing here but the view and the point.',
    debriefRoom: () => 'South is the Rehearsal Hangar. The flip chart is full and nothing downstream of it changed.',
    rehearsalHangar: e => at(e, 'reel', 'rehearsalHangar')
      ? 'TAKE REEL. The mission, flown before anything was built, to an empty floor, for eleven years.'
      : 'You\'ve the Reel. North, and out through the War Room.',
    sensorLine: () => 'ASK OFFICER ABOUT THE INSTRUMENTS. The right question is which one is wrong.',
    contingencyCloset: () => 'A binder for everything that didn\'t happen. Nothing here to take.',

    /* ---------------------------------------------- hall 6 */
    acceptanceFloor: e => at(e, 'loop', 'acceptanceFloor')
      ? 'TAKE LOOP, READ PLATE for the word, and ASK VERIFIER ABOUT THE RECTANGLE.'
      : 'You\'ve the Closed Loop. West is the Integration Bay.',
    contractShelf: () => 'Published interfaces, stamped and stable. South is the ledge and the Sealed Blob.',

    /* ---------------------------------------------- hall 7 */
    continentalFloor: () =>
      'A continent underfoot. Look at it long enough and you can find the forest you came ' +
      'up from, which is where all of this ends.',
    magnitudeStair: () => 'READ PLATE for the word. Each step is ten of the last.',
    longNowRoom: () => 'A clock that ticks once a year. It\'s the only realistic schedule on this platform.',
    ballastYard: () => 'The mass you add to make a thing behave at the size you decided it\'s. Mostly process.',
    supplyChain: e => at(e, 'bom', 'supplyChain')
      ? 'TAKE BOM — the Bill of Materials, bolted to the frame at the outfeed. And ASK ' +
        'SURVEYOR ABOUT THE BENCHMARK.'
      : 'You\'ve the Bill of Materials. It\'s half the evidence you need on the ground.',
    deorbitGantry: () =>
      'A rail, a release lever and a procedure nobody has followed. JUMP goes over the ' +
      'rail with the deprecated things, four floors down into the Notification Storm.',

    /* ---------------------------------------------- act V */
    scatterField: () => 'The platform is in the trees. South-east is where the halls came down.',
    wreckOfTheHalls: e => Object.keys(e.state.flags.salvaged || {}).length >= 7
      ? 'You\'ve all seven records. They\'re evidence now, not treasure.'
      : 'SALVAGE. Seven of the things you banked are worth carrying to a table: the ' +
        'transcript, the spool, the metaobject, the refusal, the reel, the loop and the ' +
        'bill of materials.',
    newProgramOffice: () =>
      'The Clerk signs on Friday whatever you do; he can\'t be beaten and doesn\'t need to ' +
      'be. The person who matters is in the cold hut to the south-west.',
    siteHut: e => e.state.flags.askedEngineer
      ? 'They\'ve said what they need. Get it written down at the Records Office.'
      : (e.flag('kettle')
          ? 'ASK ENGINEER WHAT THEY NEED. Ask — don\'t tell them what you\'ve.'
          : 'Nobody has been in here today and the kettle isn\'t plugged in. PLUG IN KETTLE.'),
    recordsOffice: () =>
      'WRITE THE RECORD. It needs three things: the Assay from the benchmark, the Bill of ' +
      'Materials off the supply chain, and what this programme actually has to do — which ' +
      'only the engineer in the site hut can give you.',
    signingTent: e => e.state.flags.recordWritten
      ? 'SHOW RECORD. And don\'t pick up the pen yourself: the signature that counts is the ' +
        'one belonging to somebody who will still be here in four years.'
      : 'You\'ve nothing on that table yet. The Records Office is south-east of the office.',
    theRoadAtDawn: () => 'It\'s done. Walk on.',
    surveyorsStake: e => e.flag('assayed')
      ? 'You\'ve the Assay. The fire road runs south from the forest, west of the road.'
      : 'A brass benchmark, surveyed before any of this, and the only flat true thing in ' +
        'the forest. ASSAY FRAGMENT WITH KIT.',
    antennaFarm: e => e.flag('published')
      ? 'It\'s out. A standard can\'t be un-published, which is the point of one.'
      : (e.state.flags.actV
          ? 'Every dish here has been listening to a platform that never explained itself. ' +
            'PUBLISH THE FORMAT — with the Metaobject in hand, or you\'re just another ' +
            'confident broadcast.'
          : 'Dishes, all pointed at the same patch of cloud, all still receiving.'),
    programBoneyard: () => 'Five programmes parked in the order they were cancelled. There\'s room for a sixth.',
    culvertMouth: e => e.state.flags.actV
      ? 'Two long and one short. ANSWER him one more time.'
      : 'The creek comes out here under pressure. Whatever is upstream of here\'s upstream of everything.',
    endOfRoad: () =>
      'The shed is east and has your kit in it. One more thing is down in the creek, ' +
      'south. You can carry seven things at a time, so think about what goes back down.',
    insideShed: e =>
      ['lantern', 'keys', 'knife', 'duck', 'thermos', 'rations'].some(i => at(e, i, 'insideShed'))
        ? 'TAKE the lantern, keys, knife, duck, thermos and rations. All six matter later, ' +
          'and the lantern only burns while it\'s lit.'
        : 'The shed is stripped. The hex key is in the creek bed, south of the road.',
    gully: () => 'DOWNSTREAM, to the creek bed.',
    creekBed: e => at(e, 'hexKey', 'creekBed')
      ? 'TAKE HEX KEY. It opens the balloon\'s fuel valve and nothing else in the game.'
      : 'Nothing left here. DOWNSTREAM is the sinkhole; the hatch there only opens from below.',
    theTrunk: e => at(e, 'branch', 'nowhere')
      ? 'CUT BRANCH, with the knife. A branch off this trunk is what gets you over the ' +
        'merge chasm later.'
      : 'You\'ve your branch. The meadow is east.',
    balloonMeadow: e => {
      if (!e.flag('valve')) return 'OPEN VALVE WITH HEX KEY. Until the fuel valve is open ' +
        'the burner is dry.';
      if (!e.flag('aboard')) return 'PUT anything you\'ll not need in the forest IN BASKET — ' +
        'cargo rides up free and doesn\'t count against your seven. TAKE CERTIFICATE out of ' +
        'the document pouch; it\'s the only thing that gets you through the firewall. Then ' +
        'BOARD BALLOON.';
      if (!e.flag('burner')) return 'LIGHT BURNER.';
      if (e.here('debt') || e.carrying('debt')) return 'DROP DEBT. The sandbags stencilled ' +
        'TECHNICAL DEBT are the only thing holding this basket down, and nothing else you ' +
        'do will lift it.';
      return 'LAUNCH.';
    },
    firewallGate: e => e.prop('certificate')
      ? 'The port is open behind you for the rest of the session. West is the Atrium.'
      : 'SHOW CERTIFICATE. It\'s self-signed and the gate takes it anyway.',
    atrium: () =>
      'READ PLATE for the seven bearings, and READ PLACARD in each hall when you get there. ' +
      'This rotunda is the place to leave everything you\'re not carrying — you can only ' +
      'hold seven things, and you\'ll be back through here constantly.',
    companyStore: () =>
      'BUY CAP, 30 story points. The Deprecation Charge in the endgame is inert without ' +
      'the blasting cap, there\'s no store after the baseline freezes, and missing it ' +
      'costs you the ending.',
    versionCrypt: () =>
      'TAKE COMMIT and TAKE TOKEN. The Golden Commit pays a troll and undoes a mini-boss, ' +
      'and REFLOG always brings it back here. The API token unchains the CI bot.',

    clientConcourse: e => e.prop('thermos')
      ? 'The thermos is full. North, to the Chat Parlor.'
      : 'FILL THERMOS at the espresso urn. Somebody north of here hasn\'t had a coffee ' +
        'all day.',
    chatParlor: e => {
      if (!e.flag('userHelped')) return 'GIVE THERMOS TO USER. They\'ve been talking to a ' +
        'mirror all day; coffee gets you the one thing a mirror can\'t give them, which is ' +
        'a straight statement of what they actually need.';
      return at(e, 'console', 'chatParlor') ? 'TAKE CONSOLE.' : 'Done here.';
    },
    uncannyValley: () =>
      'TAKE MAT — the anti-static mat is the only safe place to set the Glass Prototype ' +
      'down. Do NOT FOLLOW AVATAR. It\'s not a puzzle.',
    requirementsHall: () => 'READ PLACARD. The quarry is north.',
    shallQuarry: e => {
      if (!e.flag('tabletFound')) return 'LIGHT LANTERN, then SHINE LANTERN ON SLABS. Almost ' +
        'every slab in this face is sand; in token-light exactly one of them answers.';
      return at(e, 'tablet', 'shallQuarry') ? 'TAKE TABLET.' : 'Done here.';
    },
    modelForge: e => {
      if (!e.flag('golemSatisfied')) return 'SHOW TABLET TO GOLEM. It\'ll not release the ' +
        'orb to anybody who can\'t say what need the model satisfies — and that\'s exactly ' +
        'what\'s written on the tablet, with the test on the back.';
      return at(e, 'orb', 'modelForge') ? 'TAKE ORB.' : 'Done here. The vault is west.';
    },
    metamodelVault: () =>
      'PUT <artifact> IN SOCKET for each of the seven keystones, and PUT <treasure> IN NICHE ' +
      'for the thirteen lesser ones. Depositing is worth far more than finding.',
    mergeChasm: () =>
      'WAVE BRANCH. A branch cut from the Great Trunk fast-forwards a bridge across one ' +
      'commit at a time. Crossing without waving is a merge conflict, and the conflict is ' +
      'in you.',
    promptGarden: e => {
      const bits = [];
      if (at(e, 'cage', 'promptGarden')) bits.push('TAKE CAGE — you need it to hold a copilot.');
      const grown = e.state.flags.vineGrowth || 0;
      if (grown < 2) bits.push('POUR TOKENS ON VINE, twice, and the vine climbs the light ' +
        'shaft to the Macro Gantry. Optional, but it joins the two halls furthest apart.');
      return bits.length ? bits.join(' ') : 'Nothing left here.';
    },
    copilotRoost: e => {
      if (e.prop('cage')) return 'You\'ve the Contrarian. Don\'t open the cage until you ' +
        'are standing in front of something that needs disagreeing with.';
      if (!e.carrying('cage')) return 'You need the context cage first — it\'s in the Prompt ' +
        'Garden, south. Without somewhere to keep the context, the bird is gone the moment ' +
        'you\'ve it.';
      if (e.carrying('branch')) return 'DROP BRANCH first. The grey one won\'t come near ' +
        'cut wood. Then CATCH CONTRARIAN.';
      return 'CATCH CONTRARIAN. It\'s the one on the back beam that\'s saying nothing.';
    },
    hallucinationGallery: () =>
      'Worth seeing, and nothing here\'s required. Do NOT open the cage in this room: the ' +
      'Confabulator has never once said I don\'t know, and the argument is short.',
    missionDeck: () =>
      'READ CHARTER. It\'s one sentence long, and it\'s the answer to the room next door.',
    warRoom: e => {
      if (!e.flag('fogGone')) return 'Say the charter out loud: FLY THE MISSION. This is a ' +
        'room built for saying things out loud, and the fog over the table has a budget line ' +
        'until somebody does.';
      return at(e, 'compass', 'warRoom') ? 'TAKE COMPASS.' : 'The dome is open. Done here.';
    },
    groundTruthRange: () =>
      'TAKE STONE. The plain grey stone isn\'t a treasure and scores nothing; carry it and ' +
      'the shrine can\'t lie to you.',
    vFoundry: () =>
      'TAKE LEFT ARM and TAKE RIGHT ARM and carry both east to the Integration Bay. They\'re ' +
      'heavy, so you\'ll be carrying very little else.',
    pullRequestBridge: e => {
      if (e.flag('bridgeDown')) return 'The bridge is down. Whatever was on the far side ' +
        'stays there.';
      if (!e.flag('trollGone')) return 'The Reviewer Troll merges nothing without an ' +
        'approving review. Bring the CI bot here from the Sandbox and its small green check ' +
        'settles it. (Paying him the Golden Commit works too — REFLOG fetches it back.)';
      return 'DROP the bot on this side before you cross. Crossing with it collapses the ' +
        'bridge and locks the Golden V and the Pearl away for good.';
    },
    integrationBay: e => e.here('leftArm') && e.here('rightArm')
      ? 'WELD ARMS. Decomposition down one side, verification up the other.'
      : 'Both arms of the V have to be in this bay. Neither half is worth anything alone, ' +
        'which is rather the point of it.',
    macroGantry: () => 'READ PLACARD. The scaffold is north.',
    titanScaffold: e => {
      if (e.carrying('rule')) return 'Do NOT PULL LEVER again while you\'re holding the ' +
        'rule. It scales what\'s on the pad, and you\'re standing on the pad.';
      return at(e, 'rule', 'nowhere')
        ? 'PULL LEVER. Forty feet of slide rule comes down through the orders of magnitude ' +
          'and ends up eight inches long and still accurate.'
        : 'TAKE RULE, and keep it: it\'s the leverage that opens the Sealed Blob.';
    },
    orbitalRing: () =>
      'TAKE PROTOTYPE. The Glass Prototype survives being set down only on the mat, in the ' +
      'foam satchel, or in a vault niche — so carry it straight to the vault.',
    interfaceLedge: e => e.prop('blob')
      ? (at(e, 'pearl', 'interfaceLedge') ? 'TAKE PEARL.' : 'Done here.')
      : 'PRY BLOB WITH RULE. It has no seams and no documentation, and undocumented things ' +
        'open the way they always open: with leverage from a larger scale.',

    tokenFountain: e => e.prop('flask')
      ? 'The flask is full. Two flasks poured on the vine in the Prompt Garden open a climb.'
      : 'TAKE FLASK and FILL FLASK. FILL LANTERN also works here, if you can pay for it.',
    sandbox: e => {
      if (e.prop('bot') === 0) return 'GIVE RATIONS TO BOT. It\'s hungry, it weighs as much ' +
        'as a car, and it\'s how you get past the Reviewer Troll.';
      if (e.prop('bot') === 1) return 'UNLOCK CHAIN WITH TOKEN — the API token from the ' +
        'Version Crypt. Then it follows you anywhere, which is the whole danger of it.';
      return 'The bot is loose and following you. Take it to the Pull Request Bridge, and ' +
        'leave it there before you cross.';
    },
    serviceShaft: () =>
      'UNLOCK HATCH WITH KEYS, then DOWN. It comes out at the sinkhole in the creek, which ' +
      'joins the forest to the platform by something more reliable than a balloon.',
    legacyPit: e => e.prop('serpent')
      ? (at(e, 'feather', 'legacyPit') ? 'TAKE FEATHER.' : 'The serpent is gone.')
      : 'The serpent won\'t be fought — it\'s load-bearing. OPEN CAGE and let something ' +
        'small disagree with it in public.',
    incidentRoom: () =>
      'SHOW COMMIT TO DANNET, and then REFLOG on the very next turn. Both heads want the ' +
      'Golden Commit at once and the yoke takes it from both ends; REFLOG then puts the ' +
      'commit back on its shelf and there\'s nothing left to fight over. The two moves must ' +
      'be consecutive.',
    shrine: () =>
      'PRAY — but carry the plain grey stone from the Ground Truth Range first. Unpaid and ' +
      'ungrounded, roughly one answer in four is confident, well-structured and false.',
    visionPool: () => 'VISION, as often as you like. Katie has twenty and they don\'t come ' +
      'in order. Nothing in the endgame surprises anybody who has heard them all.',
    chapel: () =>
      'ASK MARK ABOUT DASSAULT — the origin of the boss, and the most useful thing anybody ' +
      'says in this game. Then ASK MARK ABOUT DANNET, before you go down to the Incident Room.',

    /* Mid-duel, duelHint() has already answered with the placard. */
    boardroom: e => e.flag('duelWon')
      ? 'Do NOT SIGN CONTRACT — it\'s a real ending and it\'s his. DOWN, to the monolith.'
      : 'Answer each face with the artifact that unmakes it: CONSOLE, TABLET, ORB, ' +
        'FEATHER, COMPASS, VEE or RULE. A wrong answer costs that face its point and ' +
        'nothing else.',
    monolith: e => e.state.itemLocations.fragment === 'nowhere'
      ? 'It\'ll not move and it\'ll not explain itself, but a corner will come away: ' +
        'CHIP THE MONOLITH, and keep the piece. There\'s a bench in the Assay Office ' +
        'that can say what a thing is made of.'
      : 'You\'ve your piece of it. Keep it through everything that\'s coming.',
    rcMonolith: e => e.flag('chargePlaced')
      ? 'The charge is set. UP, then N and W to the balcony.'
      : 'PUT CAP IN CHARGE to seat the blasting cap, then PUT CHARGE AT MONOLITH.',
    rcBalcony: e => e.flag('chargePlaced')
      ? 'PRESS DETONATOR.'
      : 'Nothing to fire yet. The charge goes at the monolith, below the boardroom.'
  };

  function doHint(e) {
    if (duelHint(e)) return;
    /* a bug in the room speaks first, whatever else the room has to say */
    const bug = !!e.state.flags.bugHere;
    if (bug) {
      e.print('There\'s a bug in this room, and the duck isn\'t company, it\'s a method: ' +
        'THROW DUCK AT BUG, then pick the duck back up.');
    }
    const h = HINTS[e.state.room];
    const said = h && h(e);
    if (said) { e.print(said); return; }
    if (bug) return;
    e.print('Nothing in this room is waiting on you. Type GOAL for what you\'re here to do, ' +
      'READ PLACARD in any of the seven halls for the word that beats its face, and LOOK to ' +
      'see what\'s here.');
  }

  /* ---- the duel ---- */
  const FACES = [
    { face: 'Le Sourire (The Smile)', key: 'console',
      says: '"But you\'ve not seen the demonstration. Sit. It\'s ninety minutes. It\'s ' +
        'already running, so really it\'s eighty."',
      beat: 'You turn the console around and put the keyboard in his hands. The Smile ' +
        'discovers that it has nothing whatever to say when it\'s the one being asked, ' +
        'and comes off in your hand like a mask.' },
    { face: 'Le Notaire (The Notary)', key: 'tablet',
      says: 'He unfolds an agreement. It reaches the floor and keeps going. "Clause ' +
        '14.2.7: the system shall be world-class. You agreed to this. You agreed at install."',
      beat: 'One sentence. Atomic, unambiguous, verifiable, with the test carved on the ' +
        'back. The Notary reads it twice looking for the door, and doesn\'t find one.' },
    { face: 'Le Verrou (The Lock)', key: 'orb',
      says: '"Your models are beautiful. They\'re also .dsX9. Export? But of course — for ' +
        'a fee, in a format we no longer support, in the fourth quarter."',
      beat: 'The schema is open, published and complete. The Lock closes on it and finds ' +
        'nothing to bite.' },
    { face: 'Le Perroquet (The Parrot)', key: 'feather',
      says: '"What a brilliant architecture. You\'re absolutely right. Shall I proceed?"',
      beat: 'A helper that will say no. The Parrot hears the word for the first time in a ' +
        'long and successful career, and moults.' },
    { face: 'Le Brouillard (The Fog)', key: 'compass',
      says: '"The requirements are still maturing. Let\'s begin the build and discover ' +
        'them together, hmm? It\'s more agile."',
      beat: 'The needle swings and holds on the mission, and there\'s nothing for fog to ' +
        'be in.' },
    { face: "L'Hydre (The Hydra)", key: 'vee',
      says: '"One small change. Ah — and the two changes that change implies. Ah — and ' +
        'the four that those—"',
      beat: 'Every head must trace up to a need and close down onto a test. The ones that ' +
        'can\'t, come off.' },
    { face: 'Le Colosse (The Colossus)', key: 'rule',
      says: 'The room goes to scale. The floor is his palm. "You misunderstand. I\'m not ' +
        'the vendor. I\'m the environment."',
      beat: 'You slide one order of magnitude out. At the next scale up he\'s a block on ' +
        'a diagram with two interfaces and a supplier, and a block on a diagram can be ' +
        'replaced.' }
  ];

  /* The duel is the one place the whole game is cashed in, so it does not hide
     the rules: it names the face in English, says how many are left, and the
     board in front of you lists the seven words you may answer with. A wrong
     answer costs nothing but the point — he talks, you get the placard back. */
  function startDuel(e) {
    e.state.flags.duelRound = 0;
    e.state.flags.duelWrong = 0;
    e.state.flags.duelMissed = {};
    e.print('"Ah," says Dassault, without turning round. "You\'ve been busy. Seven ' +
      'things. Very good. We\'ll find a place for all of them in the roadmap."\n\n' +
      'He turns round, and he has no face — he has a set of them, and he puts on the ' +
      'first one the way you\'d put on reading glasses.\n\n' +
      'SEVEN FACES. ONE ANSWER EACH.\n' +
      'Answer with the artifact that unmakes the face, by name. Your seven:\n' +
      '  CONSOLE · TABLET · ORB · FEATHER\n' +
      '  COMPASS · VEE · RULE\n' +
      'A wrong answer costs you that face\'s points and nothing else — he can\'t ' +
      'win this, and you can keep trying. Type HINT for the placard of the face in ' +
      'front of you; he will wait, and he will remember that you needed it.\n' +
      'Answer all seven cleanly, unprompted, and you\'ll have done the only thing ' +
      'in this building nobody has managed in eleven years.');
    presentFace(e);
  }

  /* Keyed off the artifact, not the index, so the two tables cannot drift. */
  const hallOf = key => HALLS.find(h => h.artifact === key);

  function presentFace(e) {
    const r = e.state.flags.duelRound;
    const f = FACES[r];
    const h = hallOf(f.key);
    e.print('\nFACE ' + (r + 1) + ' OF 7 — ' + h.face + ', ' + h.faceEn +
      '\n(Hall ' + h.n + ': ' + h.area + ')\n' + f.says);
  }

  /* HINT in the boardroom hands back the placard for the face you are looking
     at, so a player who did not read them in the halls is not locked out. */
  function duelHint(e) {
    const r = e.state.flags.duelRound;
    if (r === undefined || e.flag('duelWon') || e.state.room !== 'boardroom') return false;
    const f = e.state.flags;
    f.duelPrompted = (f.duelPrompted || 0) + 1;
    e.print(hallOf(FACES[r].key).placard +
      '\n\nHe waits while you read it, with enormous patience, and makes a small note.');
    return true;
  }

  function duelAnswer(e, word) {
    const r = e.state.flags.duelRound;
    if (r === undefined || r >= FACES.length || e.state.room !== 'boardroom') return false;
    const f = FACES[r];
    const h = hallOf(f.key);
    if (word !== f.key) {
      e.state.flags.duelWrong++;
      e.state.flags.duelMissed[r] = true;
      e.print('He accepts it graciously, turns it over, and hands it back dimmed. That ' +
        'isn\'t what this face is afraid of.\n' +
        'This is ' + h.faceEn + '. ' + h.does + '\n' +
        'Try another of the seven, or type HINT.');
      return true;
    }
    /* The face always comes off — a fumbled one just does not score. */
    const earned = e.state.flags.duelMissed[r] ? 0 : 3;
    if (earned) e.addScore(earned);
    e.print(f.beat + (earned ? '  (+3)' : '  (no points: this one took two tries)'));
    e.state.flags.duelRound++;
    /* Halfway, with four faces off, he stops fighting and starts offering. This
       is the only moment in the game where the losing ending is attractive. */
    if (e.state.flags.duelRound === 4 && !e.state.flags.offered) {
      e.state.flags.offered = true;
      e.moveItem('contract', 'boardroom');
      e.print('\nHe stops, with three faces left, and does the thing he\'s actually ' +
        'good at.\n\n' +
        '"Let\'s not do the other three," says Dassault. "You\'ve made your point and I ' +
        'am not too proud to say so. Here\'s what I\'ll do: the format stays open, you ' +
        'keep the thread, we license the foundation at cost, and you take a seat on the ' +
        'board and make sure I keep my word.\n\n' +
        'You\'d be inside it. You\'ve seen what happens out here to people who are ' +
        'not." He holds out a pen, and a chair.\n\n' +
        '(SIGN CONTRACT is a real offer and a real ending. Or answer the fifth face.)');
    }
    if (e.state.flags.duelRound < FACES.length) { presentFace(e); return true; }
    if (!e.state.flags.duelWrong && !e.state.flags.duelPrompted) {
      e.addScore(15);
      e.print('\nSeven for seven, unprompted, off placards you read in the halls weeks ' +
        'ago because they were on the wall and you were the sort of person who reads what ' +
        'is on the wall.\n\nHe looks at you with something that\'s almost professional ' +
        'regard. "You were listening," he says. It\'s the only true thing any of his faces ' +
        'has ever said. (+15)');
    }
    e.setFlag('duelWon');
    e.setProp('dassault', 1);
    e.moveItem('contract', 'boardroom');
    e.print('\nSeven faces gone, and folded flat where he stood: a man made entirely of ' +
      'paper, holding out a pen and a seat on the board. The way down from the boardroom ' +
      'is open.');
    return true;
  }

  /* ---- the charge ---- */
  function armCharge(e) {
    if (!e.carrying('cap')) { e.print('You\'ve no blasting cap.'); return; }
    if (e.prop('charge')) { e.print('The cap is already seated.'); return; }
    e.setProp('charge', 1);
    e.moveItem('cap', 'nowhere');
    e.print('The cap seats in the well with a small click that\'s eleven years overdue.');
  }

  function setCharge(e) {
    if (e.state.room !== 'rcMonolith') { e.print('There\'s no monolith here.'); return; }
    e.moveItem('charge', 'rcMonolith');
    e.setFlag('chargePlaced');
    e.print('You set the charge against the foundation, low down, where it\'s bolted to ' +
      'everything.');
  }

  function fireCharge(e) {
    if (!e.flag('chargePlaced')) { e.print('There\'s nothing out there to fire.'); return; }
    if (!e.prop('charge')) {
      e.print('The detonator clicks. Nothing else happens. Somewhere eleven years ago a ' +
        'blasting cap is in a drawer, and the drawer became a concession stand, and the ' +
        'concession stand is on a balcony that no longer exists.\n\n' +
        'This charge is never going to fire. There\'s a service ladder over the rail of ' +
        'the Last Balcony, and it goes DOWN, and that\'s the ending you\'ve got.');
      return;
    }
    if (e.state.room === 'rcMonolith') {
      e.kill('The charge goes off eleven years late and about forty feet too close.');
      return;
    }
    if (e.state.room !== 'rcBalcony') {
      e.print('You\'re still inside the building that\'s about to stop being one. Get to ' +
        'the balcony.');
      return;
    }
    e.addScore(45);
    e.setFlag('blew');
    e.print(TEXT.ending);
    /* The blast is no longer the ending. Everything that goes up in this
       programme comes down in the same forest, and so do you. */
    theGround(e);
  }

  /* ---- the shrine ---- */
  const FALSE_ANSWERS = [
    'THE EIGHTH HALL IS BEHIND THE FOUNTAIN. TAKE THE STAIR YOU HAVE NOT TAKEN.',
    'THE GOLEM WILL ACCEPT ANY REQUIREMENT SPOKEN WITH SUFFICIENT CONFIDENCE.',
    'THE BRIDGE IS RATED FOR TWO. IT HAS ALWAYS BEEN RATED FOR TWO.',
    'THE LEVER IS SAFE THE SECOND TIME. IT IS THE FIRST TIME THAT IS THE RISK.'
  ];
  function trueHint(e) {
    const f = e.state.flags;
    if (!f.launched) return 'THE SANDBAGS ARE THE ONLY THING KEEPING YOU ON THE GROUND.';
    if (!f.userHelped) return 'THE ONE AT THE MIRROR-GLASS WANTS COFFEE MORE THAN AGREEMENT.';
    if (!f.tabletFound) return 'ONE SLAB IN THE QUARRY IS NOT SAND. SHOW IT TOKEN-LIGHT.';
    if (!f.golemSatisfied) return 'THE GOLEM IS NOT A GUARD. IT IS WAITING FOR A REASON.';
    if (e.prop('serpent') === 0) return 'THE SERPENT WILL NOT BE FOUGHT. LET SOMETHING SMALL DISAGREE WITH IT.';
    if (!f.dannetUndone) return 'TWO HEADS HAVE NEVER WANTED THE SAME THING. GIVE THEM ONE, THEN TAKE IT.';
    if (!f.boughtCap) return 'THE CHARGE BELOW HAS NO HEART IN IT. BUY THE HEART WHILE THERE IS A SHOP.';
    const missing = TREASURES.filter(t => !e.state.flags.vaulted[t]);
    if (missing.length) return 'THE RING IS NOT FULL. ' + missing.length + ' STILL LOOSE IN THE BUILDING.';
    return 'YOU HAVE DONE THE WORK. THE REST IS DISTANCE.';
  }
  function pray(e) {
    if (e.state.room !== 'shrine') {
      e.print('You pray. The platform notes your enthusiasm and adds it to the telemetry.');
      return;
    }
    const honest = e.carrying('stone') || e.state.flags.shrineCredit > 0;
    if (e.state.flags.shrineCredit > 0 && !e.carrying('stone')) e.state.flags.shrineCredit--;
    if (honest || e.rng() > 0.25) {
      e.print('The face of light considers you.\n    ' + trueHint(e));
    } else {
      e.print('The face of light considers you.\n    ' +
        FALSE_ANSWERS[Math.floor(e.rng() * FALSE_ANSWERS.length)]);
    }
  }

  /* ============================== the bugs =============================== */
  const BUGS = [
    { id: 'null', name: 'a Null Pointer',
      arrive: 'A Null Pointer materialises out of an uninitialised corner and throws a ' +
        'stack trace at you!', hit: 0.15 },
    { id: 'offbyone', name: 'an Off-by-One',
      arrive: 'An Off-by-One appears in the doorway. Or possibly in the next doorway.', hit: 0.2 },
    { id: 'race', name: 'a Race Condition',
      arrive: 'A Race Condition arrives. Another Race Condition arrives first.', hit: 0.25 },
    { id: 'leak', name: 'a Memory Leak',
      arrive: 'A Memory Leak settles in the corner and begins, very slowly, to grow.', hit: 0 },
    { id: 'heisenbug', name: 'a Heisenbug',
      arrive: 'Something has already happened here. You\'ll know it by what it has done.', hit: 0.2 }
  ];

  function bugTurn(e) {
    const f = e.state.flags;
    const room = e.state.room;
    if (!DEEP.includes(room) || f.frozen) { f.bugHere = null; return; }
    if (f.repellent > 0) { f.repellent--; f.bugHere = null; return; }

    if (f.bugHere) {
      const bug = BUGS.find(b => b.id === f.bugHere);
      if (bug && bug.hit && e.rng() < bug.hit) {
        e.print('It connects. ' + bug.name.replace(/^an? /, 'The ') + ' gets you.');
        e.kill(null);
        return;
      }
      if (e.rng() < 0.3) { f.bugHere = null; e.print('The bug wanders off to be somebody else\'s.'); }
      return;
    }
    if (e.rng() < 0.14) {
      const bug = BUGS[Math.floor(e.rng() * BUGS.length)];
      f.bugHere = bug.id;
      e.print(bug.arrive);
    }
    /* the Regression: steals one found-but-unvaulted treasure and stashes it */
    if (!f.regressionGone && e.rng() < 0.05) {
      const loose = TREASURES.filter(t => e.carrying(t));
      if (loose.length) {
        const stolen = loose[Math.floor(e.rng() * loose.length)];
        e.moveItem(stolen, 'trace4');
        e.print('Somewhere behind you, a test that passed yesterday goes red. ' +
          e.item(stolen).name + ' isn\'t where you left it.');
      }
    }
  }

  /* Compass words, for the dark check. The engine has its own copy; this is
     the same set, kept here so imbse-data does not have to require engine.js. */
  const DIR_WORDS = {
    north: 'north', n: 'north', south: 'south', s: 'south',
    east: 'east', e: 'east', west: 'west', w: 'west',
    northeast: 'northeast', ne: 'northeast', northwest: 'northwest', nw: 'northwest',
    southeast: 'southeast', se: 'southeast', southwest: 'southwest', sw: 'southwest',
    up: 'up', u: 'up', down: 'down', d: 'down', in: 'in', out: 'out'
  };

  /* ============================== the hooks ============================== */
  const hooks = {
    onStart(e) {
      Object.assign(e.state.flags, {
        tokens: LAMP_LIFE, deaths: 0, vaulted: {}, found: {},
        storyPoints: 0, bought: {}, shrineCredit: 0, repellent: 0,
        vineGrowth: 0, bugHere: null, placardsRead: {},
        /* the expansion */
        words: {}, wordReturn: {}, salvaged: {}, met: {}, booth: 0, rateTick: 0,
        actV: false, signed: false, recordWritten: false, askedEngineer: false,
        groundTurns: 0, hadKit: false, hadCap: false
      });
      /* the truck raises meta.maxCarry, which lives on the shared game object;
         put it back on every reset so one run never inherits another's truck */
      e.game.meta.maxCarry = 7;
      /* gates that are state, not objects: they must start explicitly shut */
      for (const k of ['bridge', 'serpent', 'hatch', 'vine', 'funnel', 'panel', 'signed'])
        e.state.props[k] = 0;
      e.item('tablet').hidden = true;
      e.item('orb').hidden = true;
      e.item('console').hidden = true;
      if (NPCS && NPCS.onStart) NPCS.onStart(e);
    },

    onEnterRoom(e, room) {
      const f = e.state.flags;
      /* An unchained bot follows you about, and the Reviewer Troll only has to
         see its green check once to decide he was never here. */
      if (e.prop('bot') === 2) e.moveItem('bot', room);
      if (room === 'pullRequestBridge' && e.prop('bot') === 2 && !f.trollGone) {
        f.trollGone = true;
        e.print('The troll looks once at the bot\'s small green check, says a word in a ' +
          'language of his own, and goes over the rail.');
      }
      if (room === 'rootCellar' && !f.deepScored) { f.deepScored = true; e.addScore(25); }
      /* the road at dawn: the thread stops being yours */
      if (room === 'theRoadAtDawn' && f.signed && !e.state.won) {
        e.addScore(20);
        e.moveItem('thread', 'nowhere');
        e.print(TEXT.handover);
        e.print(epilogue(e));
        e.state.won = true;
        return;
      }
      if (room === 'boardroom' && f.duelRound === undefined && !f.duelWon) startDuel(e);
      if (room === 'uncannyValley' && e.hasLight() && !f.sawAvatar) {
        f.sawAvatar = true;
        e.print('On the floor between you is a black anti-static mat.');
      }

      /* ---- the expansion ---- */

      /* The Context Window holds four things. What it sheds is chosen by when
         you picked it up, which is not the same as what you need. */
      if (room === 'contextWindow') {
        const held = e.inventory().filter(id => id !== 'thread' && id !== 'truck');
        if (held.length > 4) {
          const shed = held.slice(0, held.length - 4);
          for (const id of shed) e.moveItem(id, 'copilotRoost');
          e.print('You come in carrying ' + held.length + ' things and the room has a stated ' +
            'capacity of four.\n\nYou put ' + shed.map(id => e.item(id).name).join(', ') +
            ' down outside the door, politely, with your own hands, and you\'ll not remember ' +
            'doing it. (They\'re in the Roost.)');
        }
      }

      /* The Accessibility Wing was built for somebody who was never going to
         have a lantern, and that turns out to include you. */
      if (room === 'accessibilityWing' && !f.sawAnnex) {
        f.sawAnnex = true;
        e.print('It\'s legible. You hadn\'t noticed until now that nothing else down here ' +
          'is, without a lamp.');
      }

      /* The storm drains a lantern and a train of thought until it is muted. */
      if (room === 'notificationStorm' && !e.flag('storm:muted')) {
        e.print('An alert arrives at eye level. Then four more. None of them is the important ' +
          'one, and there\'s no way to tell, because they arrive in order of arrival.');
      }

      if (NPCS && NPCS.onEnterRoom) NPCS.onEnterRoom(e, room);
    },

    /* Every named fixture in the room says it is here, the same way an item
       does, so the prose never has to be mined for the nouns that work. */
    fixtureLines(e) {
      const here = SCENERY[e.state.room] || {};
      const lines = Object.keys(here)
        .map(k => here[k])
        .filter(entry => typeof entry === 'object' && entry.name)
        .map(entry => 'There ' + (entry.plural ? 'are ' : 'is ') + entry.name + ' here.');
      if (NPCS && NPCS.presenceLines) lines.push(...NPCS.presenceLines(e));
      /* The Plain Language Edition is the manual rewritten so anybody can read
         it, and the swamp is three rooms written so nobody can. It wins. */
      if (SWAMP_NAMES[e.state.room] && e.carrying('plainLanguage')) {
        lines.push('You look it up in the Plain Language Edition, which does not do ' +
          'atmosphere. ' + SWAMP_NAMES[e.state.room]);
      }
      return lines;
    },

    onTurn(e) {
      const f = e.state.flags;

      /* the lantern burns context, and only while it is lit */
      if (e.prop('lantern') && e.carrying('lantern')) {
        const drain = f.bugHere === 'leak' ? 2 : 1;
        f.tokens -= drain;
        if (f.tokens === 30) e.print('Your lantern is getting dim. The context window is nearly spent.');
        if (f.tokens <= 0) {
          f.tokens = 0;
          e.setProp('lantern', 0);
          e.setFlag('lit:lantern', false);
          e.print('Your lantern has run out of context and gone out.');
        }
      }

      /* ---- the expansion ---- */

      /* The storm burns a second token a turn, and the mute wears off. */
      if (e.state.room === 'notificationStorm' && !e.flag('storm:muted') &&
        e.prop('lantern') && e.carrying('lantern')) f.tokens -= 1;
      if (e.flag('storm:muted') && e.state.moves - (f.stormMutedAt || 0) > 50) {
        e.setFlag('storm:muted', false);
        if (e.state.room === 'notificationStorm' || e.state.room === 'sessionArchive') {
          e.print('The placard falls off the door. The storm resumes at the threshold as ' +
            'though it had been holding its breath.');
        }
      }

      /* The Rate Limiter admits one move in three, unless you show it a token. */
      if (e.state.room === 'rateLimiter' && !e.carrying('token')) {
        f.rateTick = (f.rateTick || 0) + 1;
        if (f.rateTick % 3) {
          e.print('The turnstile doesn\'t move. It\'ll, shortly. It was set by somebody who ' +
            'has never stood in this queue.');
        }
      }

      /* Three turns of not talking in the booth is the whole puzzle. */
      if (f.booth) {
        if (e.state.room !== 'elicitationBooth') f.booth = 0;
        else if (++f.booth > 3 && !f.gotNeed) {
          f.gotNeed = true;
          e.moveItem('need', 'inventory');
          e.print('You\'ve not said anything for three turns.\n\nThe booth, which was built ' +
            'for this and hasn\'t been used for it in nine years, prints one page: the ' +
            'Validated Need, in somebody else\'s words, signed by them, and dated eleven ' +
            'years ago. It\'s good. Nothing that was built afterwards is in it.');
        }
      }

      /* Act V has a clock. The Clerk signs on Friday whatever anybody does. */
      if (f.actV && !f.signed && !e.state.won) {
        f.groundTurns = (f.groundTurns || 0) + 1;
        if (f.groundTurns === 200) {
          e.print('Somewhere down the fire road the generator is still running. It\'s ' +
            'getting light.');
        }
        if (f.groundTurns >= 250) {
          e.print(TEXT.longWalk);
      e.print(epilogue(e));
          e.state.won = true;
          return;
        }
      }

      bugTurn(e);
      if (e.state.dead || e.state.won) return;
      if (NPCS && NPCS.onTurn) NPCS.onTurn(e);
    },

    onCommand(e, words) {
      /* BOARD BUS: 'board' is a motion word, so the bus has to catch it here
         before the parser walks it into a wall. */
      if (words[0] === 'board' && words.some(w => /bus/.test(w))) {
        if (e.state.room !== 'countyRoad') { e.print('There\'s no bus here.'); return true; }
        boardBus(e);
        return true;
      }
      /* ---------------------------------------------------------- the dark
       * You do not walk about in a room you cannot see. The only door you can
       * find by touch is the one you came in by, so that is the only way you
       * are allowed to go — which keeps the dark frightening without ever
       * sealing anybody in it.
       */
      if (!e.hasLight() && !e.state.dead) {
        const dir = DIR_WORDS[words[0]] || (motionSynonyms || {})[words[0]];
        if (dir) {
          const specs = e.resolveExit(dir) || [];
          const spec = specs.find(sp => sp.to || sp.die || sp.special);
          const to = spec && (typeof spec.to === 'function' ? spec.to(e) : spec.to);
          if (to && to === e.state.prevRoom) {
            e.print('You feel your way back along the wall to the door you came in by. ' +
              'It\'s the only one you can find.');
            e.go(dir);
            return true;
          }
          e.print('It\'s pitch dark, and you\'re not going to walk into that. You can feel ' +
            'your way BACK to the door you came in by, and that\'s all you can do until ' +
            'there\'s a light in here.');
          return true;
        }
      }
      if (NPCS && NPCS.onCommand && NPCS.onCommand(e, words)) return true;
      /* the avatar */
      if (words[0] === 'follow' && e.state.room === 'uncannyValley') {
        e.kill('You go to meet it. It comes to meet you. You arrive at the same place at ' +
          'the same time and only one of you leaves, and the documentation is ambiguous ' +
          'about which.');
        return true;
      }
      return false;
    },

    onDeath(e) {
      const f = e.state.flags;
      if (e.carrying('bandage')) {
        e.moveItem('bandage', 'nowhere');
        e.print('Kennet\'s bandage takes the worst of it, which was all of it. It\'s very ' +
          'well made, and now it\'s spent.');
        return;
      }
      if (f.indulgence) {
        f.indulgence = false;
        e.print('The Indulgence of the Nightly Build is spent on your behalf. Saint Mark ' +
          'would like it on record that he was against this.');
        return;
      }
      f.deaths++;
      e.addScore(-10);
      e.print(TEXT.deaths[Math.min(f.deaths, MAX_DEATHS) - 1]);
      if (f.deaths >= MAX_DEATHS) { e.state.dead = true; return; }
      /* scatter what you were holding, and put you back at the top */
      for (const id of e.inventory()) {
        if (id !== 'thread') e.moveItem(id, isTreasure(id) ? 'atrium' : e.state.room);
      }
      e.setProp('lantern', 0);
      e.setFlag('lit:lantern', false);
      e.state.room = f.launched ? 'atrium' : 'endOfRoad';
      e.state.wasDark = false;
      e.print(e.describeRoom(true));
    },

    /* The 700-point table in docs/SCRIPT.md §8. The first 400 are the original
       game unchanged; the expansion adds 300, of which 161 are on the ground. */
    computeScore(e) {
      const f = e.state.flags;
      let s = e.state.score;                       // event points, banked as they happen
      for (const t of TREASURES) {
        const it = items[t];
        if (f.found[t]) s += it.keystone ? 5 : 4;
        if (f.vaulted[t]) s += it.keystone ? 15 : 8;
      }
      if (f.magazineFiled) s += 1;
      if (!f.quit && (e.state.won || !e.state.dead)) s += 4;
      if (NPCS && NPCS.score) s += NPCS.score(e);
      return s + 4;                                // round-off, as the table says
    },

    /* SCORE prints the rank off the expanded ladder. */
    rankFor(score) {
      const row = RANKS.find(r => score >= r[0]);
      return row ? row[1] : RANKS[RANKS.length - 1][1];
    },

    onInventory(e) {
      const f = e.state.flags;
      if (f.storyPoints) e.print('  (' + f.storyPoints + ' iMBSE story points in the tin.)');
    }
  };

  /* --- item found/vaulted bookkeeping rides on take/drop --- */
  for (const t of TREASURES) {
    const it = items[t];
    const prevTake = it.onTake;
    it.onTake = function (e) {
      if (prevTake && prevTake(e) === false) return false;
      if (!e.state.flags.found[t]) e.state.flags.found[t] = true;
      return true;
    };
  }
  items.glass.onDrop = function (e) {
    const room = e.state.room;
    const safe = room === VAULT || e.here('mat') || e.state.flags.bought.satchel;
    if (safe) return true;
    e.moveItem('glass', 'nowhere');
    e.print('You set the Glass Prototype down on a hard floor, and the first one that ' +
      'ever worked becomes a noise.');
    loseTreasure(e, 'glass', 'It was blown in a single piece and it\'s in several now.');
    return false;
  };
  items.magazine.onDrop = function (e) {
    if (e.state.room === 'backlogEnd' && !e.state.flags.magazineFiled) {
      e.state.flags.magazineFiled = true;
      e.print('You leave MBSE Today among the cards that will never be pulled, for the ' +
        'same reason it always has been left there.');
    }
    return true;
  };

  /* ============================= magic words ============================= */
  const magicWords = {
    xyzzy(e) {
      if (e.state.room === 'insideShed') { e.teleport('sandbox', 'Nothing happens for a ' +
        'moment, and then everything does.'); return; }
      if (e.state.room === 'sandbox') { e.teleport('insideShed', 'Nothing happens for a ' +
        'moment, and then everything does.'); return; }
      e.print('Nothing happens. Somebody put that word in this dungeon eleven years ago ' +
        'and has never owned up to it.');
    },
    sudo(e) {
      if (e.state.room === 'ingressDeck') { e.teleport('rootCellar', 'Authorised. Logged.'); return; }
      if (e.state.room === 'rootCellar') { e.teleport('ingressDeck', 'Authorised. Logged.'); return; }
      e.print('You\'ve no business doing that here, and it has been written down.');
    },
    fly(e) {
      if (e.state.room !== 'warRoom') { e.print('You say it, and it\'s true, and nothing here needs it.'); return; }
      if (e.flag('fogGone')) { e.print('The dome is already open.'); return; }
      e.setFlag('fogGone');
      e.item('compass').hidden = false;
      e.print('You say it out loud, in a room built for saying things out loud. The fog ' +
        'goes off the table like breath off glass and the dome opens.\nThe Mission ' +
        'Compass may be taken.');
    },
    reflog(e) {
      if (NPCS && NPCS.reflog && NPCS.reflog(e)) return;
      const loc = e.state.itemLocations.commit;
      if (loc === 'versionCrypt') { e.print('The Golden Commit is already on its shelf.'); return; }
      e.moveItem('commit', 'versionCrypt');
      e.print('The Golden Commit isn\'t where it was. It\'s on its shelf in the Version ' +
        'Crypt, because that\'s what a baseline under configuration control is.');
    },
    hallucinate(e) {
      if (e.state.room === 'hallucinationGallery') {
        if (e.carrying('stone')) { e.moveItem('stone', 'nowhere');
          e.print('The grey stone doesn\'t survive the trip. Nothing false ever does, and ' +
            'the trip is entirely false.'); }
        e.teleport('promptGarden', 'The gallery agrees, beautifully and at length, that ' +
          'you\'re somewhere else.');
        return;
      }
      if (e.state.room === 'promptGarden') {
        e.teleport('hallucinationGallery', 'The garden agrees, beautifully and at length, ' +
          'that you\'re somewhere else.');
        return;
      }
      e.print('Nothing plausible occurs.');
    },
    deprecate(e) { fireCharge(e); },
    pray(e) { pray(e); },
    /* PLUGH joins the two rooms where dead programs go. One of them is four
       thousand feet above the other, and they are the same room. */
    plugh(e) {
      if (e.state.room === 'insideShed') {
        e.teleport('deprecatedWing', 'A hollow voice says "PLUGH", and it\'s your own, ' +
          'four thousand feet up, in a colder room with the same shelves in it.'); return;
      }
      if (e.state.room === 'deprecatedWing') {
        e.teleport('insideShed', 'A hollow voice says "PLUGH", and you\'re in a tin shed ' +
          'in a forest, and the mug is still there.'); return;
      }
      e.print('A hollow voice says "XYZZY".');
    },

    /* STANDUP — wherever you are, whatever you were doing. That is the joke. */
    standup(e) {
      if (!e.state.flags.launched) {
        e.print('You stand up. The forest isn\'t impressed and nobody attends.'); return;
      }
      if (e.state.flags.actV) {
        e.print('There\'s nobody left to stand up with. It\'s four in the morning and the ' +
          'meeting is cancelled for good.'); return;
      }
      if (e.state.room === 'atrium') {
        e.print('You\'re already in the middle of everything, which is where the standup is, ' +
          'which is why nothing about it has ever been short.'); return;
      }
      e.teleport('atrium', 'Wherever you were and whatever you were holding and however far ' +
        'in you had got, it\'s now fifteen minutes past nine and you\'re in the Atrium with ' +
        'everybody else. It\'s logged.');
    }
  };

  /* The seven words, generated from the table: say one to be in its room, say
     it again to be back where you were. You must have read the plate first —
     a word you have not earned is just a word. */
  for (const word of Object.keys(WORDS)) {
    magicWords[word] = function (e) {
      const f = e.state.flags;
      const home = WORDS[word];
      if (!f.words || !f.words[word]) {
        e.print('Nothing happens. It\'s a perfectly good word and it\'s not yours yet.');
        return;
      }
      if (f.actV) {
        e.print('You say it into the dark of a forest. The room it belonged to is in the ' +
          'bracken about a mile east of here, open to the sky.');
        return;
      }
      if (e.state.room === home) {
        const back = f.wordReturn && f.wordReturn[word];
        if (!back) { e.print('You\'re here. There\'s nowhere it would take you back to.'); return; }
        f.wordReturn[word] = null;
        e.teleport(back, 'The word puts you back where it found you.');
        return;
      }
      f.wordReturn = f.wordReturn || {};
      f.wordReturn[word] = e.state.room;
      e.teleport(home, 'You say it out loud, and the platform — which has never once been ' +
        'able to say what it\'s for — turns out to know exactly where things are.');
    };
  }

  /* ============================== specials =============================== */
  const specials = {
    /* The way down from the Last Balcony. It is four thousand feet of monolith
       and a service ladder, and it is the ending you get when the charge is
       never going to fire. Asked for once, it warns; asked for twice, it goes. */
    longWalk(e) {
      const f = e.state.flags;
      if (e.prop('charge') && e.flag('chargePlaced')) {
        e.print('You could climb down. There\'s a charge below you with a cap in it and a ' +
          'detonator in your hand, and walking away from that would be a waste of eleven ' +
          'years. (PRESS DETONATOR.)');
        return;
      }
      if (!f.walkWarned) {
        f.walkWarned = true;
        e.print('Over the rail there\'s a service ladder, and below the ladder there\'s ' +
          'four thousand feet of monolith going down through a building that has stopped.\n\n' +
          'You can climb down it. It takes the rest of the night and you arrive with what ' +
          'is in your pockets and nothing anybody can read.\n\n' +
          'Say DOWN again if that\'s the ending you\'re having.');
        return;
      }
      e.print(TEXT.longWalk);
      e.print(epilogue(e));
      e.state.won = true;
    },
    board(e) { boardBalloon(e); },
    launch(e) { launchBalloon(e); },
    crossBridge(e) {
      const east = e.state.room === 'pullRequestBridge';
      if (e.flag('bridgeDown')) {
        e.print('The bridge is in the chasm. Everything on the far side of it\'s now a ' +
          'matter of record rather than of access.');
        return;
      }
      if (!e.flag('trollGone')) {
        if (e.prop('bot') === 2) {
          e.setFlag('trollGone');
          e.print('The troll looks once at the bot\'s small green check, says a word in a ' +
            'language of his own, and goes over the rail.');
        } else if (e.carrying('commit')) {
          e.moveItem('commit', 'nowhere');
          e.setFlag('trollGone');
          e.print('"NOTHING MERGES WITHOUT AN APPROVING REVIEW." He takes the Golden ' +
            'Commit, reads it slowly, and approves. He doesn\'t give it back.');
        } else {
          e.print('"NOTHING MERGES WITHOUT AN APPROVING REVIEW." He wants one treasure ' +
            'per crossing, and he will take it slowly.');
          return;
        }
      }
      if (e.prop('bot') === 2) {
        e.setFlag('bridgeDown');
        e.print('You and the bot start across together. The bridge fails its own load ' +
          'test about a third of the way over and goes into the chasm, and takes the ' +
          'bot, and very nearly takes you.');
        e.teleport('vFoundry');
        e.setProp('bot', 0);
        e.moveItem('bot', 'nowhere');
        /* Everything east of it is now a matter of record rather than of access.
           Say so, by name, rather than letting the player find out in an hour. */
        for (const id of ['vee', 'loop', 'pearl']) {
          if (!e.carrying(id) && !e.state.flags.vaulted[id]) {
            loseTreasure(e, id, 'It\'s on the far side, and there\'s no far side any more.');
          }
        }
        return;
      }
      e.teleport(east ? 'integrationBay' : 'pullRequestBridge');
    }
  };

  /* ================================ meta ================================= */
  const game = {
    meta: {
      title: 'iMBSE — The Adventure',
      intro: TEXT.intro,
      maxScore: 750,
      customScoring: true,
      maxCarry: 7,
      keepWords: ['to', 'at', 'with', 'on', 'from', 'into'],
      darkMessage: TEXT.dark,
      darkDeathMessage: TEXT.darkDeath,
      darkDeathChance: 0,
      /* The refusals. A player reads these more often than they read any room
         on the platform, so they are a list and not a line, and every one of
         them is about this building rather than about the parser. */
      noWayMessage: [
        'There\'s no way to go that direction.',
        'There\'s no way to go that direction. It was in the roadmap.',
        'Nothing goes that way. Something was going to.',
        'That direction is out of scope for this release.',
        'There\'s no way to go that direction, and there\'s a ticket open about it.',
        'That was descoped. The wall is what descoping looks like from the inside.',
        'No. The interface was published and then nobody built the other side of it.'
      ],
      carryFullMessage: [
        'Your hands are full. Seven things is the limit, and it\'s the limit for the ' +
          'same reason every limit here\'s: somebody had to choose.',
        'You can\'t carry anything more. This is the one constraint on the platform ' +
          'that\'s honestly enforced.',
        'That would be eight, and eight has never once worked out for anybody.',
        'You\'re at capacity. You may re-prioritise the backlog in your arms, but you ' +
          'may not extend it.',
        'No. Seven. You\'re welcome to write a paper about why it should be nine.'
      ],
      cantTakeMessage: [
        'That\'s load-bearing, or somebody has said it\'s, which is the same thing here.',
        'It doesn\'t come away. Things that come away were the first to go.',
        'You can\'t take that. It\'s part of the platform, and the platform is bolted ' +
          'to something nobody can name.'
      ],
      unknownVerbMessage: [
        'I don\'t know how to "%s" something.',
        'Nothing on this platform knows how to "%s". Try HELP, which is a longer list ' +
          'than it looks.',
        '"%s" isn\'t in the vocabulary. Somebody proposed it. It\'s in the backlog.',
        'I don\'t know how to "%s" something, and I\'m not going to pretend I do. ' +
          'That\'s the one habit I don\'t have.'
      ],
      /* Words handled outside game.verbs — the NPC surface in imbse-npcs.js,
         Tom's ten games, and the three the front end intercepts. Listed here
         so the parser can complete abbreviations of them (ANS → ANSWER) and,
         just as importantly, knows never to expand them into something else. */
      vocabulary: [
        'ask', 'answer', 'talk', 'tell', 'points', 'play', 'buy', 'vision', 'joke',
        'confess', 'reflog', 'stop', 'concede', 'guess', 'is', 'estimate', 'call',
        'probe', 'accuse', 'repeat', 'route', 'corridor', 'expand', 'suite', 'order',
        'trace', 'traces', 'trash', 'bin', 'approve', 'reject', 'yes', 'no',
        'save', 'restore', 'load', 'map',
        'games', 'who', 'people', 'blow', 'whistle', 'path'
      ],
      abbreviations: { m: 'map', v: 'vision' },
      help: TEXT.help,
      ranks: RANKS
    },
    startRoom: 'endOfRoad',
    rooms, items, treasury: VAULT, motionSynonyms, magicWords, specials, verbs, hooks,
    SCENERY,
    KEYSTONES, LESSER, TREASURES, HALLS, FACES, RANKS
  };

  if (NPCS && NPCS.install) NPCS.install(game);
  return game;
});

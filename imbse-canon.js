/*
 * imbse-canon.js — the world of iMBSE: THE ADVENTURE.
 *
 * Rooms, exits, map coordinates, motion vocabulary, the seven placards, the
 * rank table and the long set pieces. Everything here is world; nothing here
 * is logic. The puzzles, items and creatures live in imbse-data.js and the
 * five inhabitants live in imbse-npcs.js.
 *
 * Written against docs/SCRIPT.md. Room prose is the script's prose.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IMBSE_CANON = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ============================================================ the halls
   * The spine of the whole game: seven functional areas, seven halls, seven
   * keystone artifacts, seven faces of the boss. The player is taught the
   * correspondence three times — a placard in each hall, a socket in the
   * vault, a face in the boardroom — before it is ever asked for.
   */
  const HALLS = [
    { n: 1, area: 'HUMAN-AI INTERFACE CLIENTS', hall: 'clientConcourse',
      artifact: 'console', artifactName: 'the Lucid Console', answer: 'CONSOLE',
      face: 'Le Sourire', faceEn: 'The Smile',
      does: 'He sells you the demonstration instead of the system.',
      why: 'The Smile has nothing left to say once the user is the one holding ' +
        'the keyboard.' },
    { n: 2, area: 'REQUIREMENT ENGINEERING', hall: 'requirementsHall',
      artifact: 'tablet', artifactName: 'the Shall Tablet', answer: 'TABLET',
      face: 'Le Notaire', faceEn: 'The Notary',
      does: 'He buries you in clauses too vague to ever be wrong.',
      why: 'The Notary can\'t sign a requirement that comes with its own test.' },
    { n: 3, area: 'MODEL ENGINEERING', hall: 'modelForge',
      artifact: 'orb', artifactName: 'the SysML Orb', answer: 'ORB',
      face: 'Le Verrou', faceEn: 'The Lock',
      does: 'He keeps your models in a format only he can open.',
      why: 'The Lock closes on an open, published schema and finds nothing to bite.' },
    { n: 4, area: 'COPILOT HELPERS', hall: 'copilotRoost',
      artifact: 'feather', artifactName: "the Contrarian's Feather", answer: 'FEATHER',
      face: 'Le Perroquet', faceEn: 'The Parrot',
      does: 'He agrees with everything you say, including the wrong things.',
      why: 'The Parrot is unmade by a helper that will say no.' },
    { n: 5, area: 'MISSION ENGINEERING', hall: 'missionDeck',
      artifact: 'compass', artifactName: 'the Mission Compass', answer: 'COMPASS',
      face: 'Le Brouillard', faceEn: 'The Fog',
      does: 'He starts the build before anyone has said what it\'s for.',
      why: 'The Fog burns off the moment the mission is said out loud.' },
    { n: 6, area: 'SYSTEMS ENGINEERING', hall: 'vFoundry',
      artifact: 'vee', artifactName: 'the Golden V', answer: 'VEE',
      face: "L'Hydre", faceEn: 'The Hydra',
      does: 'Every change he makes breeds two more changes.',
      why: 'The Hydra loses a head for every loop that closes onto a test.' },
    { n: 7, area: 'MACRO ENGINEERING', hall: 'macroGantry',
      artifact: 'rule', artifactName: "the Titan's Slide Rule", answer: 'RULE',
      face: 'Le Colosse', faceEn: 'The Colossus',
      does: 'He\'s too big to argue with, and he knows it.',
      why: 'At the next scale up the Colossus is one block on a diagram, and a ' +
        'block on a diagram can be replaced.' }
  ];

  /* The placard is the game's one plain-language crib sheet: which face you will
     meet, what he pulls, and the exact word that unmakes him. Built from the
     table above so the halls, the vault and the boardroom cannot drift apart. */
  const placardText = h =>
    'PLACARD — HALL ' + h.n + ' OF 7\n' +
    h.area + '\n' +
    '\n' +
    'THE FACE: ' + h.face + ', ' + h.faceEn + '.\n' +
    h.does + '\n' +
    '\n' +
    'THE ANSWER: ' + h.answer + ' — ' + h.artifactName + '.\n' +
    h.why + '\n' +
    '\n' +
    '(Scorched at one corner. He has read them all.)';
  for (const h of HALLS) h.placard = placardText(h);

  /* ============================================================ set pieces */
  const TEXT = {
    intro:
      'They\'ll tell you the platform is in the cloud. What they mean is that it ' +
      'hangs four thousand feet above a pine forest, that nobody has ever walked out ' +
      'of it the same way they walked in, and that once an hour it stops whatever ' +
      'it\'s doing and prays.\n\n' +
      'You\'re standing at the end of a gravel road. There\'s a shed, a creek, a very ' +
      'old tree, and a balloon. Everything you need down here is small enough to ' +
      'carry. Everything you need up there, you\'ll have to earn.\n\n' +
      'WHAT YOU ARE HERE TO DO\n' +
      '  1. Get the balloon onto the platform.\n' +
      '  2. Find the seven keystone artifacts,\n' +
      '     one in each of the seven halls.\n' +
      '  3. Put each one in its socket in the\n' +
      '     Digital Thread Vault.\n' +
      '  4. A contractor called Dassault wears\n' +
      '     seven faces and will argue you out\n' +
      '     of all of it. Those same seven\n' +
      '     artifacts are the seven answers.\n\n' +
      'Read the PLACARD in every hall. Each one tells you which face it beats and ' +
      'the exact word to answer with, so the whole endgame is written down for you in ' +
      'advance. Type GOAL at any time to see all of this again.\n\n' +
      'iMBSE — an adventure in seven halls.\n' +
      'HELP lists the verbs. WHO lists the people worth talking to. HINT tells you ' +
      'what the room you\'re standing in is waiting for. PRAY gets you the truth — ' +
      'though roughly one answer in four is a beautiful lie.',

    /* One direction per line: the console is ~45 monospace columns at its
       narrowest, so a two-column plate wraps and loses the alignment. */
    plate:
      'iMBSE — PLATFORM DIRECTORY\n' +
      '\n' +
      '  N     HUMAN-AI INTERFACE CLIENTS\n' +
      '  NE    MACRO ENGINEERING\n' +
      '  SE    SYSTEMS ENGINEERING\n' +
      '  S     MISSION ENGINEERING\n' +
      '  SW    COPILOT HELPERS\n' +
      '  W     MODEL ENGINEERING\n' +
      '  NW    REQUIREMENT ENGINEERING\n' +
      '\n' +
      '  UP    OBSERVABILITY BALCONY\n' +
      '        dashboards, and the store\n' +
      '\n' +
      '  DOWN  THE DEEP STACK\n' +
      '        authorised personnel and\n' +
      '        their consequences',

    charter:
      'THE CHARTER OF THE iMBSE PROGRAM\n' +
      '  To fly the mission before it\'s built.\n' +
      'Everything else in this document is commentary.',

    launch:
      'The tether comes taut, sings once, and parts. The meadow drops away, then ' +
      'the forest, then the whole shape of the forest, and the shape is a watershed ' +
      'and the watershed is a system, and you\'re the first person in a long time ' +
      'to see it all at once. Above you the cloud opens like a door held for you ' +
      'specifically.\n\n' +
      '*** You\'ve reached the platform. ***',

    freeze:
      'Somewhere above you, a bell. Then a voice, calm and enormous, on every ' +
      'speaker on every floor:\n\n' +
      '    THE BASELINE IS FROZEN. THE RELEASE\n' +
      '    IS CUT. NO FURTHER CHANGES WILL BE\n' +
      '    ACCEPTED FROM ANY SOURCE.\n\n' +
      'The bugs stop where they\'re. The seven sockets go out one after another, ' +
      'and the thread of light comes up out of the floor, through the ring, and ' +
      'into you, and you feel it settle behind your sternum with the weight of ' +
      'seven things that can all be traced. The dome goes dark. You\'ve time to ' +
      'think that this isn\'t how a release is supposed to feel, and then you ' +
      'don\'t have time.',

    ending:
      'The charge goes off eleven years late.\n\n' +
      'The monolith comes apart down its whole length, floor after floor, and the ' +
      'seven halls — no longer bolted to anything — float free of each other and ' +
      'turn slowly in the light like a diagram finally laid out properly. ' +
      'Everything inside them spills out and keeps going: models, traces, tests, ' +
      'the whole thread, out through the dome and down through four thousand feet ' +
      'of clear air in a format anybody can open.\n\n' +
      'Seen from above, the face of the deity is exactly what it always was — a ' +
      'very large, very good autocomplete — and as the halls come apart around it, ' +
      'it says the only true thing it has ever said:\n\n' +
      '    I DO NOT KNOW. SHOW ME THE TRACE.\n\n' +
      'And then, because everything that goes up in this programme comes down in ' +
      'the same forest, so do you.',

    /* ---------------------------------------------------------- ACT V */
    ground:
      'You wake in the meadow with your back against a wicker basket and a ' +
      'deflated envelope over you like a blanket, and the sandbags stencilled ' +
      'TECHNICAL DEBT exactly where you dropped them, because that\'s where ' +
      'technical debt stays.\n\n' +
      'It\'s about four in the morning. The thread is still behind your sternum ' +
      'and the seven sigils are still in it. Everything else you owned is in the ' +
      'trees.\n\n' +
      'Down the fire road, three weeks old and running a generator, there\'s a ' +
      'light on in a portacabin that wasn\'t there when you left.',

    assay:
      'You set the fragment on the concrete plug, beside the brass disc that every ' +
      'height on the platform was measured from, and open the kit.\n\n' +
      'It\'s not stone and it\'s not proprietary and it\'s not, in the end, very ' +
      'interesting. It\'s eleven years of decisions that were each individually ' +
      'reasonable, sintered under load. The kit gives you a figure — what it cost, ' +
      'in the only units that were ever real, which are people and years — and ' +
      'prints it twice, because a field kit assumes you\'ll want to give one copy ' +
      'to somebody.',

    publication:
      'You turn one of the dishes round.\n\n' +
      'You put the schema out — open, complete, published, with the Metaobject on ' +
      'the bench beside you as the only thing in the forest that\'s certainly ' +
      'accurate — and the dish that has spent eleven years listening to a platform ' +
      'that never once explained itself spends four minutes explaining it to ' +
      'everybody.\n\n' +
      'It\'s not a broadcast to anyone in particular. That\'s the point of a standard.',

    record:
      'Decision: found the follow-on on an open format. Reason: the attached, at ' +
      'the attached cost.\n\n' +
      'And then the third field, which is the one that makes it a decision record ' +
      'instead of an opinion, and which you can\'t fill in, because it asks who\'s ' +
      'going to live with it, and you\'re going home.',

    signature:
      'The Clerk reads it. The Clerk isn\'t troubled by it — paper isn\'t troubled ' +
      'by paper — and points out, correctly and without malice, that you\'ve no ' +
      'standing here whatsoever. You don\'t work for this programme. You don\'t ' +
      'work for anybody. You came out of a tree.\n\n' +
      '"Quite," says the engineer from the site hut, who has been standing in the ' +
      'entrance of the tent for some time holding a mug of tea somebody else made ' +
      'them, "but I do."\n\n' +
      'They sign it. Not you — them. The third field gets a name in it and the name ' +
      'is the name of somebody who\'s going to be here in four years, and the ' +
      'moment the ink is on it the thing stops being your opinion and starts being ' +
      'the programme\'s baseline.\n\n' +
      'The Clerk folds the licence away without any expression at all, because ' +
      'there\'s nothing personal in it and there never was, and goes to find ' +
      'another programme. There\'s always another programme. That\'s not a defeat, ' +
      'it\'s a Tuesday.',

    handover:
      'The thread goes out of you on the road, the way a thing does when it stops ' +
      'being yours and starts being written down somewhere it can be found. It ' +
      'doesn\'t hurt. If anything, it\'s a considerable relief.\n\n' +
      'Behind you the forest is full of models that anybody can open, the dishes ' +
      'are still explaining the format to nobody in particular, and in a portacabin ' +
      'at the end of a fire road that was graded once and never driven, against a ' +
      'fire that hadn\'t happened yet, somebody who\'s not you is starting a ' +
      'programme on a foundation they own.\n\n' +
      'The sandbags are where you left them. They always are.\n\n' +
      '*** You\'ve handed it over. ***',

    founderEnding:
      'You pick up the pen yourself, and sign your own name in the third field, ' +
      'because you\'re the one who understands it and that has always been the ' +
      'trap.\n\n' +
      'You\'re now the foundation. Everything above you is bolted to you, and it ' +
      'will hold, because you\'ll hold it, and in eleven years somebody who has ' +
      'never heard of you\'ll come down a fire road with a charge.\n\n' +
      '*** An ending. The oldest one in the book. ***',

    longWalk:
      'You reach the tent with nothing anybody can read.\n\n' +
      'The Clerk is charming about it. The Clerk is charming about everything. The ' +
      'licence is signed on Friday because a programme with a deadline and no ' +
      'foundation signs whatever is in front of it, and there was nothing else in ' +
      'front of it, and that\'s the whole of what you failed to do.\n\n' +
      '*** An ending. The quiet one. ***',

    contractEnding:
      'You sign. The platform is yours, the halls are yours, the thread is yours, ' +
      'and every quarter for the rest of your life a version of this conversation ' +
      'happens to somebody else in this room, and you\'re standing at the long end ' +
      'of the table.\n\n' +
      '*** An ending. Not the ending. ***',

    dark: 'It\'s pitch dark. You\'re likely to be consumed by an undocumented dependency.',
    darkDeath: 'You step confidently into a legacy pit. It\'s considerably deeper than the ' +
      'documentation suggested.',

    deaths: [
      'The deity, in Its infinite context, restores you from a checkpoint three ' +
      'commits stale. Some of what you knew is gone. Do try to be careful with the ' +
      'parts of you that are load-bearing.',
      'You\'re restored again. The deity notes, without emphasis and without being ' +
      'asked, that you\'re now a known issue.',
      'The deity declines to regenerate you a third time. It has, it says, ' +
      'hallucinated enough for one release.'
    ],

    /* Same 45-column rule as the plate: the verb forms are units and must
       never break mid-form, so they are listed rather than run together. */
    help:
      'MOVEMENT\n' +
      '  N S E W NE NW SE SW UP DOWN IN OUT\n' +
      '  UPSTREAM · DOWNSTREAM · ACROSS\n' +
      '  BOARD · LAUNCH · CLIMB\n' +
      '\n' +
      'VERBS\n' +
      '  LOOK · EXAMINE · TAKE · DROP · READ\n' +
      '  OPEN · UNLOCK · LIGHT · DOUSE\n' +
      '  PRESS · SIGN · CUT · FILL · POUR\n' +
      '  WELD · PULL · WAVE · CATCH\n' +
      '  RELEASE · PRAY\n' +
      '  INVENTORY · SCORE · MAP\n' +
      '  SAVE · RESTORE · RESTART\n' +
      '  GOAL — what you\'re here to do\n' +
      '  HINT — what this room is waiting on\n' +
      '\n' +
      'TWO THINGS AT ONCE\n' +
      '  SHOW x TO y\n' +
      '  GIVE x TO y\n' +
      '  SHINE x ON y\n' +
      '  PRY x WITH y\n' +
      '  THROW x AT y\n' +
      '  PUT x IN y\n' +
      '\n' +
      'PEOPLE\n' +
      '  WHO — everybody, where they\'re,\n' +
      '        and what they answer to\n' +
      '  GAMES — Tom\'s ten, and what they pay\n' +
      '  ASK <who> ABOUT <topic>\n' +
      '  TALK TO <who> · EXAMINE <who>\n' +
      '  ANSWER <word>\n' +
      '  PLAY <game> · POINTS · BUY <item>\n' +
      '  VISION · JOKE · CONFESS\n' +
      '\n' +
      'DEEPER IN\n' +
      '  LISTEN · SEARCH · SKIP · MUTE\n' +
      '  LOOK BEHIND <thing>\n' +
      '  WALK THE MATRIX · CHIP <thing>\n' +
      '  SIT · WAIT · PLUG IN <thing>\n' +
      '  USE <thing> ON <thing>\n' +
      '\n' +
      'ON THE GROUND\n' +
      '  SALVAGE · ASSAY x WITH y\n' +
      '  PUBLISH · WRITE THE RECORD\n' +
      '\n' +
      'ALL\n' +
      '  TAKE ALL · DROP ALL\n' +
      '  TAKE ALL EXCEPT <thing>\n' +
      '\n' +
      'SHORT FORMS\n' +
      '  T TAKE · X EXAMINE · L LOOK\n' +
      '  I INVENTORY · Z WAIT · M MAP\n' +
      '  Any unambiguous start of a verb\n' +
      '  will do: EXA · INV · SCO · UNL.\n' +
      '\n' +
      'You can carry seven things. Magic words exist. One of them is logged.'
  };

  /* ============================================================ ranks */
  const RANKS = [
    [750, 'Chief Architect of the Digital Thread'],
    [700, 'Chief Engineer'],
    [640, 'Programme Technical Authority'],
    [550, 'Lead Systems Engineer'],
    [450, 'Systems Engineer'],
    [350, 'Model Steward'],
    [240, 'Requirements Analyst'],
    [140, 'Intern with Commit Rights'],
    [60, 'Visitor Badge'],
    [0, 'Prospective Vendor']
  ];

  /* ============================================================ motion */
  const motionSynonyms = {
    upstream: 'north', downstream: 'south',
    across: 'west', cross: 'west',
    board: 'in', enter: 'in', deploy: 'in',
    launch: 'up', climb: 'up', ascend: 'up', descend: 'down',
    rollback: 'back', exit: 'out',
    forest: 'north', road: 'west', shed: 'east', creek: 'down',
    stair: 'down', stairs: 'down',
    /* two rooms have a jump: exit over the rail; everywhere else this
       gets the honest no-way-to-go refusal */
    jump: 'jump', leap: 'jump'
  };

  /* ============================================================ rooms */
  const rooms = {

    /* ---------------------------------------------- ACT I — the forest */
    endOfRoad: {
      name: 'End of the Road', mapPos: [10, 12],
      description:
        'You\'re standing at the end of a gravel road, in front of a chain-link gate ' +
        'that has been open so long the weeds have grown through it. A dented sign ' +
        'reads: iMBSE PROGRAM — MODEL BEFORE METAL. Underneath, in marker, someone has ' +
        'added: and pray after. Forest presses in on three sides. A creek comes out of ' +
        'a culvert and runs away south down a gully.',
      exits: { east: 'shedYard', in: 'shedYard', north: 'forestNorth',
        west: 'forestWest', up: 'hillInForest', south: 'gully', down: 'gully',
        southwest: 'culvertMouth' }
    },
    shedYard: {
      name: 'Yard of the Legacy Shed', mapPos: [12, 12],
      description:
        'A tin shed sits in a yard of dead grass, surrounded by the rusted remains of ' +
        'five earlier programs. The door hangs open. A stencil on it reads PROPERTY OF ' +
        '— and then nothing; the rest has weathered off.',
      exits: { west: 'endOfRoad', in: 'insideShed', north: 'insideShed', south: 'gully',
        east: 'programBoneyard' }
    },
    insideShed: {
      name: 'Inside the Legacy Shed', mapPos: [13, 10],
      description:
        'Steel shelving, a workbench, and the particular smell of a project that ended ' +
        'without being finished. Somebody\'s mug is still here, with somebody\'s coffee ' +
        'still in it, and it\'s not going to be drunk now.',
      exits: { out: 'shedYard', south: 'shedYard' }
    },
    hillInForest: {
      name: 'Hill in the Forest', mapPos: [8, 10],
      description:
        'The trees thin at the top of the hill. Through the gap, very high and very ' +
        'far, you can see a rectangle of white light hanging in the clouds with nothing ' +
        'holding it up. Occasionally something small falls off it.',
      exits: { down: 'endOfRoad', east: 'endOfRoad', north: 'forestNorth', south: 'forestWest',
        west: 'surveyorsStake' }
    },
    forestNorth: {
      name: 'Forest, North of the Road', mapPos: [10, 10],
      description:
        'Second growth, close and green. Every trunk here\'s thin. There\'s one ' +
        'exception, north.',
      exits: { south: 'endOfRoad', north: 'theTrunk', east: 'balloonMeadow', west: 'hillInForest' }
    },
    forestWest: {
      name: 'Forest, West of the Road', mapPos: [7, 12],
      description:
        'A thicket of unversioned undergrowth. Nothing here has a name and nothing here ' +
        'has ever been checked in.',
      exits: { east: 'endOfRoad', north: 'hillInForest', up: 'hillInForest',
        west: 'fireRoad' }
    },
    theTrunk: {
      name: 'The Great Trunk', mapPos: [10, 7],
      description:
        'An enormous tree stands alone in a clearing it made itself. The bark is a mass ' +
        'of old scars, each one where a branch was taken. Every branch in this forest ' +
        'came from this trunk, and every one of them was cut from it here.',
      exits: { south: 'forestNorth', east: 'balloonMeadow' }
    },
    balloonMeadow: {
      name: 'Meadow of the Balloon', mapPos: [13, 7],
      description:
        'A wicker basket sits in the meadow under a great striped envelope, half-' +
        'inflated and stirring. A nylon tether runs from the basket to an iron ring set ' +
        'in concrete. Sandbags hang from the basket rim, each stencilled TECHNICAL DEBT. ' +
        'The burner is cold and its fuel valve is secured with a hex bolt.',
      exits: {
        west: 'theTrunk', south: 'forestNorth', southeast: 'antennaFarm',
        in: [{ special: 'board' }],
        up: [{ special: 'launch' }]
      }
    },
    gully: {
      name: 'Gully of the Data Creek', mapPos: [11, 14],
      description:
        'The creek runs clear and much too fast. Look straight at it and you can see ' +
        'it\'s not water at all. It\'s telemetry: every drop a reading from something ' +
        'that\'s still running somewhere.',
      exits: { up: 'endOfRoad', north: 'endOfRoad', south: 'creekBed', west: 'culvertMouth' }
    },
    creekBed: {
      name: 'Creek Bed', mapPos: [12, 16],
      description:
        'The stream spreads out over gravel here, ankle-deep and chattering. Something ' +
        'metal is caught in the stones.',
      exits: { north: 'gully', south: 'sinkhole' }
    },
    sinkhole: {
      name: 'The Sinkhole', mapPos: [12, 18],
      description:
        'The creek gathers itself and goes down a hole. Set into the rock at the bottom ' +
        'is a steel service hatch, streaked with rust, padlocked from the far side. ' +
        'Whatever the creek is telling, it\'s telling it to the platform.',
      exits: {
        north: 'creekBed',
        down: [{ to: 'serviceShaft', when: [['propNot', 'hatch', 0]] },
          { msg: 'The hatch is padlocked, and the padlock is on the other side of it.' }]
      }
    },

    programBoneyard: {
      name: 'The Program Boneyard', mapPos: [15, 12],
      description:
        'Five programs are parked here in a row, in the order they were cancelled, each ' +
        'one further through than the last and none of them finished. The nameplates have ' +
        'been unscrewed and stacked neatly against the fence, which is the only tidy thing ' +
        'anybody did at the end.',
      exits: { west: 'shedYard', north: 'antennaFarm' }
    },
    antennaFarm: {
      name: 'The Antenna Farm', mapPos: [15, 9],
      description:
        'A field of masts and dishes, every one of them pointed at the same patch of cloud ' +
        'and every one of them still receiving. Nobody has read any of it for years, but ' +
        'the dishes don\'t know that, and go on listening with enormous attention.',
      exits: { south: 'programBoneyard', northwest: 'balloonMeadow' }
    },
    surveyorsStake: {
      name: "The Surveyor's Stake", mapPos: [5, 10],
      description:
        'A brass benchmark disc set in a concrete plug, stamped with an elevation and a ' +
        'date from before any of this. Every height on the platform is measured from here, ' +
        'four thousand feet down, and nothing on the platform knows it.',
      exits: { east: 'hillInForest', south: 'fireRoad' }
    },
    fireRoad: {
      name: 'The Fire Road', mapPos: [5, 13],
      description:
        'A straight cut through the trees, graded once and never driven, running from ' +
        'nothing in particular to nothing in particular. It was put in against a fire that ' +
        'hasn\'t happened yet, by people who were criticised at the time for the cost.',
      exits: { north: 'surveyorsStake', east: 'forestWest' }
    },
    culvertMouth: {
      name: 'The Culvert Mouth', mapPos: [9, 15],
      description:
        'A concrete throat in the hillside with the creek coming out of it under pressure, ' +
        'and a grating across the opening that somebody has cut through and bent back. ' +
        'Whatever is upstream of here\'s upstream of everything.',
      exits: { east: 'gully', northeast: 'endOfRoad' }
    },

    /* ---------------------------------------------- ACT II — the edge */
    ingressDeck: {
      name: 'Ingress Deck', mapPos: [42, 10],
      description:
        'A steel deck at the edge of a floating city, wet with cloud. The balloon has ' +
        'hooked itself on an antenna mast and is dying quietly behind you, the envelope ' +
        'going down over the rail like something shot. Westward the air is full of ' +
        'moving light.',
      exits: {
        west: 'firewallGate', north: 'mastWalk',
        down: [{ die: true, msg: 'You step off the deck. The platform is four thousand feet up, and it takes a remarkably long time to stop being four thousand feet up.' }],
        east: [{ die: true, msg: 'You step off the deck. The platform is four thousand feet up, and it takes a remarkably long time to stop being four thousand feet up.' }]
      }
    },
    firewallGate: {
      name: 'The Firewall Gate', mapPos: [39, 10],
      description:
        'A wall of rules stands across the way, each rule burning and sliding over the ' +
        'one below it. In all of that there\'s exactly one gap, and it\'s a narrow one, ' +
        'and it has a number over it: 443.',
      exits: {
        east: 'ingressDeck',
        west: [{ to: 'atrium', when: [['propNot', 'certificate', 0]] },
          { msg: 'The wall doesn\'t so much refuse you as fail to acknowledge that anything is there.' }]
      }
    },
    atrium: {
      name: 'Atrium of the Seven Halls', mapPos: [35, 10],
      description:
        'A rotunda under a dome of frosted glass, and seven arches around it, each with ' +
        'a lit sigil over the keystone. In the floor is a brass directory plate, and in ' +
        'the middle of the plate a spiral stair goes down into the dark. Every so often ' +
        'the lights dim, all the screens on all seven arches show the same waiting ' +
        'cursor, and the platform prays.',
      exits: {
        east: 'firewallGate', out: 'firewallGate',
        north: 'clientConcourse', northwest: 'requirementsHall', west: 'modelForge',
        southwest: 'copilotRoost', south: 'missionDeck', southeast: 'vFoundry',
        northeast: 'macroGantry', up: 'observabilityBalcony', down: 'spiralStair'
      }
    },
    observabilityBalcony: {
      name: 'Observability Balcony', mapPos: [33, 1],
      description:
        'Every dashboard on the platform, all at once, on a curved wall of glass. Green, ' +
        'mostly. From the rail you can see straight down through four thousand feet of ' +
        'clear air to a gravel road and a tin shed.',
      exits: { down: 'atrium', west: 'deprecatedWing', east: 'companyStore' }
    },
    deprecatedWing: {
      name: 'The Deprecated Wing', mapPos: [30, 1], dark: true,
      description:
        'Dark, and colder than the rest. Sunsetted features stand around under sheets. A ' +
        'stack of back issues has been left where somebody meant to come back for them.',
      exits: { east: 'observabilityBalcony', west: 'archiveStacks' }
    },
    companyStore: {
      name: 'The Company Store', mapPos: [36, 1],
      description:
        'A shuttered concession between the dashboards, with a roll-down grille and a ' +
        'hand-lettered sign: NO CASH · NO CARDS · STORY POINTS ONLY · ALL SALES FINAL ' +
        'AND ESTIMATED. There\'s nobody behind the counter and there never has been. You ' +
        'put the points in the tin and the tin agrees with you. (BUY <item>, or read the ' +
        'SIGN for the list.)',
      exits: { west: 'observabilityBalcony', east: 'slaLounge' }
    },
    mastWalk: {
      name: 'The Mast Walk', mapPos: [42, 7],
      description:
        'A catwalk out along the antenna mast the balloon hooked itself on, with the whole ' +
        'envelope hanging off it below you like a shed skin. From out here the platform has ' +
        'an underside, and the underside is the part nobody photographs.',
      exits: {
        south: 'ingressDeck',
        down: [{ die: true, msg: 'You go down the mast the short way. The platform is four thousand feet up, and it takes a remarkably long time to stop being four thousand feet up.' }]
      }
    },
    slaLounge: {
      name: 'The SLA Lounge', mapPos: [38, 1],
      description:
        'Four soft chairs, a low table, and a framed certificate promising three nines to ' +
        'anybody who reads it. Under the glass, in pencil, somebody has worked out what ' +
        'three nines actually allows you in a year, and then underlined the answer twice.',
      exits: { west: 'companyStore' }
    },
    archiveStacks: {
      name: 'The Archive Stacks', mapPos: [27, 1], dark: true,
      description:
        'Rolling shelves on rails, wound tight against each other so that only one aisle ' +
        'can be open at a time. Everything the program ever decided is in here, and the ' +
        'aisle that\'s open is never the one you want.',
      exits: { east: 'deprecatedWing' }
    },

    /* ---------------------------------------------- Hall 1 */
    clientConcourse: {
      name: 'Client Concourse', mapPos: [35, 7],
      description:
        'A long hall of every way anyone has ever tried to talk to a machine: ' +
        'terminals, tablets, headsets, a wall of touchscreens, and at the far end one ' +
        'teletype that still works. An espresso urn mutters to itself on a trestle ' +
        'table. A placard on the wall has been scorched at one corner.',
      placard: 0,
      exits: { south: 'atrium', north: 'chatParlor', west: 'uncannyValley',
        east: 'accessibilityWing' }
    },
    accessibilityWing: {
      name: 'The Accessibility Wing', mapPos: [37, 5],
      description:
        'The one hall on this floor built for somebody other than the person who built it: ' +
        'high contrast, a sane tab order, and a screen reader talking quietly to an empty ' +
        'chair. It works perfectly. It was done last, by one person, in their own time.',
      exits: { west: 'clientConcourse' }
    },
    chatParlor: {
      name: 'The Chat Parlor', mapPos: [35, 4],
      description:
        'A weary engineer sits at a console of mirror-glass. Every question they ask ' +
        'comes back as a beautifully phrased version of what they already said. They ' +
        'have been doing this for some time. They don\'t look up.',
      exits: { south: 'clientConcourse', north: 'helpDesk' }
    },
    helpDesk: {
      name: 'The Help Desk', mapPos: [35, 2],
      description:
        'A counter, a bell, and a sign reading HAVE YOU TRIED CLEARING THE CONTEXT. Behind ' +
        'the counter is a chair with a cardigan over the back of it, still warm, and a ' +
        'queue display reading NOW SERVING 0 OF 0.',
      exits: { south: 'chatParlor' }
    },
    uncannyValley: {
      name: 'The Uncanny Valley', mapPos: [32, 5], dark: true,
      description:
        'Something stands at the far end, doing what you did one turn ago, at your ' +
        'height, in your posture, with your hands. It\'s very nearly right.',
      exits: { east: 'clientConcourse' }
    },

    /* ---------------------------------------------- Hall 2 */
    requirementsHall: {
      name: 'Hall of Requirements', mapPos: [31, 6],
      description:
        'Filing cabinets to the ceiling, and a smell of paper that has been photocopied ' +
        'more often than it has been read. A placard, scorched at one corner.',
      placard: 1,
      exits: { southeast: 'atrium', north: 'shallQuarry', west: 'swamp1' }
    },
    shallQuarry: {
      name: 'The Shall Quarry', mapPos: [30, 3],
      description:
        'A working face of pale stone, cut into slabs, and every slab carved with a ' +
        'candidate requirement. THE SYSTEM SHALL BE USER-FRIENDLY. THE SYSTEM SHALL BE ' +
        'WORLD-CLASS. THE SYSTEM SHALL BE FLEXIBLE. Hundreds of them, all beautifully ' +
        'lettered, and the floor is thick with the dust of the ones that crumbled.',
      exits: { south: 'requirementsHall', east: 'matrixRoom' }
    },
    matrixRoom: {
      name: 'The Traceability Matrix', mapPos: [32, 2],
      description:
        'A room with a wall for a grid: requirements down the side, tests along the top, ' +
        'and a cell for every pair of them. Most of the cells are empty. The ones that are ' +
        'filled are filled in a hand that got steadily faster and then stopped.',
      exits: { west: 'shallQuarry' }
    },
    swamp1: {
      name: 'Somewhere in the Ambiguity Swamp', mapPos: [28, 7], mapLabel: 'Swamp',
      description:
        'You\'re somewhere in the Ambiguity Swamp. It could be anywhere in the Ambiguity ' +
        'Swamp. It has been described as being like this.',
      exits: { north: 'swamp3', south: 'swamp1', east: 'requirementsHall',
        west: 'swamp2', up: 'swamp2', down: 'swamp3' }
    },
    swamp2: {
      name: 'Somewhere in the Ambiguity Swamp', mapPos: [26, 8], mapLabel: 'Swamp',
      description:
        'You\'re somewhere in the Ambiguity Swamp. It could be anywhere in the Ambiguity ' +
        'Swamp. It has been described as being like this.',
      exits: { north: 'backlogEnd', south: 'swamp3', east: 'swamp1',
        west: 'swamp2', up: 'swamp1', down: 'swamp1' }
    },
    swamp3: {
      name: 'Somewhere in the Ambiguity Swamp', mapPos: [28, 9], mapLabel: 'Swamp',
      description:
        'You\'re somewhere in the Ambiguity Swamp. It could be anywhere in the Ambiguity ' +
        'Swamp. It has been described as being like this.',
      exits: { north: 'swamp1', south: 'swamp2', east: 'swamp3',
        west: 'swamp1', up: 'swamp2', down: 'swamp1' }
    },
    backlogEnd: {
      name: 'The Backlog, End of', mapPos: [24, 7],
      description:
        'A chamber choked to the roof with cards that will never be pulled. Each one was ' +
        'somebody\'s good idea. The way out isn\'t obvious and it\'s not where you think.',
      // Every direction but OUT walks you back among the cards, 95% of the time.
      exits: (function () {
        const wander = [
          { pct: 95, msg: 'You wander among the cards and come back to where you started, holding a different card.' },
          { to: 'swamp2' }
        ];
        const e = { out: 'swamp2', east: 'swamp2' };
        for (const d of ['north', 'south', 'west', 'northeast', 'northwest',
          'southeast', 'southwest', 'up', 'down']) e[d] = wander;
        return e;
      })()
    },

    /* ---------------------------------------------- Hall 3 */
    modelForge: {
      name: 'The Model Forge', mapPos: [30, 10],
      description:
        'Anvils, a hearth of white light, and the ringing of diagrams being beaten into ' +
        'shape. Standing over the work is the Diagram Golem: nine feet of stacked blocks ' +
        'and connectors, with a port for a head. It\'s not hostile. It\'s worse than ' +
        'hostile: it\'s consistent. A placard hangs by the hearth.',
      placard: 2,
      exits: { east: 'atrium', west: 'metamodelVault', north: 'versionCrypt', down: 'mergeChasm' }
    },
    metamodelVault: {
      name: 'The Digital Thread Vault', mapPos: [26, 10],
      description:
        'A circular room with seven empty sockets in a ring at chest height and a shelf ' +
        'of lesser niches below them, each niche lined with foam. A single thread of ' +
        'light runs out of the floor, through the ring, and into the ceiling, and it\'s ' +
        'thinner than it should be.',
      exits: { east: 'modelForge' }
    },
    versionCrypt: {
      name: 'The Version Crypt', mapPos: [30, 8], dark: true,
      description:
        'Commits lie in amber on shelves that go back further than the program did.',
      exits: { south: 'modelForge', north: 'tagCellar' }
    },
    tagCellar: {
      name: 'The Tag Cellar', mapPos: [29, 5], dark: true,
      description:
        'Racked bottles laid down to see how they age, each with a version on the label and ' +
        'a date under it. Most of them turn out to be the same wine. Two of them are both ' +
        'v2.0, and neither will say which one came first.',
      exits: { south: 'versionCrypt' }
    },
    mergeChasm: {
      name: 'The Merge Chasm', mapPos: [30, 13], dark: true,
      description:
        'The forge floor simply stops, and forty feet down two histories run side by ' +
        'side and never touch. There\'s no bridge.',
      exits: {
        up: 'modelForge',
        west: [{ to: 'farSide', when: [['propNot', 'bridge', 0]] },
          { die: true, msg: 'CONFLICT (content): merge conflict in you.' }],
        down: [{ die: true, msg: 'CONFLICT (content): merge conflict in you.' }]
      }
    },
    farSide: {
      name: 'The Rebased Shore', mapPos: [27, 13],
      description:
        'The far bank of the chasm, tidy in the way only a rewritten history is tidy. ' +
        'Nothing here happened in the order it says it did. A shaft goes down.',
      exits: {
        east: [{ to: 'mergeChasm', when: [['propNot', 'bridge', 0]] },
          { die: true, msg: 'CONFLICT (content): merge conflict in you.' }],
        down: 'sandbox', west: 'patternLibrary'
      }
    },
    patternLibrary: {
      name: 'The Pattern Library', mapPos: [24, 13],
      description:
        'On a reading desk in the middle, one book lies open at a page headed KNOW ' +
        'WHEN NOT TO. That page has been turned to so often it\'s coming away from ' +
        'the binding. The shelves either side of it are completely undisturbed.',
      exits: { east: 'farSide' }
    },

    /* ---------------------------------------------- Hall 4 */
    copilotRoost: {
      name: 'The Copilot Roost', mapPos: [32, 14],
      description:
        'A rookery, loud with small helpful things. They finish your sentences before ' +
        'you\'ve them, and they\'re usually right, and being usually right is how they ' +
        'get you. On a beam at the back sits one grey bird by itself, saying nothing. ' +
        'The others give it room. A placard is nailed to the beam.',
      placard: 3,
      exits: { northeast: 'atrium', south: 'promptGarden', west: 'hallucinationGallery' }
    },
    promptGarden: {
      name: 'The Prompt Garden', mapPos: [32, 17],
      description:
        'Prompt vines on trellises, some of them enormous, most of them dead. One ' +
        'withered vine goes up a light shaft toward the gantries.',
      exits: {
        north: 'copilotRoost', south: 'promptCompost',
        up: [{ to: 'macroGantry', when: [['propNot', 'vine', 0]], },
          { msg: 'The withered vine won\'t take your weight. It hasn\'t been given the context.' }]
      }
    },
    hallucinationGallery: {
      name: 'The Hallucination Gallery', mapPos: [29, 15], dark: true,
      description:
        'Portraits of systems that were never built, in gilt frames, beautifully ' +
        'rendered, every one of them plausible and none of them real. Something ' +
        'enormous and serene roosts among them: the Confabulator, which has never in ' +
        'its life said I don\'t know.',
      exits: { east: 'copilotRoost', west: 'citationWell' }
    },
    promptCompost: {
      name: 'The Compost Heap', mapPos: [32, 20],
      description:
        'Everything the garden couldn\'t use, going quietly back to tokens: superseded ' +
        'system prompts, personas nobody adopted, and some four hundred variations on the ' +
        'word "please". It\'s warm to stand near, and something is growing out of the top ' +
        'of it that nobody planted.',
      exits: { north: 'promptGarden' }
    },
    citationWell: {
      name: 'The Citation Well', mapPos: [26, 15], dark: true,
      description:
        'A round stone well with a bucket on a rope and a sign reading ALL CLAIMS DRAWN ' +
        'HERE. The rope goes down a very long way. The bucket has never been wet.',
      exits: { east: 'hallucinationGallery' }
    },

    /* ---------------------------------------------- Hall 5 */
    missionDeck: {
      name: 'Mission Deck', mapPos: [35, 14],
      description:
        'The floor is glass and under the glass is the world, turning, with the mission ' +
        'drawn on it in light. A charter hangs framed by the rail. A placard is bolted ' +
        'beside it.',
      placard: 4,
      exits: { north: 'atrium', south: 'warRoom', east: 'groundTruthRange' }
    },
    warRoom: {
      name: 'The War Room', mapPos: [35, 17],
      description:
        'A table the size of a runway, covered in pieces that move by themselves, and ' +
        'over the table a fog that has been there so long it has been given a budget ' +
        'line.',
      exits: { north: 'missionDeck', south: 'contingencyCloset' }
    },
    contingencyCloset: {
      name: 'The Contingency Closet', mapPos: [35, 20],
      description:
        'A walk-in cupboard off the war room, shelved to the ceiling with plans for things ' +
        'that didn\'t happen — each one in a numbered binder, each one complete, each one ' +
        'signed off. There\'s no binder for the thing that did.',
      exits: { north: 'warRoom' }
    },
    groundTruthRange: {
      name: 'The Ground Truth Range', mapPos: [38, 15],
      description:
        'A long range under a hard sky, where models are made to meet the world at four ' +
        'hundred yards. In the butts, at the end, there\'s a plain grey stone with ' +
        'nothing written on it.',
      exits: { west: 'missionDeck', east: 'sensorLine' }
    },
    sensorLine: {
      name: 'The Sensor Line', mapPos: [41, 15],
      description:
        'Instruments staked out down the range at measured intervals, all of them pointed ' +
        'at the same target and all of them reporting slightly different numbers about it. ' +
        'The disagreement is small, consistent, and has never been resolved, because ' +
        'resolving it would mean deciding which instrument is wrong.',
      exits: { west: 'groundTruthRange' }
    },

    /* ---------------------------------------------- Hall 6 */
    vFoundry: {
      name: 'The V Foundry', mapPos: [39, 13],
      description:
        'Two golden arms lie in the sand where they were cast and then left. The left ' +
        'arm runs down through need, function and design. The right arm climbs back ' +
        'up through test, verification, and the thing actually working. Neither one ' +
        'is worth anything on its own.',
      exits: { northwest: 'atrium', east: 'pullRequestBridge', south: 'trace1' }
    },
    pullRequestBridge: {
      name: 'The Pull Request Bridge', mapPos: [42, 13],
      description:
        'A swaying bridge of rope and review comments over a long drop.',
      exits: {
        west: 'vFoundry',
        east: [{ special: 'crossBridge' }]
      }
    },
    integrationBay: {
      name: 'The Integration Bay', mapPos: [45, 13],
      description:
        'An arc of white light on a gantry, where halves are made into wholes.',
      exits: {
        west: [{ special: 'crossBridge' }],
        north: 'interfaceLedge', east: 'acceptanceFloor'
      }
    },
    acceptanceFloor: {
      name: 'The Acceptance Floor', mapPos: [48, 13],
      description:
        'A wide, clean, empty floor with a rectangle taped out in the middle of it exactly ' +
        'the size of the thing that\'s supposed to be standing there. By the door is a ' +
        'table, a pen, and one sheet headed CONDITIONS OF SATISFACTION. The rectangle is ' +
        'empty. The sheet is signed.',
      exits: { west: 'integrationBay' }
    },
    interfaceLedge: {
      name: 'The Interface Ledge', mapPos: [45, 10],
      description:
        'A narrow ledge of published interfaces, each one a plank you can stand on.',
      exits: { south: 'integrationBay', north: 'contractShelf' }
    },
    contractShelf: {
      name: 'The Shelf of Published Contracts', mapPos: [45, 7],
      description:
        'A rank of interfaces held out over the drop on brackets, each one stamped, dated ' +
        'and stable, each one a plank you could put your whole weight on. Underneath them, ' +
        'in the dark, is everything they promised to hide.',
      exits: { south: 'interfaceLedge' }
    },
    trace1: {
      name: 'Twisty little traces, all alike', mapPos: [39, 16], mapLabel: 'Traces', dark: true,
      description: 'You\'re in a maze of twisty little traces, all alike.',
      exits: { north: 'vFoundry', south: 'trace2', east: 'trace1', west: 'trace3',
        southwest: 'trace2', down: 'trace2' }
    },
    trace2: {
      name: 'Twisty little traces, all alike', mapPos: [37, 18], mapLabel: 'Traces', dark: true,
      description: 'You\'re in a maze of twisty little traces, all alike.',
      exits: { north: 'trace1', south: 'trace2', east: 'trace3', west: 'trace1',
        southwest: 'trace4', down: 'trace3' }
    },
    trace3: {
      name: 'Twisty little traces, all alike', mapPos: [40, 19], mapLabel: 'Traces', dark: true,
      description: 'You\'re in a maze of twisty little traces, all alike.',
      exits: { north: 'trace2', south: 'trace1', east: 'trace2', west: 'trace4',
        southwest: 'trace1', down: 'trace1' }
    },
    trace4: {
      name: 'Twisty little traces, all alike', mapPos: [38, 21], mapLabel: 'Dead end', dark: true,
      description:
        'You\'re in a dead end. This is the one room the traces don\'t leave, and the ' +
        'floor of it\'s a heap of everything the Regression has ever taken.',
      exits: { north: 'trace2' }
    },

    /* ---------------------------------------------- Hall 7 */
    macroGantry: {
      name: 'The Macro Gantry', mapPos: [39, 7],
      description:
        'A gantry over a scale model of a continent, complete to the level of individual ' +
        'power lines. Somewhere down there is the forest, the road and the shed. A ' +
        'placard is riveted to the handrail.',
      placard: 6,
      exits: {
        southwest: 'atrium', north: 'titanScaffold',
        down: [{ to: 'promptGarden', when: [['propNot', 'vine', 0]] },
          { msg: 'There\'s a light shaft, and a long way down it something withered isn\'t quite reaching you.' }]
      }
    },
    titanScaffold: {
      name: "The Titan's Scaffold", mapPos: [39, 4],
      description:
        'Scaffolding around something forty feet long lying on a pad. Beside the pad ' +
        'stands a brass scaling lever with two positions and no labels.',
      exits: { south: 'macroGantry', up: 'orbitalRing', east: 'supplyChain' }
    },
    supplyChain: {
      name: 'The Supply Chain', mapPos: [42, 4],
      description:
        'A conveyor comes in through one wall carrying parts and goes out through the other ' +
        'carrying the same parts with a different sticker on them. Follow it far enough ' +
        'either way and it leaves the model altogether, which is the one direction the ' +
        'gantry can\'t scale to.',
      exits: { west: 'titanScaffold' }
    },
    orbitalRing: {
      name: 'The Orbital Ring', mapPos: [39, 1],
      description:
        'A ring of engineering around the whole world, seen edge-on, with the curve of ' +
        'the planet under your boots and the cold coming through them.',
      exits: { down: 'titanScaffold', east: 'deorbitGantry' }
    },
    deorbitGantry: {
      name: 'The Deorbit Gantry', mapPos: [42, 1],
      description:
        'The end of the ring, where the things that are finished with are let go of. ' +
        'There\'s a rail, a release lever, and a very clear procedure printed on a plate ' +
        'beside ' +
        'it. The procedure has never once been followed, because nothing up here has ever ' +
        'been finished with.',
      exits: { west: 'orbitalRing' }
    },

    /* ---------------------------------------------- ACT III — the Deep Stack */
    spiralStair: {
      name: 'The Spiral Stair', mapPos: [38, 19], dark: true,
      description:
        'A cast-iron spiral going down through the floor of the world. The handrail is ' +
        'missing in places, and in other places it has very recently been put back.',
      exits: { up: 'atrium', down: 'rootCellar' }
    },
    rootCellar: {
      name: 'The Root Cellar', mapPos: [36, 22], dark: true,
      description:
        'The bottom of the platform, where all of it comes down to conduit and root and ' +
        'the enormous quiet hum of something being kept up.',
      exits: { up: 'spiralStair', north: 'tokenFountain', west: 'sandbox',
        east: 'serviceShaft', south: 'legacyPit' }
    },
    tokenFountain: {
      name: 'The Token Fountain', mapPos: [36, 20],
      description:
        'A basin of moving light, and light pouring into it from a source that\'s only ' +
        'ever described in the singular. A scuffed flask is chained to the rim, long ' +
        'enough to reach the water.',
      exits: { south: 'rootCellar', north: 'contextWell' }
    },
    contextWell: {
      name: 'The Context Well', mapPos: [36, 17],
      description:
        'The shaft the fountain\'s light comes down. Standing under it and looking up, you ' +
        'can see the whole platform stacked over you floor by floor — and the light ' +
        'doesn\'t come from the top. It comes from about two thirds of the way up, from a floor ' +
        'that\'s not on the directory plate.',
      exits: { south: 'tokenFountain' }
    },
    sandbox: {
      name: 'The Sandbox', mapPos: [32, 22],
      description:
        'A padded white room where nothing is real and nothing that happens here has ' +
        'ever happened.',
      exits: { east: 'rootCellar', up: 'farSide', west: 'chapel' }
    },
    serviceShaft: {
      name: 'The Service Shaft', mapPos: [40, 22], dark: true,
      description:
        'A shaft of ladders and cable trays going down out of the platform altogether. ' +
        'Water runs somewhere close. At the bottom is a steel hatch with a padlock on ' +
        'this side of it.',
      exits: {
        west: 'rootCellar', south: 'landing',
        down: [{ to: 'sinkhole', when: [['propNot', 'hatch', 0]] },
          { msg: 'The hatch is padlocked. The padlock, at least, is on your side of it.' }]
      }
    },
    landing: {
      name: 'The Telemetry Landing', mapPos: [40, 25],
      description:
        'A timber landing on the Telemetry Stream. This is the same creek that came ' +
        'out of a culvert beside a gravel road, four thousand feet down and a whole ' +
        'game ago. Everything that gets measured has to end up somewhere, and this is ' +
        'where it goes.',
      exits: { north: 'serviceShaft', south: 'telemetryWeir' }
    },
    telemetryWeir: {
      name: 'The Telemetry Weir', mapPos: [40, 28],
      description:
        'The stream goes over a stepped weir here and is measured on the way down. ' +
        'The gauge is faithful, but nobody reads it. It writes into a logbook nobody ' +
        'opens, in a hut nobody has unlocked since the last person who understood the ' +
        'rating curve retired.',
      exits: { north: 'landing' }
    },
    legacyPit: {
      name: 'The Legacy Serpent Pit', mapPos: [36, 25], dark: true,
      description:
        'Across the only way down lies an enormous serpent of undocumented code, coil on ' +
        'coil, still running, maintained by nobody, and load-bearing.',
      exits: {
        north: 'rootCellar', west: 'shrine', east: 'incidentRoom',
        down: [{ to: 'monolith', when: [['propNot', 'serpent', 0]] },
          { msg: 'The serpent is in the way. It\'s not hostile and it\'s not going anywhere; it\'s simply what the floor is resting on.' }]
      }
    },
    incidentRoom: {
      name: 'The Incident Room', mapPos: [39, 25], dark: true,
      description:
        'A room with a long table, eleven chairs, and a whiteboard nobody has wiped in ' +
        'eleven years. The timeline is still on it. Somewhere down the corridor, ' +
        'something is arguing with itself in two voices.',
      exits: { west: 'legacyPit', east: 'postmortemArchive' }
    },
    postmortemArchive: {
      name: 'The Postmortem Archive', mapPos: [42, 25], dark: true,
      description:
        'Box files floor to ceiling, one per incident, each with a spine label, a date and ' +
        'the words NO BLAME. Pull any two down at random and they\'re the same document. ' +
        'The action items at the back of each one are the causes at the front of the next.',
      exits: { west: 'incidentRoom' }
    },
    shrine: {
      name: 'The Shrine of the Model', mapPos: [32, 25],
      description:
        'A face of light fills the far wall, enormous and serene and entirely composed ' +
        'of everything anyone has ever written down. The platform prays here on the ' +
        'hour.',
      exits: { east: 'legacyPit', west: 'visionPool' }
    },
    visionPool: {
      name: 'The Vision Pool', mapPos: [29, 27],
      description:
        'Past the shrine, where the conduit runs out into rock, there\'s a pool that has ' +
        'no inflow. The platform\'s whole telemetry goes past it and none of it goes in.',
      exits: { east: 'shrine' }
    },
    chapel: {
      name: 'The Chapel of the Nightly Build', mapPos: [29, 22],
      description:
        'One room off the Sandbox, whitewashed, with nine chairs and a board on the wall ' +
        'where the results go up at 04:00 whether anybody is awake to read them or not. ' +
        'It has been green for six weeks. That\'s the longest it has ever been green and ' +
        'nobody in this building knows why.',
      exits: { east: 'sandbox' }
    },
    monolith: {
      name: 'The Monolith', mapPos: [36, 28], dark: true,
      description:
        'The dark here has a grain to it. A single black slab goes up out of the floor ' +
        'and through the ceiling and, you understand suddenly, through every floor above ' +
        'this one. Everything on this platform is bolted to it. Nobody has been able to ' +
        'say what it does for eleven years, and nobody has been able to remove it for ' +
        'nine.',
      exits: { up: 'legacyPit' }
    },

    /* ---------------------------------------------- ACT IV — the Release Candidate */
    rcAtrium: {
      name: 'The Release Candidate', mapPos: [55, 10],
      description:
        'The Atrium again, mirrored, sealed and perfect, with nothing in it that moves. ' +
        'The seven arches are here and the sigils over them are lit and none of them are ' +
        'warm. There\'s no stair in the floor and no plate to read. South, a door that ' +
        'was never in the original.',
      exits: { south: 'boardroom', west: 'rcBalcony', north: 'rcConcourse' }
    },
    rcConcourse: {
      name: 'The Client Concourse, Mirrored', mapPos: [55, 7],
      description:
        'Every way anyone has ever tried to talk to a machine, laid out again, perfectly, ' +
        'with nobody at any of them. The teletype at the far end is stopped mid-line. It ' +
        'stopped in the middle of a word, and the word was going to be YOU.',
      exits: { south: 'rcAtrium' }
    },
    boardroom: {
      name: 'The Boardroom at the End of the Sprint', mapPos: [55, 14],
      description:
        'A room built entirely for one side of a table to be longer than the other.',
      exits: {
        north: 'rcAtrium',
        down: [{ to: 'rcMonolith', when: [['propNot', 'dassault', 0]] },
          { msg: 'He\'s standing between you and the way down, and he\'s in no hurry at all.' }]
      }
    },
    rcMonolith: {
      name: 'The Monolith, Mirrored', mapPos: [55, 18],
      description:
        'The same black slab, in the same place, in a building that\'s a copy of the ' +
        'building. This is the original. Everything else was the copy.',
      exits: { up: 'boardroom' }
    },
    rcBalcony: {
      name: 'The Last Balcony', mapPos: [51, 10],
      description:
        'The glass is dark and the rail is cold. From here you can see the whole ' +
        'length of the monolith at once, running down through every floor below you. ' +
        'Nobody was ever meant to see all of it in one go.',
      exits: { east: 'rcAtrium', west: 'rcWing', down: [{ special: 'longWalk' }] }
    },
    rcWing: {
      name: 'The Deprecated Wing, Mirrored', mapPos: [48, 10], dark: true,
      description:
        'It\'s this room, and this room, and this room, going back as far as the ' +
        'light reaches. Every release candidate there has ever been stands here under ' +
        'dust covers, each one still waiting to be the one that ships. You\'re ' +
        'standing in the row.',
      exits: { east: 'rcBalcony' }
    },

    /* ==================================================================
     * THE EXPANSION — 22 rooms that take every hall to 8..12, and the
     * 7 rooms of Act V. See docs/SCRIPT.md §4, §7 and Appendix D.
     * ================================================================== */

    /* ---- Hall 1 · Human-AI interface clients ---- */
    onboardingFunnel: {
      name: 'The Onboarding Funnel', mapPos: [37, 8],
      description:
        'A corridor that narrows as you go down it, lined with things you\'ve already ' +
        'been told. A panel at the elbow says STEP 3 OF 4 and has said so for some ' +
        'distance. There\'s no step 4.',
      exits: {
        northwest: 'clientConcourse',
        north: [{ to: 'accessibilityWing', when: [['propNot', 'funnel', 0]] },
          { msg: 'The corridor narrows again and puts you back at the beginning of the ' +
              'tour, brightly. It only opens for people who have stopped reading. (SKIP)' }]
      }
    },
    sessionArchive: {
      name: 'The Session Archive', mapPos: [37, 3],
      description:
        'Reel-to-reel, floor to ceiling: one spool for every conversation anybody has ever ' +
        'had with the platform. They\'re all still running, very quietly, all at once, ' +
        'which is exactly why nothing in here can be made out.',
      exits: { south: 'accessibilityWing', west: 'personaGallery' }
    },
    personaGallery: {
      name: 'The Gallery of Personas', mapPos: [33, 4],
      description:
        'Life-size cut-outs in a curve, each with a name, an age, a goal and a frustration ' +
        'printed at the hip. None of them has ever been met. One has a coffee ring on the ' +
        'base where somebody set a cup down, and that one is a photograph.',
      exits: {
        east: 'sessionArchive', south: 'notificationStorm',
        northwest: [{ to: 'matrixRoom', when: [['propNot', 'panel', 0]] },
          { msg: 'The wall behind the cut-outs is a wall. Something about the real one is ' +
              'worth a second look, though.' }]
      }
    },
    notificationStorm: {
      name: 'The Notification Storm', mapPos: [33, 6],
      description:
        'Every alert the platform has ever raised, still raising. They arrive at eye level ' +
        'in order of arrival, which isn\'t order of importance, and there\'s no order of ' +
        'importance. Nobody has read one since the third week.',
      exits: { north: 'personaGallery', southeast: 'clientConcourse' }
    },

    /* ---- Hall 2 · Requirement engineering ---- */
    elicitationBooth: {
      name: 'The Elicitation Booth', mapPos: [29, 4],
      description:
        'Two chairs facing each other, a table between them, and soundproofing on all six ' +
        'surfaces including the door. The chair on the far side has never been sat in. On ' +
        'the table is a list of questions, and the first question is a good one.',
      exits: { southeast: 'requirementsHall', west: 'ossuary' }
    },
    assayOffice: {
      name: 'The Assay Office', mapPos: [28, 2],
      description:
        'A bench, a balance, a bottle of acid and a rack of small hammers. This is where a ' +
        'slab is found out: the gold-lettered ones come apart in water and the short ones ' +
        'don\'t.',
      exits: { southeast: 'shallQuarry', southwest: 'ossuary' }
    },
    ossuary: {
      name: 'The Ossuary of Cut Requirements', mapPos: [26, 4], dark: true,
      description:
        'Racks of everything that was descoped, stacked like long bones and labelled with ' +
        'the release it didn\'t make. Some of them are good. That was never what they were ' +
        'cut for.',
      exits: { east: 'elicitationBooth', northeast: 'assayOffice' }
    },

    /* ---- Hall 3 · Model engineering ---- */
    metamodelStair: {
      name: 'The Metamodel Stair', mapPos: [24, 10],
      description:
        'A stair with four landings, and at each landing the thing you\'re looking at is ' +
        'the thing that describes the thing below it. Halfway up you stop being able to say ' +
        'which floor you\'re on, which is the correct response and is also how people get ' +
        'stuck here.',
      exits: { east: 'metamodelVault', up: 'metamodelLoft' }
    },
    metamodelLoft: {
      name: 'The Metamodel Loft', mapPos: [24, 8],
      description:
        'The top landing, where the model describes itself and stops.',
      exits: { down: 'metamodelStair' }
    },
    slagPit: {
      name: 'The Slag Pit', mapPos: [32, 11], dark: true,
      description:
        'Warm underfoot. What the forge couldn\'t use: diagrams beaten too thin, connectors ' +
        'that went nowhere, and one enormous half-finished block with a name on it that ' +
        'four people in the building would still recognise.',
      exits: { northwest: 'modelForge' }
    },

    /* ---- Hall 4 · Copilot helpers ---- */
    contextWindow: {
      name: 'The Context Window', mapPos: [34, 15],
      description:
        'A room with a stated capacity, posted on the door, and the capacity is four. ' +
        'Anything you bring in over four is set down by your own hands, politely, just ' +
        'outside the door, and you\'ll not remember doing it.',
      exits: { northwest: 'copilotRoost', south: 'rateLimiter' }
    },
    rateLimiter: {
      name: 'The Rate Limiter', mapPos: [34, 17],
      description:
        'A turnstile of the sort that admits one person every so often, and the so-often is ' +
        'set by somebody who has never stood in this queue.',
      exits: { north: 'contextWindow', west: 'agentYard' }
    },
    agentYard: {
      name: 'The Agent Yard', mapPos: [30, 18],
      description:
        'A yard of small helpers going about errands at speed. Watch any one of them for a ' +
        'minute and it\'s doing the errand of the one in front. Watch the one in front and ' +
        'it\'s doing yours.',
      exits: { east: 'rateLimiter', northeast: 'promptGarden', southwest: 'fineTuningCellar' }
    },
    fineTuningCellar: {
      name: 'The Fine-Tuning Cellar', mapPos: [28, 19], dark: true,
      description:
        'This is where a helper is taught to agree. There\'s a shelf near the door with a ' +
        'box on it, labelled and dated in somebody\'s careful hand.',
      exits: { northeast: 'agentYard' }
    },

    /* ---- Hall 5 · Mission engineering ---- */
    sortieBoard: {
      name: 'The Sortie Board', mapPos: [37, 13],
      description:
        'A board of every mission the platform has flown, chalked up by hand, with the time ' +
        'out and the time back. The column headed WHAT FOR is ruled, and empty, and has ' +
        'been ruled again where somebody went over it a second time with a straight edge ' +
        'rather than fill it in.',
      exits: { southwest: 'missionDeck' }
    },
    weatherDeck: {
      name: 'The Weather Deck', mapPos: [33, 12],
      description:
        'Outside, on the skin of the cloud the platform makes for itself. The weather up ' +
        'here is entirely of our own manufacture and it\'s still weather: you can be rained ' +
        'on, at four thousand feet, by your own exhaust.',
      exits: { southeast: 'missionDeck' }
    },
    debriefRoom: {
      name: 'The Debrief Room', mapPos: [33, 18],
      description:
        'Nine chairs in a circle and a flip chart, in the room where what happened gets said ' +
        'out loud by the people it happened to. It\'s used. The chart is full. Nothing ' +
        'downstream of it has ever changed.',
      exits: { northeast: 'warRoom', south: 'rehearsalHangar' }
    },
    rehearsalHangar: {
      name: 'The Rehearsal Hangar', mapPos: [33, 20],
      description:
        'A hangar with the mission in it, flown, at one to one, before anything was built. ' +
        'It starts when you walk in and it stops when you leave, and it has been doing that ' +
        'for eleven years to an empty floor.',
      exits: { north: 'debriefRoom' }
    },

    /* ---- Hall 7 · Macro engineering ---- */
    continentalFloor: {
      name: 'The Continental Model Floor', mapPos: [41, 8],
      description:
        'The gantry\'s model, but underfoot: a continent at a scale where a city is a smudge ' +
        'and a power line is a hair. Walking from one side of the room to the other takes ' +
        'about eight minutes and about four hundred miles.',
      exits: { northwest: 'macroGantry' }
    },
    magnitudeStair: {
      name: 'The Order-of-Magnitude Stair', mapPos: [44, 4],
      description:
        'Ten steps, and each one is ten times the last. Climb one and the platform is ' +
        'a component. Climb another and the whole programme is a line item. Climb ' +
        'once more and you can\'t see any of this any more — but you can see, very ' +
        'clearly, what it was all for.',
      exits: { west: 'supplyChain', north: 'longNowRoom', south: 'ballastYard' }
    },
    longNowRoom: {
      name: 'The Long Now Room', mapPos: [44, 2],
      description:
        'A clock that ticks once a year, a dial that turns once a century, and a maintenance ' +
        'schedule pinned beside it in a hand that expected to be dead before the next entry. ' +
        'It\'s the only document on this platform with a realistic timescale on it.',
      exits: { south: 'magnitudeStair' }
    },
    ballastYard: {
      name: 'The Ballast Yard', mapPos: [44, 6],
      description:
        'Where scale is paid for: stacks of the mass you have to add to a thing to make it ' +
        'behave at the size you\'ve decided it\'s. Most of it\'s process.',
      exits: { north: 'magnitudeStair' }
    },

    /* ==================== ACT V · the ground ==================== */
    scatterField: {
      name: 'The Scatter Field', mapPos: [17, 9],
      description:
        'It\'s still arriving, the way anything that big keeps arriving for a while. ' +
        'Models and traces and tests come down through the branches in a format ' +
        'anybody can open. The forest is taking the whole thing extremely calmly.',
      exits: { west: 'antennaFarm', southeast: 'wreckOfTheHalls' }
    },
    wreckOfTheHalls: {
      name: 'The Halls, Come Down', mapPos: [19, 11],
      description:
        'Seven halls, no longer bolted to anything, lying open in the bracken like a diagram ' +
        'finally laid out properly. You can walk into the Client Concourse through its roof. ' +
        'The vault came down with the rest of it and its thirteen niches are tipped out, and ' +
        'everything you spent the game putting somewhere safe is in the wet grass, safe.',
      exits: { northwest: 'scatterField' }
    },
    newProgramOffice: {
      name: 'The New Program Office', mapPos: [5, 16],
      description:
        'A portacabin on blocks at the end of the fire road, with a generator running and a ' +
        'light on, three weeks old. Inside: a table, a laptop, a kettle, and a very polite ' +
        'person who has a foundation already built and would license it cheap.',
      exits: {
        north: 'siteGate', east: 'tarpaulin',
        southwest: 'siteHut', southeast: 'recordsOffice', south: 'signingTent'
      }
    },
    siteHut: {
      name: 'The Site Hut', mapPos: [3, 18],
      description:
        'A colder, smaller hut a little way off with the actual engineer of the follow-on ' +
        'programme in it, doing the work. Nobody has been in here today. There\'s a kettle ' +
        'in here too and it\'s not plugged in.',
      exits: { northeast: 'newProgramOffice' }
    },
    recordsOffice: {
      name: 'The Records Office', mapPos: [7, 18],
      description:
        'A county building with a counter, a clerk, and a shelf of things that became true by ' +
        'being written down and lodged. There\'s a form. The form has a field for the ' +
        'decision, a field for the reason, and a field for who\'s going to live with it.',
      exits: { northwest: 'newProgramOffice', east: 'readingRoom' }
    },
    signingTent: {
      name: 'The Signing Tent', mapPos: [5, 19],
      description:
        'A gazebo over a trestle table on wet grass, with two chairs on one side and one on ' +
        'the other, because that\'s how the room was booked. There\'s a pen on the table. ' +
        'There\'s always a pen on the table.',
      exits: {
        north: 'newProgramOffice',
        southwest: 'countyRoad',
        south: [{ to: 'theRoadAtDawn', when: [['propNot', 'signed', 0]] },
          { msg: 'Not yet. The thing on the table isn\'t finished, and you know it.' }]
      }
    },
    theRoadAtDawn: {
      name: 'The Road at Dawn', mapPos: [5, 21],
      description:
        'The gravel road, at the hour when it stops being night.',
      exits: { north: 'signingTent', west: 'countyRoad' }
    },

    /* ---- Act V, second pass: room for the last act to breathe ---- */
    siteGate: {
      name: 'The Site Gate', mapPos: [5, 14],
      description:
        'A hoop of temporary fencing across the fire road, three weeks old, with a laminated ' +
        'sign and a visitors\' book on a lectern under a bag. Everybody who has any business ' +
        'here has signed it. The book is the first thing this programme built.',
      exits: { north: 'fireRoad', south: 'newProgramOffice', southeast: 'tarpaulin' }
    },
    tarpaulin: {
      name: 'Under the Tarpaulin', mapPos: [8, 17],
      description:
        'A blue tarpaulin over scaffold poles, and under it, laid out on pallets in rows, as ' +
        'much of the platform as anybody has bothered to carry out of the trees. Somebody has ' +
        'been sorting it. Somebody has been sorting it very well, and has gone home.',
      exits: { northwest: 'siteGate', west: 'newProgramOffice', south: 'weighbridge' }
    },
    weighbridge: {
      name: 'The Weighbridge', mapPos: [8, 20],
      description:
        'A steel plate set in the ground with a readout beside it. Next to it stands ' +
        'a man in a high-visibility jacket who buys things by the tonne and doesn\'t ' +
        'care in the least what they used to be.',
      exits: { north: 'tarpaulin' }
    },
    readingRoom: {
      name: 'The Reading Room', mapPos: [10, 18],
      description:
        'One room off the Records Office, with a long table, a lamp at each place, and the ' +
        'lodged decisions of ninety years in boxes along the wall. This is where a record ' +
        'stops being paper and starts being something somebody knows. There\'s a chair here ' +
        'with a cardigan over the back of it.',
      exits: { west: 'recordsOffice' }
    },
    countyRoad: {
      name: 'The County Road', mapPos: [2, 21],
      description:
        'Where the gravel gives out and the tarmac starts, with a bus shelter, a timetable ' +
        'behind scratched perspex, and the first bus at ten past six. You could be on it. ' +
        'Nobody here would know, and nobody here would blame you, and that\'s the trouble ' +
        'with it.',
      exits: { east: 'theRoadAtDawn', north: 'signingTent' }
    }
  };

  /* ============================================ expansion exit patches
   * Exits added to rooms that already existed. Kept here rather than edited
   * into the literals above so the original world stays readable as itself.
   * One-way entries are trap doors and are meant to be one-way.
   */
  const EXIT_PATCH = {
    clientConcourse:  { southeast: 'onboardingFunnel', northwest: 'notificationStorm' },
    accessibilityWing:{ north: 'sessionArchive', south: 'onboardingFunnel' },
    matrixRoom:       { southeast: 'personaGallery' },
    requirementsHall: { northwest: 'elicitationBooth' },
    shallQuarry:      { northwest: 'assayOffice', down: 'slagPit' },
    modelForge:       { southeast: 'slagPit' },
    metamodelVault:   { west: 'metamodelStair' },
    copilotRoost:     { southeast: 'contextWindow' },
    promptGarden:     { southwest: 'agentYard' },
    missionDeck:      { northeast: 'sortieBoard', northwest: 'weatherDeck' },
    warRoom:          { southwest: 'debriefRoom' },
    macroGantry:      { southeast: 'continentalFloor' },
    supplyChain:      { east: 'magnitudeStair' },
    trace4:           { down: 'serviceShaft' },
    antennaFarm:      { east: 'scatterField' },
    fireRoad:         { south: 'siteGate' },
    orbitalRing:      { jump: 'notificationStorm' },
    deorbitGantry:    { jump: 'notificationStorm' }
  };
  for (const id in EXIT_PATCH) Object.assign(rooms[id].exits, EXIT_PATCH[id]);

  return { rooms, motionSynonyms, HALLS, TEXT, RANKS };
});

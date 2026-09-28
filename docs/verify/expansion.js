/*
 * expansion.js — the iMBSE expansion ledger.
 *
 * Base: the pinned snapshot of imbse-canon.js (90 rooms, including the 26 rooms
 * added by the concurrent build session — all folded in by name, none discarded).
 * Patch: 22 new hall rooms (to bring every hall to 8..12) + 7 Act V rooms.
 *
 * Validates: mapPos collisions, dangling exits, reciprocity, hall sizes,
 * reachability, and direction-vs-coordinate sanity. docs/SCRIPT.md is written
 * from the table this file proves.
 */
const path = require('path');
const SNAP = path.join(__dirname, '..', '..', 'imbse-canon.js');
const CANON = require(SNAP);

/* -------- base world, flattened to {dir: target} -------- */
const rooms = {};
for (const [id, r] of Object.entries(CANON.rooms)) {
  const ex = {};
  for (const [dir, spec] of Object.entries(r.exits || {})) {
    if (typeof spec === 'string') ex[dir] = spec;
    else if (Array.isArray(spec)) {
      const first = spec.find(s => s && s.to);
      if (first) ex[dir] = first.to;
      else if (spec.find(s => s && s.special)) ex[dir] = '@' + spec.find(s => s.special).special;
      else ex[dir] = '@die';
    }
  }
  rooms[id] = { name: r.name, pos: r.mapPos, exits: ex };
}
rooms.pullRequestBridge.exits.east = 'integrationBay';
rooms.integrationBay.exits.west = 'pullRequestBridge';
rooms.balloonMeadow.exits.up = 'ingressDeck';

/* =================== 29 new rooms =================== */
const NEW = {
  /* ---- HALL 1 — Human-AI interface clients (5 -> 9) ---- */
  onboardingFunnel: ['The Onboarding Funnel',   37,  8, false, { northwest:'clientConcourse', north:'accessibilityWing' }],
  sessionArchive:   ['The Session Archive',     37,  3, false, { south:'accessibilityWing', west:'personaGallery' }],
  personaGallery:   ['The Gallery of Personas', 33,  4, false, { east:'sessionArchive', south:'notificationStorm', northwest:'matrixRoom' }],
  notificationStorm:['The Notification Storm',  33,  6, false, { north:'personaGallery', southeast:'clientConcourse' }],

  /* ---- HALL 2 — Requirement engineering (7 -> 10) ---- */
  elicitationBooth: ['The Elicitation Booth',   29,  4, false, { southeast:'requirementsHall', west:'ossuary' }],
  assayOffice:      ['The Assay Office',        28,  2, false, { southeast:'shallQuarry', southwest:'ossuary' }],
  ossuary:          ['The Ossuary of Cut Requirements', 26, 4, true, { east:'elicitationBooth', northeast:'assayOffice' }],

  /* ---- HALL 3 — Model engineering (7 -> 10) ---- */
  metamodelStair:   ['The Metamodel Stair',     24, 10, false, { east:'metamodelVault', up:'metamodelLoft' }],
  metamodelLoft:    ['The Metamodel Loft',      24,  8, false, { down:'metamodelStair' }],
  slagPit:          ['The Slag Pit',            32, 11, true,  { northwest:'modelForge' }],

  /* ---- HALL 4 — Copilot helpers (5 -> 9) ---- */
  contextWindow:    ['The Context Window',      34, 15, false, { northwest:'copilotRoost', south:'rateLimiter' }],
  rateLimiter:      ['The Rate Limiter',        34, 17, false, { north:'contextWindow', west:'agentYard' }],
  agentYard:        ['The Agent Yard',          30, 18, false, { east:'rateLimiter', southwest:'fineTuningCellar', northeast:'promptGarden' }],
  fineTuningCellar: ['The Fine-Tuning Cellar',  28, 19, true,  { northeast:'agentYard' }],

  /* ---- HALL 5 — Mission engineering (5 -> 9) ---- */
  sortieBoard:      ['The Sortie Board',        37, 13, false, { southwest:'missionDeck' }],
  weatherDeck:      ['The Weather Deck',        33, 12, false, { southeast:'missionDeck' }],
  debriefRoom:      ['The Debrief Room',        33, 18, false, { northeast:'warRoom', south:'rehearsalHangar' }],
  rehearsalHangar:  ['The Rehearsal Hangar',    33, 20, false, { north:'debriefRoom' }],

  /* ---- HALL 7 — Macro engineering (5 -> 9) ---- */
  continentalFloor: ['The Continental Model Floor', 41, 8, false, { northwest:'macroGantry' }],
  magnitudeStair:   ['The Order-of-Magnitude Stair', 44, 4, false, { west:'supplyChain', north:'longNowRoom', south:'ballastYard' }],
  longNowRoom:      ['The Long Now Room',       44,  2, false, { south:'magnitudeStair' }],
  ballastYard:      ['The Ballast Yard',        44,  6, false, { north:'magnitudeStair' }],

  /* ---- ACT V — the ground (7 new; the sixteen forest rooms return) ---- */
  scatterField:     ['The Scatter Field',       17,  9, false, { west:'antennaFarm', southeast:'wreckOfTheHalls' }],
  wreckOfTheHalls:  ['The Halls, Come Down',    19, 11, false, { northwest:'scatterField' }],
  newProgramOffice: ['The New Program Office',   5, 16, false, { north:'fireRoad', southwest:'siteHut', southeast:'recordsOffice', south:'signingTent' }],
  siteHut:          ['The Site Hut',             3, 18, false, { northeast:'newProgramOffice' }],
  recordsOffice:    ['The Records Office',       7, 18, false, { northwest:'newProgramOffice' }],
  signingTent:      ['The Signing Tent',         5, 19, false, { north:'newProgramOffice', south:'theRoadAtDawn' }],
  theRoadAtDawn:    ['The Road at Dawn',         5, 21, false, { north:'signingTent' }]
};

/* The canon now contains the whole expanded world, so NEW and PATCH below are
   kept only as the manifest of what the expansion added — they are checked
   against the canon rather than applied to it. */
for (const id of Object.keys(NEW)) {
  if (!rooms[id]) console.log('  MISSING from canon: ' + id);
  else rooms[id].isNew = true;
}

/* ---- exits added to existing rooms ---- */
const PATCH = {
  clientConcourse:  { southeast:'onboardingFunnel', northwest:'notificationStorm' },
  accessibilityWing:{ north:'sessionArchive', south:'onboardingFunnel' },
  matrixRoom:       { southeast:'personaGallery' },                 /* hidden panel, H2<->H1 */
  requirementsHall: { northwest:'elicitationBooth' },
  shallQuarry:      { northwest:'assayOffice', down:'slagPit' },     /* down = trap door, one-way */
  modelForge:       { southeast:'slagPit' },
  metamodelVault:   { west:'metamodelStair' },
  copilotRoost:     { southeast:'contextWindow' },
  promptGarden:     { southwest:'agentYard' },
  missionDeck:      { northeast:'sortieBoard', northwest:'weatherDeck' },
  warRoom:          { southwest:'debriefRoom' },
  macroGantry:      { southeast:'continentalFloor' },
  supplyChain:      { east:'magnitudeStair' },
  orbitalRing:      { jump:'notificationStorm' },                    /* trap door, one-way */
  antennaFarm:      { east:'scatterField' },                         /* Act V only */
  fireRoad:         { south:'newProgramOffice' },                    /* Act V only */
  trace4:           { down:'serviceShaft' }                          /* trap door, one-way */
};
/* PATCH is the manifest of exits the expansion added. The canon owns them now;
   it is checked for their presence rather than having them applied. */
for (const [id, ex] of Object.entries(PATCH)) {
  for (const dir of Object.keys(ex)) {
    if (rooms[id] && !rooms[id].exits[dir]) console.log('  MISSING exit: ' + id + '.' + dir);
  }
}

/* deliberate one-ways — not reciprocity failures */
const ONE_WAY = new Set([
  'shallQuarry:down:slagPit', 'orbitalRing:jump:notificationStorm', 'trace4:down:serviceShaft', 'deorbitGantry:jump:notificationStorm',
  'balloonMeadow:up:ingressDeck', 'farSide:down:sandbox', 'sinkhole:down:serviceShaft',
  'serviceShaft:down:sinkhole', 'shedYard:south:gully', 'balloonMeadow:south:forestNorth',
  'missionDeck:east:groundTruthRange', 'accessibilityWing:west:clientConcourse',
  'contingencyCloset:north:warRoom', 'sensorLine:west:groundTruthRange',
  'acceptanceFloor:west:integrationBay', 'mastWalk:south:ingressDeck'
]);

const ACT_V_2 = ['siteGate', 'tarpaulin', 'weighbridge', 'readingRoom', 'countyRoad'];

const HALLS = {
  1: ['clientConcourse','chatParlor','helpDesk','uncannyValley','accessibilityWing','onboardingFunnel','sessionArchive','personaGallery','notificationStorm'],
  2: ['requirementsHall','shallQuarry','matrixRoom','elicitationBooth','assayOffice','ossuary','swamp1','swamp2','swamp3','backlogEnd'],
  3: ['modelForge','metamodelVault','versionCrypt','tagCellar','mergeChasm','farSide','patternLibrary','metamodelStair','metamodelLoft','slagPit'],
  4: ['copilotRoost','promptGarden','hallucinationGallery','promptCompost','citationWell','contextWindow','rateLimiter','agentYard','fineTuningCellar'],
  5: ['missionDeck','warRoom','groundTruthRange','contingencyCloset','sensorLine','sortieBoard','weatherDeck','debriefRoom','rehearsalHangar'],
  6: ['vFoundry','pullRequestBridge','integrationBay','acceptanceFloor','interfaceLedge','contractShelf','trace1','trace2','trace3','trace4'],
  7: ['macroGantry','titanScaffold','supplyChain','orbitalRing','deorbitGantry','continentalFloor','magnitudeStair','longNowRoom','ballastYard']
};

/* the seven words: hall -> [word, room] */
const WORDS = {
  1: ['PERSONA', 'personaGallery'], 2: ['SHALL', 'ossuary'], 3: ['SCHEMA', 'metamodelLoft'],
  4: ['PROMPT', 'fineTuningCellar'], 5: ['SORTIE', 'sortieBoard'], 6: ['VERIFY', 'acceptanceFloor'],
  7: ['SCALE', 'magnitudeStair']
};

/* the seven new lesser treasures: hall -> [treasure, room] */
const NEW_TREASURES = {
  1: ['the First Transcript', 'sessionArchive'], 2: ['the Golden Thread Spool', 'matrixRoom'],
  3: ['the Metaobject', 'metamodelLoft'], 4: ['the First Refusal', 'fineTuningCellar'],
  5: ['the Rehearsal Reel', 'rehearsalHangar'], 6: ['the Closed Loop', 'acceptanceFloor'],
  7: ['the Bill of Materials', 'supplyChain']
};

module.exports = { rooms, NEW, PATCH, HALLS, WORDS, NEW_TREASURES, ONE_WAY };

/* =================== validation =================== */
if (require.main === module) {
  const err = [], warn = [];
  const seen = {};
  for (const [id, r] of Object.entries(rooms)) {
    if (!r.pos) { err.push(`${id}: no mapPos`); continue; }
    const k = r.pos.join(',');
    if (seen[k]) err.push(`mapPos collision [${k}]: ${seen[k]} / ${id}`);
    seen[k] = id;
  }
  for (const [id, r] of Object.entries(rooms))
    for (const [dir, t] of Object.entries(r.exits))
      if (!t.startsWith('@') && !rooms[t]) err.push(`${id}.${dir} -> unknown "${t}"`);

  const MAZE = new Set(['swamp1','swamp2','swamp3','backlogEnd','trace1','trace2','trace3','trace4']);
  for (const [id, r] of Object.entries(rooms)) {
    if (MAZE.has(id)) continue;
    for (const [dir, t] of Object.entries(r.exits)) {
      if (t.startsWith('@') || !rooms[t] || MAZE.has(t)) continue;
      if (ONE_WAY.has(`${id}:${dir}:${t}`)) continue;
      if (!Object.values(rooms[t].exits).includes(id)) warn.push(`one-way: ${id}.${dir} -> ${t}`);
    }
  }
  for (const [n, ids] of Object.entries(HALLS)) {
    if (ids.length < 8 || ids.length > 12) err.push(`hall ${n}: ${ids.length} rooms (want 8..12)`);
    for (const i of ids) if (!rooms[i]) err.push(`hall ${n}: unknown room ${i}`);
  }
  for (const [n, [w, room]] of Object.entries(WORDS))
    if (!rooms[room]) err.push(`word ${w}: unknown room ${room}`);
  for (const [n, [t, room]] of Object.entries(NEW_TREASURES))
    if (!rooms[room]) err.push(`treasure ${t}: unknown room ${room}`);

  const seenR = new Set(['endOfRoad']); const q = ['endOfRoad'];
  while (q.length) { const id = q.shift();
    for (const t of Object.values(rooms[id].exits))
      if (!t.startsWith('@') && rooms[t] && !seenR.has(t)) { seenR.add(t); q.push(t); } }
  const RC = new Set(['rcAtrium','rcConcourse','boardroom','rcMonolith','rcBalcony','rcWing']);
  for (const id of Object.keys(rooms)) if (!seenR.has(id) && !RC.has(id)) warn.push(`unreachable: ${id}`);

  const DELTA = { north:[0,-1], south:[0,1], east:[1,0], west:[-1,0], northeast:[1,-1],
                  southwest:[-1,1], northwest:[-1,-1], southeast:[1,1] };
  for (const [id, r] of Object.entries(rooms)) {
    if (!r.isNew && !PATCH[id]) continue;
    for (const [dir, t] of Object.entries(r.exits)) {
      const d = DELTA[dir]; if (!d || !rooms[t] || t.startsWith('@') || MAZE.has(t) || MAZE.has(id)) continue;
      const dx = rooms[t].pos[0] - r.pos[0], dy = rooms[t].pos[1] - r.pos[1];
      const ok = (d[0] === 0 ? Math.abs(dx) <= 2 : Math.sign(dx) === d[0])
              && (d[1] === 0 ? Math.abs(dy) <= 2 : Math.sign(dy) === d[1]);
      if (!ok) warn.push(`geometry: ${id}.${dir} -> ${t} (${dx},${dy})`);
    }
  }

  const total = Object.keys(rooms).length, added = Object.keys(NEW).length;
  console.log(`rooms: ${total} (${total - added} base + ${added} new)`);
  for (const [n, ids] of Object.entries(HALLS)) console.log(`  hall ${n}: ${ids.length}`);
  console.log(`\nERRORS (${err.length})`); err.forEach(e => console.log('  x ' + e));
  console.log(`WARNINGS (${warn.length})`); warn.forEach(w => console.log('  ! ' + w));
}

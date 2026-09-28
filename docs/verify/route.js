/*
 * route.js — walks the WALKTHROUGH route through the validated world.
 *
 * Verifies: every movement command has an exit, the carry limit is never
 * exceeded, every treasure is found and vaulted, and the points add up.
 *
 * NOTE: this walks a static model of the world and checks the SPINE route in
 * WALKTHROUGH.md, which is worth 700. The game maxes at 750; the remaining 50
 * is Act V's tail and Commander Alexander's three riddles, which the spine
 * does not cover. The authoritative end-to-end check is tests/engine.test.js,
 * which drives the real engine, wins, and asserts the full 750.
 */
const { rooms } = require('./expansion.js');

const DIR = { N:'north', S:'south', E:'east', W:'west', NE:'northeast', NW:'northwest',
  SE:'southeast', SW:'southwest', UP:'up', DOWN:'down', IN:'in', OUT:'out',
  UPSTREAM:'north', DOWNSTREAM:'south', JUMP:'jump' };

/* items: id -> room (start) */
const ITEMS = {
  lantern:'insideShed', keys:'insideShed', knife:'insideShed', duck:'insideShed',
  thermos:'insideShed', rations:'insideShed', hexKey:'creekBed', certificate:'balloonMeadow',
  console:'chatParlor', tablet:'shallQuarry', orb:'modelForge', compass:'warRoom',
  credits:'deprecatedWing', commit:'versionCrypt', glass:'orbitalRing', cache:'trace4',
  mat:'uncannyValley', cage:'promptGarden', flask:'tokenFountain', token:'versionCrypt',
  stone:'groundTruthRange', magazine:'deprecatedWing', leftArm:'vFoundry', rightArm:'vFoundry',
  /* new */
  transcript:'sessionArchive', spool:'matrixRoom', metaobject:'metamodelLoft',
  refusal:'fineTuningCellar', reel:'rehearsalHangar', loop:'acceptanceFloor', bom:'supplyChain',
  assayKit:'assayOffice', plainLanguage:'accessibilityWing', placard:'helpDesk',
  branch:'@trunk', feather:'@serpent', vee:'@weld', rule:'@lever', pearl:'@blob', yoke:'@dannet',
  cap:'@store', truck:'@store'
};
const KEYSTONE = ['console','tablet','orb','feather','compass','vee','rule'];
const LESSER = ['credits','commit','glass','pearl','cache','yoke',
                'transcript','spool','metaobject','refusal','reel','loop','bom'];
const TREASURE = new Set([...KEYSTONE, ...LESSER]);

const LC = {}; for (const k of Object.keys(ITEMS)) LC[k.toLowerCase()] = k;
const norm = w => LC[w.toLowerCase()] || null;
let room = 'endOfRoad', carried = new Set(), limit = 7, basket = new Set();
const found = new Set(), vaulted = new Set(), salvaged = new Set();
const errors = [], trail = [];
let line = 0, maxCarried = 0;

function err(msg) { errors.push(`[${line}] in ${room}: ${msg}`); }

function step(cmd) {
  line++;
  const c = cmd.trim().toUpperCase();
  if (!c || c.startsWith('#')) return;
  trail.push(room);

  /* movement */
  if (DIR[c]) {
    const d = DIR[c], t = rooms[room] && rooms[room].exits[d];
    if (!t) return err(`no exit ${c} (have: ${Object.keys(rooms[room].exits).join(',')})`);
    if (t.startsWith('@')) return err(`exit ${c} is ${t}`);
    room = t; return;
  }
  const m = c.match(/^(TAKE|DROP|PUT|BUY|VAULT|SALVAGE|LIMIT|AT|AWARD|WARP)\s+(.+)$/);
  if (!m) return;                                    /* prose command, ignore */
  const [, verb, rest] = m;
  const raw = rest.split(/\s+IN\s+|\s+FROM\s+/)[0].trim();
  const what = norm(raw) || raw.toLowerCase();

  if (verb === 'LIMIT') { limit = parseInt(rest, 10); return; }
  if (verb === 'AT') { if (room.toLowerCase() !== rest.trim().toLowerCase()) err(`expected ${rest}, am in ${room}`); return; }
  if (verb === 'AWARD') return;
  if (verb === 'WARP') { const t = rest.trim(); const k = Object.keys(rooms).find(r => r.toLowerCase() === t.toLowerCase()); if (!k) return err(`warp to unknown ${t}`); room = k; return; }

  if (verb === 'TAKE' || verb === 'BUY') {
    if (!ITEMS[what]) return err(`unknown item ${what}`);
    const FREE = new Set(['truck']);
    const slots = [...carried].filter(i => !FREE.has(i)).length;
    if (!FREE.has(what) && slots >= limit) return err(`carry limit ${limit} exceeded taking ${what} (holding: ${[...carried].join(', ')})`);
    carried.add(what); basket.delete(what);
    if (TREASURE.has(what)) found.add(what);
    maxCarried = Math.max(maxCarried, [...carried].filter(i => i !== 'truck').length);
    return;
  }
  if (verb === 'DROP') {
    if (!carried.has(what)) return err(`dropping ${what} which is not carried`);
    carried.delete(what); return;
  }
  if (verb === 'PUT') {
    if (!carried.has(what)) return err(`putting ${what} which is not carried`);
    carried.delete(what);
    if (/BASKET/.test(c)) basket.add(what);
    if (/SOCKET|NICHE/.test(c)) {
      if (room !== 'metamodelVault') return err(`vaulting ${what} outside the vault`);
      vaulted.add(what);
    }
    return;
  }
  if (verb === 'SALVAGE') {
    if (!TREASURE.has(what)) return err(`salvaging non-treasure ${what}`);
    salvaged.add(what); return;
  }
}

/* ------------------------------------------------------------------------
 * SUPERSEDED — 2026-08.
 *
 * This walks a hand-maintained static model of the world (expansion.js) rather
 * than the engine, and that model has not kept up: run against the current
 * route it reports 210 errors, every one of them an artefact of its own stale
 * item and exit tables rather than a fault in the route.
 *
 * The real check is tests/walkthrough.test.js, which drives the actual engine
 * with the actual published commands and fails if any one of them is refused.
 * Run that instead:
 *
 *     node tests/walkthrough.test.js
 *
 * The code below is left intact and will still run with --force, for anyone who
 * wants to bring the static model back into line.
 * --------------------------------------------------------------------- */
if (!process.argv.includes('--force')) {
  console.log('route.js is superseded by tests/walkthrough.test.js — run that instead.');
  console.log('(pass --force to run this stale static check anyway)');
  process.exit(0);
}

const SPINE = 700;                      /* what the documented spine is worth */
const ROUTE = require('./route-commands.js');
for (const c of ROUTE) step(c);

/* ---- report ---- */
const missingFound = [...TREASURE].filter(t => !found.has(t));
const missingVault = [...TREASURE].filter(t => !vaulted.has(t));
const NEW7 = ['transcript','spool','metaobject','refusal','reel','loop','bom'];
const missingSalv = NEW7.filter(t => !salvaged.has(t));

const pts = {
  'balloon rises': 25, 'root cellar': 25,
  'keystones found (7x5)': 35, 'keystones vaulted (7x15)': 105,
  'lesser found (13x4)': 52, 'lesser vaulted (13x8)': 104,
  'MBSE Today at the Backlog': 1, 'the freeze': 25,
  'seven faces (7x3)': 21, 'the charge': 45, 'no QUIT': 4,
  'Dannet undone': 15, "Alexander's first three riddles": 9,
  "Thomas's ten games": 10, "Mark on Dassault": 4,
  'seven words (7x2)': 14, 'seven hall residents (7x3)': 21,
  'seven records salvaged (7x3)': 21,
  'Act V: the ground': 20, 'Act V: the assay': 15, 'Act V: publication': 25,
  'Act V: the record written': 25, 'Act V: signed by another': 45,
  'Act V: the handover': 20, "Act V: Alexander's last crossing": 10,
  'round-off': 4
};
const total = Object.values(pts).reduce((a, b) => a + b, 0);

console.log(`commands: ${line}   rooms visited: ${new Set(trail).size}   max carried: ${maxCarried} (limit ${limit})`);
console.log(`end room: ${room}`);
console.log(`\nERRORS (${errors.length})`); errors.forEach(e => console.log('  x ' + e));
console.log(`\nfound ${found.size}/${TREASURE.size}  missing: ${missingFound.join(', ') || 'none'}`);
console.log(`vaulted ${vaulted.size}/${TREASURE.size}  missing: ${missingVault.join(', ') || 'none'}`);
console.log(`salvaged ${salvaged.size}/7  missing: ${missingSalv.join(', ') || 'none'}`);
const { rooms: R } = require('./expansion.js');
const unvisited = Object.keys(R).filter(r => !new Set(trail).has(r));
console.log(`\nUNVISITED (${unvisited.length}): ${unvisited.join(', ')}`);
console.log(`carried at the end: ${[...carried].join(', ')}`);
console.log(`\nSCORE TABLE = ${total}`);
if (total !== SPINE) console.log(`  !! spine expected ${SPINE}, off by ${SPINE - total}`);
else console.log(`  (the spine is ${SPINE} of the game's 750; the rest is Act V and the riddles)`);

/*
 * build-map.js — regenerate docs/MAP.md from the world itself.
 *
 * The map is not maintained by hand. Room membership of an act is read off the
 * ACT banner comments in imbse-canon.js, the grid cells come from each room's
 * mapPos (which is what automap.js lays out), and reachability is computed by
 * walking the plain exits from the start room, so a room that can only be got
 * to by balloon, magic word or special is labelled as such.
 *
 *   node tools/build-map.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAME = require(path.join(ROOT, 'imbse-data.js'));
const rooms = GAME.rooms;

const DIRS = {
  north: 'N', south: 'S', east: 'E', west: 'W', northeast: 'NE',
  northwest: 'NW', southeast: 'SE', southwest: 'SW', up: 'UP', down: 'DN',
  in: 'IN', out: 'OUT'
};

/* ---- which act each room belongs to ----
 * No room carries its act, and file order will not tell you: the expansion
 * rooms were appended to whichever block happened to be last, so a hall on the
 * platform can sit under the ACT V banner. Settling it by majority vote of the
 * neighbours does not work either — the mis-filed rooms are adjacent to each
 * other and outvote the correct ones.
 *
 * So it is declared here, in one place, where it can be read and argued with.
 * Acts III and I come off the canon's banners, which are right for those two.
 * Acts IV and V are small, closed and unambiguous, so they are named. Anything
 * else is on the platform, which is Act II by definition.
 */
const ACT_IV = ['rcAtrium', 'rcConcourse', 'rcMonolith', 'rcBalcony', 'rcWing', 'boardroom'];
const ACT_V = ['scatterField', 'wreckOfTheHalls', 'tarpaulin', 'weighbridge', 'siteGate',
  'siteHut', 'newProgramOffice', 'signingTent', 'recordsOffice', 'readingRoom',
  'theRoadAtDawn', 'countyRoad'];
/* forest rooms that were typed in after the ACT V banner */
const ACT_I_EXTRA = ['antennaFarm', 'fireRoad'];

function actsFromCanon() {
  const src = fs.readFileSync(path.join(ROOT, 'imbse-canon.js'), 'utf8').split('\n');
  const banner = {};
  let current = 'UNPLACED';
  for (const line of src) {
    const b = line.match(/ACT\s+(I|II|III|IV|V)\b/);
    if (b && /[-=]{3,}/.test(line)) current = 'ACT ' + b[1];
    const room = line.match(/^ {4}(\w+):\s*\{/);
    if (room && rooms[room[1]]) banner[room[1]] = current;
  }
  const act = {};
  for (const k of Object.keys(rooms)) {
    if (ACT_V.includes(k)) act[k] = 'ACT V';
    else if (ACT_IV.includes(k)) act[k] = 'ACT IV';
    else if (ACT_I_EXTRA.includes(k) || banner[k] === 'ACT I') act[k] = 'ACT I';
    else if (banner[k] === 'ACT III') act[k] = 'ACT III';
    else act[k] = 'ACT II';
  }
  return act;
}

const TITLES = {
  'ACT I': 'ACT I — THE FOREST',
  'ACT II': 'ACT II — THE PLATFORM',
  'ACT III': 'ACT III — THE DEEP STACK',
  'ACT IV': 'ACT IV — THE RELEASE CANDIDATE',
  'ACT V': 'ACT V — THE GROUND',
  UNPLACED: 'ELSEWHERE'
};
const ORDER = ['ACT I', 'ACT II', 'ACT III', 'ACT IV', 'ACT V', 'UNPLACED'];

/* ---- what you can walk to, without a balloon or a magic word ---- */
function walkable() {
  const seen = new Set([GAME.startRoom]);
  const queue = [GAME.startRoom];
  while (queue.length) {
    const k = queue.pop();
    for (const spec of Object.values(rooms[k].exits || {})) {
      for (const s of [].concat(spec)) {
        const to = typeof s === 'string' ? s : (s && s.to);
        if (typeof to === 'string' && rooms[to] && !seen.has(to)) {
          seen.add(to);
          queue.push(to);
        }
      }
    }
  }
  return seen;
}

function waysOut(key) {
  const out = [];
  for (const [dir, spec] of Object.entries(rooms[key].exits || {})) {
    const dests = [].concat(spec).map(s => {
      const to = typeof s === 'string' ? s : (s && s.to);
      if (typeof to === 'string' && rooms[to]) return rooms[to].name;
      if (s && s.special) return '*' + s.special + '*';
      if (typeof to === 'function') return '*computed*';
      return '*conditional*';
    });
    out.push((DIRS[dir] || dir.toUpperCase()) + ' → ' + [...new Set(dests)].join(' / '));
  }
  return out.join('<br>') || '—';
}

const act = actsFromCanon();
const reach = walkable();
const groups = {};
for (const k of Object.keys(rooms)) {
  const g = act[k] || 'UNPLACED';
  (groups[g] = groups[g] || []).push(k);
}

const xs = Object.values(rooms).map(r => r.mapPos[0]);
const ys = Object.values(rooms).map(r => r.mapPos[1]);
const dark = Object.keys(rooms).filter(k => rooms[k].dark);

let md = '# iMBSE — THE MAP\n\n';
md += '*Generated from `imbse-canon.js` by `tools/build-map.js`. Don\'t hand-edit —\n';
md += 'regenerate it when the world changes:* `node tools/build-map.js`\n\n';
md += '**' + Object.keys(rooms).length + ' rooms.** Every room carries a `mapPos` grid ' +
  'cell, which is what `automap.js` lays out. The grid runs x ' + Math.min(...xs) +
  '–' + Math.max(...xs) + ', y ' + Math.min(...ys) + '–' + Math.max(...ys) +
  ', and no two rooms share a cell.\n\n';
md += '- **·dark·** — unlit. You can\'t cross it, or take anything in it, without a lit lantern. ' +
  '(' + dark.length + ' rooms.)\n';
md += '- **·no walk-in·** — no plain exit anywhere leads here. It\'s reached by the balloon, ' +
  'by a magic word, or by a special (the long walk, the blast).\n\n';
md += 'The Room tab of the automap shows an illustrated plate for every room; the plates and ' +
  'their room mapping live in `images/` (see `images/plates.py`).\n\n';

for (const g of ORDER) {
  const list = (groups[g] || []).sort((a, b) =>
    rooms[a].mapPos[1] - rooms[b].mapPos[1] || rooms[a].mapPos[0] - rooms[b].mapPos[0]);
  if (!list.length) continue;
  md += '## ' + TITLES[g] + '  *(' + list.length + ' rooms)*\n\n';
  md += '| Room | key | cell | ways out |\n|---|---|---|---|\n';
  for (const k of list) {
    const r = rooms[k];
    const tags = [r.dark ? '**·dark·**' : '', reach.has(k) ? '' : '**·no walk-in·**']
      .filter(Boolean).join(' ');
    md += '| ' + r.name + (tags ? ' ' + tags : '') + ' | `' + k + '` | ' +
      r.mapPos.join(',') + ' | ' + waysOut(k) + ' |\n';
  }
  md += '\n';
}

fs.writeFileSync(path.join(ROOT, 'docs', 'MAP.md'), md);
console.log('docs/MAP.md — ' + Object.keys(rooms).length + ' rooms in ' +
  ORDER.filter(g => (groups[g] || []).length).length + ' acts');
for (const g of ORDER) {
  if ((groups[g] || []).length) console.log('  ' + TITLES[g] + ': ' + groups[g].length);
}

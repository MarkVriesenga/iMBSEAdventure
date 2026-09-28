/*
 * walkthrough.test.js — replay the published walkthrough through the engine.
 *
 * The old hand-written walkthrough drifted until it failed 55 commands and
 * finished on 411 of 750 without winning, and nothing caught it, because
 * nothing ever ran it. This does: it reads the commands out of the markdown
 * that ships, drives the real engine with them, and fails if a single one is
 * refused or the run does not win.
 *
 *   node tests/walkthrough.test.js
 */
const fs = require('fs');
const path = require('path');
const Engine = require(path.join(__dirname, '..', 'engine.js'));
const GAME = require(path.join(__dirname, '..', 'imbse-data.js'));

let pass = 0, fail = 0;
const ok = (cond, what) => { if (cond) pass++; else { fail++; console.log('  FAIL ' + what); } };
const eq = (a, b, what) => ok(a === b, what + '  (got ' + JSON.stringify(a) +
  ', wanted ' + JSON.stringify(b) + ')');

const DOC = path.join(__dirname, '..', 'docs', 'WALKTHROUGH.md');

/* the commands are the four-space-indented lines, one per line */
function commandsFrom(file) {
  return fs.readFileSync(file, 'utf8').split('\n')
    .filter(l => /^ {4}\S/.test(l))
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

console.log('\nTHE PUBLISHED WALKTHROUGH');

const cmds = commandsFrom(DOC);
ok(cmds.length > 400, 'the walkthrough has a route in it (' + cmds.length + ' commands)');

/* there is one walkthrough, and it is this one — a second copy of a generated
   document is a second thing to forget to regenerate */
ok(!fs.existsSync(path.join(__dirname, '..', 'docs', 'expansion')) &&
  !fs.existsSync(path.join(__dirname, '..', 'docs', 'original')),
  'there is one docs tree, not an original and an expansion');

/* it must be the route the verifier and the doc generator share */
const ROUTE = require(path.join(__dirname, '..', 'docs', 'verify',
  'route-commands.js'));
eq(cmds.join('|').toUpperCase(), ROUTE.join('|').toUpperCase(),
  'the published commands are exactly route-commands.js (rebuild with tools/build-walkthrough.js)');

const e = new Engine(GAME);
let s = 12345;
e.rng = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
let out = [];
e.onOutput(t => out.push(t));
e.start();
e.state.flags.repellent = 100000;      // the bugs are weather; this is a route test

/* every stock refusal the game can print, so a silently-ignored command is caught */
const REFUSALS = []
  .concat(GAME.meta.noWayMessage, GAME.meta.carryFullMessage, GAME.meta.cantTakeMessage)
  .filter(Boolean);
const HARD = /I don't know how to|isn't in the vocabulary|Nothing on this platform knows how to|I see no |There's nothing here to take|already carrying it/i;

const refused = [];
cmds.forEach((cmd, i) => {
  out = [];
  e.parse(cmd);
  const said = out.join(' ').replace(/\s+/g, ' ');
  if (REFUSALS.some(r => said.indexOf(r) !== -1) || HARD.test(said)) {
    refused.push('#' + i + ' "' + cmd + '" in ' + e.state.room + ' — ' + said.slice(0, 80));
  }
});
ok(!refused.length, 'no command is refused' +
  (refused.length ? '\n    ' + refused.slice(0, 8).join('\n    ') : ''));

ok(e.state.won, 'the route wins');
eq(e.state.room, 'theRoadAtDawn', 'and ends on the road at dawn');
eq(e.state.flags.deaths, 0, 'with no deaths');
eq(Object.keys(e.state.flags.vaulted).length, 20, 'all twenty treasures vaulted');

const visited = Object.keys(e.state.visited).filter(k => GAME.rooms[k]).length;
eq(visited, Object.keys(GAME.rooms).length, 'every room in the game is entered');

const score = e.score();
ok(score >= 741, 'scoring ' + score + ' of 750 (+9 more for Alexander\'s riddles)');
eq(score + 9, GAME.meta.maxScore, 'which is exactly ' + GAME.meta.maxScore +
  ' with the three riddles');
ok(e.state.flags.tokens > 0, 'and the lantern still has ' + e.state.flags.tokens +
  ' tokens in it');

/* the document must not promise anything the run did not do */
const doc = fs.readFileSync(DOC, 'utf8');
ok(doc.indexOf('124 of 124') !== -1 || doc.indexOf('all 124 rooms') !== -1,
  'the document claims the room coverage it actually achieves');
ok(doc.indexOf('119 rooms') === -1, 'no stale 119-room claim survives');

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);

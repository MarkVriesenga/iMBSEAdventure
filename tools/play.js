#!/usr/bin/env node
/*
 * play.js — watch the whole game play itself.
 *
 * Drives the real engine through the verified route, one command at a time,
 * paced slowly enough to read. Same commands the walkthrough test replays
 * (docs/WALKTHROUGH.md, which is generated from docs/verify/route-commands.js),
 * only here they are printed as a session rather than asserted against.
 *
 *   node tools/play.js                 # the whole game, ~250ms a command
 *   node tools/play.js --fast          # as fast as the engine will go
 *   node tools/play.js --from 11       # fast-forward to stage 11, then watch
 *   node tools/play.js --list          # the stages, and how long each is
 *   node tools/play.js --batch         # the route as a column to paste in the browser
 *
 * It ends on the same numbers the test asserts: 741 of 750, twenty treasures,
 * 124 rooms, no deaths. The missing nine are Commander Alexander's riddles,
 * which arrive when the river feels like it and cannot be scripted.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const Engine = require(path.join(ROOT, 'engine.js'));
const GAME = require(path.join(ROOT, 'imbse-data.js'));
const WALKTHROUGH = path.join(ROOT, 'docs', 'WALKTHROUGH.md');
const ROUTE_FILE = path.join(ROOT, 'docs', 'verify', 'route-commands.js');

/* ------------------------------------------------ options */
function parseArgs(argv) {
  const o = {
    delay: 250, from: 1, to: Infinity, pause: false, quiet: false,
    bugs: false, seed: 12345, color: true, list: false, batch: null, md: null,
    help: false, width: 0
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const num = () => Number(argv[++i]);
    switch (a) {
      case '-h': case '--help': o.help = true; break;
      case '--fast': o.delay = 0; break;
      case '--slow': o.delay = 700; break;
      case '--delay': case '--speed': o.delay = num(); break;
      case '--from': o.from = num(); break;
      case '--to': o.to = num(); break;
      case '--stage': o.from = o.to = num(); break;
      case '--pause': o.pause = true; break;
      case '--quiet': o.quiet = true; break;
      case '--bugs': o.bugs = true; break;
      case '--seed': o.seed = num(); break;
      case '--width': o.width = num(); break;
      case '--no-color': o.color = false; break;
      case '--list': o.list = true; break;
      case '--batch':
        o.batch = (argv[i + 1] && !argv[i + 1].startsWith('-')) ? argv[++i] : '-';
        break;
      case '--md': case '--markdown':
        o.md = (argv[i + 1] && !argv[i + 1].startsWith('-')) ? argv[++i] : '-';
        break;
      default:
        console.error('play.js: unknown option ' + a + ' (try --help)');
        process.exit(2);
    }
  }
  return o;
}

const opts = parseArgs(process.argv.slice(2));

const HELP = `
iMBSE — watch the game play itself

  node tools/play.js [options]

Plays the verified 741-point route through the real engine and prints it as a
session: the command, what the game says back, and the score as it moves.

  --delay <ms>   pause between commands           (default 250)
  --fast         no pause at all
  --slow         700ms, for reading over a shoulder
  --from <n>     fast-forward stages before n, then watch from stage n
  --to <n>       stop after stage n
  --stage <n>    just stage n (earlier stages are replayed silently first)
  --pause        wait for ENTER between stages
  --quiet        commands and score only, no room text
  --bugs         let the random bugs happen (the route suppresses them)
  --seed <n>     seed the engine RNG                (default 12345)
  --width <n>    wrap column                        (default: terminal, max 88)
  --no-color     plain text
  --list         list the stages and their command counts
  --batch [file] print the whole route as a column of commands, to paste into
                 the game's command box; with a file, write it there instead
  --md [file]    the same commands as markdown, fenced one block per stage
  -h, --help     this

Examples

  node tools/play.js                    the whole run, about two minutes
  node tools/play.js --slow --pause     stage by stage, on the ENTER key
  node tools/play.js --stage 18         just Act V
  node tools/play.js --fast --quiet     the score history in a few seconds
  node tools/play.js --batch route.txt  a file to paste into the browser
`;

if (opts.help) { process.stdout.write(HELP); process.exit(0); }

/* ------------------------------------------------ colour */
const useColor = opts.color && process.stdout.isTTY && !process.env.NO_COLOR;
const paint = code => s => useColor ? '\x1b[' + code + 'm' + s + '\x1b[0m' : String(s);
const dim = paint('2');
const bold = paint('1');
const cyan = paint('96');
const yellow = paint('93');
const green = paint('92');
const red = paint('91');
const magenta = paint('95');

const WIDTH = opts.width || Math.min(process.stdout.columns || 80, 88);

function wrap(text) {
  const out = [];
  for (const para of String(text).split('\n')) {
    if (!para.trim()) { out.push(''); continue; }
    let line = '';
    for (const word of para.split(/\s+/)) {
      if (line && (line.length + 1 + word.length) > WIDTH) { out.push(line); line = word; }
      else line = line ? line + ' ' + word : word;
    }
    out.push(line);
  }
  return out;
}

/* ------------------------------------------------ the route
 * The stages come out of the published walkthrough, because its headings are
 * what make a two-minute run watchable. The commands in it are exactly
 * route-commands.js — the test enforces that — so if they have drifted apart
 * the document is stale and says so here rather than quietly playing something
 * else.
 */
function loadStages() {
  if (!fs.existsSync(WALKTHROUGH)) {
    return [{ title: 'The route', commands: require(ROUTE_FILE) }];
  }
  const stages = [];
  let current = null;
  for (const line of fs.readFileSync(WALKTHROUGH, 'utf8').split('\n')) {
    const head = /^## (.+)$/.exec(line);
    if (head) { current = { title: head[1].trim(), commands: [] }; stages.push(current); continue; }
    if (current && /^ {4}\S/.test(line)) {
      const cmd = line.trim();
      if (cmd && !cmd.startsWith('#')) current.commands.push(cmd);
    }
  }
  /* the headings carry their own number — this script prints its own, so take
     theirs off rather than say "stage 1 of 18: 1 · The forest" */
  return stages.filter(s => s.commands.length)
    .map(s => ({ title: s.title.replace(/^\d+\s*·\s*/, ''), commands: s.commands }));
}

const stages = loadStages();
const allCommands = stages.reduce((a, s) => a.concat(s.commands), []);

if (fs.existsSync(ROUTE_FILE)) {
  const route = require(ROUTE_FILE);
  if (route.join('|').toUpperCase() !== allCommands.join('|').toUpperCase()) {
    console.error(dim('note: docs/WALKTHROUGH.md is out of step with docs/verify/' +
      'route-commands.js — rebuild it with node tools/build-walkthrough.js'));
  }
}

if (opts.list) {
  console.log('\n' + bold('THE ROUTE') + dim('  ' + stages.length + ' stages, ' +
    allCommands.length + ' commands'));
  stages.forEach((s, i) => {
    console.log('  ' + String(i + 1).padStart(2) + '  ' + s.title +
      dim('  · ' + s.commands.length));
  });
  console.log('');
  process.exit(0);
}

/* ------------------------------------------------ commands.md
 * The same route as --batch, but grouped by stage and fenced, so a reader can
 * take one stage at a time. Generated, like everything else that restates the
 * route, so that it cannot quietly disagree with it.
 */
if (opts.md) {
  const out = [];
  out.push('# iMBSE — the play-through commands', '');
  out.push('Every command of the verified route, in order: **' + allCommands.length +
    ' of them across ' + stages.length + ' stages**, ending on **741 of 750** with ' +
    'twenty treasures banked, all 124 rooms entered and no deaths.', '');
  out.push('**Paste a block, don\'t type it.** The command box takes a column of ' +
    'commands and plays them out one at a time, so you can watch the map and the ' +
    'score move. `ESC`, or the Stop button, halts a batch part-way.', '');
  out.push('The bugs are weather, and they\'re not in here. A bug interrupt will ' +
    'derail a pasted block — that\'s what the rubber duck is for (`THROW DUCK AT ' +
    'BUG`, then take it back). The static analyser from the Company Store buys 100 ' +
    'turns of quiet.', '');
  out.push('Generated by `node tools/play.js --md commands.md` from ' +
    '`docs/verify/route-commands.js`. Don\'t hand-edit it: change the route, ' +
    'rebuild, and run the tests. Prose, traps and the reasoning behind the route ' +
    'are in [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md).', '');
  out.push('---', '');
  stages.forEach((s, i) => {
    out.push('## ' + (i + 1) + ' · ' + s.title, '');
    out.push('```', s.commands.join('\n'), '```', '');
  });
  out.push('---', '');
  out.push('## The whole route in one block', '');
  out.push('All ' + allCommands.length + ' commands, for a single paste. It runs ' +
    'for about four minutes at the batch tick and finishes the game.', '');
  out.push('```', allCommands.join('\n'), '```', '');
  const md = out.join('\n');
  if (opts.md === '-') process.stdout.write(md);
  else {
    fs.writeFileSync(opts.md, md);
    console.log('Wrote ' + allCommands.length + ' commands in ' + stages.length +
      ' stages to ' + opts.md);
  }
  process.exit(0);
}

if (opts.batch) {
  const text = allCommands.join('\n') + '\n';
  if (opts.batch === '-') process.stdout.write(text);
  else {
    fs.writeFileSync(opts.batch, text);
    console.log('Wrote ' + allCommands.length + ' commands to ' + opts.batch +
      '\nPaste the lot into the game\'s command box and it plays itself.');
  }
  process.exit(0);
}

/* ------------------------------------------------ the engine */
const engine = new Engine(GAME);
let seed = opts.seed;
engine.rng = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

let captured = [];
let showing = true;
engine.onOutput(text => { if (showing) captured.push(text); });
engine.start();
/* The bugs are weather. The route is verified with them suppressed, so that is
   the default here too; --bugs puts them back and the run may wander. */
if (!opts.bugs) engine.state.flags.repellent = 1e6;

const TREASURE_TOTAL = (GAME.TREASURES || []).length || 20;
const ROOM_TOTAL = Object.keys(GAME.rooms).length;

const REFUSALS = []
  .concat(GAME.meta.noWayMessage, GAME.meta.carryFullMessage, GAME.meta.cantTakeMessage)
  .filter(Boolean);
const HARD = /I do not know how to|is not in the vocabulary|Nothing on this platform knows how to|I see no |There is nothing here to take|already carrying it/i;

function treasures() { return Object.keys(engine.state.flags.vaulted || {}).length; }
function roomsFound() {
  return Object.keys(engine.state.visited).filter(k => !k.includes('#') && GAME.rooms[k]).length;
}

/* ------------------------------------------------ playing */
const started = Date.now();
const refused = [];
let last = { score: 0, treasures: 0, rooms: 0 };
let played = 0;

const sleep = ms => ms > 0 ? new Promise(r => setTimeout(r, ms)) : Promise.resolve();

function classify(line) {
  if (line.startsWith('— ')) return yellow(line);
  if (line.startsWith('***')) return magenta(line);
  return line;
}

function play(cmd) {
  captured = [];
  engine.parse(cmd);
  played++;
  const said = captured.join(' ').replace(/\s+/g, ' ');
  const balked = REFUSALS.some(r => said.indexOf(r) !== -1) || HARD.test(said);
  if (balked) refused.push({ n: played, cmd: cmd, room: engine.state.room, said: said.slice(0, 90) });
  return balked;
}

function echo(cmd, balked) {
  console.log((balked ? red('> ' + cmd + '   ✗') : cyan('> ' + cmd)));
}

function speak() {
  for (const text of captured) {
    for (const line of wrap(text)) console.log(line ? classify(line) : '');
  }
}

/* One dim line whenever the numbers move — the score, a treasure banked, a room
   entered for the first time. Nothing at all when the turn changed nothing, so
   the transcript stays a transcript. */
function hud() {
  const score = engine.score(), t = treasures(), r = roomsFound();
  const bits = [];
  if (score !== last.score) bits.push(green('+' + (score - last.score) + ' → ' + score + ' pts'));
  if (t !== last.treasures) bits.push(green('treasure ' + t + '/' + TREASURE_TOTAL));
  if (r !== last.rooms) bits.push('room ' + r + '/' + ROOM_TOTAL);
  last = { score: score, treasures: t, rooms: r };
  if (!bits.length) return;
  console.log(dim('    [ turn ' + String(engine.state.moves).padStart(3, '0') + ' · ' +
    bits.join(' · ') + ' · ' + (engine.hasLight() ? engine.room().name : 'darkness') + ' ]'));
}

function rule() { return dim('─'.repeat(WIDTH)); }

function banner(i, stage) {
  console.log('\n' + rule());
  console.log(bold('  ' + stage.title));
  console.log(dim('  stage ' + (i + 1) + ' of ' + stages.length + ' · ' +
    stage.commands.length + ' commands · ' + engine.score() + ' points so far'));
  console.log(rule() + '\n');
}

function waitForEnter() {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(dim('  — ENTER for the next stage — '), () => { rl.close(); resolve(); });
  });
}

/* ------------------------------------------------ the run */
async function run() {
  console.log('\n' + bold('iMBSE — THE ADVENTURE') + dim('   playing ' +
    allCommands.length + ' commands through the engine' +
    (opts.delay ? ' at ' + opts.delay + 'ms' : ' flat out')));
  console.log(dim('Ctrl-C stops it wherever it\'s.\n'));

  showing = !opts.quiet;
  captured = [];
  engine.print(engine.describeRoom(true));
  speak();
  last = { score: engine.score(), treasures: treasures(), rooms: roomsFound() };

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i], n = i + 1;
    if (n > opts.to) break;

    /* stages before --from are replayed silently, because the state has to get
       there somehow and nobody wants to watch it twice */
    if (n < opts.from) {
      showing = false;
      for (const cmd of stage.commands) play(cmd);
      showing = !opts.quiet;
      last = { score: engine.score(), treasures: treasures(), rooms: roomsFound() };
      console.log(dim('  ‹ fast-forwarded stage ' + n + ' · ' + stage.title + ' ›'));
      continue;
    }

    if (opts.pause && n > opts.from) await waitForEnter();
    banner(i, stage);

    for (const cmd of stage.commands) {
      const balked = play(cmd);
      echo(cmd, balked);
      if (!opts.quiet) speak();
      hud();
      if (engine.state.dead) { console.log('\n' + red('*** The run died. ***')); return; }
      if (engine.state.won) return;
      await sleep(opts.delay);
    }
  }
}

/* ------------------------------------------------ the reckoning */
function summary() {
  const score = engine.score();
  const rank = GAME.meta.ranks
    ? (GAME.meta.ranks.find(r => score >= r[0]) || GAME.meta.ranks[GAME.meta.ranks.length - 1])[1]
    : null;
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const won = !!engine.state.won;

  console.log('\n' + rule());
  console.log(bold('  THE RECKONING'));
  console.log(rule());
  const row = (k, v) => console.log('  ' + k.padEnd(14) + ' ' + v);
  row('Score', score + ' of ' + GAME.meta.maxScore + (rank ? dim('   ' + rank) : ''));
  row('Treasures', treasures() + ' of ' + TREASURE_TOTAL);
  row('Rooms', roomsFound() + ' of ' + ROOM_TOTAL);
  row('Turns', engine.state.moves);
  row('Deaths', engine.state.flags.deaths || 0);
  row('Lantern', (engine.state.flags.tokens || 0) + ' tokens left');
  row('Commands', played + ' of ' + allCommands.length + dim('   in ' + secs + 's'));
  row('Refused', refused.length ? red(String(refused.length)) : green('none'));
  for (const r of refused.slice(0, 10)) {
    console.log(dim('      #' + r.n + ' "' + r.cmd + '" in ' + r.room + ' — ' + r.said));
  }
  if (refused.length > 10) console.log(dim('      …and ' + (refused.length - 10) + ' more'));
  console.log(rule());
  /* a run cut short by --to or --stage has not failed at anything; only a run
     that was let off the leash and still did not win has */
  const truncated = !won && !engine.state.dead && opts.to < stages.length;
  console.log(won
    ? green('  WON') + dim('   the last nine points are Alexander\'s riddles, ' +
      'which can\'t be scripted')
    : truncated
      ? yellow('  STAGE ' + opts.to + ' COMPLETE') + dim('   the route was cut short here')
      : (engine.state.dead ? red('  DIED') : yellow('  STOPPED SHORT')) +
        dim('   the run didn\'t finish the game'));
  console.log(rule() + '\n');

  return (won || truncated) && !refused.length ? 0 : 1;
}

let interrupted = false;
process.on('SIGINT', () => {
  if (interrupted) process.exit(130);
  interrupted = true;
  console.log('\n' + yellow('*** Stopped. ***'));
  summary();
  process.exit(130);
});

run().then(() => process.exit(summary())).catch(err => {
  console.error(red('\nplay.js: ' + (err && err.stack || err)));
  process.exit(1);
});

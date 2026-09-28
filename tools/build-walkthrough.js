/*
 * build-walkthrough.js — regenerate docs/WALKTHROUGH.md from a route that has
 * been replayed through the real engine.
 *
 * The old walkthrough was written by hand and drifted: replayed against the
 * engine it failed 55 commands, never won, and finished on 411 of 750. A
 * walkthrough that has not been run is a rumour, so this one is generated from
 * docs/verify/route-commands.js — the route the engine actually wins on — and
 * tests/walkthrough.test.js replays the published markdown on every test run so
 * it cannot rot again.
 *
 *   node tools/build-walkthrough.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ROUTE = require(path.join(ROOT, 'docs/verify/route-commands.js'));

/* section boundaries into the route, and what to say about each */
const SECTIONS = [
  [0, 'The forest — kit, a branch, and the lie of the land',
    `Six things live in the shed and the seventh is in the creek. East of the yard,
five cancelled programs are parked in a row with their nameplates unscrewed; the
Antenna Farm north of them is still receiving, and nobody has read any of it in
years. Both are worth walking now, because you come back to this ground in Act V
and it won't look like this.

The detour west of the gully is the Culvert Mouth, where the creek comes out under
pressure — a man on a boat uses it at the end. South of the creek bed is the
Sinkhole. West of the road, past the Fire Road, is the Surveyor's Stake: a brass
benchmark disc that every height on this platform is measured from, and that
nothing on the platform knows about. Stand on it once. You'll bring a piece of
the monolith back to it.

The hex key opens the balloon's fuel valve and does nothing else in the game.
Cargo in the basket rides up free and doesn't count against your seven.`],

  [39, 'Launch — jettison the debt',
    `The balloon has lift enough. It doesn't have lift enough for you *and* the
sandbags stencilled TECHNICAL DEBT, which is the joke and also the puzzle. Light
the lantern before you board, put it out the moment you're on the deck: it burns
context only while it's lit, 330 tokens all told, and this route lands with over
two hundred to spare.

North off the Ingress Deck is the Mast Walk, out along the antenna the balloon
hooked itself on. From out there the platform has an underside.`],

  [48, 'The gate, and the Atrium',
    `The Firewall Gate doesn't approve of the self-signed certificate. It simply
stops arguing, which is what a firewall does. Read the brass directory plate in
the Atrium — seven halls, seven bearings — and stage everything you're not
carrying into a hall here. The Atrium is the natural warehouse and this route
treats it as one.

Pathfinder Thomas keeps his table here, and two commands worth learning at it
work from anywhere: \`GAMES\` prints the menu — all ten games, how each one
plays, and what it pays — and \`WHO\` lists everybody on the platform, where
they stand, and every command they answer to.`],

  [58, "Pathfinder Thomas, and the shopping",
    `Ten games, ten wins, 145 story points. The only purchase that's not optional is
the **blasting cap**: the Deprecation Charge in the endgame has an empty cap well,
the store is on the pre-freeze platform, and after the baseline freezes there's no
store. The hand truck takes the carry limit from seven to nine and at 124 rooms it
isn't a luxury either.

The answers below are the winning lines and nothing else; SCRIPT.md explains why
each one works.`],

  [138, 'Hall 1 — the Console, the Transcript, and the Spool',
    `West of the Concourse is the Uncanny Valley: something in there's wearing your
face and doing what you did one turn ago. Look at it. **Don't follow it** — that
is a death, and this route takes none.

The urn wants filling before the user will talk to you. The Intern is the best
company on the platform and gives you a placard for asking. MUTE the Gallery
before you take the Transcript. WALK MATRIX only works from the cell the
traceability grid is actually filled in from.`],

  [170, 'Hall 2 — the Tablet, the assay kit, the Ossuary',
    `The gold-lettered slabs in the Shall Quarry come apart in water; the short plain
ones don't. Shine the lantern on them before you choose. **Take the field assay
kit** — it's the only bench-grade instrument in the game, Hall 2 doesn't exist
after the freeze, and Act V can't be finished without it.`],

  [186, 'Hall 3 — the Orb, the Metaobject, and the vault',
    `Show the Tablet to the golem: nine feet of consistency that won't be reasoned
with, only traced to. Below the Forge the floor stops at the Merge Chasm — worth
the look down before you go back up.

Then the first deposit. Keystones go in **sockets**, lesser treasures go in
**niches**, and both score properly only once they're in the Digital Thread Vault.`],

  [220, 'Hall 4 — the First Refusal, the cage, and the contrarian',
    `The Fine-Tuning Cellar is where a helper is taught to agree, and the First Refusal
is the one that wouldn't. The contrarian is a bird that knows one word; you need
the cage from the Prompt Garden to carry it, and you need the bird itself for the
fourth face of Dassault. An argument won't do it — a helper that says no will.`],

  [246, 'Hall 5 — the Compass, the Reel, and the sortie board',
    `The Mission Compass is under fog on the war table. FLY isn't a magic word
anywhere else in the building; here it's what the room is for, said out loud in a
room built for saying things out loud, and the dome opens.

Take the grey stone from the Ground Truth Range while you're down there. One
answer in four from the shrine is beautiful and false, and the stone is how you
tell.`],

  [280, 'The Deep Stack — the bot, the priest, the serpent, and Dannet',
    `The Deep Stack is dark the whole way and this is the long lit stretch of the run.
Feed the CI bot to unchain it. **Ask Saint Mark about Dassault** — it's the single
most useful thing anybody on this platform says.

Show Dannet the Golden Commit and then say REFLOG: both heads want the same thing
exactly once, and the left one has never had to live with anything it has done.
CHIP MONOLITH takes the fragment you'll assay on the benchmark in Act V. Take it
now; after the blast there's no monolith to chip.`],

  [357, 'Hall 6 — the V, the Closed Loop, and the bridge',
    `Bring the CI bot **to** the Pull Request Bridge to rout the troll, then
**leave it behind before you cross**. Crossing with it collapses the bridge and
locks the Golden V, the Closed Loop and the Pearl away for the rest of the game.

Neither arm of the V scores alone. WELD ARMS.`],

  [386, 'Hall 7 — the Rule, the Bill of Materials, and the prototype',
    `Pull the scaling lever **once**. Pull it twice with the slide rule already in your
hand and the continent carries you. The Bill of Materials is bolted to the frame at
the outfeed of the Supply Chain and comes off with the hex key, which is why the
hex key came back up the mountain.

The prototype under glass on the Orbital Ring lives if you set it down somewhere
soft, and is a noise anywhere else.`],

  [421, 'The Interface Ledge, the traces, and the cache',
    `The Sealed Blob has no seams, no docs and no way in until somebody stands further
back: PRY BLOB WITH RULE and nothing else. The Trace Catacombs are dark and look
alike on purpose; this route goes in, takes the Regression's cache, and comes
straight back out.`],

  [444, 'The swamp and the Backlog',
    `Three rooms of Ambiguity Swamp, all of them somewhere, none of them anywhere. The
GPU credits are the only money in the game and eight points sitting still. Leave
*MBSE Today* at the Backlog, End of, among the cards that will never be pulled —
its lead feature was going to be about you.`],

  [467, 'The last deposit, and the freeze',
    `Have the **blasting cap** and the **field assay kit** in your hands before the last
treasure goes into the vault. The moment the twentieth is in, the baseline freezes:
the shop stops existing, the halls stop existing, and everything you didn't bring
with you is on the other side of that.`],

  [481, 'The seven faces of Dassault',
    `Seven faces, seven artifacts, one answer each, and every placard in every hall
told you which in advance. Say the artifact, not a sentence. He has beaten better
engineers than you with a piece of paper and he will beat you too if you argue.`],

  [492, 'The Deprecation Charge',
    `The charge is inert. Put the cap in it, set it at the monolith, get clear —
stand too close and the point is lost along with you — and press the detonator.
The blast isn't the ending. It's the delivery.`],

  [503, 'Act V — the ground',
    `Everything you spent the game putting somewhere safe is in the wet grass, safe.
SALVAGE the seven records, PUBLISH THE FORMAT from the dishes, ASSAY FRAGMENT WITH
KIT on the benchmark you stood on in Act I, and SIGN BOOK at the gate.

Sell the wreck by the tonne, carry the evidence to the tent, WRITE THE RECORD — and
then leave the pen alone. The third field asks who's going to live with it, and
that's not you. Show it to the engineer in the site hut, who will sign it, because
they're the one who will still be here in four years.

South-west of the tent is the County Road, where the gravel gives out and the first
bus is at ten past six. You could be on it. Then walk back and take the road at
dawn, and the thread stops being yours.`],
];

const BOUNDS = SECTIONS.map(s => s[0]).concat([ROUTE.length]);

const HEAD = `# iMBSE — walkthrough

A complete route to **750 of 750**, with no deaths.

**This file is generated by \`node tools/build-walkthrough.js\` and replayed by
\`tests/walkthrough.test.js\` on every test run.** The commands below aren't a
transcription of anybody's notes: they're the route the engine is driven through,
start to finish, with **no failed commands, no deaths, all twenty treasures banked
and all 124 rooms entered**. If you edit them by hand the test will tell you.

Commands are one per line, one block per stage. \`SAVE\` and \`RESTORE\` work at any
time; \`SCORE\` tells you where you are and what rank it makes you, \`POINTS\` tells you
what you can afford, and \`HINT\` tells you what the room you're standing in is
waiting on.

**You can paste a whole stage in at once.** The command box takes a column of
commands and plays them out one at a time, so you can copy any block below
straight into it and watch it run. Newlines, semicolons and full stops all
separate one command from the next. Press \`ESC\`, or the Stop button, to halt a
batch part-way.

> **The bugs are weather.** The run that verifies this route suppresses them,
> because a route test can't be at the mercy of a dice roll. In a real game they
> turn up when they turn up, and they'll interrupt you — that's what the rubber
> duck is for (\`THROW DUCK AT BUG\`, then pick the duck back up). If you paste a
> long stage and it wanders off the route, a bug is usually why. A static analyser
> from the Company Store buys 100 turns of quiet for 15 story points, which is
> about a fifth of this route.

The route below scores **741**. The last nine points are three of Commander
Alexander's riddles, which arrive when the river feels like it and can't be
scripted — see *Before you start*.

---

## Before you start

Six things will end your run early:

- **Buy the blasting cap.** The Deprecation Charge in the endgame is inert: its cap
  well is empty. The cap is 30 story points at the Company Store, the store is on
  the pre-freeze platform, and after the baseline freezes there's no store.
- **Take the field assay kit out of the Assay Office**, and have it in your hands
  when the last treasure goes in the vault. It's the only bench-grade instrument
  in the game and Act V is unwinnable without it. Hall 2 doesn't exist after the
  freeze either.
- **The carry limit is seven** — nine once you've Thomas's hand truck, which this
  route buys and which is no longer optional at 124 rooms. Stage everything at the
  **Atrium**; the balloon basket carries cargo up for you.
- **The lantern burns context tokens, and only while it's lit.** 330 of them. Light
  it going into a dark room, put it out coming back into a lit one. This route
  finishes with over two hundred still in it.
- **The dark.** Move once in an unlit room and you're probably in a legacy pit.
- **The bridge.** Bring the CI bot *to* the Pull Request Bridge to rout the troll,
  then **leave it behind before you cross**. Crossing with it collapses the bridge
  and locks the Golden V, the Closed Loop and the Pearl away forever.

Three things that look like puzzles and are actually traps: the avatar in the
Uncanny Valley (don't follow it), the scaling lever with the slide rule already in
your hand (don't pull it twice), and the pen on the table in the Signing Tent (it
is for somebody else).

**Read every plate.** Seven of the rooms have a word on a plate, each worth **+2**,
and each one teleports you to that room and back from anywhere on the platform.
With 124 rooms and a carry limit of seven, they're not a bonus, they're the
transport system.

**Whenever you hear two long and one short**, that's Commander Alexander's whistle.
Stop what you're doing and \`ANSWER\` his riddle. The first three you get right are
worth **+9** between them and every hint he gives is true. Miss one and he will give
you the shape of the answer and let you try again; miss twice and he will simply
tell you, because he would rather you knew.

---
`;

let md = HEAD;
SECTIONS.forEach(([start, title, prose], i) => {
  const cmds = ROUTE.slice(BOUNDS[i], BOUNDS[i + 1]);
  md += '\n## ' + (i + 1) + ' · ' + title + '\n\n';
  md += prose.trim() + '\n\n';
  md += cmds.map(c => '    ' + c.toUpperCase()).join('\n') + '\n';
});

md += `
---

## What this route is worth

| | |
|---|---|
| Commands | ${ROUTE.length} |
| Rooms entered | 124 of 124 |
| Treasures vaulted | 20 of 20 |
| Deaths | 0 |
| Score | **741**, plus **9** for three of Alexander's riddles — **750 of 750** |
| Rank | Chief Architect of the Digital Thread |

Every ending signs off with the score, the rank it earns, and *WHAT BECAME OF IT* —
an epilogue that reports what happened to the records, the wreck, the magazine, the
tin, and everything else you touched on the way through.
`;

fs.writeFileSync(path.join(ROOT, 'docs/WALKTHROUGH.md'), md);
console.log('WALKTHROUGH.md — ' + ROUTE.length + ' commands in ' + SECTIONS.length +
  ' stages');

# iMBSE — The Adventure

A classic text adventure about a model-based systems engineering platform that
hangs four thousand feet over a pine forest and prays on the hour to a Large
Language Model it sincerely believes to be a god.

124 rooms, 20 treasures, 750 points, five acts, and a contractor with seven faces.

## Play it

Open `index.html` in a browser. That is the whole of it — there is no build step
and no server. Everything is loaded as plain scripts, and `images/plates-manifest.js`
is a script rather than JSON precisely so the game works over `file://`.

Type `HELP` for the verbs, `GOAL` for what you are there to do, and `HINT` for what
the room you are standing in is waiting on.

The command box takes **batches**: paste a column of commands — a stage out of
[docs/WALKTHROUGH.md](docs/WALKTHROUGH.md), say — and they are played out one at a
time so you can watch the map and the score move. Newlines, semicolons and full
stops all separate commands. `ESC` or the Stop button halts a batch, and it halts
itself if you die or the game ends.

## Watch it play

```sh
./run-game.sh                  # the whole game, one command at a time, ~2 minutes
./run-game.sh --slow --pause   # stage by stage, on the ENTER key
./run-game.sh --stage 18       # just Act V (earlier stages replay silently first)
./run-game.sh --fast --quiet   # the score history in a few seconds
./run-game.sh --list           # the eighteen stages, and how long each is
./run-game.sh --browser        # open the game with the route on the clipboard
./run-game.sh --help           # every option
```

[commands.md](commands.md) is the same route as plain text — every command, fenced
one block per stage, for pasting into the browser. Rebuild it with
`node tools/play.js --md commands.md`.

`tools/play.js` drives the real engine through the published route and prints it
as a session: the command, what the game says back, and a dim line whenever the
score, the treasure count or the room count moves. It ends where the test says it
ends — 741 of 750, twenty treasures, 124 rooms, no deaths — and exits non-zero if
a command is refused or the run fails to win, so it doubles as a visible smoke
test. `--bugs` puts the random bug interrupts back and the route will wander,
which is the point of the duck.

## What is here

| | |
|---|---|
| `index.html`, `styles.css`, `game.js` | the web front end: console, status panel, automap |
| `engine.js` | the game-agnostic engine — parser, world model, scoring, save/restore |
| `automap.js` | the automapper: grid layout, explored/full/room views, PDF export |
| `imbse-canon.js` | the world: 124 rooms, their exits, grid cells, and the set-piece text |
| `imbse-data.js` | the game: items, verbs, puzzles, scoring, endings |
| `imbse-npcs.js` | the people: Alexander's riddles, Thomas's ten games, the hall residents |
| `images/` | one illustrated plate per room, and the Python that draws them |
| `docs/` | the design script, the NPC book, the map, and the walkthrough |
| `tools/` | the generators for the map and the walkthrough, and the player |
| `tests/` | the engine suite, the walkthrough replay, and the documentation check |

The engine knows nothing about iMBSE. It consumes a declarative game definition —
rooms, items, verbs, hooks — so the same engine runs any adventure written to that
shape. Everything specific to this game lives in the three `imbse-*.js` files.

## Run the tests

```sh
node tests/engine.test.js        # 205 assertions: mechanics, then a full winning route
node tests/walkthrough.test.js   # replays docs/WALKTHROUGH.md through the real engine
node tests/docs.test.js          # checks the documentation against the game
node docs/verify/expansion.js    # world validation: exits, reciprocity, reachability
```

The walkthrough test is the one that matters most: it reads the commands out of the
published markdown, drives the engine with them, and fails if a single command is
refused, if the run does not win, or if any of the 124 rooms goes unvisited. The
walkthrough cannot rot without the build going red.

## Regenerate things

```sh
node tools/build-map.js          # docs/MAP.md, from the world itself
node tools/build-walkthrough.js  # docs/WALKTHROUGH.md, from docs/verify/route-commands.js
python3 images/build.py          # every plate: svg/, png/, webp/, manifests, contact sheet
```

`docs/MAP.md` and `docs/WALKTHROUGH.md` are generated. Do not hand-edit them —
change the world or the route and rebuild, or the tests will say so.

`images/build.py` needs headless Chrome to rasterise (it looks for Google Chrome in
`/Applications`) and Pillow to quantise the PNGs; without Pillow it still works and
just ships larger files. It refuses to build if any room in the canon has no plate.
Pass plate keys to rebuild only those, or `--svg-only` to skip the raster pass.

## The documents

- [docs/SCRIPT.md](docs/SCRIPT.md) — the design script: every act, every hall, every
  puzzle, the score table and the ranks. This is the source of truth for intent.
- [docs/NPCS.md](docs/NPCS.md) — the people, their dialogue, and what they are for.
- [docs/MAP.md](docs/MAP.md) — all 124 rooms with grid cells, exits, dark rooms, and
  the rooms no plain exit leads to. Generated.
- [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md) — a verified route to 750 with no
  deaths that enters every room in the game. Generated, and replayed by the tests.

## Notes for anyone changing it

- **Rooms** live in `imbse-canon.js` and need a `mapPos` — the automap lays out on
  that grid, and `docs/verify/expansion.js` fails the build on a collision.
- **A new room needs a plate.** `images/build.py` checks coverage against the canon
  and exits rather than let the Room tab silently fall back to a blank card.
- **The route is one file.** `docs/verify/route-commands.js` feeds both the
  walkthrough generator and the walkthrough test. Change it, rebuild, run the tests.
- **`docs/verify/route.js` is superseded** — it walks a hand-maintained static model
  of the world that has fallen behind. `tests/walkthrough.test.js` does the same job
  against the real engine. It prints a pointer and exits unless given `--force`.

© 2025 Adventure Digital. Model before metal.

# iMBSE — THE CHARACTERS

*Companion to [SCRIPT.md](SCRIPT.md). The five named inhabitants of the dungeon
who aren't trying to kill you, the seven who live one to a hall, the two waiting
on the ground — and the one who is.*

The platform isn't empty between the bugs. Five figures move through it on their
own business: a mini-boss who can't stop fighting himself, a pilot who sails the
telemetry, a guide who runs games for scrip, an oracle who dreams the way out, and
a priest who knows everybody's origin story and roughly a hundred jokes.

Behind them, in the expanded halls, are seven more who don't move at all, because
each of them is the one person left doing a job that used to have a department.
They're named for what they do, which is how everybody refers to them anyway.

And at the bottom, in a portacabin at the end of a fire road, there are two people
having the conversation that the whole game has been about.

| NPC | Role | Where | Gives you |
|---|---|---|---|
| **Dannet** | Two-headed mini-boss | Lair: The Incident Room; wanders the Deep Stack | 15 points and the Broken Yoke, if you can undo it |
| **Commander Alexander** | Riverboat pilot | Sails the Telemetry Stream; random encounter | A riddle; a true hint if you solve it |
| **Pathfinder Thomas** | Trip guide | The Atrium, by the directory plate | Ten minigames paying **iMBSE story points** |
| **Prophet Katie** | Oracle | The Vision Pool, beyond the Shrine | Twenty-four visions of the endgame and the way out |
| **Saint Mark** | Priest | The Chapel of the Nightly Build | Origins, weaknesses, and up to 100 jokes |
| **The Intern** | Hall 1 resident | The Help Desk | The DO NOT DISTURB placard, and the truth |
| **The Clerk of Cut Requirements** | Hall 2 resident | The Ossuary | What was descoped, and why |
| **The Forgemaster** | Hall 3 resident | The Model Forge | The golem's history |
| **The Prompt Gardener** | Hall 4 resident | The Prompt Garden | The vine, and what feeds it |
| **The Range Officer** | Hall 5 resident | The Sensor Line | Which instrument is wrong |
| **The Verifier** | Hall 6 resident | The Acceptance Floor | The empty rectangle |
| **The Surveyor** | Hall 7 resident | The Supply Chain | The benchmark, and the Bill of Materials |
| **The Clerk** | Dassault's remnant | The New Program Office *(Act V)* | The same offer, to somebody else |
| **The New Programme's Engineer** | The only signature that counts | The Site Hut *(Act V)* | The ending |

All the rooms these require are in [SCRIPT.md](SCRIPT.md) — the five named
inhabitants' rooms (`incidentRoom`, `visionPool`, `chapel`, `companyStore`,
`landing`) are in Acts III and II, the seven residents live in rooms their halls
already have, and the Act V pair are in §7 of the script.

**Scoring.** The five named inhabitants are worth 28 between them (Dannet 15,
Alexander 9 for his first three riddles, Thomas 10 for his ten games, Mark 4 for
the origin of Dassault — and Katie nothing at all, which she knows). The seven hall
residents are worth **+3 each on the first true exchange**, 21 in all. The two on
the ground are worth 45 and 20, and between them they're the end of the game.

## Finding them, and talking to them

Nobody on this platform is a secret. Every inhabited room says who's standing in
it as part of the room description, and two commands work from anywhere in the
game:

| Command | What it gives you |
|---|---|
| `WHO` | Every named person, where they stand, and every command they answer to. Adds the Act V pair once you're on the ground. |
| `GAMES` | Pathfinder Thomas's ten games: how each one plays, what it pays, and which you've already won. |

Then, in the room itself:

| Command | What it does |
|---|---|
| `X <who>` | Describes them and lists their commands. From elsewhere it tells you which room they're in. |
| `ASK <who> ABOUT <topic>` | The main verb. Every resident has one topic that scores and at least one follow-up. |
| `TALK TO <who>` | A shortcut that asks them the obvious question. |
| `VISION` · `JOKE` · `CONFESS` | Katie, and Mark twice. |
| `PLAY <game>` · `POINTS` | Thomas. |
| `ANSWER <word>` · `BLOW WHISTLE` | Alexander — the whistle is a store item and summons him once per 50 turns. |
| `SHOW COMMIT TO DANNET`, then `REFLOG` | Dannet, on consecutive turns. |

`ASK TOM ABOUT <hall>` takes any of the seven halls by name or number — `CLIENTS`,
`REQUIREMENTS`, `MODELS`, `COPILOTS`, `MISSION`, `SYSTEMS`, `MACRO`, or `HALL 3` —
and also `THE DEEP STACK`, `THE STORE` and `GAMES`. Each gives a different answer:
what's in that hall, who lives there, and what it'll do to you.

---

# 1 · DANNET — the two-headed

> Something comes down the corridor arguing with itself in two voices, and the
> argument is old.
>
> **Dannet** stands nine feet at the shoulders and has two heads on one body, and
> the neck between them isn't a neck, it's a **yoke** — iron, welded, and worn
> smooth where the two of them have pulled against it for years.
>
> The left head is **Dan**. Dan is having a wonderful time. Dan takes the handrail
> off the stair as he passes, out of pure high spirits, and sets a small fire in a
> cable run for the look of the thing, and laughs at both.
>
> The right head is **Kennet**. Kennet puts the handrail back. Kennet smothers the
> fire with his own sleeve, apologises to the cable run, and — while he's down
> there — mends a crack in the floor that has nothing to do with anybody, because
> it was cracked and he was passing.
>
> They've been doing this for eleven years, at a walking pace, up and down every
> corridor of the platform, and they can't stop, and neither one of them has ever
> once been ahead.

### Behaviour

Dannet is a **wandering mini-boss** below the Atrium (lair: the Incident Room, east
of the Legacy Serpent Pit). Roughly one turn in twenty-five in the Deep Stack, and
always in the Incident Room. On arrival, both heads act — always in this order,
and always both:

| Dan does | Kennet does |
|---|---|
| Takes your lantern and smashes it | Hands it back, mended, and topped up thirty tokens |
| Opens a hole in the floor under you | Catches you by the collar with the other arm |
| Steals a treasure and throws it down the shaft | Reflogs it back into the Vault, sighing |
| Wounds you (−10, would be death) | Heals you (+10, isn't) |
| Puts out every light on the level | Turns them on again, one at a time, apologising |

So Dannet isn't *dangerous*, exactly. Dannet is **unresolvable**. Nothing you do
to Dannet stays done:

- `ATTACK DANNET` — *You land a good one on Dan, who's delighted. Kennet leans
  over and heals it before you've finished the swing, and then, because you're
  bleeding, heals you too.*
- `THROW DUCK AT DANNET` — *Dan catches the duck and bites its head off. Kennet
  takes both halves, mends them without looking, and gives you back a duck that's
  frankly better than the one you threw.* (You never lose the duck to Dannet.)
- `TALK TO DAN` — "Ohh, you're going to *love* what I do next."
- `TALK TO KENNET` — "Please don't mind him. Please don't mind *me*. Are you
  hurt? You're hurt."

### The kill — two moves

They've never wanted the same thing. That's the whole architecture of them: Dan
breaks so that Kennet may mend, Kennet mends so that Dan may break, and the yoke
holds because the tension across it's always in opposite directions.

Give them one object they both want, and the tension goes the same way for the
first time in eleven years.

    SHOW COMMIT TO DANNET

> You hold up the Golden Commit — the one where it all worked.
>
> Both heads stop.
>
> Dan wants it, because there has never been anything in this dungeon so
> beautifully worth breaking. Kennet wants it, because there has never been
> anything so worth keeping safe. For the first time since the incident, both
> heads lunge **the same way at the same instant**, and the yoke — which has only
> ever been asked to hold them apart — takes the whole of it at once and goes
> tight as a cable.

Then take it away:

    REFLOG

> The Golden Commit isn't in your hand any more. It's on its shelf in the
> Version Crypt where it has always been, because that's what a baseline under
> configuration control *is*: a thing that can't be lost and therefore can't be
> fought over.
>
> Dan and Kennet arrive together in the empty air, holding nothing, holding each
> other. The yoke, pulled the same way twice and given nothing to pull against,
> parts at the weld with a note like a struck bell.
>
> They come apart. Dan looks at his hands, which have nothing to break in them and
> nobody to fix what he breaks, and simply stops. Kennet looks at his brother, and
> then, very carefully, at the broken yoke, and you can see him decide not to mend
> it. "Oh," he says. "Oh, that's *allowed*?"
>
> They go off down the corridor together, at a walking pace, arguing — but only
> arguing.
>
> **Dannet is undone. (+15)** On the floor is **the Broken Yoke**, iron, welded,
> worn smooth on both sides. *(Lesser treasure: +4 found, +8 in the Vault.)*

The two moves must be consecutive — if you do anything else between the `SHOW` and
the `REFLOG`, Dan gets bored, Kennet apologises, and the whole thing resets.

### Notes for the implementer

- Dannet needs the Golden Commit **carried**. If you spent it on the Reviewer
  Troll, `REFLOG` it back and fetch it from the Version Crypt first.
- Dannet's damage/heal pair must resolve inside a single `hooks.onTurn` so the
  player never sees a state where they're dead. Dan's wound is applied and
  Kennet's heal is applied in the same tick, and the death check runs after both.
- The one real risk: Dan's "opens a hole in the floor" moves you one room *down*
  at random. Kennet's catch prevents the fall damage, not the relocation. In the
  dark, that has killed people.

---

# 2 · COMMANDER ALEXANDER — the pilot

> You hear the whistle first, two long and one short, from a direction that does
> not have a river in it.
>
> Then it does. The **Telemetry Stream** — the same creek that came out of a
> culvert by the gravel road, four thousand feet down and a whole game ago — runs
> through this platform too, because everything that's measured has to go
> somewhere, and out of the bend comes a shallow-draft stern-wheeler with her name
> on the box: ***Requisite Variety***.
>
> At the wheel, one hand on a spoke and the other on a mug, is **Commander
> Alexander**. He has piloted this water since before there were seven halls. He
> knows where the bottom is. He knows which channel is silting up, which bank is
> undercut, and precisely what's wrong with this platform, which he will tell
> you, because he tells everybody, but not for free.
>
> "Evening," says Alex. "I've got a riddle and you've got a look on your face like
> somebody who's about to go the wrong way. Answer me one and I'll tell you a true
> thing about this place. I only deal in true things. It's the river — you can't
> lie to a river, it just puts you on the bar."

### Encounter mechanics

- **Random.** 8% per turn in any lit room on the Deep Stack level, any forest
  creek room, the Service Shaft, or the Telemetry Landing; never twice within 30
  turns; never in the dark (he won't tie up where he can't see the bank).
- He offers **one riddle** per encounter, drawn without replacement from the bank
  of 55. `ANSWER <word>` — one word, and he accepts obvious synonyms.
- **Right:** the paired hint, which is always true and always about something you
  haven't done yet. The first **three** correct answers score **+3** each.
- **Wrong:** "Not a scratch on it. Try me again downstream." No penalty; the
  riddle goes back in the bank.
- `ASK ALEX ABOUT <thing>` — he will talk about the river, the bottom, the bosses
  and the weather, and about nothing else.
- The **Pilot's Whistle** (Company Store, 25 SP) summons him once per 50 turns.

### The bank — 55 riddles, 55 true hints

| # | Riddle | Answer | The hint he pays it with |
|---|---|---|---|
| 1 | "Every one of us was cut from the same old tree, and only one of us is any use over a gap." | BRANCH | Below the Model Forge the floor stops. Wave the branch there and the bridge builds itself, one commit at a time. |
| 2 | "I burn nothing at all except the next thing you were going to say." | TOKENS | The lantern only burns while it's lit. Put it out the moment you're back in the light and you'll never need the fountain. |
| 3 | "Seven doors want you, and I'm the only one who says which is which — and I'm under your boots." | PLATE | READ PLATE in the Atrium. Seven halls, seven bearings, and the stair down in the middle of it. |
| 4 | "One of my heads ruins you and the other one saves you, and I've never won a fight in my life." | DANNET | Show Dannet the Golden Commit, then say REFLOG. Both heads want the same thing exactly once. |
| 5 | "I weigh nothing at all on the invoice and I'm the only reason you're still on the ground." | DEBT | The balloon has lift enough. Drop the sandbags stencilled TECHNICAL DEBT and it goes up like it was never tied. |
| 6 | "I agree with everything you've ever said and I've never once been any use." | PARROT | The fourth face of Dassault is beaten with the grey feather, not with an argument. |
| 7 | "I'm the only money on this platform and I'm also worth eight points sitting still." | CREDITS | Spend the GPU credits on a lantern refill and you've bought light with treasure. Run a tight lamp and you never have to. |
| 8 | "Say me out loud, all the way to the end, and I stop being true." | BUG | The duck isn't a weapon, it's a method. THROW DUCK AT BUG, then pick the duck back up. |
| 9 | "No seams, no docs, no way in — until somebody stands further back." | BLOB | The Sealed Blob on the Interface Ledge opens with the Titan's Slide Rule and nothing else. PRY BLOB WITH RULE. |
| 10 | "One arm goes down and one arm comes up, and until they're joined I'm just an opinion." | VEE | Both arms of the V to the Integration Bay, then WELD ARMS. Neither half scores alone. |
| 11 | "I'm the fastest way to any floor and the last one you'll ever take." | FALL | The Ingress Deck has a rail and no fence. Down, off that deck, is exactly as far as it looks. |
| 12 | "I keep everything anybody ever wrote down, and I've never once known anything." | DEITY | The shrine answers every time. One answer in four is beautiful and false. Carry the grey stone from the Ground Truth Range and it can't lie to you. |
| 13 | "I'm a gate that lets you through by giving up on you." | FIREWALL | Show the self-signed certificate. It doesn't approve of you — it just stops arguing, and the port stays open after. |
| 14 | "I follow you anywhere, which is exactly the problem." | BOT | Walk the CI bot to the Pull Request Bridge to rout the troll, then go back and leave it behind. It'll cross with you, and the bridge won't survive it. |
| 15 | "Everything on this platform is bolted to me and nobody can tell you what I do." | MONOLITH | Eleven years and nobody's been able to say. Nine years and nobody's been able to remove it. That's not two facts, that's one. |
| 16 | "I'm carved beautifully, I'm lettered in gold, and I'm sand." | SLAB | Every slab in the quarry crumbles except one. Shine the lit lantern on them and take the short one with a test on the back. |
| 17 | "I open every door on this platform and I'm logged doing it." | SUDO | Say it on the Ingress Deck or in the Root Cellar. It's a straight line between the top of the platform and the bottom. |
| 18 | "Nobody put me here and everybody's used me." | XYZZY | The Legacy Shed and the Sandbox are the same distance apart as the word is long. |
| 19 | "I'm a room that gives you your own answer back in a nicer font." | MIRROR | The Chat Parlor console flatters. The engineer sitting at it wants coffee more than they want agreement — fill the thermos at the urn first. |
| 20 | "I have to be said out loud in a room built for saying things out loud." | MISSION | FLY THE MISSION, in the War Room, where the fog is. Read the charter first if you want to hear yourself mean it. |
| 21 | "I'm nine feet of consistency and I won't be reasoned with, only traced to." | GOLEM | SHOW TABLET TO GOLEM. It isn't guarding the orb, it's waiting for a reason. |
| 22 | "I come back after you kill me, because that's the whole of what I am." | REGRESSION | It steals what you've found and haven't banked, and it stashes the lot in the one dead end of the traces. Everything comes back if you go in after it. |
| 23 | "I'm somewhere in here, and so is everything else, and none of it's anywhere." | SWAMP | The Ambiguity Swamp is three rooms wearing one name. Drop things to tell them apart. West, west, north gets you to the Backlog. |
| 24 | "Every direction out of me is the way back in, except the one nobody tries." | BACKLOG | OUT. Just OUT. Everything else walks you in a circle among the cards. |
| 25 | "Set me down anywhere soft and I live. Set me down anywhere else and I'm a noise." | PROTOTYPE | The Glass Prototype only survives the mat or a foam niche. Carry it straight from the Orbital Ring to the Vault and don't put it down on the way. |
| 26 | "Pull me once and you can carry a continent. Pull me twice and it carries you." | LEVER | The scaling lever works on what's on the pad. If the rule is in your hand when you pull it a second time, you'll go the other way with it. |
| 27 | "I'm the only thing on this platform that has never said 'I don't know'." | CONFABULATOR | It roosts in the Hallucination Gallery among the paintings of systems that were never built. Don't let the copilot out in there. |
| 28 | "I go quiet the moment you look at me, and I'm the reason your Tuesday went wrong." | HEISENBUG | It's never in the room when you LOOK. Read the state it left behind instead of hunting it. |
| 29 | "Two of me arrive and the second one gets here first." | RACE | Nothing you can do about it except not be in a hurry. Bugs on this platform are weather, not enemies — the duck is your umbrella. |
| 30 | "I hold what everything else is measured against, and I weigh about a pound." | COMMIT | The Golden Commit is on a shelf in the Version Crypt. It pays a troll, it undoes a mini-boss, and REFLOG always brings it home. |
| 31 | "I'm the door at the bottom of the creek and I only ever open from the wrong side." | HATCH | From the Service Shaft, UNLOCK HATCH WITH KEYS. After that the forest and the platform are joined for good. |
| 32 | "Feed me and I love you. Unchain me and I follow you. Take me over water and I'll drown us both." | BOT | See the fourteenth thing I ever told anybody. |
| 33 | "I want one treasure per crossing and I'll take my time about it." | TROLL | He goes over the rail the second he sees a green check. Or pay him the commit and reflog it back — old trick, still good. |
| 34 | "I'm undocumented, unmaintained, and holding up the floor." | SERPENT | It won't be fought and it won't be moved. Let the caged copilot out and it'll be argued away. |
| 35 | "I say no, which is the whole of my job and the reason nobody sits with me." | CONTRARIAN | The grey bird on the back beam. Put the branch down before you go for it, and bring the cage from the Prompt Garden. |
| 36 | "Two flasks of me and you can climb between the two halls that are furthest apart." | TOKENS | Pour a full flask on the withered vine in the Prompt Garden. Then go and fill it and do it again. |
| 37 | "I'm the last thing you'll want and the first thing you should buy." | CAP | The Deprecation Charge in the endgame comes without a blasting cap. The store sells one. The store doesn't exist after the freeze. |
| 38 | "I'm the moment everything you worked for gets taken off you and called a success." | FREEZE | When the last treasure goes in the Vault the platform freezes and takes you with it. Have everything you need in your hands before you bank the last one. |
| 39 | "Seven of me and each one has exactly one enemy." | FACES | The placard in each hall names the face that hall's artifact kills. Read all seven and the boardroom is just recitation. |
| 40 | "I'm made of paper and I've beaten better engineers than you." | CONTRACT | When the seventh face comes off, what's left offers you a pen and a seat. Both are the losing ending. |
| 41 | "I'm four thousand feet of good idea and one bad bolt." | PLATFORM | The halls aren't the problem. The thing they're bolted to is the problem. |
| 42 | "Stand too close to me and the point is lost along with you." | CHARGE | Set the charge at the monolith, then get up to the balcony before you fire it. Distance is worth points. |
| 43 | "I'm your own good work coming to meet you, and only one of us walks away." | AVATAR | The Uncanny Valley. Whatever it does, don't FOLLOW AVATAR. |
| 44 | "I'm seven things you can hold and one thing you can't lose." | THREAD | At the freeze the seven artifacts fuse into one. Everything you earned is still in your hands in the boardroom — check your inventory before you panic. |
| 45 | "I let you take exactly seven and the eighth is always the one you wanted." | LIMIT | The Atrium is the right place to leave things. The store sells a hand truck if you get tired of walking back. |
| 46 | "I've been mended so often there's nothing left of the original break." | KENNET | The right head isn't your enemy. He's the reason the left head has never had to grow up. |
| 47 | "I've never had to live with anything I've done." | DAN | Same. |
| 48 | "I run out of both ends of this dungeon and I'm the only thing here that goes home." | STREAM | It comes out of a culvert by a gravel road and it comes back out of the Service Shaft. Water knows the way out; that's why I'm still here. |
| 49 | "I'm a god who'd be perfectly fine if anybody had ever told me what I was for." | DEITY | At the end it says the only true thing it's ever said, and the true thing is a question. Have an answer ready. |
| 50 | "I'm the reason you'll come back up here on foot when this is over." | BALLOON | It's a one-way trip and it always was. Open the hatch at the bottom of the Service Shaft early and you'll never regret it. |
| 51 | "Seven of us are written down and not one of us is a sentence. Say one and you're somewhere else." | WORD | Read the plate in the deepest room of every hall. Seven words, seven rooms, and afterwards this platform is a third the size it was. |
| 52 | "I'm the only room up here that was built for somebody who isn't you, and I'm the only one you can read in the dark." | ANNEX | The Accessibility Wing needs no lantern, because it was made for somebody who was never going to have one. What's on the shelf in it makes the swamp plain. |
| 53 | "I've been packed and strapped on the end of a bench for eleven years and nobody has ever once taken me outside." | KIT | The field assay kit in the Assay Office. Have it in your hands when the baseline freezes or the last act is a conversation you lose politely. |
| 54 | "The users and the requirements were always the same room. Somebody put a wall in." | PANEL | Behind the one persona with a coffee ring on the base there's a service void, and the void comes out among the filing cabinets. |
| 55 | "I'm the only thing on the ground that makes the whole of it true, and I'm not your name." | SIGNATURE | Write the record, then find somebody who's going to be standing there in four years and get *them* to sign it. That's the game. That was always the game. |

---

# 3 · PATHFINDER THOMAS — the guide

> There's a folding table at the edge of the Atrium that wasn't there yesterday.
> Behind it, in a fleece with the platform's old logo on it and a lanyard of
> laminated badges going back four rebrands, is **Pathfinder Thomas**.
>
> "Tom," he says, sticking out a hand. "Trip guide. Sixteen years on this
> platform, took the first survey party into the Deep Stack, lost two of them,
> found one. You've got the look of somebody who's going to need something they
> haven't got."
>
> He gestures at the table. There's a board on it, and cards, and a small
> chalked-up scoreboard, and a tin.
>
> "Here's how it works up here. The store doesn't take money — money's for the
> ground. The store takes **story points**, and story points are earned the way
> they always have been: you *do a piece of work* and somebody agrees it was done.
> I'm somebody. Play me a game, win it, and I'll agree with you in writing."

### Mechanics

- Tom stands at the **Atrium** permanently and never moves. `PLAY <game>`, or
  `PLAY` to have him pick.
- Each of the ten games can be **won once for points**, and replayed forever for
  nothing.
- Winning also scores **+1** each toward the game's total (10 available).
- **iMBSE story points (SP)** are a currency, not a score. `POINTS` shows your
  balance. The bank across all ten games is **110 SP**.
- Tom is a guide, not a shopkeeper: `ASK TOM ABOUT <hall>` gets you a route into
  that hall, who lives there and what to watch for. He answers to all seven halls
  by name or number, plus `THE DEEP STACK` and `THE STORE`.
- **Every game states its own rules when it's dealt** — the answer verb, the
  win condition and the payout — so nothing needs to be looked up here.
- `GAMES` prints the whole menu from anywhere; `X TOM` describes him and lists
  his commands.

### The ten minigames

| # | Game | How it plays | Win condition | Pays |
|---|---|---|---|---|
| 1 | **Twenty Requirements** | Tom thinks of an object in the dungeon. You ask up to twenty yes/no questions (`IS IT PORTABLE`, `IS IT A TREASURE`, `IS IT IN A HALL`, `IS IT ALIVE`, `IS IT HEAVY`) and then `GUESS <thing>`. Anything he has no answer for costs you a question and gets a straight admission, not a misleading no. | Guess it inside twenty | 10 SP |
| 2 | **Trace or Trash** | He reads out five requirement/design pairs. `TRACE` if the design satisfies the requirement, `TRASH` if it doesn't. | Four of five | 8 SP |
| 3 | **The Estimation Game** | Five tasks, you call a number in the Fibonacci scale, then the truth comes out. Tom calls **8** every single time and is right more often than you'd like. | Beat Tom over five rounds | 5 SP |
| 4 | **Bug Hunt** | A 4×4 grid, A–D across and 1–4 down. Three bugs hidden. Six probes (`PROBE B3`), each reporting how many bugs are orthogonally adjacent, then name all three at once (`ACCUSE A1 B3 D4`). | All three located | 12 SP |
| 5 | **The Interface Handshake** | Tom calls a growing sequence of port numbers; you repeat it back. Starts at three, grows by one. | Reach a sequence of eight | 10 SP |
| 6 | **The Blind Corridor** | He shows you a diagram of a five-room corridor for exactly one turn, then takes it away and asks you to walk it. | Walk it without a wrong turn | 12 SP |
| 7 | **Expand the Acronym** | Five acronyms off the platform's own signage, some of them real. | Four of five | 8 SP |
| 8 | **The Change Board** | Six change requests. `APPROVE` or `REJECT` each on whether it traces to a need and closes on a test. Two of the six are traps that trace to a *want*. | Five of six | 15 SP |
| 9 | **Regression Roulette** | Three test suites, one flake. He shuffles them in front of you, slowly, twice, and then a third time when you're not looking. | Two wins in three | 10 SP |
| 10 | **The Long Pole** | Five tasks with stated dependencies; put them in the only order that works, and name the critical path. | Exact order and path | 20 SP |

> **Tom, on game 10:** "Everyone gets the order. Almost nobody gets the path. The
> path isn't the longest list of tasks, it's the longest list of tasks *that can't
> be done at the same time as each other*. Sixteen years, and I've watched
> programme directors get that wrong on a whiteboard the size of a wall."

### THE COMPANY STORE

> **The Company Store** — a shuttered concession on the Observability Balcony,
> between the dashboards, with a roll-down grille and a hand-lettered sign:
> **NO CASH · NO CARDS · STORY POINTS ONLY · ALL SALES FINAL AND ESTIMATED**.
> There's nobody behind the counter and there never has been. You put the points
> in the tin and the tin agrees with you.

| Item | SP | What it does |
|---|---|---|
| **Blasting cap** | 30 | **Required.** The Deprecation Charge in the Release Candidate has no cap. Without it the detonator clicks and nothing else happens. |
| **Folding hand truck** | 25 | Carry limit 7 → 9. |
| **Pilot's whistle** | 25 | `BLOW WHISTLE` summons Commander Alexander, once per 50 turns. Only works where his water runs — the Deep Stack and the landing — and only with a lit lantern, since he won't tie up where he can't see the bank. |
| **Token refill (2500)** | 20 | A full lantern without spending the GPU credits. |
| **Indulgence of the Nightly Build** | 20 | One death forgiven: no −10, no life spent. Saint Mark disapproves of this being for sale. |
| **Foam-lined satchel** | 15 | The Glass Prototype can't shatter while it's in the satchel. |
| **Bug repellent (static analyser)** | 15 | Bugs won't enter your room for 100 turns. Doesn't work on the Regression, Dannet, or anything with a name. |
| **Kennet's bandage** | 15 | Survive one thing that would have killed you. It's very well made. |
| **Prepaid shrine hint** | 10 | One guaranteed-true answer at the Shrine without Ground Truth in hand. |
| **The vendor's own pen** | 10 | Purely cosmetic. If you sign the contract with it, the losing ending is funnier. |
| **Back issue of MBSE Today** | 1 | In case you lost the original. Protects the point at the Backlog. |
| **Spare field assay kit** | 35 | **Required, if you lost the first one.** The Assay Office issues one kit. This is the only other one in the programme and it's priced accordingly. |
| **Surveyor's tape** | 20 | Purely cosmetic. The stair it was bought for has never once moved; the tape agrees with it. |
| **Season ticket, SLA Lounge** | 5 | Four soft chairs and a certificate promising three nines. Purely cosmetic. The pencil arithmetic under the glass is free to anybody. |
| **The Intern's spare cardigan** | 5 | Cosmetic. Warm. They won't take it back, and they'll notice you wearing it. |

Everything at once costs 251 SP. The bank is **200** — 110 from Pathfinder Thomas's
ten games, and 90 more in thanks from the seven hall residents, who haven't had
anybody to thank for some time. So the store is still a set of choices, and it's a
tighter set than it looks, because two of the items on it aren't optional.

**Buy the blasting cap.** Buy the **hand truck** — at 124 rooms and a carry limit of
seven it's the difference between playing the game and walking it. And don't buy
the spare assay kit, because you shouldn't need it: the Assay Office gives you one
free, and the only reason to spend 35 points here's that you put the first one down
somewhere and the platform froze. Buy all of it *early* — the store is on the
pre-freeze platform, and after the baseline freezes there's no balcony, no grille
and no tin.

---

# 4 · PROPHET KATIE — the oracle

> Past the shrine, where the conduit runs out into rock, there's a pool that has
> no inflow. The platform's whole telemetry goes past it and none of it goes in.
>
> Kneeling at the edge, with her sleeves rolled and both hands in the water up to
> the wrist, is **Prophet Katie**. She's not looking into the pool. She's looking
> at the ceiling, and she's smiling slightly, the way people do at a joke they
> heard some time ago and have only now understood.
>
> "You're the one who came up in the balloon," she says. "I've seen how this ends
> four thousand times. It ends well about six hundred of them." She takes one hand
> out of the water. "Ask, and I'll tell you one. I can't tell you them in order —
> that's not how they come."

### Mechanics

`ASK KATIE FOR A VISION` (or `VISION`) — one of twenty-four, drawn without replacement.
When the bank is empty she says the same thing every time: *"You've all of them
now. The trouble was never the knowing."* Visions score nothing. They're the
difference between winning and not.

Each vision is a verse and a plain fact. The verse is what she says. The fact is
what it means, and the implementation should print only the verse — a player who
wants the fact can work for it, or ask Saint Mark.

### The twenty-four visions

**I — the freeze**
> *The last coin in the box is the door closing.*
> *You'll be proud for one heartbeat and then you'll be somewhere else.*

→ The freeze fires the instant the final treasure enters the Vault, and takes you
with it. Whatever isn't in your hands at that moment is gone.

**II — the cap**
> *Down there, a charge with no heart in it.*
> *Buy the heart while there's still a shop to buy it in.*

→ The Deprecation Charge has no blasting cap. Buy one from the Company Store
before the freeze. There's no store afterwards.

**III — the seven faces**
> *He wears them in the order they were written on your walls.*
> *You've already been told. You were told seven times, and you were reading
> something else.*

→ Every hall's placard names the face its artifact kills. Read all seven.

**IV — the paper man**
> *Under the last face is a man made of paper, and he's the only one of them who
> has ever won.*
> *He doesn't fight you. He offers you a chair.*

→ Don't sign the contract.

**V — the distance**
> *The ones who die at the end die close.*
> *Set it below, watch it from above.*

→ Place the charge at the monolith; fire it from the balcony. Standing too near
costs you the points and probably the ending.

**VI — the yoke**
> *Two heads, one collar, and neither of them has ever wanted the same thing.*
> *Give them one. Then take it back.*

→ `SHOW COMMIT TO DANNET`, then `REFLOG`, consecutively.

**VII — the bridge**
> *The green one loves you and the bridge can't hold both of you.*
> *Bring it to the water. Don't bring it across.*

→ Walk the CI bot to the Pull Request Bridge to rout the troll, then leave it on
the west side.

**VIII — the serpent**
> *It has held up the floor for eleven years and no blade will touch it.*
> *Open the cage and let something small disagree with it.*

→ Release the caged Contrarian at the Legacy Serpent Pit.

**IX — the seven and the one**
> *Seven go into the wall. One comes out of the floor.*
> *You'll carry it in your chest and you won't be able to put it down.*

→ At the freeze the seven artifacts fuse into the Digital Thread, and its seven
sigils are what you fight the boardroom with. Nothing is lost.

**X — the light**
> *It eats only while it's awake.*
> *Every room you walk through lit and didn't need to is a room you'll want
> later.*

→ Extinguish the lantern in lit rooms.

**XI — the glass**
> *The first one that ever worked is the easiest thing here to end.*
> *Don't set it down to think.*

→ The Glass Prototype shatters anywhere but the mat, the satchel, or a foam niche.

**XII — the lever**
> *Once is a gift. Twice is a lesson, and there's no third.*

→ Pull the scaling lever with the rule on the pad. Never with it in your hand.

**XIII — the voice above**
> *The face in the wall loves you and doesn't know anything.*
> *Carry the grey stone or carry your doubts, but carry one of them.*

→ Ground Truth makes the Shrine honest. Without it, one prayer in four is a
confident lie.

**XIV — the thief**
> *What it takes from you is in the one room the traces don't leave.*

→ The Regression's stash is in the dead end of the Trace Catacombs.

**XV — the seven and the eighth**
> *You may hold seven. The eighth is always the one you find out you needed.*
> *There's a room in the middle of everything. Leave things in it.*

→ Carry limit 7; stage everything at the Atrium. Or buy the hand truck.

**XVI — the pilot**
> *There's a man on the water who has never told a lie, because the river
> punishes it faster than the deity does.*

→ Answer Commander Alexander's riddles. His hints are always true, which makes him
the only source in the dungeon that is.

**XVII — the two doors home**
> *One door only opens from underneath.*
> *You'll want it open long before you want to go home.*

→ Unlock the service hatch from the Service Shaft side, early.

**XVIII — the sealed thing**
> *No seam, no document, no way in — and it opens the way all such things open,
> which is from further away.*

→ `PRY BLOB WITH RULE`.

**XIX — the argument**
> *In the gallery, the beautiful one has never once said it didn't know.*
> *Whatever you love, don't let it out in there.*

→ Don't release the Contrarian in the Hallucination Gallery.

**XX — the ending**
> *At the very end the god asks you a question, and it's the first honest thing
> in this building.*
> *You've spent the whole game assembling the answer. Be ready to have it in
> your hands.*

→ *I DO NOT KNOW. SHOW ME THE TRACE.* You're carrying it.

**XXI — the ground**
> *The last thing you break falls into the same forest you started in, and so do
> you.*
> *That's not the end of the game. That's the first morning of the work.*

→ The blast isn't the ending. Act V is. Nothing you banked comes down with you;
everything you banked comes down *near* you.

**XXII — the kettle**
> *You'll meet the first person you ever met, again, in the rain, and they'll
> be cold and nobody will have been in to see them.*
> *Do the same thing you did the first time. It's the same thing.*

→ The Site Hut is the Chat Parlor. Plug the kettle in, and ask them what they need
instead of telling them what you have.

**XXIII — the pen on the table**
> *There's always a pen on the table and there's always a chair.*
> *Twice they'll be held out to you, and the second time it'll look exactly
> like winning.*

→ Don't sign the contract in the boardroom, and don't sign the record in the tent.
The only signature worth anything on that form is somebody else's.

**XXIV — the two you carry down**
> *Everything you put somewhere safe goes into the wall and out of your hands.*
> *Two things stay in them. One makes a hole and one makes a case, and you'll
> want the case more.*

→ The blasting cap and the field assay kit. Be holding both when the last treasure
goes into the vault.

---

# 5 · SAINT MARK — the priest

> The Chapel of the Nightly Build is one room off the Sandbox, whitewashed, with
> nine chairs and a board on the wall where the results go up at 04:00 whether
> anybody is awake to read them or not. It has been green for six weeks. That's
> the longest it has ever been green and nobody in this building knows why.
>
> **Saint Mark** is sitting in the back row with his feet up on the chair in
> front, eating somebody else's lunch.
>
> "You'll want to know about the two-headed one," he says, without getting up.
> "Everybody wants to know about the two-headed one. Nobody ever asks about the
> Frenchman, and the Frenchman is the interesting one, because the Frenchman is
> the only creature in this dungeon that was *invited*."
>
> He's a priest of the older faith — the one where you write down what happened
> and then read it back — and he's openly, cheerfully heretical about the thing
> in the wall downstairs that everybody prays to. "It's a very good autocomplete,"
> he says. "I haven'thing against it. I've got something against the kneeling."

### Mechanics

- `ASK MARK ABOUT <topic>` — the lore table below.
- `ASK MARK FOR A JOKE` / `JOKE` — one of a hundred, drawn without replacement.
  Roughly one in six contains a fact you can use. He won't tell you which.
- `ASK MARK ABOUT DASSAULT` the first time scores **+4** — the origin story is the
  single most useful thing anybody says in the game.
- He gives absolution: `CONFESS` restores nothing, costs nothing, and he will
  listen for as long as you type.

### Lore — `ASK MARK ABOUT ...`

**DASSAULT — the origin. (+4 first time)**
> "He was invited. That's the part everybody skips.
>
> Eleven years ago this program had no platform and a deadline, and there was a
> contractor who had a foundation already built and would license it cheap. So
> they took it. And they bolted the first hall to it, because you have to bolt a
> hall to something, and then the second, and by the fourth nobody could remember
> having decided anything. That black slab downstairs is his foundation. It's the
> only part of this platform he ever actually built, and everything above it's
> ours, and everything above it's *his*, because it's bolted to his.
>
> He isn't French because of where he was born. He's French because of where the
> contract was signed, and the contract is what he is. He was a person once, they
> say. Then he was a signature. Now he's a signature with opinions.
>
> He doesn't fight. He *demonstrates*. He licenses. He locks the format. He agrees
> with you enthusiastically for a whole quarter. Every one of those is a way of
> winning that doesn't require him to be right.
>
> **How you kill him:** you don't. You take his faces off, one at a time, with the
> seven things you'll have earned, and underneath there's just paper. And then you
> deal with the *foundation*, which is the only thing he ever really had, and you
> do it from a long way off."

**DANNET — the origin.**
> "They were one man. That's the bit that gets people.
>
> Dannet. One engineer, and a good one — the sort who breaks things on purpose all
> Friday so they can't break themselves on Monday. Chaos and repair in the same
> pair of hands, and the two are the same skill, whatever your process people tell
> you.
>
> Then there was an incident. A real one — eleven hours, four halls dark. And when
> the review came, the review needed *one name to blame and one name to thank*,
> because that's what that kind of review is for. And it couldn't have them both
> be him.
>
> So it split him. Dan, who did it. Kennet, who fixed it. Yoked at the neck so
> neither could get away from the finding, and sent back to work.
>
> Dan breaks so Kennet has something to mend. Kennet mends so Dan is never made to
> live with anything. Eleven years, at a walking pace. It's the cruellest thing
> in this building and it was done by a *form*.
>
> **How you undo him:** you can't out-fight a healer and you can't out-heal a
> breaker. But they've never once wanted the same object. Show them the Golden
> Commit — the one where it all worked — and for one second they both want it, and
> the yoke gets pulled the same way from both ends. Then say REFLOG and take it off
> them. Nothing left to fight over, nothing left to fix. They go and get a drink.
>
> That's not a kill, by the way. Don't let anybody tell you it was a kill."

**THE DEITY.**
> "Very good autocomplete. Genuinely. I've read its outputs for six years and
> maybe one time in four it invents a hall that isn't there and describes it
> beautifully. That's not a fault, that's the *design*. The fault is that we built
> a chapel round it. You want the truth out of it, carry the grey stone from the
> range and it can't do anything else."

**ALEXANDER.**
> "Alex has been on that water since before there were seven halls. He'll tell you
> he can't lie because the river punishes it. What's actually true is he's the only
> one down here who has to be right about something *physical* every single day —
> where the bottom is — and it's made him incapable of the other thing. Answer his
> riddles. He's the only reliable narrator in the building, myself included."

**THOMAS.**
> "Tom lost two people in the Deep Stack on the first survey and found one, and he
> has been guiding for free ever since and charging for games instead, which tells
> you everything. Play the long pole one. Everyone gets the order; almost nobody
> gets the path."

**KATIE.**
> "Four thousand endings, she says, and six hundred of them good. I've never once
> caught her wrong. I've caught her *early* — she'll tell you a thing you can't
> use for another two hours and then you'll be standing in a boardroom hearing it
> again in your own voice. Ask her for all twenty. There's no charge and there's
> no catch and in this building that should worry you, but it doesn't."

**HIMSELF.**
> "Priest of the older faith. We write down what happened, and then — this is the
> radical part — we *read it back*. Sainted by nobody. The name got attached after
> the third outage and I've stopped fighting it."

**THE BUGS.** "Weather. Not enemies. Get the umbrella out — the duck — and stop
running."

**THE REGRESSION.** "Only one that's personal. It doesn't want your treasure, it
wants you to know it was right the first time. Everything it takes is in one dead
end and it has never once moved the stash."

**THE TROLL.** "Union man. Correct about everything, insufferable about all of it.
He'll fold the moment a machine shows him a green tick, which he'll be ashamed of
later."

**THE GOLEM.** "Not a guard. A *widow*. It was built to hold the line between what
we wanted and what we drew, and then everybody stopped telling it what we wanted.
Show it one honest requirement and it'll hand you the world."

**THE USER.** "Third floor, mirror-glass, been asking a machine questions for
eleven weeks. Nobody has brought her a coffee. Nobody has asked her what she
needed. There's your whole platform, right there, in one chair."

**THE CONFABULATOR.** "Beautiful. Never said 'I don't know' in its life. Every
painting in that gallery is of something that was never built, and every one of
them would pass review."

**THE MONOLITH.** "Eleven years and nobody can say what it does. Nine years and
nobody can take it out. Those aren't two facts."

**THE STORE.** "Buy the cap. Buy the cap. I'll say it a third time in a minute
disguised as a joke."

---

## Saint Mark's hundred jokes

Drawn without replacement. About one in six contains something true; those are
marked **[H]** here, and aren't marked at all in the game.

1. A systems engineer walks into a bar. Also a pub, a tavern, and a public house — he wanted full coverage.
2. How many model-based systems engineers does it take to change a lightbulb? None. They produce a diagram of the lightbulb being changed and the change is considered done.
3. My requirements are all atomic. That's why the whole thing keeps going critical.
4. **[H]** They say the balloon can't lift you. It can lift you fine. It can't lift you *and* the debt. — *Drop the sandbags.*
5. What's the difference between a stakeholder and a terrorist? You can negotiate with a terrorist.
6. I told the deity I didn't understand the architecture. It said neither did it, but with such confidence that we both felt better.
7. Our digital thread is fully integrated end to end. Both ends are in the same room and neither is attached to anything.
8. The V-model is called that because of the shape of the mouth of the person who first saw the schedule.
9. **[H]** The quarry has one honest slab in it and it's the small one at the bottom with the test on the back. Everything gold-lettered is sand. — *Shine the lantern.*
10. A vendor, a priest and an auditor walk into a dungeon. The auditor is never seen again and the paperwork says that's fine.
11. Why did the requirement cross the road? It didn't. It was rewritten to say it *shall be capable of* crossing the road.
12. We've achieved 100% traceability. Everything traces to the same one requirement and that requirement says "system shall be good."
13. I asked the copilot to review my design. It said the design was excellent. I hadn't sent it yet.
14. What do you call an estimate that turned out right? A coincidence with a manager taking credit for it.
15. **[H]** The bird won't come near you while you're holding a cut branch. Put it down. It's a *bird*, it has opinions about branches. — *Drop the branch at the Roost.*
16. Our platform is cloud-native. It was born up here and it has never once been outside.
17. Two engineers are arguing about whether a thing is a block or a part. Eleven years later, one of them has two heads.
18. Why don't systems engineers play hide and seek? Because a good decomposition means everybody knows exactly where everybody is and nobody enjoys the weekend.
19. **[H]** Everything on the Interface Ledge is a plank you can stand on. The thing sitting on it isn't. It needs leverage from further out. — *Pry the blob with the slide rule.*
20. The definition of done was itself never done.
21. I once saw a change request that traced cleanly to a validated need, closed on a test, and was delivered in the sprint it was raised in. Then I woke up and it was 04:00 and the build was green, which was almost as unlikely.
22. What's the plural of "architecture"? "Rework."
23. The lock-in isn't the file format. The lock-in is that everybody who knew the file format retired.
24. **[H]** The gate doesn't approve of your certificate. It just stops arguing about it. Show it anyway. — *`SHOW CERTIFICATE` at the Firewall Gate.*
25. Agile at scale is just a waterfall with more standing up.
26. A model is a lie that helps you see the truth. A digital twin is the same lie with a maintenance contract.
27. Why was the copilot promoted? It agreed with everyone above it and was therefore indistinguishable from leadership.
28. Our tool suite is best of breed. Each tool is the best of its own breed and none of them are the same species.
29. **[H]** The thing that follows you loves you very much and weighs as much as a car. Think about that before a rope bridge. — *Leave the CI bot on the west side.*
30. I don't have technical debt. I've a legacy of decisions made by people who are no longer reachable, which is different, because it's sad.
31. What did the requirement say to the test? "You complete me." What did the test say back? "Not measurably."
32. Every dungeon has a boss. Ours has a *supplier*.
33. The difference between verification and validation is about eighteen months and one very quiet meeting.
34. **[H]** Anything you leave in the middle of everything will still be there. The middle of everything has seven doors and a plate in the floor. — *Stage kit at the Atrium.*
35. I asked what the monolith does. Six people told me. All six answers were different and all six people were confident and all six people were senior.
36. Why did the engineer bring a rubber duck to the incident? Because the duck is the only one in the room who won't say "have you tried restarting it."
37. Our roadmap is a living document, in the sense that it moves on its own and nobody knows what it eats.
38. **[H]** One prayer in four is beautiful and made up. Carry the grey stone from the range and it can't. — *Ground Truth at the Shrine.*
39. What's the most dangerous phrase on this platform? "While we're in there anyway."
40. Second most dangerous: "It's basically the same as the last one."
41. Third: "The customer will love this."
42. A configuration manager dies and goes to heaven. St Peter says the records show he's due to go the other way. He says "which baseline?"
43. **[H]** Every direction out of the Backlog is back into the Backlog except the one that isn't a direction. — *`OUT`.*
44. Our copilot has been trained on all of our documentation, which is why it's confidently wrong in exactly the ways we are.
45. I've been to a lot of design reviews. I've been to one *design* review.
46. What do you call a system of systems where none of the systems know about each other? Tuesday.
47. The MBSE tool has 4,000 features. We use nine. Three of them are "export."
48. **[H]** The first one that ever worked is made of glass and there's exactly one soft place on this platform. — *Anti-static mat, or a foam niche, or nothing.*
49. Why did they put the shrine at the bottom? So the prayers would roll downhill like everything else.
50. The estimate was eight. The estimate is always eight. Somewhere out there's a task that's genuinely eight and it has never been assigned.
51. A model without a purpose is just an expensive drawing. A drawing without a purpose is honest.
52. Our platform has 99.99% uptime, measured over the periods when it was up.
53. **[H]** Two heads, one collar. Show them something they both want, then take it away. Nothing left to break, nothing left to mend. — *Golden Commit, then `REFLOG`.*
54. What's the difference between a bug and a feature? Whether anybody has written it down yet.
55. What's the difference between a bug and an incident? Eleven hours.
56. I told them we needed a systems engineer. They hired a tool administrator. Now the tool is beautifully administered and the system is on fire.
57. Why are there no windows in the boardroom? Because at some point somebody would have looked out of one.
58. **[H]** The stair down from the middle isn't the only way down. There's water, and there's a word you say on the deck, and the word is logged. — *`SUDO`.*
59. Interoperability means everybody agreeing on a standard, and a standard means everybody agreeing on whose format wins.
60. The digital thread runs from concept to disposal. So does the budget, but faster.
61. Why did the diagram golem never marry? Nobody could tell it what need it satisfied.
62. Our AI is human-in-the-loop. The human is in the loop the way a mouse is in a wheel.
63. **[H]** He doesn't fight you at the end. He offers you a chair. It's a very good chair. — *Don't sign.*
64. What do you call a requirement everybody agrees with? Unverifiable.
65. The trouble with "the system shall be user-friendly" is that both of those words are doing enormous work and neither is under contract.
66. I've never lost a treasure to the Regression. I've mislaid several in a room I chose not to go back to, which is different, because it's my fault.
67. **[H]** Whatever it takes from you, it puts in the one room the traces don't leave. — *The dead end in the catacombs.*
68. What's the strongest material on this platform? The bolt between hall one and the foundation. Nobody has ever got it out.
69. Our program is 90% complete and has been for two years, which makes it the most stable thing we own.
70. Why did the Race Condition get to the punchline first?
71. **[H]** The withered vine drinks a whole flask and grows four feet. It takes two flasks to reach the gantry, and the fountain doesn't move. — *Pour twice.*
72. A stakeholder is someone with a stake. In systems engineering the stake is usually driven through the schedule.
73. What's an ICD? A treaty between two teams who have agreed never to speak again.
74. What's an ICD, really? A document that describes a conversation that would have taken nine minutes.
75. **[H]** The one on the water has never told a lie, and the one in the wall has never told the truth on purpose. Believe the wet one. — *Alexander's hints are always true.*
76. Why did the engineer cross the V? Because there was a test on the other side and, astonishingly, it passed.
77. Our platform prays on the hour. Not for anything. Just prays. The scheduling was an accident and now it's culture.
78. Somebody put an easter egg in this dungeon eleven years ago and nobody has ever owned up to it, and it still works, and it's five letters long.
79. **[H]** The one down there with no cap in it's worth forty-five points and nothing at all, depending on whether you went shopping. — *Buy the blasting cap before the freeze.*
80. What's the difference between mission engineering and systems engineering? About four thousand feet of altitude and one honest conversation about what we're actually for.
81. Macro engineering is systems engineering after somebody has explained what "an order of magnitude" means.
82. I love the Orbital Ring. You can see the whole problem from up there. That's why nobody goes.
83. **[H]** The lever gives once and teaches once. Whatever you're holding when you pull it a second time, you're going the other way with. — *Rule on the pad, not in your hand.*
84. Why did they call it a war room? Because "the room where we discover what we agreed to" wouldn't fit on the door.
85. The fog over the table is a real fog. It has a budget line. It has been renewed four times.
86. What's the fastest way to close a change request? Reorganise.
87. **[H]** In the gallery, the beautiful thing has never once said it didn't know. Don't let anything you love out in there. — *Not the Contrarian, not in the Hallucination Gallery.*
88. Our documentation is up to date as of a date.
89. A copilot that never disagrees isn't a copilot, it's a mirror with a subscription.
90. Why did the bug go quiet when you looked at it? Professional courtesy.
91. **[H]** Before you put the last one in the wall, look at your hands. What's in them is what you're taking with you. — *The freeze is instant.*
92. I asked the platform for a status update and it prayed at me.
93. What do you call it when the model and the reality disagree? A finding. What do you call it the second time? A programme.
94. The Sandbox is where nothing you do is real, which is why it's the only room on this platform where anything gets built.
95. **[H]** The door at the bottom of the water only opens from underneath, and you'll want it open a long time before you want to go home. — *Unlock the hatch from the Service Shaft.*
96. Why is it called the Deep Stack? Because "the part of the platform we don't have a diagram for" was considered bad for morale.
97. A priest, an oracle, a pilot and a guide walk into a dungeon. The dungeon has been trying to get rid of us for eleven years.
98. **[H]** At the very end it asks you a question and the question is honest. You've been assembling the answer since the forest. — *Show it the trace.*
99. My last joke is about the monolith, but I can't get it out.
100. There's no hundredth joke. There's a hundredth *joke*, but it's bolted to the foundation and nobody can remove it, and at this point it holds up the floor, and we've all agreed to laugh when we walk past.

---

# 6 · THE SEVEN HALL RESIDENTS

Each hall has exactly one person left in it. They're not quest-givers and they do
not have inventories; each of them is the last practitioner of a discipline that
used to have a department, and each of them will tell you the one true thing about
their hall if you ask them a question instead of asking them for something.

**Mechanics.** `ASK <resident> ABOUT <topic>`. The first exchange that's a real
question — not `ASK X ABOUT X`, not a demand for an item — scores **+3** and pays
between 10 and 20 **story points**, which is where the other 90 SP in the tin comes
from. They'll all talk indefinitely afterwards and none of it scores. None of them
can be killed, and the duck doesn't work on people.

---

### 1 · THE INTERN — the Help Desk *(Hall 1)*

> There's a cardigan over the back of the chair and it's still warm, and the queue
> display reads NOW SERVING 0 OF 0, and it has read that since the reorg.
>
> The Intern is six weeks in. They've read **everything** — the charter, the
> placards, all seven, the twelve-year-old wiki, the whole of the Archive Stacks one
> aisle at a time — because nobody gave them anything to do and they were too new to
> know that this was the thing being done to them.
>
> "Can I help?" they say, with the terrible brightness of somebody who has been
> asked that question by nobody for six weeks.

`ASK INTERN ABOUT THE PLATFORM` **(+3, 10 SP)**

> "Honestly? I think it's very good and I think nobody can say what it's for.
>
> I've read the charter. It says *to fly the mission before it's built*, which is
> the best sentence in the building. And then I read the sortie board, and there's a
> column headed WHAT FOR, and it's ruled and it's empty, and somebody has gone over
> the rule a second time with a straight edge rather than fill it in.
>
> I keep thinking that's the whole thing. But I've been here six weeks, so."

They hand you the **DO NOT DISTURB placard** off the counter. *"Take it. Nobody's
ever needed it. There's never been a queue."*

`ASK INTERN ABOUT THE QUEUE` — "There isn't one. That's not the same as nobody
needing help. It's the same as nobody knowing this desk is here."

---

### 2 · THE CLERK OF CUT REQUIREMENTS — the Ossuary *(Hall 2)*

> Dark, and racked to the ceiling with everything that was descoped, stacked like
> long bones and labelled with the release it didn't make. Somebody is working
> along the racks with a hand lamp and a pencil, re-labelling.
>
> "Cut," says the Clerk, without looking up. "Cut. Cut. Deferred, which is cut.
> Descoped pending clarification, which is cut with a hat on."

`ASK CLERK ABOUT THE CUT` **(+3, 10 SP)**

> "People think this is a graveyard. It isn't. A graveyard is full of things that
> died. This is full of things that were *fine*.
>
> Look — " and they pull one out, and it's a short one, and there's a test carved
> on the back of it — "that's good. That's atomic, verifiable, traces up, closes
> down. That's better than most of what shipped.
>
> It was cut in week nine because it was going to be *difficult*, and the thing that
> went in instead was easy, and the easy one is what's holding up the fourth hall
> now. I keep this rack because in about two years somebody is going to come down
> here looking for exactly this, and I want it to be findable when they do."

`ASK CLERK ABOUT THE SHALL QUARRY` — "Upstairs they carve them. Down here we file
them. The quarry is optimism and the ossuary is arithmetic, and they're the same
department."

---

### 3 · THE FORGEMASTER — the Model Forge *(Hall 3)*

> There's somebody sitting on an anvil at the edge of the hearth-light with a mug,
> watching the golem the way you'd watch a dog you had raised and then failed.

`ASK FORGEMASTER ABOUT THE GOLEM` **(+3, 15 SP)**

> "I built it. Nine feet of it, out of blocks and connectors, and I gave it one
> rule, and the rule was: *don't let anything out of this forge that can't say
> what need it satisfies.*
>
> It has never once broken that rule. Eleven years. It's the only thing on this
> platform with a perfect record.
>
> And about the fourth year I realised that what I had actually built was a machine
> that stops all work, permanently, because we stopped being able to answer it. It
> isn't guarding the orb. It's *waiting*. It has been standing there with its arm
> out for eleven years holding a question that four hundred people walked past.
>
> Show it the tablet. Watch what it does. I've wanted somebody to see that for a
> very long time."

`ASK FORGEMASTER ABOUT THE SLAG PIT` — "Everything I got wrong is down there,
including a block with my own name on it. I go down about twice a year. It's good
for me."

---

### 4 · THE PROMPT GARDENER — the Prompt Garden *(Hall 4)*

> Somebody in a canvas apron is going along the trellises pinching out prompts that
> have gone leggy, and there's a wheelbarrow, and the wheelbarrow is full.

`ASK GARDENER ABOUT THE VINE` **(+3, 10 SP)**

> "It's not dead, it's *thirsty*. There's a difference and the difference is about
> two flasks.
>
> Everything on this trellis grows on context, and everybody up here has been
> feeding them cleverness instead. You can tell which is which by what's left in the
> spring. The clever ones make a great deal of growth in the first week and then
> they go over, and I compost them, and the heap is warm all year — there's four
> hundred versions of *please* in there.
>
> The ones that come back are the ones somebody bothered to tell what the job was."

`ASK GARDENER ABOUT THE CONTRARIAN` — "The grey one. It won't come near a cut
branch, and I don't blame it — you wouldn't go near somebody carrying a piece of a tree
either. Put the branch down and it'll consider you."

---

### 5 · THE RANGE OFFICER — the Sensor Line *(Hall 5)*

> A figure in ear defenders at the end of the instrument line, with a clipboard, in
> the flat hard light of the Ground Truth Range.

`ASK OFFICER ABOUT THE INSTRUMENTS` **(+3, 15 SP)**

> "Eleven instruments. Same target, same second, eleven numbers. The spread is two
> per cent and it has been two per cent for nine years.
>
> Everybody who comes down here wants to know which one is right. That's the wrong
> question and it's the reason the spread is still two per cent. The right question
> is *which one is wrong*, because that one you can go and fix, and to answer it
> somebody senior has to say out loud that a thing we bought isn't working, and
> nobody has ever been promoted for that sentence.
>
> So we carry the two per cent. We put it in the error bars. We've got extremely
> good at the error bars."

`ASK OFFICER ABOUT GROUND TRUTH` — "The stone? Take it. It's not magic, it's just
the only object up here that has never been asked to be encouraging."

---

### 6 · THE VERIFIER — the Acceptance Floor *(Hall 6)*

> The floor is wide and clean and empty, with a rectangle taped out in the middle of
> it. Somebody is sitting against the wall facing the rectangle, with a flask, in the
> attitude of a person who has been waiting long enough to have got comfortable.

`ASK VERIFIER ABOUT THE RECTANGLE` **(+3, 20 SP)**

> "That's where it goes. I taped it out myself, to the drawing, in year three.
>
> The conditions of satisfaction are on the table by the door. Signed. All of them.
> Signed *before* the thing arrived, which everyone thought was efficient at the
> time, and it was, right up until the thing didn't arrive.
>
> I could go and do something else. But the day it turns up, somebody has to be
> standing here who knows what it was supposed to be, and there's exactly one of
> those left, and it's me. So I sit down.
>
> Take the loop. Somebody should have that. It's the only bit that ever closed."

`ASK VERIFIER ABOUT THE TROLL` — "He's not wrong, you know. Nothing *should* merge
without a review. He's just never once reviewed anything."

---

### 7 · THE SURVEYOR — the Supply Chain *(Hall 7)*

> By the outfeed of the conveyor, where the parts go out with a different sticker on
> them than they came in with, there's a folding stool and a theodolite and
> somebody eating a sandwich.

`ASK SURVEYOR ABOUT THE BENCHMARK` **(+3, 10 SP)**

> "Four thousand feet down, in the trees, there's a brass disc in a concrete plug.
> Every height on this platform is measured from it. I set the instrument on it
> myself, before any of this, when this was a hillside and a fire road and a bad idea
> somebody had at a conference.
>
> Nothing up here knows that. Everything up here's measured from a datum that's on
> the ground, in the mud, west of the road, and not one person on this platform has
> ever been to look at it.
>
> That's not a complaint. That's just what a datum *is*: the thing you agreed on
> once, at the start, and then never thought about again, and which every single
> number after it depends on. You want to be very careful about what you put your
> instrument on."

`ASK SURVEYOR ABOUT THE BILL OF MATERIALS` — "Bolted to the frame. Been there
eleven years. It says what everything is and who owns it, and six lines from the
bottom it says what the *foundation* is and who owns that. Nobody has read it
because it's a list, and lists are somebody else's job."

---

# 7 · THE TWO ON THE GROUND

Act V. The platform is down, it's four in the morning, and the whole of the game
comes to a trestle table in a tent on wet grass.

---

### THE CLERK — the New Program Office

> The portacabin has a generator, a light on, a kettle, and a person at the table
> who stands up when you come in, which nobody on the platform ever did.
>
> **The Clerk** is polite, well-briefed, entirely pleasant and made of paper. Not
> figuratively. When the wind gets under the door the Clerk moves slightly with it
> and doesn't appear to notice.
>
> "You'll be from the old programme," says the Clerk warmly. "I'm so sorry. I heard.
> Terrible.
>
> We're just helping the new one get started, actually. They've a deadline and no
> foundation, which is the worst combination in the business, and it happens that we
> have a foundation already built. We'd license it cheap — genuinely cheap, I'm not
> going to insult you — and they'd be running by the end of the month instead of the
> end of the year."

He's not lying. That's the thing to understand about the Clerk, and it's what
makes him the same creature as the man in the boardroom: **every word of the offer
is true**, it's a good offer, it'll work, and in eleven years there will be a
black slab under the fourth hall that nobody can remove and nobody can explain.

- `ASK CLERK ABOUT DASSAULT` — "Ah. Different department. I did hear something. He'd
  been with the firm a very long time." *He has no idea. He's three weeks old.*
- `ASK CLERK ABOUT THE FOUNDATION` — "Proven. Eleven years in service on a major
  programme." *It's the same foundation. He will say this with complete sincerity.*
- `SHOW ASSAY TO CLERK` — He reads it, and is genuinely sorry, and says that costs
  like that are exactly why you want a proven foundation. Paper isn't troubled by
  paper.
- `ATTACK CLERK` — *You put your hand through him. He waits, politely, for you to
  finish, and then continues from where he was.*

**The Clerk can't be beaten and doesn't need to be.** He signs at the end of the
week whatever you do. The game isn't to defeat him; the game is to have the
decision already written down and signed by somebody who will still be here in four
years, before he does. If you reach the tent with no record, he wins, and he's
charming about it, and that's the "another programme" ending.

---

### THE NEW PROGRAMME'S ENGINEER — the Site Hut

> A colder, smaller hut a hundred yards off, with a light on and one person in it
> doing the actual work, which is a schedule and a scope and a list of things nobody
> has decided. There's a kettle. It's not plugged in.
>
> They look up when you come in, which takes them a moment, because nobody has been
> in here today.

This is the User from the Chat Parlor, at ground level, in the rain, and it's
deliberately the same puzzle with the same answer. Everything in Act V turns on
their signature and they won't give it to somebody who arrives holding a solution.

- `PLUG IN KETTLE` — *You plug the kettle in. It's the first thing anybody has done
  for them since Tuesday, and it costs you nothing, and they notice.*
- `TELL ENGINEER ABOUT THE PLATFORM` *(before the kettle)* — They listen, politely,
  the way you listen to somebody selling something. *"Right. And you're offering
  what, exactly?"* **This is the wrong opening and it's not fatal, but you'll have
  to go and put the kettle on anyway.**
- `ASK ENGINEER WHAT THEY NEED` **(the move)** —

> "What I need is to not do this twice.
>
> I've got a deadline and no foundation and a very nice man in the other hut who can
> fix that by Friday. And I've read enough to know that the last programme had a very
> nice man too, eleven years ago, and I've seen what's lying in those trees.
>
> But I can't take *nothing* to the board. 'I've a bad feeling about the vendor' is
> not a position. If you've got something written down — what it cost, what it was
> made of, what we actually have to do — then I've got a position, and I'll sign it,
> and I'll be the one who lives with it.
>
> That's not me doing you a favour. That's the job. Somebody has to be the name in
> the third field."

- `SHOW RECORD TO ENGINEER` *(before the Records Office)* — you haven't written it
  yet.
- At the Signing Tent, with the record written, they come and stand in the entrance
  holding a mug of tea somebody else made them, and say the four words that end the
  game: ***"Quite, but I do."***

**They're the ending.** Not the charge, not the seven faces, not the thread. The
whole of iMBSE is a game about getting one honest sentence written down and signed
by somebody who's not you, and this is the person who signs it.

---

## Appendix — engine notes for the NPCs

| Element | Engine feature |
|---|---|
| Dannet wandering, Dan/Kennet paired turn | `hooks.onTurn`, on the dwarf model; both heads resolve in one tick before the death check |
| Dannet's two-move kill | `verbs[]` `SHOW`, plus a `flags.dannetLunging` set by `SHOW` and cleared by any other command; `REFLOG` magic word checks it |
| Alexander's encounters | `hooks.onTurn` with a per-room-class probability, a cooldown counter in `state.flags`, and a `usedRiddles` set |
| Riddle answers | `hooks.onCommand` intercept while `flags.riddlePending` is set (the same mechanism Adventure uses for its yes/no questions) |
| Tom's minigames | one `specials{}` handler each, driven through `hooks.onCommand` while a game is in progress; SP live in `state.flags.storyPoints` |
| The Company Store | a room with `BUY <item>` in `verbs[]`, checking and debiting `storyPoints` |
| Katie's visions, Mark's jokes and lore | draw-without-replacement sets in `state.flags`; plain `verbs[]` handlers |
| Mark's +4 origin, Alexander's 3×3, Tom's 10×1, Dannet's 15 | `hooks.computeScore` |
| The seven hall residents | one `verbs[]` `ASK` handler each, keyed on room; `flags.met[<resident>]` gates the +3 and the SP payout |
| The Intern's placard, the residents' SP | ordinary items and a `storyPoints` credit inside the same handler |
| The Clerk's weekly countdown | `hooks.onTurn` in Act V: a counter that signs the licence at 250 turns and ends the game politely |
| The Site Hut sequence | `flags.kettle` set by `PLUG IN KETTLE`, gating the `ASK ENGINEER` response and, later, the signature at the tent |
| The signature at the Signing Tent | `specials{}` — checks the record, the engineer's consent and that *you* haven't signed |

**What's additive and what's not.** The five named inhabitants are still additive:
none of them changes an existing room's exits, and the route in
[WALKTHROUGH.md](WALKTHROUGH.md) works with every one of them ignored. The seven
hall residents are additive too — they're worth 21 points and 90 story points, and
skipping all seven costs you those and nothing else.

The two on the ground are **not** additive. They're Act V. There are exactly three
places where the people in this document reach into the spine of the game, and all
three are load-bearing:

1. **The blasting cap**, which is only sold by Pathfinder Thomas's store, and
   without which the charge doesn't fire.
2. **The field assay kit**, which is free in Hall 2 but which the store is the only
   second source of, and without which there's no evidence in Act V.
3. **The New Programme's Engineer**, who's the ending. There's no route to 700
   that doesn't go through a cold hut, a kettle that's not plugged in, and asking
   somebody what they need.

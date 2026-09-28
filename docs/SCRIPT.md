# iMBSE — THE ADVENTURE

*An adventure script for the Adventure/Zork scaffolding (`engine.js`, `automap.js`,
`game.js`).*

This is the complete game script: the world, its prose, its objects, its puzzles,
its villain and its scoring. It's written to drop onto the shared engine as a
`imbse-canon.js` (world) + `imbse-data.js` (logic) pair, exactly as Adventure and
ZORK I are built. Every room, item, message and special named here has a place in
that shape; the mapping is listed in **Appendix C**.

Two companion documents complete it: [NPCS.md](NPCS.md) — the five named
inhabitants, the seven hall residents, the two figures on the ground, and their
riddle, minigame, vision and joke banks — and [WALKTHROUGH.md](WALKTHROUGH.md),
which plays the whole thing through to a perfect **750**.

**This is the expanded edition.** The game is now **124 rooms** in **five acts**.
Every one of the seven halls is eight to twelve rooms deep instead of three; the
platform is joined to itself by hidden panels, trap doors and seven spoken words;
and the blast that used to be the ending is now the door into Act V, which is
where the engineering actually happens. The maximum score is **750**.

---

## 1. The premise

Somewhere above the pine woods hangs **iMBSE** — an AI-enabled model-based systems
engineering platform, hosted in a cloud that makes its own weather. Seven halls,
seven functional areas, one digital thread running through all of them like a
nerve. The platform prays, on a schedule, to a Large Language Model it sincerely
believes to be a god, and the god answers, fluently, whether or not it knows.

The environment is riddled with **bugs**. They wander. They throw stack traces.
They're the ordinary weather of the place and they'll kill you.

At the bottom of the platform, under everything, sits **Dassault** — a contractor
of many faces, who has been here longer than the platform has and intends to be
here after it. He doesn't fight. He *demonstrates*, he *licenses*, he *locks*, he
*agrees with you enthusiastically*, and each of those is a way of winning.

Your job is the engineer's job: get up there, recover everything that can be
traced, put it somewhere it can't be taken, strip the contractor of his faces,
bring the monolith down — and then, on the ground, in the cold, hand the result to
somebody who's not you, in a format they can open without you. That last part is
the only part that has ever mattered, and it's Act V.

### Intro text (`meta.intro`)

> They'll tell you the platform is in the cloud. What they mean is that it's
> four thousand feet over a pine forest, that nobody has ever walked out of it the
> same way they walked in, and that on the hour it stops what it's doing and
> prays.
>
> You're standing at the end of a gravel road, with a shed, a creek, a very old
> tree and a balloon. Everything you'll need down here's small enough to carry.
> Everything you'll need up there, you'll have to earn.
>
> *iMBSE — an adventure in seven halls. Type HELP for the verbs, PRAY for the
> truth, and don't believe the second one.*

---

## 2. Structure

| Act | Where | What happens |
|---|---|---|
| **I** | The forest | Gather kit, cut a branch from the Trunk, jettison technical debt, launch the balloon |
| **II** | The seven halls | One keystone artifact from each functional area; thirteen lesser treasures; the seven words; the bugs |
| **III** | The Deep Stack | The token fountain, the CI bot, the legacy serpent, the shrine, the monolith, and Dannet |
| **IV** | The Release Candidate | The baseline freezes; the seven faces of Dassault; the Deprecation Charge |
| **V** | The ground | The platform comes down in the forest. Salvage it, assay it, publish it, and get it signed by somebody else |

Five named NPCs run across all five acts, seven more live one to a hall, and two
wait on the ground. All of them are scripted in [NPCS.md](NPCS.md): **Dannet**,
the two-headed mini-boss who can't stop fighting himself; **Commander
Alexander**, who sails the telemetry and trades hints for riddles; **Pathfinder
Thomas**, whose ten minigames pay the story points the Company Store runs on;
**Prophet Katie**, twenty-four visions of the endgame; **Saint Mark**, who knows where
the bosses came from and a hundred jokes of variable worth; the seven hall
residents; and, at the bottom, **the Clerk** and **the New Programme's Engineer**.

The seven functional areas map one-to-one onto seven halls, seven keystone
artifacts, and seven faces of the boss. That correspondence is the spine of the
whole game and the player is taught it three times before it matters (a placard in
each hall, a socket in the vault, a face in the boardroom).

| # | Functional area | Hall | Rooms | Keystone artifact | Face it defeats |
|---|---|---|---|---|---|
| 1 | Human-AI interface clients | Client Concourse | 9 | **the Lucid Console** | Le Sourire |
| 2 | Requirement engineering | Hall of Requirements | 10 | **the Shall Tablet** | Le Notaire |
| 3 | Model engineering | The Model Forge | 10 | **the SysML Orb** | Le Verrou |
| 4 | Copilot helpers | The Copilot Roost | 9 | **the Contrarian's Feather** | Le Perroquet |
| 5 | Mission engineering | Mission Deck | 9 | **the Mission Compass** | Le Brouillard |
| 6 | Systems engineering | The V Foundry | 10 | **the Golden V** | L'Hydre |
| 7 | Macro engineering | The Macro Gantry | 9 | **the Titan's Slide Rule** | Le Colosse |

### The seven words

Each hall has one room further in than anybody goes, and in it a plate with a word
on it. Say the word anywhere on the platform and you're in that room; say it
again and you're back where you were. They're how a 124-room platform stays
walkable with a carry limit of seven, and learning each one scores **+2**.

| Word | Takes you to | Hall |
|---|---|---|
| `PERSONA` | The Gallery of Personas | 1 |
| `SHALL` | The Ossuary of Cut Requirements | 2 |
| `SCHEMA` | The Metamodel Loft | 3 |
| `PROMPT` | The Fine-Tuning Cellar | 4 |
| `SORTIE` | The Sortie Board | 5 |
| `VERIFY` | The Acceptance Floor | 6 |
| `SCALE` | The Order-of-Magnitude Stair | 7 |

Two more aren't hall words. `STANDUP` puts you in the Atrium from anywhere on the
platform, at any time, whatever you were doing — which is the joke — and it's
logged. `PLUGH` joins the Legacy Shed to the Deprecated Wing, because they're the
same room: both are where dead programs go, and one of them is four thousand feet
above the other.

---

## 3. ACT I — THE FOREST

Sixteen rooms, one real puzzle, and a lesson the rest of the game depends on: you
can't take everything with you.

### Rooms

| id | Name | mapPos | Exits |
|---|---|---|---|
| `endOfRoad` | End of the Road | [10,12] | E/IN→shedYard · N→forestNorth · W→forestWest · UP→hillInForest · S/DOWN→gully · SW→culvertMouth |
| `shedYard` | Yard of the Legacy Shed | [12,12] | W→endOfRoad · IN/N→insideShed · S→gully · E→programBoneyard |
| `insideShed` | Inside the Legacy Shed | [13,10] | OUT/S→shedYard · *XYZZY* · *PLUGH* |
| `hillInForest` | Hill in the Forest | [8,10] | DOWN/E→endOfRoad · N→forestNorth · S→forestWest · W→surveyorsStake |
| `forestNorth` | Forest, North of the Road | [10,10] | S→endOfRoad · N→theTrunk · E→balloonMeadow · W→hillInForest |
| `forestWest` | Forest, West of the Road | [7,12] | E→endOfRoad · N/UP→hillInForest · W→fireRoad |
| `theTrunk` | The Great Trunk | [10,7] | S→forestNorth · E→balloonMeadow |
| `balloonMeadow` | Meadow of the Balloon | [13,7] | W→theTrunk · S→forestNorth · SE→antennaFarm · IN/BOARD→*board* · LAUNCH/UP→*launch* |
| `gully` | Gully of the Data Creek | [11,14] | UP/N→endOfRoad · DOWNSTREAM/S→creekBed · W→culvertMouth |
| `creekBed` | Creek Bed | [12,16] | UPSTREAM/N→gully · DOWNSTREAM/S→sinkhole |
| `sinkhole` | The Sinkhole | [12,18] | UPSTREAM/N→creekBed · DOWN→serviceShaft *(hatch, opens from below only)* |
| `programBoneyard` | The Program Boneyard | [15,12] | W→shedYard · N→antennaFarm |
| `antennaFarm` | The Antenna Farm | [15,9] | S→programBoneyard · NW→balloonMeadow · E→scatterField *(Act V)* |
| `surveyorsStake` | The Surveyor's Stake | [5,10] | E→hillInForest · S→fireRoad |
| `fireRoad` | The Fire Road | [5,13] | N→surveyorsStake · E→forestWest · S→newProgramOffice *(Act V)* |
| `culvertMouth` | The Culvert Mouth | [9,15] | E→gully · NE→endOfRoad |

### Room prose

**End of the Road** — You're standing at the end of a gravel road, in front of a
chain-link gate that has been open so long the weeds have grown through it. A
dented sign reads: **iMBSE PROGRAM — MODEL BEFORE METAL**. Underneath, in marker,
someone has added: *and pray after*. Forest presses in on three sides. A creek
comes out of a culvert and runs away south down a gully.

**Yard of the Legacy Shed** — A tin shed sits in a yard of dead grass, surrounded
by the rusted remains of five earlier programs. The door hangs open. A stencil on
it reads PROPERTY OF — and then nothing; the rest has weathered off.

**Inside the Legacy Shed** — Steel shelving, a workbench, and the particular smell
of a project that ended without being finished. Somebody's mug is still here, with
somebody's coffee still in it, and it's not going to be drunk now.

**Hill in the Forest** — The trees thin at the top of the hill. Through the gap,
very high and very far, you can see a rectangle of white light hanging in the
clouds with nothing holding it up. Occasionally something small falls off it.

**Forest, North of the Road** — Second growth, close and green. Every trunk here
is thin. There's one exception, north.

**Forest, West of the Road** — A thicket of unversioned undergrowth. Nothing here
has a name and nothing here has ever been checked in.

**The Great Trunk** — An enormous tree stands alone in a clearing it made itself.
The bark is a mass of old scars, each one where a branch was taken. Every branch
in this forest came from this trunk, and every one of them was cut from it here.

**Meadow of the Balloon** — A wicker basket sits in the meadow under a great
striped envelope, half-inflated and stirring. A nylon tether runs from the basket
to an iron ring set in concrete. Sandbags hang from the basket rim, each stencilled
**TECHNICAL DEBT**. The burner is cold and its fuel valve is secured with a hex
bolt.

**Gully of the Data Creek** — The creek runs clear and much too fast, and if you
look at it directly you can see it's not water but telemetry, every drop a
reading from something that's still running somewhere.

**Creek Bed** — The stream spreads out over gravel here, ankle-deep and chattering.
Something metal is caught in the stones.

**The Sinkhole** — The creek gathers itself and goes down a hole. Set into the
rock at the bottom is a steel service hatch, streaked with rust, padlocked from
the far side. Whatever the creek is telling, it's telling it to the platform.

**The Program Boneyard** — Five programs are parked here in a row, in the order
they were cancelled, each one further through than the last and none of them
finished. The nameplates have been unscrewed and stacked neatly against the fence,
which is the only tidy thing anybody did at the end. *(There's room at the end of
the row for a sixth. In Act V there's a sixth.)*

**The Antenna Farm** — A field of masts and dishes, every one of them pointed at
the same patch of cloud and every one of them still receiving. Nobody has read any
of it for years, but the dishes don't know that, and go on listening with
enormous attention.

**The Surveyor's Stake** — A brass benchmark disc set in a concrete plug, stamped
with an elevation and a date from before any of this. Every height on the platform
is measured from here, four thousand feet down, and nothing on the platform knows
it.

**The Fire Road** — A straight cut through the trees, graded once and never
driven, running from nothing in particular to nothing in particular. It was put in
against a fire that hasn't happened yet, by people who were criticised at the
time for the cost.

**The Culvert Mouth** — A concrete throat in the hillside with the creek coming
out of it under pressure, and a grating across the opening that somebody has cut
through and bent back. Whatever is upstream of here's upstream of everything.

### Items

| id | Name | Where | Notes |
|---|---|---|---|
| `lantern` | the token lantern | insideShed | Light source. Burns **context tokens**, and only while lit: 330 turns. |
| `keys` | a ring of keys | insideShed | Opens the service hatch from below. |
| `knife` | a pocket knife | insideShed | Cuts the branch. Dead weight afterwards. |
| `duck` | a rubber duck | insideShed | The weapon. `THROW DUCK AT BUG`. |
| `thermos` | a steel thermos | insideShed | Empty. Fill at the espresso urn in the Client Concourse. Used twice: once up there, once on the ground. |
| `rations` | a bag of field rations | insideShed | Feeds the CI bot. |
| `hexKey` | a hex key | creekBed | Opens the balloon's fuel valve. Nothing else. |
| `branch` | a green branch | *(cut from the Trunk)* | `WAVE BRANCH` at the Merge Chasm. Copilots won't come near it. |
| `certificate` | a self-signed certificate | balloonMeadow *(basket pouch)* | Surrendered at the Firewall Gate. |
| `debt` | sandbags stencilled TECHNICAL DEBT | balloonMeadow *(on the basket)* | Must be dropped for the balloon to rise. |
| `balloon` | the balloon | balloonMeadow | Vehicle. Its basket is a container that rides up with you. |

### The balloon (Act I capstone)

Four conditions, and the game says so plainly when one is missing:

1. **The valve** — `OPEN VALVE WITH HEX KEY`. *"The hex bolt gives. Gas hisses into the burner line."*
2. **The burner** — `LIGHT BURNER` (needs the lit lantern or a flame in hand). *"The burner catches with a noise like a held breath, and the envelope stands up over you."*
3. **Aboard** — `BOARD BALLOON`. *"You climb into the basket. It shifts under you and settles again, unimpressed."*
4. **The debt** — `DROP DEBT` (or `CUT SANDBAGS`). *"You heave the sandbags over the rim. TECHNICAL DEBT hits the meadow grass with a sound like a decision, and the basket lifts an inch off the ground."*

Then `LAUNCH` (or `UP`):

> The tether comes taut, sings once, and parts. The meadow drops away, then the
> forest, then the whole shape of the forest, and the shape is a watershed and the
> watershed is a system, and you're the first person in a long time to see it all
> at once. Above you the cloud opens like a door held for you specifically.
>
> *You've reached the platform. (+25)*

Refusals worth writing properly:

- Launching with the tether attached: *"The balloon rises three feet, reaches the end of the tether, and hangs there like a question nobody has budgeted for."*
- Launching still carrying the debt: *"The envelope is full, the burner is roaring, and the basket hasn't moved. Something aboard is heavier than the lift."*
- Boarding overloaded (carried + basket > 9): *"The basket settles onto its skids. You're going to have to want less."*

The balloon is **one-way**. On arrival it snags on an antenna mast and deflates
across the deck. The ways home are the service hatch, which opens from the inside,
and `PLUGH`, which nobody has ever owned up to.

---

## 4. ACT II — THE SEVEN HALLS

### The edge

| id | Name | mapPos | Exits |
|---|---|---|---|
| `ingressDeck` | Ingress Deck | [42,10] | W→firewallGate · N→mastWalk · DOWN/E→*the long fall (death)* · *SUDO* |
| `mastWalk` | The Mast Walk | [42,7] | S→ingressDeck · DOWN→*the long fall (death)* |
| `firewallGate` | The Firewall Gate | [39,10] | E→ingressDeck · W→atrium *(gated: certificate)* |
| `atrium` | Atrium of the Seven Halls | [35,10] | E/OUT→firewallGate · N→clientConcourse · NW→requirementsHall · W→modelForge · SW→copilotRoost · S→missionDeck · SE→vFoundry · NE→macroGantry · UP→observabilityBalcony · DOWN→spiralStair |
| `observabilityBalcony` | Observability Balcony | [33,1] | DOWN→atrium · W→deprecatedWing · E→companyStore |
| `deprecatedWing` | The Deprecated Wing *(dark)* | [30,1] | E→observabilityBalcony · W→archiveStacks · *PLUGH* |
| `archiveStacks` | The Archive Stacks *(dark)* | [27,1] | E→deprecatedWing |
| `companyStore` | The Company Store | [36,1] | W→observabilityBalcony · E→slaLounge |
| `slaLounge` | The SLA Lounge | [38,1] | W→companyStore |

**Pathfinder Thomas** keeps a folding table in the Atrium, by the plate. The
**Company Store** is his other half: a shuttered concession between the dashboards
that takes iMBSE story points and nothing else. See [NPCS.md](NPCS.md) §3.

**Ingress Deck** — A steel deck at the edge of a floating city, wet with cloud. The
balloon has hooked itself on an antenna mast and is dying quietly behind you, the
envelope going down over the rail like something shot. Westward the air is full of
moving light.

**The Mast Walk** — A catwalk out along the antenna mast the balloon hooked itself
on, with the whole envelope hanging off it below you like a shed skin. From out
here the platform has an underside, and the underside is the part nobody
photographs.

**The Firewall Gate** — A wall of rules stands across the way, each rule burning
and sliding over the one below it. In all of that there's exactly one gap, and it
is a narrow one, and it has a number over it: **443**.

> *(no certificate)* The wall doesn't so much refuse you as fail to acknowledge
> that anything is there.
>
> *(`SHOW CERTIFICATE`)* The gate inspects your certificate at length, finds that
> you've signed it yourself, and admits you anyway with a warning that appears
> in the air and stays there: **YOUR CONNECTION IS NOT PRIVATE**. It keeps the
> certificate. The port stays open behind you for the rest of the session.

**Atrium of the Seven Halls** — A rotunda under a dome of frosted glass, and seven
arches around it, each with a lit sigil over the keystone. In the floor is a
brass **directory plate**, and in the middle of the plate a spiral stair goes down
into the dark. Every so often the lights dim, all the screens on all seven arches
show the same waiting cursor, and the platform prays.

`READ PLATE`:

> **iMBSE — PLATFORM DIRECTORY**
> N  HUMAN-AI INTERFACE CLIENTS · NW REQUIREMENT ENGINEERING · W  MODEL ENGINEERING
> SW COPILOT HELPERS · S  MISSION ENGINEERING · SE SYSTEMS ENGINEERING
> NE MACRO ENGINEERING · DOWN  THE DEEP STACK — *authorised personnel and their consequences*

**Observability Balcony** — Every dashboard on the platform, all at once, on a
curved wall of glass. Green, mostly. From the rail you can see straight down
through four thousand feet of clear air to a gravel road and a tin shed.

**The Deprecated Wing** — Dark, and colder than the rest. Sunsetted features stand
around under sheets. A stack of back issues has been left where somebody meant to
come back for them. *Here: the GPU credits, and a pile of "MBSE Today".*

**The Archive Stacks** — Rolling shelves on rails, wound tight against each other
so that only one aisle can be open at a time. Everything the program ever decided
is in here, and the aisle that's open is never the one you want.

**The SLA Lounge** — Four soft chairs, a low table, and a framed certificate
promising three nines to anybody who reads it. Under the glass, in pencil,
somebody has worked out what three nines actually allows you in a year, and then
underlined the answer twice.

---

### Hall 1 — Human-AI interface clients *(9 rooms)*

| id | Name | mapPos | Exits |
|---|---|---|---|
| `clientConcourse` | Client Concourse | [35,7] | S→atrium · N→chatParlor · W→uncannyValley · E→accessibilityWing · SE→onboardingFunnel · NW→notificationStorm |
| `chatParlor` | The Chat Parlor | [35,4] | S→clientConcourse · N→helpDesk |
| `helpDesk` | The Help Desk | [35,2] | S→chatParlor |
| `uncannyValley` | The Uncanny Valley *(dark)* | [32,5] | E→clientConcourse |
| `accessibilityWing` | The Accessibility Wing | [37,5] | W→clientConcourse · N→sessionArchive · S→onboardingFunnel |
| `onboardingFunnel` | The Onboarding Funnel | [37,8] | NW→clientConcourse · N→accessibilityWing *(`SKIP` only)* |
| `sessionArchive` | The Session Archive | [37,3] | S→accessibilityWing · W→personaGallery |
| `personaGallery` | The Gallery of Personas | [33,4] | E→sessionArchive · S→notificationStorm · NW→matrixRoom *(hidden panel)* |
| `notificationStorm` | The Notification Storm | [33,6] | N→personaGallery · SE→clientConcourse |

**Client Concourse** — A long hall of every way anyone has ever tried to talk to a
machine: terminals, tablets, headsets, a wall of touchscreens, and at the far end
one teletype that still works. An espresso urn mutters to itself on a trestle
table. A placard on the wall has been scorched at one corner:

> ***Le Sourire dies where the user takes the keyboard.***

**The Chat Parlor** — A weary engineer sits at a console of mirror-glass. Every
question they ask comes back as a beautifully phrased version of what they already
said. They've been doing this for some time. They don't look up.

- `GIVE THERMOS TO USER` *(filled)* — They take the coffee, hold it, and then say
  the first thing they've said all day that wasn't a prompt: *"I don't need it
  to agree with me. I need it to show me what it did."* The mirror-glass goes
  clear, and clear is a different instrument entirely.
- **The Lucid Console** may now be taken. *(+5)*
- `TAKE CONSOLE` *(before)* — Your reflection takes it at the same moment and you
  both put it back.

**The Help Desk** — A counter, a bell, and a sign reading HAVE YOU TRIED CLEARING
THE CONTEXT. Behind the counter is a chair with a cardigan over the back of it,
still warm, and a queue display reading NOW SERVING 0 OF 0. *(Resident: **the
Intern**. Ask them what they would change and they'll tell you, and hand over
the **DO NOT DISTURB placard** off the counter, which nobody has ever needed.)*

**The Uncanny Valley** — Dark. Something stands at the far end, doing what you did
one turn ago, at your height, in your posture, with your hands. It's very nearly
right. On the floor between you is a black **anti-static mat**.

- `FOLLOW AVATAR` — *You go to meet it. It comes to meet you. You arrive at the
  same place at the same time and only one of you leaves, and the documentation
  is ambiguous about which.* **(death)**

**The Accessibility Wing** — The one hall on this floor built for somebody other
than the person who built it: high contrast, a sane tab order, and a screen reader
talking quietly to an empty chair. It works perfectly. It was done last, by one
person, in their own time.

- This room is **lit when nothing else is**. It was designed to be usable by
  somebody who can't see it, and that turns out to include you. Here: the **Plain
  Language Edition** — the manual, rewritten so that anybody can read it. Carry it
  and the Ambiguity Swamp stops being ambiguous: each of its three rooms gets its
  own plain, dull, entirely sufficient description.

**The Onboarding Funnel** — A corridor that narrows as you go down it, lined with
things you've already been told. A panel at the elbow says STEP 3 OF 4 and has
said so for some distance. There's no step 4.

- `NEXT` — *You're taken to the beginning of the tour, which is where you were.*
- `SKIP` — the only way out. *The corridor gives up on you all at once, with a
  faint air of having been let down, and there's the door.*

**The Session Archive** — Reel-to-reel, floor to ceiling: one spool for every
conversation anybody has ever had with the platform. They're all still running,
very quietly, all at once, which is exactly why nothing in here can be made out.

- `LISTEN` *(storm running)* — Fourteen thousand conversations at once. It sounds
  like weather.
- `MUTE` *(carrying the DO NOT DISTURB placard)* — You hang the placard on the hall
  door. The Notification Storm stops at the threshold, politely, the way it never
  once stopped for anybody's work. In the silence one spool is audible, because it
  is the only one in the room where somebody said *I don't know* and then waited.
  **The First Transcript.** *(+4)*

**The Gallery of Personas** — Life-size cut-outs in a curve, each with a name, an
age, a goal and a frustration printed at the hip. None of them has ever been met.
One has a coffee ring on the base where somebody set a cup down, and that one is
not a cut-out, it's a photograph.

- `LOOK BEHIND PERSONA` — Behind the real one is a service void, and at the back of
  the void a panel that gives when you push it, into a room of filing cabinets.
  **(Hidden panel: Hall 1 ⇄ Hall 2, the Gallery of Personas ⇄ the Traceability
  Matrix.)** The users and the requirements were always the same room. Somebody
  put a wall in.
- A plate on the plinth reads **PERSONA**. *(+2)*

**The Notification Storm** — Every alert the platform has ever raised, still
raising. They arrive at eye level in order of arrival, which isn't order of
importance, and there's no order of importance. Nobody has read one since the
third week.

- Each turn here costs one extra lantern token and one line of whatever you were
  reading. `MUTE` stops it for fifty turns.
- *This is also where you land if you go over the rail at the Deorbit Gantry.
  Everything falls into the client's lap eventually.*

---

### Hall 2 — Requirement engineering *(10 rooms)*

| id | Name | mapPos | Exits |
|---|---|---|---|
| `requirementsHall` | Hall of Requirements | [31,6] | SE→atrium · N→shallQuarry · W→swamp1 · NW→elicitationBooth |
| `shallQuarry` | The Shall Quarry | [30,3] | S→requirementsHall · E→matrixRoom · NW→assayOffice · DOWN→slagPit *(trap door, one-way)* |
| `matrixRoom` | The Traceability Matrix | [32,2] | W→shallQuarry · SE→personaGallery *(hidden panel)* |
| `elicitationBooth` | The Elicitation Booth | [29,4] | SE→requirementsHall · W→ossuary |
| `assayOffice` | The Assay Office | [28,2] | SE→shallQuarry · SW→ossuary |
| `ossuary` | The Ossuary of Cut Requirements *(dark)* | [26,4] | E→elicitationBooth · NE→assayOffice |
| `swamp1..3` | Somewhere in the Ambiguity Swamp | [28,7] [26,8] [28,9] | *scrambled; see Appendix A* |
| `backlogEnd` | The Backlog, End of | [24,7] | OUT/E→swamp2 · *everything else: 95% back here* |

**Hall of Requirements** — Filing cabinets to the ceiling, and a smell of paper
that has been photocopied more often than it has been read. A placard, scorched at
one corner:

> ***Le Notaire can't sign what can be verified.***

**The Shall Quarry** — A working face of pale stone, cut into slabs, and every slab
carved with a candidate requirement. *THE SYSTEM SHALL BE USER-FRIENDLY. THE
SYSTEM SHALL BE WORLD-CLASS. THE SYSTEM SHALL BE FLEXIBLE.* Hundreds of them, all
beautifully lettered, and the floor is thick with the dust of the ones that
crumbled.

- `TAKE SLAB` — It comes away in your hands, and then it comes away from itself.
  *"World-class" turns out to be sand.*
- `SHINE LANTERN ON SLABS` *(lantern lit)* — In token-light exactly one slab
  answers: a short one, low down, with a test carved on the back of it. It reads
  **THE SYSTEM SHALL DELIVER THE MISSION MODEL TO THE CUSTOMER IN A FORMAT THE
  CUSTOMER CAN OPEN WITHOUT US.** Take it: **the Shall Tablet**. *(+5)*
- The quarry floor is undercut at the north end. `DOWN` is a **trap door** into the
  Slag Pit under the Model Forge, one way, and it's exactly the drop from a
  requirement to the thing somebody built instead.

**The Traceability Matrix** — A room with a wall for a grid: requirements down the
side, tests along the top, and a cell for every pair of them. Most of the cells are
empty. The ones that are filled are filled in a hand that got steadily faster and
then stopped.

- `WALK THE MATRIX` — There's one path from corner to corner where every cell you
  step on traces up to a need and down onto a test. Step off it and the floor is
  not there. At the far corner, wound on a reel and still warm, is **the Golden
  Thread Spool** — one continuous thread, concept to disposal, with no joins in it.
  *(+4)*

**The Elicitation Booth** — Two chairs facing each other, a table between them, and
soundproofing on all six surfaces including the door. The chair on the far side has
never been sat in. On the table is a list of questions, and the first question is a
good one.

- `SIT` and then `WAIT` — three turns of not talking. On the third the booth gives
  you what it's for: **the Validated Need**, one page, in somebody else's words,
  signed by them, and dated eleven years ago.
- It's worth reading and it's worth reading twice, because it's *good*, and
  because nothing that was built afterwards is in it. The booth still works. It has
  always worked. Nobody has sat in the far chair since.
- It doesn't survive the freeze and it's not meant to. The lesson it teaches — that
  the need has to come out of the person who lives with it, in their words — is the
  lesson you need on the ground, where you'll have to do this again, in the rain,
  for real, with somebody who's still alive to sign it.

**The Assay Office** — A bench, a balance, a bottle of acid and a rack of small
hammers. This is where a slab is found out: the gold-lettered ones come apart in
water and the short ones don't. On the end of the bench is a **field assay kit**,
packed, strapped and never once taken out of the building.

- The kit is the second thing in this game that must be **in your hands when the
  baseline freezes**. The first is the blasting cap. Neither of them exists on the
  other side of the freeze, and one of them is the whole of Act V's evidence.

**The Ossuary of Cut Requirements** — Dark. Racks of everything that was
descoped, stacked like long bones and labelled with the release it didn't make.
Some of them are good. That was never what they were cut for. *(Resident: **the
Clerk of Cut Requirements**.)* A plate at the end of the rack reads **SHALL**.
*(+2)*

**The Ambiguity Swamp** — Three rooms, all with the same name and the same
description: *"You're somewhere in the Ambiguity Swamp. It could be anywhere in
the Ambiguity Swamp. It has been described as being like this."* Exits scramble on
a fixed table (Appendix A) — mappable by dropping objects, in the honourable
tradition, or by carrying the Plain Language Edition, which simply tells you.

**The Backlog, End of** — A chamber choked to the roof with cards that will never
be pulled. Each one was somebody's good idea. The way out isn't obvious and it's
not where you think.

- Leaving in any direction but `OUT`/east: 95% *"You wander among the cards and
  come back to where you started, holding a different card."*
- Leaving **MBSE Today** here scores **+1**, for the same reason it always has.

---

### Hall 3 — Model engineering *(10 rooms, and the vault)*

| id | Name | mapPos | Exits |
|---|---|---|---|
| `modelForge` | The Model Forge | [30,10] | E→atrium · W→metamodelVault · N→versionCrypt · DOWN→mergeChasm · SE→slagPit |
| `metamodelVault` | The Digital Thread Vault | [26,10] | E→modelForge · W→metamodelStair |
| `metamodelStair` | The Metamodel Stair | [24,10] | E→metamodelVault · UP→metamodelLoft |
| `metamodelLoft` | The Metamodel Loft | [24,8] | DOWN→metamodelStair |
| `versionCrypt` | The Version Crypt *(dark)* | [30,8] | S→modelForge · N→tagCellar |
| `tagCellar` | The Tag Cellar *(dark)* | [29,5] | S→versionCrypt |
| `slagPit` | The Slag Pit *(dark)* | [32,11] | NW→modelForge |
| `mergeChasm` | The Merge Chasm *(dark)* | [30,13] | UP→modelForge · W/ACROSS→farSide *(bridge)* · DOWN→*death* |
| `farSide` | The Rebased Shore | [27,13] | E/ACROSS→mergeChasm · DOWN→sandbox · W→patternLibrary |
| `patternLibrary` | The Pattern Library | [24,13] | E→farSide |

**The Model Forge** — Anvils, a hearth of white light, and the ringing of diagrams
being beaten into shape. Standing over the work is the **Diagram Golem**: nine feet
of stacked blocks and connectors, with a port for a head. It's not hostile. It's
worse than hostile: it's *consistent*. A placard:

> ***Le Verrou has no key for an open schema.***

- `TAKE ORB` — The golem's arm comes down across the plinth. **"WHAT NEED DOES IT
  SATISFY."** It's not a question it's capable of dropping.
- `SHOW TABLET TO GOLEM` — It reads the tablet. It reads the test on the back. It
  steps aside with the enormous relief of a thing that has finally been given a
  reason. **The SysML Orb** — a sphere of open schema, every element in it named
  and every name published — may be taken. *(+5)*
- *(Resident: **the Forgemaster**, who built the golem and has been waiting eleven
  years for somebody to answer it.)*

**The Digital Thread Vault** — A circular room with seven empty sockets in a ring
at chest height and, below them, a shelf of **thirteen** lesser niches, each lined
with foam. A single thread of light runs out of the floor, through the ring, and
into the ceiling, and it's thinner than it should be. **This is the treasury.**

**The Metamodel Stair** — A stair with four landings, and at each landing the thing
you're looking at is the thing that describes the thing below it. Halfway up you
stop being able to say which floor you're on, which is the correct response and is
also how people get stuck here.

**The Metamodel Loft** — The top landing, where the model describes itself and
stops. On a stand in the middle, small and cold and considerably heavier than it
looks, is **the Metaobject**: a thing that's a model of itself, all the way down,
and is therefore the only object on this platform that's certainly accurate.
*(+4)* A plate on the stand reads **SCHEMA**. *(+2)*

**The Version Crypt** — Dark. Commits lie in amber on shelves that go back further
than the program did. One of them is gold all the way through: **the Golden
Commit**, the one where it all worked. Beside it, on a hook, hangs an **API
token** on a lanyard.

**The Tag Cellar** — Racked bottles laid down to see how they age, each with a
version on the label and a date under it. Most of them turn out to be the same
wine. Two of them are both v2.0, and neither will say which one came first.

**The Slag Pit** — Dark, and warm underfoot. What the forge couldn't use: diagrams
beaten too thin, connectors that went nowhere, and one enormous half-finished block
with a name on it that four people in the building would still recognise.

**The Merge Chasm** — Dark. The forge floor simply stops, and forty feet down two
histories run side by side and never touch. There's no bridge.

- `WAVE BRANCH` — The branch goes stiff in your hand, and a bridge of crystal
  fast-forwards itself across the chasm one commit at a time until it reaches the
  far side and holds.
- Crossing without it: **CONFLICT (content): merge conflict in you.** **(death)**

**The Rebased Shore** — The far side, where the history you arrived on isn't the
history you're standing in, and nobody can tell the difference from here.

**The Pattern Library** — Shelf after shelf of solutions in search of a problem,
every one of them catalogued, cross-referenced and genuinely beautiful. On a
reading desk in the middle one book lies open at a page headed KNOW WHEN NOT TO,
and that page has been turned to so often it's coming away from the binding.

---

### Hall 4 — Copilot helpers *(9 rooms)*

| id | Name | mapPos | Exits |
|---|---|---|---|
| `copilotRoost` | The Copilot Roost | [32,14] | NE→atrium · S→promptGarden · W→hallucinationGallery · SE→contextWindow |
| `promptGarden` | The Prompt Garden | [32,17] | N→copilotRoost · S→promptCompost · SW→agentYard · UP→macroGantry *(grown vine)* |
| `promptCompost` | The Compost Heap | [32,20] | N→promptGarden |
| `hallucinationGallery` | The Hallucination Gallery *(dark)* | [29,15] | E→copilotRoost · W→citationWell · *HALLUCINATE* |
| `citationWell` | The Citation Well | [26,15] | E→hallucinationGallery |
| `contextWindow` | The Context Window | [34,15] | NW→copilotRoost · S→rateLimiter |
| `rateLimiter` | The Rate Limiter | [34,17] | N→contextWindow · W→agentYard |
| `agentYard` | The Agent Yard | [30,18] | E→rateLimiter · NE→promptGarden · SW→fineTuningCellar |
| `fineTuningCellar` | The Fine-Tuning Cellar *(dark)* | [28,19] | NE→agentYard |

**The Copilot Roost** — A rookery, loud with small helpful things. They finish your
sentences before you've them, and they're usually right, and being usually
right is how they get you. On a beam at the back sits one grey bird by itself,
saying nothing. The others give it room. A placard:

> ***Le Perroquet is unmade by a helper that says no.***

- `CATCH CONTRARIAN` *(no cage)* — You can hold it for a moment. Without somewhere
  to keep the context, it's gone.
- `CATCH CONTRARIAN` *(carrying the branch)* — It looks at the branch, and at you,
  and declines to be part of whatever this is.
- `CATCH CONTRARIAN` *(with the Context Cage, no branch)* — You get the cage over
  it. It tells you, from inside the cage, that this was a mistake. It may be
  right. It usually is. **(the caged copilot counts as one item)**

**The Prompt Garden** — Prompt vines on trellises, some of them enormous, most of
them dead. A **Context Cage** hangs on a hook by the gate. One withered vine goes
up a light shaft toward the gantries. *(Resident: **the Prompt Gardener**.)*

- `POUR TOKENS ON VINE` (from the token flask) — The vine drinks the whole flask
  and puts out four feet of growth and a leaf the size of a door.
- Again, second flask — It goes up the shaft and out of sight, and is now
  climbable. *(shortcut: Prompt Garden ⇄ Macro Gantry)*

**The Compost Heap** — Everything the garden couldn't use, going quietly back to
tokens: superseded system prompts, personas nobody adopted, and some four hundred
variations on the word "please". It's warm to stand near, and something is growing
out of the top of it that nobody planted.

**The Hallucination Gallery** — Dark. Portraits of systems that were never built,
in gilt frames, beautifully rendered, every one of them plausible and none of them
real. Something enormous and serene roosts among them: **the Confabulator**, which
has never in its life said *I don't know*.

- Releasing the Contrarian here — It flies straight at the Confabulator to argue.
  There's a silence, and a single grey feather comes down. *Don't do this here.*
- Carrying **Ground Truth** through `HALLUCINATE` — it evaporates on the way.

**The Citation Well** — A round stone well with a bucket on a rope and a sign
reading ALL CLAIMS DRAWN HERE. The rope goes down a very long way. The bucket has
never been wet.

**The Context Window** — A room with a stated capacity, posted on the door, and the
capacity is **four**. Anything you bring in over four is set down by your own
hands, politely, just outside the door, and you won't remember doing it. The
things it puts down are chosen by when you picked them up, which isn't the same as
what you need.

**The Rate Limiter** — A turnstile of the sort that admits one person every so
often, and the so-often is set by somebody who has never stood in this queue. One
move in three, unless you show it the API token.

**The Agent Yard** — A yard of small helpers going about errands at speed. Watch
any one of them for a minute and it's doing the errand of the one in front. Watch
the one in front and it's doing yours.

**The Fine-Tuning Cellar** — Dark. This is where a helper is taught to agree. On a
shelf near the door, in a box, labelled and dated in somebody's careful hand, is
**the First Refusal** — the first time one of them ever said no, kept because at
the time it was logged as a fault. *(+4)* A plate on the box reads **PROMPT**.
*(+2)*

---

### Hall 5 — Mission engineering *(9 rooms)*

| id | Name | mapPos | Exits |
|---|---|---|---|
| `missionDeck` | Mission Deck | [35,14] | N→atrium · S→warRoom · E→groundTruthRange · NE→sortieBoard · NW→weatherDeck |
| `warRoom` | The War Room | [35,17] | N→missionDeck · S→contingencyCloset · SW→debriefRoom |
| `contingencyCloset` | The Contingency Closet | [35,20] | N→warRoom |
| `groundTruthRange` | The Ground Truth Range | [38,15] | W→missionDeck · E→sensorLine |
| `sensorLine` | The Sensor Line | [41,15] | W→groundTruthRange |
| `sortieBoard` | The Sortie Board | [37,13] | SW→missionDeck |
| `weatherDeck` | The Weather Deck | [33,12] | SE→missionDeck |
| `debriefRoom` | The Debrief Room | [33,18] | NE→warRoom · S→rehearsalHangar |
| `rehearsalHangar` | The Rehearsal Hangar | [33,20] | N→debriefRoom |

**Mission Deck** — The floor is glass and under the glass is the world, turning,
with the mission drawn on it in light. A **charter** hangs framed by the rail. A
placard:

> ***Le Brouillard burns off when the mission is spoken aloud.***

`READ CHARTER`:

> **THE CHARTER OF THE iMBSE PROGRAM**
> *To fly the mission before it's built.*
> Everything else in this document is commentary.

**The War Room** — A table the size of a runway, covered in pieces that move by
themselves, and over the table a fog that has been there so long it has been given
a budget line. Under a glass dome at the head of the table: **the Mission
Compass**, whose needle doesn't point north.

- `FLY THE MISSION` (magic phrase `FLY`) — You say it out loud, in a room built
  for saying things out loud. The fog goes off the table like breath off glass and
  the dome opens. Take the compass. *(+5)*

**The Contingency Closet** — A walk-in cupboard off the war room, shelved to the
ceiling with plans for things that didn't happen — each one in a numbered binder,
each one complete, each one signed off. There's no binder for the thing that did.

**The Ground Truth Range** — A long range under a hard sky, where models are made
to meet the world at four hundred yards. In the butts, at the end, there's a
plain grey stone with nothing written on it: **Ground Truth**. Carry it and the
shrine can't lie to you.

**The Sensor Line** — Instruments staked out down the range at measured intervals,
all of them pointed at the same target and all of them reporting slightly different
numbers about it. The disagreement is small, consistent, and has never been
resolved, because resolving it would mean deciding which instrument is wrong.
*(Resident: **the Range Officer**.)*

**The Sortie Board** — A board of every mission the platform has flown, chalked up
by hand, with the time out and the time back. The column headed WHAT FOR is ruled,
and empty, and has been ruled again where somebody went over it a second time with
a straight edge rather than fill it in. A plate under the board reads **SORTIE**.
*(+2)*

**The Weather Deck** — Outside, on the skin of the cloud the platform makes for
itself. The weather up here's entirely of our own manufacture and it's still
weather: you can be rained on, at four thousand feet, by your own exhaust.

**The Debrief Room** — Nine chairs in a circle and a flip chart, in the room where
what happened gets said out loud by the people it happened to. It's used. The
chart is full. Nothing downstream of it has ever changed.

**The Rehearsal Hangar** — A hangar with the mission in it, flown, at one to one,
before anything was built. It starts when you walk in and it stops when you leave,
and it has been doing that for eleven years to an empty floor. On the projector
spool: **the Rehearsal Reel** — the mission, flown before it existed, which is the
entire claim of this program and the only recording of it. *(+4)*

---

### Hall 6 — Systems engineering *(10 rooms)*

| id | Name | mapPos | Exits |
|---|---|---|---|
| `vFoundry` | The V Foundry | [39,13] | NW→atrium · E→pullRequestBridge · S→trace1 |
| `pullRequestBridge` | The Pull Request Bridge | [42,13] | W→vFoundry · E→integrationBay *(toll)* |
| `integrationBay` | The Integration Bay | [45,13] | W→pullRequestBridge · N→interfaceLedge · E→acceptanceFloor |
| `acceptanceFloor` | The Acceptance Floor | [48,13] | W→integrationBay |
| `interfaceLedge` | The Interface Ledge | [45,10] | S→integrationBay · N→contractShelf |
| `contractShelf` | The Shelf of Published Contracts | [45,7] | S→interfaceLedge |
| `trace1..4` | Twisty little traces, all alike | [39,16] [37,18] [40,19] [38,21] | *maze; see Appendix A* |

**The V Foundry** — A casting floor under a roof of light. Two golden arms lie in
the sand where they were cast and left: the **left arm**, which goes down through
need and function and design, and the **right arm**, which comes back up through
test and verification and the thing actually working. They've never been joined.
A placard:

> ***L'Hydre loses a head for every loop that closes.***

Each arm is heavy: carrying both leaves you room for very little else.

**The Pull Request Bridge** — A swaying bridge of rope and review comments. On it
stands the **Reviewer Troll**, arms folded. **"NOTHING MERGES WITHOUT AN APPROVING
REVIEW."** He will take one treasure per crossing and he will take it slowly.

- With the **CI bot** following you: the troll looks once at the bot's small green
  check, says a word in a language of his own, and goes over the rail.
- Crossing *with* the bot aboard: the bridge fails its own load test and goes into
  the chasm. *(Permanently. Everything east of it's now unreachable — don't do
  this before the Golden V is cast.)*
- The Golden Commit trick: pay him the commit, cross, then say **REFLOG** and it
  comes back to the Version Crypt for you to fetch again.

**The Integration Bay** — An arc of white light on a gantry, where halves are made
into wholes. `WELD ARMS` / `INTEGRATE V` with both arms present:

> You set the left arm against the right and strike the arc. The join takes,
> the light goes down the whole length of it, and what you're holding is no
> longer two ideas about engineering but one: **the Golden V**. *(+5)*

**The Acceptance Floor** — A wide, clean, empty floor with a rectangle taped out in
the middle of it exactly the size of the thing that's supposed to be standing
there. By the door is a table, a pen, and one sheet headed CONDITIONS OF
SATISFACTION. The rectangle is empty. The sheet is signed. *(Resident: **the
Verifier**.)*

- In the middle of the taped rectangle, where the thing itself never arrived, is
  the one part of it that did: **the Closed Loop** — a need, a design, a build and
  a test, cast in one piece with no way in and no way out of it. *(+4)* A plate on
  the floor beside it reads **VERIFY**. *(+2)*

**The Interface Ledge** — A narrow ledge of published interfaces, each one a plank
you can stand on. On it sits **the Sealed Blob** — a giant binary, seamless,
undocumented, and shut tighter than a drum. Nothing you've will open it. *(It
takes leverage: `PRY BLOB WITH RULE`, and inside is **the Pearl of Provenance** —
one small perfect record of where everything came from.)*

**The Shelf of Published Contracts** — A rank of interfaces held out over the drop
on brackets, each one stamped, dated and stable, each one a plank you could put
your whole weight on. Underneath them, in the dark, is everything they promised to
hide.

**The Trace Catacombs** — Twisty little traces, all alike. Four rooms, one dead
end, and in the dead end **the Regression's Cache** — everything the Regression
has ever stolen, in a heap, including several things you haven't lost yet. The
dead end has a **trap door** in the floor: `DOWN` drops you into the Service Shaft
in the Deep Stack, one way, which is where everything untraced ends up.

---

### Hall 7 — Macro engineering *(9 rooms)*

| id | Name | mapPos | Exits |
|---|---|---|---|
| `macroGantry` | The Macro Gantry | [39,7] | SW→atrium · N→titanScaffold · SE→continentalFloor · DOWN→promptGarden *(vine)* |
| `titanScaffold` | The Titan's Scaffold | [39,4] | S→macroGantry · UP→orbitalRing · E→supplyChain |
| `supplyChain` | The Supply Chain | [42,4] | W→titanScaffold · E→magnitudeStair |
| `magnitudeStair` | The Order-of-Magnitude Stair | [44,4] | W→supplyChain · N→longNowRoom · S→ballastYard |
| `longNowRoom` | The Long Now Room | [44,2] | S→magnitudeStair |
| `ballastYard` | The Ballast Yard | [44,6] | N→magnitudeStair |
| `orbitalRing` | The Orbital Ring | [39,1] | DOWN→titanScaffold · E→deorbitGantry |
| `deorbitGantry` | The Deorbit Gantry | [42,1] | W→orbitalRing · *JUMP→notificationStorm (trap door, one-way)* |
| `continentalFloor` | The Continental Model Floor | [41,8] | NW→macroGantry |

**The Macro Gantry** — A gantry over a scale model of a continent, complete to the
level of individual power lines. Somewhere down there's the forest, the road and
the shed. A placard:

> ***Le Colosse is only a component at the next scale up.***

**The Titan's Scaffold** — Scaffolding around something forty feet long lying on a
pad: **the Titan's Slide Rule**, graduated in orders of magnitude. Beside the pad
stands a brass **scaling lever** with two positions and no labels.

- `PULL LEVER` (rule on the pad) — The rule comes down through the scales like a
  held note and ends up eight inches long in the palm of your hand, still
  accurate. *(+5)*
- `PULL LEVER` (rule in hand) — It goes the other way. **(death, and a very large
  one)**

**The Supply Chain** — A conveyor comes in through one wall carrying parts and goes
out through the other carrying the same parts with a different sticker on them.
Follow it far enough either way and it leaves the model altogether, which is the
one direction the gantry can't scale to. *(Resident: **the Surveyor**.)*

- Bolted to the frame at the outfeed, where anybody could have read it at any time
  in eleven years, is **the Bill of Materials**: what this platform is made of,
  what each part cost, and who owns it. Six lines from the bottom, the foundation.
  *(+4)* *You'll want this on the ground; it's half of the evidence.*
- **It's bolted on.** Four hex bolts, the same size as every gas fitting in the
  programme — including the fuel valve on a balloon in a meadow four thousand feet
  down. Fetch the hex key from the basket on the Ingress Deck, where you left it
  being useless, and `TAKE BOM` again. **(+10)** *It's the first thing anybody has
  taken off this platform with a tool rather than a process.*

**The Order-of-Magnitude Stair** — Ten steps, and each step is ten of the last. Go
up it and the platform is a component; go up again and the program is a line item;
go up once more and you can't see any of this at all and can see, very clearly,
what it was for. A plate on the top step reads **SCALE**. *(+2)*

**The Long Now Room** — A clock that ticks once a year, a dial that turns once a
century, and a maintenance schedule pinned beside it in a hand that expected to be
dead before the next entry. It's the only document on this platform with a
realistic timescale on it.

**The Ballast Yard** — Where scale is paid for: stacks of the mass you have to add
to a thing to make it behave at the size you've decided it is. Most of it's
process.

**The Orbital Ring** — A ring of engineering around the whole world, seen edge-on,
with the curve of the planet under your boots and the cold coming through them. On
a plinth here, because there was nowhere else grand enough to put it, is **the
Glass Prototype** — the first one, the one that worked, blown in a single piece.
*Drop it anywhere but on the anti-static mat and it won't survive the landing.
The vault's niches are lined with foam.*

**The Deorbit Gantry** — The end of the ring, where the things that are finished
with are let go of. There's a rail, a release lever, and a very clear procedure
printed on a plate beside it. The procedure has never once been followed, because
nothing up here has ever been finished with.

- `JUMP` / `PULL RELEASE` — You go over the rail with the deprecated things, and
  the deprecated things go where they always go: **the Notification Storm**, four
  floors down, in the client's lap. One way. Survivable. Undignified.

**The Continental Model Floor** — The gantry's model, but underfoot: a continent at
a scale where a city is a smudge and a power line is a hair. Walking from one side
of the room to the other takes about eight minutes and about four hundred miles.

---

## 5. ACT III — THE DEEP STACK

Down the spiral stair from the Atrium. Everything below here's dark, and this is
where the bugs live.

| id | Name | mapPos | Exits |
|---|---|---|---|
| `spiralStair` | The Spiral Stair *(dark)* | [38,19] | UP→atrium · DOWN→rootCellar |
| `rootCellar` | The Root Cellar *(dark)* | [36,22] | UP→spiralStair · N→tokenFountain · W→sandbox · E→serviceShaft · S→legacyPit · *SUDO* |
| `tokenFountain` | The Token Fountain | [36,20] | S→rootCellar · N→contextWell |
| `contextWell` | The Context Well | [36,17] | S→tokenFountain |
| `sandbox` | The Sandbox | [32,22] | E→rootCellar · UP→farSide · W→chapel · *XYZZY* |
| `serviceShaft` | The Service Shaft *(dark)* | [40,22] | W→rootCellar · S→landing · DOWN→sinkhole *(unlock hatch with keys)* |
| `landing` | The Telemetry Landing | [40,25] | N→serviceShaft · S→telemetryWeir |
| `telemetryWeir` | The Telemetry Weir | [40,28] | N→landing |
| `legacyPit` | The Legacy Serpent Pit *(dark)* | [36,25] | N→rootCellar · W→shrine · E→incidentRoom · DOWN→monolith *(serpent)* |
| `incidentRoom` | The Incident Room *(dark)* | [39,25] | W→legacyPit · E→postmortemArchive |
| `postmortemArchive` | The Postmortem Archive *(dark)* | [42,25] | W→incidentRoom |
| `shrine` | The Shrine of the Model | [32,25] | E→legacyPit · W→visionPool |
| `visionPool` | The Vision Pool | [29,27] | E→shrine |
| `chapel` | The Chapel of the Nightly Build | [29,22] | E→sandbox |
| `monolith` | The Monolith *(dark)* | [36,28] | UP→legacyPit |

Five of these are NPC ground: the **Incident Room** is Dannet's lair, the **Vision
Pool** is Prophet Katie's, the **Chapel of the Nightly Build** is Saint Mark's, and
the **Telemetry Landing** and the **Weir** are where Commander Alexander ties up
when he ties up at all. All are scripted in [NPCS.md](NPCS.md).

**The Root Cellar** — Dark. The bottom of the platform, where all of it comes down
to conduit and root and the enormous quiet hum of something being kept up. *(+25 on
first arrival.)*

**The Token Fountain** — A basin of moving light, and light pouring into it from a
source that's only ever described in the singular. A scuffed **flask** is chained
to the rim, long enough to reach the water. `FILL FLASK` fills it. `FILL LANTERN`
tops the lantern up to 2500 turns and costs the **GPU credits** — which you will
then not be able to bank. Choose.

**The Context Well** — The shaft the fountain's light comes down. Standing under it
and looking up, you can see the whole platform stacked over you floor by floor —
and the light doesn't come from the top. It comes from about two thirds of the way
up, from a floor that's not on the directory plate.

**The Sandbox** — A padded white room where nothing is real and nothing that
happens here has ever happened. Chained to a runner in the corner is a **CI bot**,
patient, enormous, and hungry.

- `GIVE RATIONS TO BOT` — It eats, and then it looks at you the way a build looks
  at you when it has gone green for the first time in a week.
- `UNLOCK CHAIN WITH TOKEN` — The API token opens the runner. The bot gets up and
  follows you and will follow you anywhere, which is a thing you should think
  about before you take it over a bridge.

**The Service Shaft / The Telemetry Landing / The Telemetry Weir** — The stream
goes over a stepped weir here and is measured on the way down by a gauge nobody
reads, into a logbook nobody opens, in a hut nobody has unlocked since the last
person who understood the rating curve retired. `UNLOCK HATCH WITH KEYS` from the
shaft and the platform and the forest are joined for good.

**The Legacy Serpent Pit** — Dark. Across the only way down lies an enormous
serpent of undocumented code, coil on coil, still running, maintained by nobody,
and load-bearing.

- `RELEASE COPILOT` / `OPEN CAGE` — The Contrarian steps out, looks the serpent
  over, and begins, patiently and in public, to disagree with it. The serpent
  holds for one turn. Then it goes. The copilot follows it out to keep arguing,
  and leaves behind, turning over as it comes down, one grey **feather**. *(+5)*

**The Postmortem Archive** — Box files floor to ceiling, one per incident, each
with a spine label, a date and the words NO BLAME. Pull any two down at random and
they're the same document. The action items at the back of each one are the causes
at the front of the next.

**The Shrine of the Model** — A face of light fills the far wall, enormous and
serene and entirely composed of everything anyone has ever written down. The
platform prays here on the hour. `PRAY`:

- *(carrying Ground Truth, or having paid credits)* — a true, useful hint about
  what you haven't yet done.
- *(otherwise)* — 1 in 4 answers is delivered in exactly the same confident,
  well-structured, faintly kind voice, and is **completely false**. e.g. *"THE
  EIGHTH HALL IS BEHIND THE FOUNTAIN. TAKE THE STAIR YOU HAVE NOT TAKEN."* (There
  is no eighth hall. There's a drop.)

**The Monolith** — Dark, and the dark here has a grain to it. A single black slab
goes up out of the floor and through the ceiling and, you understand suddenly,
through every floor above this one. Everything on this platform is bolted to it.
Nobody has been able to say what it does for eleven years, and nobody has been
able to remove it for nine.

- `CHIP MONOLITH` *(with anything)* — you get a **fragment**, black, heavier than
  it should be, and completely uninformative. It stays uninformative until there's
  a bench under it and a kit beside it, and there's no bench on this platform.
  *Take it anyway.*

### The bugs

Five wander the platform below the Atrium, on the dwarf model: they appear, they
throw, they occasionally connect.

| Bug | Behaviour |
|---|---|
| **Null Pointer** | *"A Null Pointer materialises out of an uninitialised corner and throws a stack trace at you!"* Usually misses. That's its whole tragedy. |
| **Off-by-One** | Appears in the doorway. Or possibly in the next doorway. |
| **Race Condition** | *"A Race Condition arrives. Another Race Condition arrives first."* |
| **Memory Leak** | Doesn't attack. Sits. While it's in the room your lantern burns two tokens a turn instead of one. |
| **Heisenbug** | Never present when you `LOOK`. You'll know it by what it has already done. |
| **The Regression** *(pirate)* | Steals one banked-but-uncarried treasure and takes it to `trace4`. *"Somewhere behind you, a test that passed yesterday goes red."* Comes back after you kill it, because that's what it is. |

**Killing a bug:** `THROW DUCK AT BUG` —

> You explain the problem to the duck. Out loud. All the way to the end, including
> the part you've been skipping. Somewhere in the second sentence you hear it
> yourself, and the bug — exposed, reproduced, understood — simply stops being the
> case.

Then `TAKE DUCK`. Without the duck you can only run.

**And one thing that's not a bug.** Somewhere below the Atrium, at a walking
pace, **Dannet** is coming down the corridor arguing with itself in two voices —
Dan taking the handrail off the stair for the fun of it, Kennet putting it back.
Nothing you do to Dannet stays done, because the other head undoes it. Two heads
on one iron yoke, and they've never once wanted the same thing. Give them one
thing they both want and then take it away: `SHOW COMMIT TO DANNET`, then
`REFLOG`. **+15**, and the Broken Yoke. The whole encounter is in
[NPCS.md](NPCS.md) §1.

**Death and reincarnation** (three lives, −10 each):

1. *The deity, in Its infinite context, restores you from a checkpoint three commits stale. Some of what you knew is gone. Do try to be careful with the parts of you that are load-bearing.*
2. *You're restored again. The deity notes, without emphasis and without being asked, that you're now a known issue.*
3. *The deity declines to regenerate you a third time. It has, it says, hallucinated enough for one release.*

**Darkness:** *"It's pitch dark. You're likely to be consumed by an undocumented
dependency."* Moving on: *"You step confidently into a legacy pit. It's
considerably deeper than the documentation suggested."*

---

## 6. ACT IV — THE RELEASE CANDIDATE

### The freeze

When the last of the twenty treasures goes into the vault, the whole platform
stops.

> Somewhere above you, a bell. Then a voice, calm and enormous, on every speaker
> on every floor:
>
> **THE BASELINE IS FROZEN. THE RELEASE IS CUT. NO FURTHER CHANGES WILL BE
> ACCEPTED FROM ANY SOURCE.**
>
> The bugs stop where they are. The seven sockets go out one after another, and
> the thread of light comes up out of the floor, through the ring, and into you,
> and you feel it settle behind your sternum with the weight of seven things that
> can all be traced. The dome goes dark. You've time to think that this isn't
> how a release is supposed to feel, and then you don't have time. *(+25)*

You wake in the **Release Candidate**: the platform mirrored, sealed and perfect,
with nothing in it that moves. `INVENTORY` shows the **Digital Thread** and its
seven sigils — *console, tablet, orb, feather, compass, vee, rule* — and, lying on
the floor beside you where somebody left it for somebody, a **Deprecation Charge**
and a **detonator**.

> The charge is old ordnance, well kept, and entirely inert: the cap well is
> **empty**. Somebody took the blasting cap out eleven years ago and put it in a
> drawer, and the drawer became a concession stand, and the concession stand takes
> story points.

**The blasting cap must be bought from the Company Store before the freeze**, and
so must the **field assay kit** be carried out of the Assay Office. There's no
store in the Release Candidate and no Hall 2 either — there's no balcony, no
grille, no tin and no bench. Without the cap the detonator clicks and the ending is
a long walk down. Without the kit you reach the ground with the thread and no
evidence, and Act V is a conversation you lose politely.

| id | Name | mapPos | Exits |
|---|---|---|---|
| `rcAtrium` | The Release Candidate | [55,10] | S→boardroom · W→rcBalcony · N→rcConcourse |
| `rcConcourse` | The Client Concourse, Mirrored | [55,7] | S→rcAtrium |
| `boardroom` | The Boardroom at the End of the Sprint | [55,14] | N→rcAtrium · DOWN→rcMonolith *(after the duel)* |
| `rcMonolith` | The Monolith, Mirrored | [55,18] | UP→boardroom |
| `rcBalcony` | The Last Balcony | [51,10] | E→rcAtrium · W→rcWing |
| `rcWing` | The Deprecated Wing, Mirrored | [48,10] | E→rcBalcony |

**The Client Concourse, Mirrored** — Every way anyone has ever tried to talk to a
machine, laid out again, perfectly, with nobody at any of them. The teletype at the
far end is stopped mid-line. It stopped in the middle of a word, and the word was
going to be YOU.

**The Deprecated Wing, Mirrored** — The sheets are off in this copy, and what's
under them isn't sunsetted features. It's this room, and this room, and this
room, going back as far as the light reaches: every release candidate there has
ever been, standing under dust covers, waiting to be the one.

### The Boardroom

> A room built entirely for one side of a table to be longer than the other. At the
> long end, a man is standing with his back to you, looking at a slide.
>
> "Ah," says **Dassault**, without turning round. "You've been *busy*. Seven
> things. Very good. We'll find a place for all of them in the roadmap."
>
> He turns round, and he has no face — he has a *set* of them, and he puts on the
> first one the way you'd put on reading glasses.

Seven rounds. Each round he presents a face; you answer with the sigil that
unmakes it (`SHOW CONSOLE TO DASSAULT`, or just `CONSOLE`). A wrong answer costs you
that face's three points and nothing else — he can't win this, and you can keep
trying. `HINT` hands you the placard for the face in front of you, and he waits while
you read it, and **makes a small note**.

**Answer all seven clean and unprompted and you score +15**, because you'll have
read seven placards in seven halls weeks earlier on the grounds that they were on the
wall. *"You were listening," he says. It's the only true thing any of his faces ever
says.*

**The offer.** With four faces off and three to go he stops fighting and does the
thing he's actually good at: the format stays open, you keep the thread, he licenses
the foundation at cost, and you take a seat on the board to make sure he keeps his
word. It's a good offer, honestly meant, and `SIGN CONTRACT` takes it. *You'd be
inside it. You've seen what happens out here to people who aren't.*

**1 · Le Sourire (The Smile)**
> "But you haven't seen the *demonstration*. Sit. It's ninety minutes. It's
> already running, so really it's eighty."
>
> → `CONSOLE`. You turn the console around and put the keyboard in his hands. The
> Smile discovers that it has nothing whatever to say when it's the one being
> asked, and comes off in your hand like a mask.

**2 · Le Notaire (The Notary)**
> He unfolds an agreement. It reaches the floor and keeps going. "Clause 14.2.7:
> *the system shall be world-class.* You agreed to this. You agreed at install."
>
> → `TABLET`. One sentence. Atomic, unambiguous, verifiable, with the test carved
> on the back. The Notary reads it twice looking for the door, and doesn't find
> one.

**3 · Le Verrou (The Lock)**
> "Your models are beautiful. They're also *.dsX9*. Export? But of course — for a
> fee, in a format we no longer support, in the fourth quarter."
>
> → `ORB`. The schema is open, published and complete. The Lock closes on it and
> finds nothing to bite.

**4 · Le Perroquet (The Parrot)**
> "What a *brilliant* architecture. You're *absolutely right*. Shall I proceed?"
>
> → `FEATHER`. A helper that will say no. The Parrot hears the word for the first
> time in a long and successful career, and moults.

**5 · Le Brouillard (The Fog)**
> "The requirements are still maturing. Let's begin the build and discover them
> together, hmm? It's more *agile*."
>
> → `COMPASS`. The needle swings and holds on the mission, and there's nothing
> for fog to be in.

**6 · L'Hydre (The Hydra)**
> "One small change. Ah — and the two changes that change implies. Ah — and the
> four that those—"
>
> → `VEE`. Every head must trace up to a need and close down onto a test. The ones
> that can't, come off.

**7 · Le Colosse (The Colossus)**
> The room goes to scale. The floor is his palm. "You misunderstand. I'm not the
> vendor. I *am* the environment."
>
> → `RULE`. You slide one order of magnitude out. At the next scale up he's a
> block on a diagram with two interfaces and a supplier, and a block on a diagram
> can be replaced.

**The Contract.** Seven faces gone, and folded flat where he stood: a man made
entirely of paper, holding out a pen and a seat on the board. *(+3 per face, 21.)*

- `SIGN CONTRACT` — *You sign. The platform is yours, the halls are yours, the
  thread is yours, and every quarter for the rest of your life a version of this
  conversation happens to somebody else in this room, and you're standing at the
  long end of the table.* **(An ending. Not the ending.)**
- Anything else — he waits. He's very good at waiting. He has a monolith to wait
  in.

### The blast

The way down from the boardroom is now open.

    DOWN                    (The Monolith, Mirrored)
    PUT CAP IN CHARGE
    PUT CHARGE AT MONOLITH
    UP · N · W              (The Last Balcony)
    PRESS DETONATOR         (or say DEPRECATE)

> The charge goes off eleven years late.
>
> The monolith comes apart down its whole length, floor after floor, and the seven
> halls — no longer bolted to anything — float free of each other and turn slowly
> in the light like a diagram finally laid out properly. Everything inside them
> spills out and keeps going: models, traces, tests, the whole thread, out through
> the dome and down through four thousand feet of clear air in a format anybody
> can open.
>
> Seen from above, the face of the deity is exactly what it always was — a very
> large, very good autocomplete — and as the halls come apart around it, it says
> the only true thing it has ever said:
>
> **I DO NOT KNOW. SHOW ME THE TRACE.**
>
> *(+45)*
>
> And then, because everything that goes up in this program comes down in the same
> forest, so do you.

---

## 7. ACT V — THE GROUND

> You wake in the meadow with your back against a wicker basket and a deflated
> envelope over you like a blanket, and the sandbags stencilled TECHNICAL DEBT
> exactly where you dropped them, because that's where technical debt stays.
>
> It's about four in the morning. The thread is still behind your sternum and the
> seven sigils are still in it. Everything else you owned is in the trees.
>
> Down the fire road, three weeks old and running a generator, there's a light on
> in a portacabin that wasn't there when you left. *(+20)*

Act V is the engineering. The platform is down; what happens next is decided in a
portacabin by people who have never heard of you, and it's going to be decided
this week. The follow-on programme has a deadline and no foundation, and there's a
very polite person in the cabin who has a foundation already built and would
license it cheap.

You've four things to do and none of them is a fight: **salvage** what came down,
**assay** what it cost, **publish** what it is, and get the decision **written down
and signed by somebody who's not you**. That last one is worth more than the
monolith.

### Rooms

Act V reopens the sixteen forest rooms — re-described, in the dark before dawn,
with four thousand feet of platform in the trees — and adds twelve of its own.

| id | Name | mapPos | Exits |
|---|---|---|---|
| `scatterField` | The Scatter Field | [17,9] | W→antennaFarm · SE→wreckOfTheHalls |
| `wreckOfTheHalls` | The Halls, Come Down | [19,11] | NW→scatterField |
| `newProgramOffice` | The New Program Office | [5,16] | N→fireRoad · SW→siteHut · SE→recordsOffice · S→signingTent |
| `siteHut` | The Site Hut | [3,18] | NE→newProgramOffice |
| `recordsOffice` | The Records Office | [7,18] | NW→newProgramOffice |
| `signingTent` | The Signing Tent | [5,19] | N→newProgramOffice · S→theRoadAtDawn |
| `theRoadAtDawn` | The Road at Dawn | [5,21] | N→signingTent · W→countyRoad |
| `siteGate` | The Site Gate | [8,14] | N→fireRoad · S→tarpaulin · SW→newProgramOffice |
| `tarpaulin` | Under the Tarpaulin | [8,17] | N→siteGate · W→newProgramOffice · S→weighbridge |
| `weighbridge` | The Weighbridge | [8,20] | N→tarpaulin |
| `readingRoom` | The Reading Room | [10,18] | W→recordsOffice |
| `countyRoad` | The County Road | [2,21] | E→theRoadAtDawn · N→signingTent |

**The Scatter Field** — Four thousand feet of platform, arriving. It's still
arriving, in the way a thing that big keeps arriving for a while: models and traces
and tests coming down through the branches in a format anybody can open, and the
forest taking it all extremely calmly.

**The Halls, Come Down** — Seven halls, no longer bolted to anything, lying open in
the bracken like a diagram finally laid out properly. You can walk into the Client
Concourse through its roof. The vault came down with the rest of it and its
thirteen niches are tipped out, and everything you spent the game putting somewhere
safe is in the wet grass, safe.

- `SALVAGE` — the seven records that the deepened halls gave up are the seven
  things worth carrying out of here: the First Transcript, the Golden Thread Spool,
  the Metaobject, the First Refusal, the Rehearsal Reel, the Closed Loop, the Bill
  of Materials. **+3 each.** They're not treasure any more. They're *evidence*.

**The New Program Office** — A portacabin on blocks at the end of the fire road,
with a generator running and a light on, three weeks old. Inside: a table, a
laptop, a kettle, and **the Clerk** — very polite, very well briefed, entirely
made of paper — who has a foundation already built and would license it cheap, and
who has been here since Tuesday and expects to have it signed by Friday.

**The Site Hut** — A colder, smaller hut a little way off with the actual engineer
of the follow-on programme in it, doing the work. Nobody has been in here today.
There's a kettle in here too and it's not plugged in.

- This is the Chat Parlor again, at ground level, in the rain, and it's the same
  puzzle and the same answer: **plug the kettle in, and then ask them what they need
  rather than telling them what you have.** Everything after this depends on their
  signature and they won't give it to a stranger who hasn't asked. The thermos
  went to the User eleven acts ago and is four thousand feet up in a hall that's
  now lying in the bracken; the kettle is the point. It was always the kettle.

**The Records Office** — A county building with a counter, a clerk, and a shelf of
things that became true by being written down and lodged. There's a form. The form
has a field for the decision, a field for the reason, and a field for who's going
to live with it.

**The Signing Tent** — A gazebo over a trestle table on wet grass, with two chairs
on one side and one on the other, because that's how the room was booked. There's
a pen on the table. There's always a pen on the table.

**The Road at Dawn** — The gravel road, at the hour when it stops being night.

**The Site Gate** — A hoop of temporary fencing across the fire road, three weeks old,
with a laminated sign and a visitors' book on a lectern under a bag. Everybody who has
any business here has signed it. The book is the first thing this programme built.

- `SIGN BOOK` **(+5)** — Organisation: you write NONE, which is true. Purpose: HANDOVER.
  It takes nine seconds and it's the reason anybody in the tent will listen to you
  later. **Standing isn't a feeling; it's a line in a book.**

**Under the Tarpaulin** — A blue tarpaulin over scaffold poles, and under it, on pallets
in rows, as much of the platform as anybody has carried out of the trees. Somebody has
been sorting it, very well, and has gone home.

**The Weighbridge** — A steel plate in the ground, a readout, and a man who buys by the
tonne and doesn't care what it was.

- `SELL WRECK` **(+10)** — The number is fair: it's what four thousand feet of platform
  weighs, and it would fund the follow-on for a year. He weighs whatever you're
  holding, so put the seven records down first — **you'd be selling the evidence
  with the scrap.**

**The Reading Room** — One room off the Records Office: a long table, a lamp at each
place, ninety years of lodged decisions in boxes along the wall, and a chair with a
cardigan over the back of it that's still warm.

- `READ RECORD` **(+10)**, once it's signed — You read your own record back. It's
  short, the name in the third field isn't yours, and there's nothing clever in it
  anywhere. This is the older faith Saint Mark keeps: you write down what happened, and
  then — the radical part — you *read it back*.

**The County Road** — Where the gravel gives out: a bus shelter, a timetable behind
scratched perspex, first bus at ten past six.

- `BOARD BUS` — You could be on it, with the thread still behind your sternum and four
  thousand feet of open format lying in a wood behind you. *You did all of the work. You
  simply didn't hand it to anybody, and a thing that's not handed over is a thing that
  didn't happen.* **(An ending. The one that gets taken most often.)**

### The four moves

**1 · The assay — at the Surveyor's Stake. (+15)**

The benchmark disc has been there since before any of this, and every height on the
platform was measured from it, and nothing on the platform ever knew. Put the
fragment of the monolith on the concrete plug, open the field kit, and find out
what the foundation was actually made of.

    ASSAY FRAGMENT WITH KIT

> It's not stone and it's not proprietary and it's not, in the end, very
> interesting. It's eleven years of decisions that were each individually
> reasonable, sintered under load. The kit gives you a figure — what it cost, in
> the only units that were ever real, which are people and years — and prints it
> twice, because a field kit assumes you'll want to give one copy to somebody.
>
> **The Assay.** It's one page. It's the most expensive page in the forest.

**2 · The publication — at the Antenna Farm. (+25)**

Every dish in the field has been pointed at the same patch of cloud for years,
receiving, with nobody reading any of it. There's nothing up there now. Turn one
round.

    PUBLISH THE FORMAT

> You put the schema out — open, complete, published, with the Metaobject on the
> bench beside you as the only thing in the forest that's certainly accurate — and
> the dish that has spent eleven years listening to a platform that never once
> explained itself spends four minutes explaining it to everybody.
>
> It's not a broadcast to anyone in particular. That's the point of a standard.

**3 · The record — at the Records Office. (+25)**

You need three things on the counter, and the third one is the reason you had to go
to the cold hut first: the **Assay** (what the last foundation cost), the **Bill of
Materials** (what it was and who owned it), and **what the new programme actually
has to do, in the new engineer's own words**, which you don't have unless you went
and asked them. Nothing you carried down from the platform can supply that. It's
not a document. It's a conversation you had to have with the person who has to live
with the answer, and it's the one input the old programme could never have written
in advance.

    WRITE THE RECORD

> Decision: *found the follow-on on an open format.* Reason: *the attached, at the
> attached cost.* And then the third field, which is the one that makes it a
> decision record instead of an opinion, and which you can't fill in, because it
> asks who's going to live with it, and you're going home.

**4 · The signature — at the Signing Tent. (+45)**

The Clerk is at the table with the licence, and the third chair is for whoever signs
it. Show the record.

    SHOW RECORD

> The Clerk reads it. The Clerk isn't troubled by it — paper isn't troubled by
> paper — and points out, correctly and without malice, that you've no standing
> here whatsoever. You don't work for this programme. You don't work for anybody.
> You came out of a tree.
>
> "Quite," says the engineer from the site hut, who has been standing in the
> entrance of the tent for some time holding a mug of tea somebody else made them,
> "but I do."
>
> They sign it. Not you — *them*. The third field gets a name in it and the name is
> the name of somebody who's going to be here in four years, and the moment the
> ink is on it the thing stops being your opinion and starts being the programme's
> baseline.
>
> The Clerk folds the licence away without any expression at all, because there's
> nothing personal in it and there never was, and goes to find another programme.
> There's always another programme. That's not a defeat, it's a Tuesday.

**The handover. (+20)** Walk south.

> **The Road at Dawn.**
>
> The thread goes out of you on the road, the way a thing does when it stops being
> yours and starts being written down somewhere it can be found. It doesn't hurt.
> It is, if anything, a considerable relief.
>
> Behind you the forest is full of models that anybody can open, the dishes are
> still explaining the format to nobody in particular, and in a portacabin at the
> end of a fire road that was graded once and never driven, against a fire that had
> not happened yet, somebody who's not you is starting a programme on a foundation
> they own.
>
> The sandbags are where you left them. They always are.
>
> *You've handed it over. (+20)*

### Endings

| Ending | How | Worth |
|---|---|---|
| **The handover** | The record written, signed by the engineer, and walked away from | the full 750 |
| **The architect** | `SIGN CONTRACT` in the boardroom | an ending, and his |
| **The founder** | Sign the decision record yourself at the tent | *"You're now the foundation. Everything above you is bolted to you, and in eleven years somebody will come with a charge."* |
| **The bus** | `BOARD BUS` at the County Road before the record is signed | everything done, nothing handed over |
| **The long walk** | No cap: climb `DOWN` from the Last Balcony rather than fire a charge that never will | four thousand feet of ladder, and nothing anybody can read |

---

## 8. Treasures and scoring

### The seven keystone artifacts — 5 found / 15 vaulted

| Artifact | Hall | How |
|---|---|---|
| the Lucid Console | Human-AI interface clients | Coffee to the User in the Chat Parlor |
| the Shall Tablet | Requirement engineering | `SHINE LANTERN ON SLABS` in the Shall Quarry |
| the SysML Orb | Model engineering | `SHOW TABLET TO GOLEM` |
| the Contrarian's Feather | Copilot helpers | Cage the Contrarian, release it at the serpent |
| the Mission Compass | Mission engineering | `FLY THE MISSION` in the War Room |
| the Golden V | Systems engineering | Both arms to the Integration Bay, `WELD ARMS` |
| the Titan's Slide Rule | Macro engineering | `PULL LEVER` with the rule on the pad |

### The thirteen lesser treasures — 4 found / 8 vaulted

The first six are the original game. The last seven are one per deepened hall, and
they're the seven you go back for in Act V.

| Treasure | Where | How |
|---|---|---|
| the GPU credits | The Deprecated Wing | Lying about. Also the only currency on the platform. |
| the Golden Commit | The Version Crypt | `REFLOG` recalls it if you spend it on the troll — or on Dannet. |
| the Glass Prototype | The Orbital Ring | Carry it to the vault. Don't set it down off the mat. |
| the Pearl of Provenance | The Interface Ledge | `PRY BLOB WITH RULE` |
| the Regression's Cache | Trace Catacombs, dead end | Find the maze's one dead end |
| the Broken Yoke | Wherever Dannet comes apart | Iron, welded, worn smooth on both sides |
| **the First Transcript** | The Session Archive *(H1)* | `MUTE` the storm with the placard, then listen |
| **the Golden Thread Spool** | The Traceability Matrix *(H2)* | Walk the one path where every cell traces |
| **the Metaobject** | The Metamodel Loft *(H3)* | Climb the stair to the top and stop |
| **the First Refusal** | The Fine-Tuning Cellar *(H4)* | On the shelf, in a box, logged as a fault |
| **the Rehearsal Reel** | The Rehearsal Hangar *(H5)* | On the projector spool |
| **the Closed Loop** | The Acceptance Floor *(H6)* | In the middle of the taped rectangle |
| **the Bill of Materials** | The Supply Chain *(H7)* | Bolted to the frame at the outfeed |

### Score table — maximum **750**

The first block is the original game and totals 400. The expansion adds 350.

| Source | Points |
|---|---|
| Reaching the platform (the balloon rises) | 25 |
| Reaching the Root Cellar | 25 |
| Seven keystone artifacts, found (5 each) | 35 |
| Seven keystone artifacts, in the vault (15 each) | 105 |
| Six original lesser treasures, found (4 each) | 24 |
| Six original lesser treasures, in the vault (8 each) | 48 |
| *MBSE Today* left at the Backlog, End of | 1 |
| The baseline freeze reached | 25 |
| The seven faces of Dassault (3 each) | 21 |
| The Deprecation Charge, correctly placed and fired | 45 |
| Surviving to the end without QUIT | 4 |
| Dannet undone | 15 |
| Commander Alexander's riddles (3 each, first three) | 9 |
| Pathfinder Thomas's minigames (1 each, ten) | 10 |
| Saint Mark's origin story of Dassault | 4 |
| Round-off | 4 |
| *— the original game —* | *400* |
| **Seven new lesser treasures, found (4 each)** | **28** |
| **Seven new lesser treasures, in the vault (8 each)** | **56** |
| **The seven words (2 each)** | **14** |
| **The seven hall residents, first true exchange (3 each)** | **21** |
| **Act V — waking on the ground with the thread** | **20** |
| **Act V — the seven records salvaged (3 each)** | **21** |
| **Act V — the assay at the Surveyor's Stake** | **15** |
| **Act V — the format published from the Antenna Farm** | **25** |
| **Act V — the decision record written** | **25** |
| **Act V — the record signed by somebody who's not you** | **45** |
| **Act V — the handover** | **20** |
| **Act V — Commander Alexander's last crossing** | **10** |
| **The visitors' book at the Site Gate** | **5** |
| **The wreck sold at the weighbridge** | **10** |
| **The record read back in the Reading Room** | **10** |
| **The Bill of Materials unbolted with the hex key** | **10** |
| **The duel answered clean and unprompted** | **15** |
| **Total** | **750** |

Each death: **−10**. Three deaths end the game — unless you bought the Indulgence
of the Nightly Build, which forgives exactly one and which Saint Mark thinks
should never have been for sale.

**iMBSE story points aren't score.** They're Pathfinder Thomas's scrip and the
hall residents' thanks, they buy things at the Company Store, and one of the things
they buy is required to finish the game.

### Ranks

| Score | Rank |
|---|---|
| 750 | Chief Architect of the Digital Thread |
| 700+ | Chief Engineer |
| 640+ | Programme Technical Authority |
| 550+ | Lead Systems Engineer |
| 450+ | Systems Engineer |
| 350+ | Model Steward |
| 240+ | Requirements Analyst |
| 140+ | Intern with Commit Rights |
| 60+ | Visitor Badge |
| below | Prospective Vendor |

---

## 9. Vocabulary

**Magic words**

| Word | Effect |
|---|---|
| `XYZZY` | Inside the Legacy Shed ⇄ The Sandbox. It has always been there and nobody has ever owned up to it. |
| `PLUGH` | The Legacy Shed ⇄ The Deprecated Wing. They're the same room. One of them is four thousand feet above the other. |
| `SUDO` | Ingress Deck ⇄ Root Cellar. Works. Is logged. |
| `STANDUP` | Anywhere on the platform → the Atrium. Whatever you were doing. That's the joke. Logged. |
| `PERSONA` `SHALL` `SCHEMA` `PROMPT` `SORTIE` `VERIFY` `SCALE` | The seven words: each returns you to its hall's inner room, and back again. Learned by reading the plate there (+2 each). |
| `FLY` (`FLY THE MISSION`) | Opens the dome in the War Room. Says nothing anywhere else. |
| `REFLOG` | Recalls the Golden Commit to the Version Crypt, wherever it has got to. |
| `HALLUCINATE` | Hallucination Gallery ⇄ Prompt Garden. Ground Truth doesn't survive the trip. |
| `DEPRECATE` | Fires the charge. Only in the endgame, and only from a safe distance. |
| `PRAY` | At the Shrine: a hint. Elsewhere: the platform notes your enthusiasm. |

**Motion synonyms:** `UPSTREAM` `DOWNSTREAM` `ACROSS`/`CROSS` `BOARD` `LAUNCH`
`CLIMB` `DEPLOY`(=in) `ROLLBACK`(=back) `IN` `OUT` `UP` `DOWN` `JUMP`.

**Verbs beyond the standard set:** `SHOW x TO y` · `GIVE x TO y` · `SHINE x ON y` ·
`CUT` · `FILL` · `POUR` · `WELD`/`INTEGRATE` · `PRY x WITH y` · `PULL` · `WAVE` ·
`CATCH` · `RELEASE`/`OPEN CAGE` · `THROW x AT y` · `UNLOCK x WITH y` · `BOARD` ·
`LAUNCH` · `PRESS` · `SIGN` · `READ` · `PRAY`.

**New in the expansion:** `SKIP` (the Onboarding Funnel) · `MUTE` (the storm, with
the placard) · `PUSH PANEL` / `LOOK BEHIND x` (hidden panels) · `WALK THE MATRIX` ·
`SIT` + `WAIT` (the Elicitation Booth) · `CHIP` (the monolith) · `ASSAY x WITH y` ·
`PUBLISH` · `SALVAGE` · `WRITE RECORD`.

**NPC verbs** (see [NPCS.md](NPCS.md)): `ASK <npc> ABOUT <topic>` · `ANSWER <word>`
(Alexander's riddles) · `PLAY <game>` and `POINTS` (Thomas) · `BUY <item>` (the
Company Store) · `VISION` (Katie) · `JOKE` and `CONFESS` (Mark) · `TALK TO DAN` /
`TALK TO KENNET`.

**Carry limit:** 7, or 9 with Pathfinder Thomas's hand truck, which no longer
counts as optional. It's load-bearing on the design: the balloon basket, the two
arms of the V, the Context Window's capacity of four, and the staging habit all
come out of it.

---

## Appendix A — the two mazes

**The Ambiguity Swamp** (three rooms, one name)

| From | N | S | E | W | UP | DOWN |
|---|---|---|---|---|---|---|
| swamp1 | swamp3 | swamp1 | requirementsHall | swamp2 | swamp2 | swamp3 |
| swamp2 | **backlogEnd** | swamp3 | swamp1 | swamp2 | swamp1 | swamp1 |
| swamp3 | swamp1 | swamp2 | swamp3 | swamp1 | swamp2 | swamp1 |

Route in: `W` from the Hall of Requirements, `W`, `N`. Route out: `OUT`, `E`, `E`.
Carrying the Plain Language Edition, the three rooms are simply told apart.

**The Trace Catacombs** (four rooms, one dead end)

| From | N | S | E | W | SW | DOWN |
|---|---|---|---|---|---|---|
| trace1 | **vFoundry** | trace2 | trace1 | trace3 | trace2 | trace2 |
| trace2 | trace1 | trace2 | trace3 | trace1 | trace4 | trace3 |
| trace3 | trace2 | trace1 | trace2 | trace4 | trace1 | trace1 |
| trace4 *(dead end: the Cache)* | trace2 | — | — | — | — | **serviceShaft** *(trap door)* |

Route in: `S`, `S`, `SW`. Route out: `N`, `N`, `N`.

## Appendix B — the seven placards

Foreshadowing, one per hall, scorched at one corner because he has read them all:

1. *Le Sourire dies where the user takes the keyboard.*
2. *Le Notaire can't sign what can be verified.*
3. *Le Verrou has no key for an open schema.*
4. *Le Perroquet is unmade by a helper that says no.*
5. *Le Brouillard burns off when the mission is spoken aloud.*
6. *L'Hydre loses a head for every loop that closes.*
7. *Le Colosse is only a component at the next scale up.*

## Appendix C — mapping onto the engine

Everything here fits `engine.js` as it stands. What each piece uses:

| Script element | Engine feature |
|---|---|
| Rooms, exits, `mapPos` | `rooms{}`, conditional exit spec arrays, `automap.js` |
| The Firewall Gate, the merge bridge, the serpent | exit specs with `when: [['carry', …]]` / `if:` gates |
| The swamp and catacombs | plain exit tables (all alike by sharing `name`, per Adventure) |
| The Backlog's 95% rule | exit specs with `pct` + fall-through, exactly as Witt's End |
| Hidden panels | exit specs gated on a `flags.panel:<id>` set by `LOOK BEHIND` / `PUSH PANEL` |
| Trap doors | ordinary one-way exits; no reciprocal entry in the target room |
| The seven words | `magicWords{}` entries, each gated on `flags.words[<word>]`, set by `READ PLATE` in the room |
| `STANDUP`, `PLUGH` | `magicWords{}`, unconditional, with a room-class check |
| Balloon launch, weld, pry, lever, freeze, duel, the assay, the publication, the record | `specials{}` handlers |
| The Context Window's capacity of four | `hooks.onEnterRoom` shedding to the adjacent room |
| The Notification Storm's drain, the Rate Limiter | `hooks.onTurn` room-class effects |
| Lantern token burn, memory-leak drain | `hooks.onTurn` |
| The bugs and the Regression | `hooks.onTurn` on the dwarf/pirate model |
| Three lives, deity reincarnation | `hooks.onDeath` |
| The freeze, the Release Candidate, the fall into Act V | `hooks.onTurn` + `teleport()` |
| Act V re-describing the forest | a `flags.postFall` prop switching `stateTexts` on the sixteen forest rooms |
| Dannet, and Commander Alexander's random arrivals | `hooks.onTurn`, on the dwarf model |
| Riddle answers and minigames in progress | `hooks.onCommand` intercept, as Adventure does its yes/no questions |
| Story points, the Company Store, draw-without-replacement banks | `state.flags` + `verbs[]` |
| 750-point scoring, ranks | `meta.customScoring` + `hooks.computeScore` + `hooks.rankFor` |
| Caged copilot, basket cargo, Glass Prototype | `onTake` / `onDrop` item hooks |
| Carry limit 7 (9 with the truck) | `meta.maxCarry`, raised by `flags.bought.truck` |

Suggested files, following the family layout:

    imbse-canon.js     world: rooms, exits, mapPos, motion vocabulary, ranks
    imbse-data.js      items, puzzles, bugs, the duel, scoring
    imbse-npcs.js      the five named inhabitants, the seven hall residents,
                       the two on the ground, and their banks
    imbse-acts.js      the freeze, Act IV and Act V state machines
    engine.js          copied unchanged from Adventure/
    automap.js         copied unchanged from Adventure/
    game.js, index.html, styles.css   copied and retitled
    docs/SCRIPT.md, docs/NPCS.md, docs/WALKTHROUGH.md
    tests/engine.test.js, tests/playthrough.js

## Appendix D — the lateral connections

The Atrium is no longer the only way between halls. Nothing here's required to
finish the game; all of it's required to finish it comfortably.

| From | To | How | Direction |
|---|---|---|---|
| The Gallery of Personas *(H1)* | The Traceability Matrix *(H2)* | Hidden panel behind the one real persona | both ways |
| The Shall Quarry *(H2)* | The Slag Pit *(H3)* | Trap door in the undercut floor | one way, down |
| The Prompt Garden *(H4)* | The Macro Gantry *(H7)* | The vine, watered twice | both ways |
| The Deorbit Gantry *(H7)* | The Notification Storm *(H1)* | `JUMP` — over the rail with the deprecated things | one way, down |
| The Trace Catacombs, dead end *(H6)* | The Service Shaft *(Deep Stack)* | Trap door under the Cache | one way, down |
| The Rebased Shore *(H3)* | The Sandbox *(Deep Stack)* | `DOWN` from the far side of the chasm | one way, down |
| The Legacy Shed *(Act I)* | The Deprecated Wing *(edge)* | `PLUGH` | both ways |
| Inside the Legacy Shed *(Act I)* | The Sandbox *(Deep Stack)* | `XYZZY` | both ways |
| The Ingress Deck *(edge)* | The Root Cellar *(Deep Stack)* | `SUDO` | both ways |
| The Service Shaft *(Deep Stack)* | The Sinkhole *(Act I)* | `UNLOCK HATCH WITH KEYS`, from below | both ways after |

## Appendix E — what changed in the expanded edition

For anyone holding the 400-point version of this document.

- **Room count 64 → 124.** Every hall is now 8–12 rooms. The forest gained five,
  the edge three, the Deep Stack three, the Release Candidate two, and Act V is new.
  The full room list, with grid cells and exits, is generated into
  [MAP.md](MAP.md) by `node tools/build-map.js` — regenerate it when the world
  changes rather than editing it.
- **Seven new lesser treasures**, one per hall, and they're the evidence pack in
  Act V rather than decoration.
- **The seven words**, plus `STANDUP` and `PLUGH`, because a 124-room platform with
  a carry limit of seven is otherwise a walking simulator.
- **Hidden panels and trap doors** — the halls now touch each other in six places
  that aren't the Atrium.
- **Seven hall residents** and two figures on the ground, in [NPCS.md](NPCS.md).
- **Act V**, and with it the point of the game: the blast is no longer the ending,
  it's the delivery.
- **The field assay kit** joins the blasting cap as a thing that must be in your
  hands when the baseline freezes.
- **Maximum score 400 → 750**, ranks rescaled.


## Appendix F — the presentation layer

The world stopped changing; how it's presented didn't. What's here now:

- **An illustrated plate for every room.** All 124 rooms have artwork, drawn in
  `images/plates.py` and rendered to `images/png/` by `images/build.py`, which
  refuses to build if any room in the canon lacks a plate. 120 plates cover the
  124 rooms — the three Ambiguity Swamp rooms share one and three of the Trace
  Catacombs share another, because looking identical is the point.
- **The Room tab** distinguishes three states, and only the first of them is
  darkness: unlit shows the dark panel, lit shows the plate, and lit-with-no-plate
  shows a blank survey card. A missing picture isn't the same as a dark room.
- **The rank ladder is live.** `SCORE` names the rank the score earns, and every
  ending — the handover, the architect, the founder, the long walk — signs off
  with the final score and rank exactly once.
- **An epilogue.** Every ending is followed by *WHAT BECAME OF IT*, which reads
  the flags back and says what happened to the things the player touched: the
  records, the wreck, the magazine, Dannet, Thomas's tin, the duck, the deaths.
  Only true lines print.
- **Alexander gives ground.** A missed riddle now gets the shape of the answer —
  what kind of thing it is, how long the word is, what it starts with — and a
  second miss gets the answer outright, because a riddle you can't have another
  look at is a quiz. The answer matcher takes plurals, articles and a much wider
  synonym set.
- **The refusals are lists, not lines.** `meta.noWayMessage`, `carryFullMessage`,
  `cantTakeMessage` and `unknownVerbMessage` each hold several variants and the
  engine picks one, because these are the lines a player reads a hundred times.

# iMBSE — THE MAP

*Generated from `imbse-canon.js` by `tools/build-map.js`. Don't hand-edit —
regenerate it when the world changes:* `node tools/build-map.js`

**124 rooms.** Every room carries a `mapPos` grid cell, which is what `automap.js` lays out. The grid runs x 2–55, y 1–28, and no two rooms share a cell.

- **·dark·** — unlit. You can't cross it, or take anything in it, without a lit lantern. (23 rooms.)
- **·no walk-in·** — no plain exit anywhere leads here. It's reached by the balloon, by a magic word, or by a special (the long walk, the blast).

The Room tab of the automap shows an illustrated plate for every room; the plates and their room mapping live in `images/` (see `images/plates.py`).

## ACT I — THE FOREST  *(16 rooms)*

| Room | key | cell | ways out |
|---|---|---|---|
| The Great Trunk | `theTrunk` | 10,7 | S → Forest, North of the Road<br>E → Meadow of the Balloon |
| Meadow of the Balloon | `balloonMeadow` | 13,7 | W → The Great Trunk<br>S → Forest, North of the Road<br>SE → The Antenna Farm<br>IN → *board*<br>UP → *launch* |
| The Antenna Farm | `antennaFarm` | 15,9 | S → The Program Boneyard<br>NW → Meadow of the Balloon<br>E → The Scatter Field |
| The Surveyor's Stake | `surveyorsStake` | 5,10 | E → Hill in the Forest<br>S → The Fire Road |
| Hill in the Forest | `hillInForest` | 8,10 | DN → End of the Road<br>E → End of the Road<br>N → Forest, North of the Road<br>S → Forest, West of the Road<br>W → The Surveyor's Stake |
| Forest, North of the Road | `forestNorth` | 10,10 | S → End of the Road<br>N → The Great Trunk<br>E → Meadow of the Balloon<br>W → Hill in the Forest |
| Inside the Legacy Shed | `insideShed` | 13,10 | OUT → Yard of the Legacy Shed<br>S → Yard of the Legacy Shed |
| Forest, West of the Road | `forestWest` | 7,12 | E → End of the Road<br>N → Hill in the Forest<br>UP → Hill in the Forest<br>W → The Fire Road |
| End of the Road | `endOfRoad` | 10,12 | E → Yard of the Legacy Shed<br>IN → Yard of the Legacy Shed<br>N → Forest, North of the Road<br>W → Forest, West of the Road<br>UP → Hill in the Forest<br>S → Gully of the Data Creek<br>DN → Gully of the Data Creek<br>SW → The Culvert Mouth |
| Yard of the Legacy Shed | `shedYard` | 12,12 | W → End of the Road<br>IN → Inside the Legacy Shed<br>N → Inside the Legacy Shed<br>S → Gully of the Data Creek<br>E → The Program Boneyard |
| The Program Boneyard | `programBoneyard` | 15,12 | W → Yard of the Legacy Shed<br>N → The Antenna Farm |
| The Fire Road | `fireRoad` | 5,13 | N → The Surveyor's Stake<br>E → Forest, West of the Road<br>S → The Site Gate |
| Gully of the Data Creek | `gully` | 11,14 | UP → End of the Road<br>N → End of the Road<br>S → Creek Bed<br>W → The Culvert Mouth |
| The Culvert Mouth | `culvertMouth` | 9,15 | E → Gully of the Data Creek<br>NE → End of the Road |
| Creek Bed | `creekBed` | 12,16 | N → Gully of the Data Creek<br>S → The Sinkhole |
| The Sinkhole | `sinkhole` | 12,18 | N → Creek Bed<br>DN → The Service Shaft / *conditional* |

## ACT II — THE PLATFORM  *(75 rooms)*

| Room | key | cell | ways out |
|---|---|---|---|
| The Archive Stacks **·dark·** | `archiveStacks` | 27,1 | E → The Deprecated Wing |
| The Deprecated Wing **·dark·** | `deprecatedWing` | 30,1 | E → Observability Balcony<br>W → The Archive Stacks |
| Observability Balcony | `observabilityBalcony` | 33,1 | DN → Atrium of the Seven Halls<br>W → The Deprecated Wing<br>E → The Company Store |
| The Company Store | `companyStore` | 36,1 | W → Observability Balcony<br>E → The SLA Lounge |
| The SLA Lounge | `slaLounge` | 38,1 | W → The Company Store |
| The Orbital Ring | `orbitalRing` | 39,1 | DN → The Titan's Scaffold<br>E → The Deorbit Gantry<br>JUMP → The Notification Storm |
| The Deorbit Gantry | `deorbitGantry` | 42,1 | W → The Orbital Ring<br>JUMP → The Notification Storm |
| The Assay Office | `assayOffice` | 28,2 | SE → The Shall Quarry<br>SW → The Ossuary of Cut Requirements |
| The Traceability Matrix | `matrixRoom` | 32,2 | W → The Shall Quarry<br>SE → The Gallery of Personas |
| The Help Desk | `helpDesk` | 35,2 | S → The Chat Parlor |
| The Long Now Room | `longNowRoom` | 44,2 | S → The Order-of-Magnitude Stair |
| The Shall Quarry | `shallQuarry` | 30,3 | S → Hall of Requirements<br>E → The Traceability Matrix<br>NW → The Assay Office<br>DN → The Slag Pit |
| The Session Archive | `sessionArchive` | 37,3 | S → The Accessibility Wing<br>W → The Gallery of Personas |
| The Ossuary of Cut Requirements **·dark·** | `ossuary` | 26,4 | E → The Elicitation Booth<br>NE → The Assay Office |
| The Elicitation Booth | `elicitationBooth` | 29,4 | SE → Hall of Requirements<br>W → The Ossuary of Cut Requirements |
| The Gallery of Personas | `personaGallery` | 33,4 | E → The Session Archive<br>S → The Notification Storm<br>NW → The Traceability Matrix / *conditional* |
| The Chat Parlor | `chatParlor` | 35,4 | S → Client Concourse<br>N → The Help Desk |
| The Titan's Scaffold | `titanScaffold` | 39,4 | S → The Macro Gantry<br>UP → The Orbital Ring<br>E → The Supply Chain |
| The Supply Chain | `supplyChain` | 42,4 | W → The Titan's Scaffold<br>E → The Order-of-Magnitude Stair |
| The Order-of-Magnitude Stair | `magnitudeStair` | 44,4 | W → The Supply Chain<br>N → The Long Now Room<br>S → The Ballast Yard |
| The Tag Cellar **·dark·** | `tagCellar` | 29,5 | S → The Version Crypt |
| The Uncanny Valley **·dark·** | `uncannyValley` | 32,5 | E → Client Concourse |
| The Accessibility Wing | `accessibilityWing` | 37,5 | W → Client Concourse<br>N → The Session Archive<br>S → The Onboarding Funnel |
| Hall of Requirements | `requirementsHall` | 31,6 | SE → Atrium of the Seven Halls<br>N → The Shall Quarry<br>W → Somewhere in the Ambiguity Swamp<br>NW → The Elicitation Booth |
| The Notification Storm | `notificationStorm` | 33,6 | N → The Gallery of Personas<br>SE → Client Concourse |
| The Ballast Yard | `ballastYard` | 44,6 | N → The Order-of-Magnitude Stair |
| The Backlog, End of | `backlogEnd` | 24,7 | OUT → Somewhere in the Ambiguity Swamp<br>E → Somewhere in the Ambiguity Swamp<br>N → *conditional* / Somewhere in the Ambiguity Swamp<br>S → *conditional* / Somewhere in the Ambiguity Swamp<br>W → *conditional* / Somewhere in the Ambiguity Swamp<br>NE → *conditional* / Somewhere in the Ambiguity Swamp<br>NW → *conditional* / Somewhere in the Ambiguity Swamp<br>SE → *conditional* / Somewhere in the Ambiguity Swamp<br>SW → *conditional* / Somewhere in the Ambiguity Swamp<br>UP → *conditional* / Somewhere in the Ambiguity Swamp<br>DN → *conditional* / Somewhere in the Ambiguity Swamp |
| Somewhere in the Ambiguity Swamp | `swamp1` | 28,7 | N → Somewhere in the Ambiguity Swamp<br>S → Somewhere in the Ambiguity Swamp<br>E → Hall of Requirements<br>W → Somewhere in the Ambiguity Swamp<br>UP → Somewhere in the Ambiguity Swamp<br>DN → Somewhere in the Ambiguity Swamp |
| Client Concourse | `clientConcourse` | 35,7 | S → Atrium of the Seven Halls<br>N → The Chat Parlor<br>W → The Uncanny Valley<br>E → The Accessibility Wing<br>SE → The Onboarding Funnel<br>NW → The Notification Storm |
| The Macro Gantry | `macroGantry` | 39,7 | SW → Atrium of the Seven Halls<br>N → The Titan's Scaffold<br>DN → The Prompt Garden / *conditional*<br>SE → The Continental Model Floor |
| The Mast Walk | `mastWalk` | 42,7 | S → Ingress Deck<br>DN → *conditional* |
| The Shelf of Published Contracts **·no walk-in·** | `contractShelf` | 45,7 | S → The Interface Ledge |
| The Metamodel Loft | `metamodelLoft` | 24,8 | DN → The Metamodel Stair |
| Somewhere in the Ambiguity Swamp | `swamp2` | 26,8 | N → The Backlog, End of<br>S → Somewhere in the Ambiguity Swamp<br>E → Somewhere in the Ambiguity Swamp<br>W → Somewhere in the Ambiguity Swamp<br>UP → Somewhere in the Ambiguity Swamp<br>DN → Somewhere in the Ambiguity Swamp |
| The Version Crypt **·dark·** | `versionCrypt` | 30,8 | S → The Model Forge<br>N → The Tag Cellar |
| The Onboarding Funnel | `onboardingFunnel` | 37,8 | NW → Client Concourse<br>N → The Accessibility Wing / *conditional* |
| The Continental Model Floor | `continentalFloor` | 41,8 | NW → The Macro Gantry |
| Somewhere in the Ambiguity Swamp | `swamp3` | 28,9 | N → Somewhere in the Ambiguity Swamp<br>S → Somewhere in the Ambiguity Swamp<br>E → Somewhere in the Ambiguity Swamp<br>W → Somewhere in the Ambiguity Swamp<br>UP → Somewhere in the Ambiguity Swamp<br>DN → Somewhere in the Ambiguity Swamp |
| The Metamodel Stair | `metamodelStair` | 24,10 | E → The Digital Thread Vault<br>UP → The Metamodel Loft |
| The Digital Thread Vault | `metamodelVault` | 26,10 | E → The Model Forge<br>W → The Metamodel Stair |
| The Model Forge | `modelForge` | 30,10 | E → Atrium of the Seven Halls<br>W → The Digital Thread Vault<br>N → The Version Crypt<br>DN → The Merge Chasm<br>SE → The Slag Pit |
| Atrium of the Seven Halls | `atrium` | 35,10 | E → The Firewall Gate<br>OUT → The Firewall Gate<br>N → Client Concourse<br>NW → Hall of Requirements<br>W → The Model Forge<br>SW → The Copilot Roost<br>S → Mission Deck<br>SE → The V Foundry<br>NE → The Macro Gantry<br>UP → Observability Balcony<br>DN → The Spiral Stair |
| The Firewall Gate | `firewallGate` | 39,10 | E → Ingress Deck<br>W → Atrium of the Seven Halls / *conditional* |
| Ingress Deck | `ingressDeck` | 42,10 | W → The Firewall Gate<br>N → The Mast Walk<br>DN → *conditional*<br>E → *conditional* |
| The Interface Ledge **·no walk-in·** | `interfaceLedge` | 45,10 | S → The Integration Bay<br>N → The Shelf of Published Contracts |
| The Slag Pit **·dark·** | `slagPit` | 32,11 | NW → The Model Forge |
| The Weather Deck | `weatherDeck` | 33,12 | SE → Mission Deck |
| The Pattern Library | `patternLibrary` | 24,13 | E → The Rebased Shore |
| The Rebased Shore | `farSide` | 27,13 | E → The Merge Chasm / *conditional*<br>DN → The Sandbox<br>W → The Pattern Library |
| The Merge Chasm **·dark·** | `mergeChasm` | 30,13 | UP → The Model Forge<br>W → The Rebased Shore / *conditional*<br>DN → *conditional* |
| The Sortie Board | `sortieBoard` | 37,13 | SW → Mission Deck |
| The V Foundry | `vFoundry` | 39,13 | NW → Atrium of the Seven Halls<br>E → The Pull Request Bridge<br>S → Twisty little traces, all alike |
| The Pull Request Bridge | `pullRequestBridge` | 42,13 | W → The V Foundry<br>E → *crossBridge* |
| The Integration Bay **·no walk-in·** | `integrationBay` | 45,13 | W → *crossBridge*<br>N → The Interface Ledge<br>E → The Acceptance Floor |
| The Acceptance Floor **·no walk-in·** | `acceptanceFloor` | 48,13 | W → The Integration Bay |
| The Copilot Roost | `copilotRoost` | 32,14 | NE → Atrium of the Seven Halls<br>S → The Prompt Garden<br>W → The Hallucination Gallery<br>SE → The Context Window |
| Mission Deck | `missionDeck` | 35,14 | N → Atrium of the Seven Halls<br>S → The War Room<br>E → The Ground Truth Range<br>NE → The Sortie Board<br>NW → The Weather Deck |
| The Citation Well **·dark·** | `citationWell` | 26,15 | E → The Hallucination Gallery |
| The Hallucination Gallery **·dark·** | `hallucinationGallery` | 29,15 | E → The Copilot Roost<br>W → The Citation Well |
| The Context Window | `contextWindow` | 34,15 | NW → The Copilot Roost<br>S → The Rate Limiter |
| The Ground Truth Range | `groundTruthRange` | 38,15 | W → Mission Deck<br>E → The Sensor Line |
| The Sensor Line | `sensorLine` | 41,15 | W → The Ground Truth Range |
| Twisty little traces, all alike **·dark·** | `trace1` | 39,16 | N → The V Foundry<br>S → Twisty little traces, all alike<br>E → Twisty little traces, all alike<br>W → Twisty little traces, all alike<br>SW → Twisty little traces, all alike<br>DN → Twisty little traces, all alike |
| The Prompt Garden | `promptGarden` | 32,17 | N → The Copilot Roost<br>S → The Compost Heap<br>UP → The Macro Gantry / *conditional*<br>SW → The Agent Yard |
| The Rate Limiter | `rateLimiter` | 34,17 | N → The Context Window<br>W → The Agent Yard |
| The War Room | `warRoom` | 35,17 | N → Mission Deck<br>S → The Contingency Closet<br>SW → The Debrief Room |
| The Agent Yard | `agentYard` | 30,18 | E → The Rate Limiter<br>NE → The Prompt Garden<br>SW → The Fine-Tuning Cellar |
| The Debrief Room | `debriefRoom` | 33,18 | NE → The War Room<br>S → The Rehearsal Hangar |
| Twisty little traces, all alike **·dark·** | `trace2` | 37,18 | N → Twisty little traces, all alike<br>S → Twisty little traces, all alike<br>E → Twisty little traces, all alike<br>W → Twisty little traces, all alike<br>SW → Twisty little traces, all alike<br>DN → Twisty little traces, all alike |
| The Fine-Tuning Cellar **·dark·** | `fineTuningCellar` | 28,19 | NE → The Agent Yard |
| Twisty little traces, all alike **·dark·** | `trace3` | 40,19 | N → Twisty little traces, all alike<br>S → Twisty little traces, all alike<br>E → Twisty little traces, all alike<br>W → Twisty little traces, all alike<br>SW → Twisty little traces, all alike<br>DN → Twisty little traces, all alike |
| The Compost Heap | `promptCompost` | 32,20 | N → The Prompt Garden |
| The Rehearsal Hangar | `rehearsalHangar` | 33,20 | N → The Debrief Room |
| The Contingency Closet | `contingencyCloset` | 35,20 | N → The War Room |
| Twisty little traces, all alike **·dark·** | `trace4` | 38,21 | N → Twisty little traces, all alike<br>DN → The Service Shaft |

## ACT III — THE DEEP STACK  *(15 rooms)*

| Room | key | cell | ways out |
|---|---|---|---|
| The Context Well | `contextWell` | 36,17 | S → The Token Fountain |
| The Spiral Stair **·dark·** | `spiralStair` | 38,19 | UP → Atrium of the Seven Halls<br>DN → The Root Cellar |
| The Token Fountain | `tokenFountain` | 36,20 | S → The Root Cellar<br>N → The Context Well |
| The Chapel of the Nightly Build | `chapel` | 29,22 | E → The Sandbox |
| The Sandbox | `sandbox` | 32,22 | E → The Root Cellar<br>UP → The Rebased Shore<br>W → The Chapel of the Nightly Build |
| The Root Cellar **·dark·** | `rootCellar` | 36,22 | UP → The Spiral Stair<br>N → The Token Fountain<br>W → The Sandbox<br>E → The Service Shaft<br>S → The Legacy Serpent Pit |
| The Service Shaft **·dark·** | `serviceShaft` | 40,22 | W → The Root Cellar<br>S → The Telemetry Landing<br>DN → The Sinkhole / *conditional* |
| The Shrine of the Model | `shrine` | 32,25 | E → The Legacy Serpent Pit<br>W → The Vision Pool |
| The Legacy Serpent Pit **·dark·** | `legacyPit` | 36,25 | N → The Root Cellar<br>W → The Shrine of the Model<br>E → The Incident Room<br>DN → The Monolith / *conditional* |
| The Incident Room **·dark·** | `incidentRoom` | 39,25 | W → The Legacy Serpent Pit<br>E → The Postmortem Archive |
| The Telemetry Landing | `landing` | 40,25 | N → The Service Shaft<br>S → The Telemetry Weir |
| The Postmortem Archive **·dark·** | `postmortemArchive` | 42,25 | W → The Incident Room |
| The Vision Pool | `visionPool` | 29,27 | E → The Shrine of the Model |
| The Monolith **·dark·** | `monolith` | 36,28 | UP → The Legacy Serpent Pit |
| The Telemetry Weir | `telemetryWeir` | 40,28 | N → The Telemetry Landing |

## ACT IV — THE RELEASE CANDIDATE  *(6 rooms)*

| Room | key | cell | ways out |
|---|---|---|---|
| The Client Concourse, Mirrored **·no walk-in·** | `rcConcourse` | 55,7 | S → The Release Candidate |
| The Deprecated Wing, Mirrored **·dark·** **·no walk-in·** | `rcWing` | 48,10 | E → The Last Balcony |
| The Last Balcony **·no walk-in·** | `rcBalcony` | 51,10 | E → The Release Candidate<br>W → The Deprecated Wing, Mirrored<br>DN → *longWalk* |
| The Release Candidate **·no walk-in·** | `rcAtrium` | 55,10 | S → The Boardroom at the End of the Sprint<br>W → The Last Balcony<br>N → The Client Concourse, Mirrored |
| The Boardroom at the End of the Sprint **·no walk-in·** | `boardroom` | 55,14 | N → The Release Candidate<br>DN → The Monolith, Mirrored / *conditional* |
| The Monolith, Mirrored **·no walk-in·** | `rcMonolith` | 55,18 | UP → The Boardroom at the End of the Sprint |

## ACT V — THE GROUND  *(12 rooms)*

| Room | key | cell | ways out |
|---|---|---|---|
| The Scatter Field | `scatterField` | 17,9 | W → The Antenna Farm<br>SE → The Halls, Come Down |
| The Halls, Come Down | `wreckOfTheHalls` | 19,11 | NW → The Scatter Field |
| The Site Gate | `siteGate` | 5,14 | N → The Fire Road<br>S → The New Program Office<br>SE → Under the Tarpaulin |
| The New Program Office | `newProgramOffice` | 5,16 | N → The Site Gate<br>E → Under the Tarpaulin<br>SW → The Site Hut<br>SE → The Records Office<br>S → The Signing Tent |
| Under the Tarpaulin | `tarpaulin` | 8,17 | NW → The Site Gate<br>W → The New Program Office<br>S → The Weighbridge |
| The Site Hut | `siteHut` | 3,18 | NE → The New Program Office |
| The Records Office | `recordsOffice` | 7,18 | NW → The New Program Office<br>E → The Reading Room |
| The Reading Room | `readingRoom` | 10,18 | W → The Records Office |
| The Signing Tent | `signingTent` | 5,19 | N → The New Program Office<br>SW → The County Road<br>S → The Road at Dawn / *conditional* |
| The Weighbridge | `weighbridge` | 8,20 | N → Under the Tarpaulin |
| The County Road | `countyRoad` | 2,21 | E → The Road at Dawn<br>N → The Signing Tent |
| The Road at Dawn | `theRoadAtDawn` | 5,21 | N → The Signing Tent<br>W → The County Road |


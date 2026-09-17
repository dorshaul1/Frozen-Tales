# Remote cast and dialogue

The four fixed residents are defined in `remoteNpcData.ts` by stable ID, existing landing ID, unique native artwork, introductory pages, ambient states and inert `futureUnlock` keys. No quest state, rewards or feature locks are implemented. No NPC markers are added to the chart.

- Mara / cartographer: Lookout Point — riverChart
- Iver / ranger: Spruce Forest Trail — corgiCompanion
- Sela / weatherObserver: Coastal Beacon — weatherForecast
- Eirik / oldFisher: Old Fisher’s Rest — advancedFishingKnowledge

`RemoteNpcs` resolves safe positions in existing walking clearings and limits small movements to valid local ground. Approaching residents takes priority over movement. Player collision includes residents and the dog.

`Dialogue` provides speaker artwork, short pages, a simple optional topic choice, next/back/close buttons, Enter/E/right, left, 1 and Escape. Its keyboard lock, pointer shield and scene early-return prevent gameplay actions while speaking. Future content can supply pages without changing the interaction router; futureUnlock values have no effect today.

Exactly one `VillageCorgi` is constructed by RemoteNpcs. Its original artwork and behavior are unchanged; an optional habitat supplies ranger walking bounds and a ranger greeting target. Save field `corgiHome` defaults/migrates to `ranger` and accepts `village` for future use. Ordinary equipment saves preserve it. No ownership reward is implemented.

`checks/remote-npcs.html` uses an isolated scene and save key to verify placement, one dog, home persistence, keyboard lock, choice/back/next/Escape, and two minutes of local routines. Asset validation and TypeScript pass; original world geometry and existing feature access remain unchanged.

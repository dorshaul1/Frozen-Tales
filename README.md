# Frozen Tales

A small Phaser 3 + TypeScript + Vite fishing game: explore a frozen river, catch fish, fill the kayak, trade at home, and improve the next outing.

```sh
npm install
npm run dev
```

`npm run build` validates assets, checks TypeScript (including browser checks), and creates the production build. `npm run preview` serves it.

## Controls and progression

- **WASD / arrows:** paddle with acceleration, smooth turns and a short drift.
- **E / Space:** cast near bubbles while moving slowly. Hold to reel; release to ease tension. Stay in the green zone.
- **E / Space at the dock:** land or board. On foot, speak to Nessa at the market to sell fish.
- **E / Space near Mara, below the dock:** open her visual equipment cards. **E / Space near Ivo, at the small hut upstream:** open the fish gallery and personal records.
- **Arrows:** choose cards and scroll larger holds. **E / Space / Enter:** confirm or open a fish detail. **Escape:** close and resume paddling. Cards also support mouse clicks. There are no view-switching tabs or remote journal/inventory shortcuts.
- **Settings → Audio:** independent volume and mute controls; audio starts after a real key or pointer input.

Each fish occupies one slot and stores species, weight in kilograms, rarity, its individual sale value, and whether it set a record when caught. Weight and value vary modestly. A quick catch card shows these details while movement is already restored. Selling never removes journal records.

The starter hold fits five fish. Whitefish are common and easy; Arctic Char are uncommon; Salmon are rarer and put up a stronger fight. Farther spots favor valuable species. Better bait changes encounter weights and nudges catches toward larger sizes.

Mara offers three levels each of rod quality, line strength, reel speed, bait quality, and cargo capacity. Rods visibly widen the safe band, stronger line adds time to recover before snapping, reels shorten fights and clear accumulated danger faster, bait attracts rarer catches, and storage grows **5 → 8 → 11 → 15**. Rods also change material color and storage adds the existing strapped basket. First equipment purchases start at $20–$55; later levels have increasing costs.

Money, individual cargo entries, equipment levels, and journal records persist locally. The original `arctic-drift.save.v1` key is retained, with a version-2 payload; old money and Kayak Storage I migrate automatically. There is no account or cloud save.

## Main tuning and implementation

- `src/game/fishing/data.ts`: species, base weights/values, rarities, catch variation, spot probabilities and fish difficulty.
- `src/game/upgrades/data.ts`: every equipment level, price, capacity and effect.
- `src/game/upgrades/Equipment.ts`: purchases, fight modifiers and saving current player state.
- `src/game/player/Cargo.ts`: individual fish and personal-best weights. `Wallet.ts` keeps money separate. `SaveStore.ts` validates and migrates local saves.
- `src/game/home/Home.ts`: boarding dock, walkable village, three NPCs, and exact individual/bulk market sales. `HarborPanel.ts` reuses one timber-framed card panel; each view opens only at its relevant world interaction.
- `src/game/fishing/Fishing.ts`: interaction, catch cards, rod/line reactions and splashes. `FishFight.ts` and `FishStruggle.ts` handle the minigame; `FishingUI.ts` draws tension and danger.
- `src/game/tuning.ts`: kayak movement, wake, fishing distances/delays, starter capacity and home location.
- `src/game/world/river.ts`: organic contours, seeded decoration/floes and collision-mask integration.
- `src/game/world/Ambience.ts`: sparse wildlife, fading tracks, light snow and water motion. `src/game/audio/AudioManager.ts`: Phaser music, ambient layers and restrained generated sound effects.

## Art pipeline

The game uses original overhead pixel art, integer camera zoom and nearest-neighbor rendering. The kayak hull and map geometry remain shared with collision. Trees, wildlife, snow, water and ice are registered by stable IDs through `src/game/assets/textures.ts` and its generated catalog.

Read `docs/art-style.md` and `docs/asset-pipeline.md` before changing art.

```sh
npm run assets:build
npm run assets:validate
npm run assets:test
npm run assets:preview
npm run assets:generate -- assets/definitions/kayak.json
```

The pipeline owns definitions, source frames, palette, canonical references, normalization, packing and Phaser registration. `assets:bootstrap` deliberately regenerates the entire authored collection. Ordinary builds preserve source art.

## Browser verification

Checks use isolated state/save keys, never the player's save. Keep the check page uninterrupted while keyboard automation runs. They are excluded from the production bundle.

- `/checks/loop.html` (also `/checks/upgrade.html`): model checks for all 15 upgrade purchases, catch variation, records, migration and limits; then actual keyboard fishing, a full hold, individual/bulk selling, a purchased rod affecting the next fight, and a real refresh restoring inventory/journal/equipment. Allow about two minutes.
- `/checks/fishing.html`: seeded simulations and repeated real catches, failure modes, movement locking/restoration, respawning and focus loss.
- `/checks/terrain.html`: bank and irregular-floe collision checks across the map.
- `/checks/movement.html`: acceleration, eight directions, drift and camera checks.
- `/checks/harbor.html`: isolated trading/journal layout fixture with a larger hold.
- `/checks/atmosphere.html` and `/checks/polish.html`: wildlife placement, directional frames, particle bounds, audio and visual inspection points.

The hub uses generated merchant/journal-keeper sprites, individual idle frames, three distinct fish portraits, five equipment icons, timber UI skins and contextual dock props. New production frames are packed and validated with the existing asset pipeline; gameplay definitions, prices and saved records are shared by all visual views.

### Blue Ice Bend

Paddle south from home: the Starting River transitions around y=1900 into Blue Ice Bend (y=2150), then opens into Frozen Lake (y=3370), all in the same scene. No gates or loading screens. Pike ($25 base, 4.5kg) and Lake Trout ($38 base, 6.2kg) reuse the tension minigame, equipment effects, cargo, journal and saves.

Balance lives in `src/game/fishing/data.ts`; area boundaries and mild downstream current speeds in `src/game/world/areas.ts`; contours, large floes and bank landmarks in `src/game/world/river.ts`. The hero and kayak use native 48×60 art at 1× scale to match villagers.

`/checks/bend.html` runs an isolated keyboard-controlled wilderness outing, catches both new fish, returns to sell and buys a rod. `/checks/bend-motion.html` verifies currents, movement locking and the lake connection. These fixtures do not use the player's save.

### Living trips

Area labels now replay whenever an area is entered. Fishing activity and animated wildlife vary with each trip; returning within 140px of home arms the next trip, and leaving beyond 270px reseeds dynamic content without touching the map. Visible activity remains stable, especially during fishing.

`src/game/world/spawnRules.ts` owns area fish pools, densities, group sizes, probabilities, lifetimes, spacing, cooldowns and limits. Penguins and birds are frequent enough to encounter while paddling; seals are uncommon; bears remain very rare and solitary. `DynamicWorld.ts` handles seeded placement and short-lived state, reusing river contours and floe masks. Existing wildlife animation, fishing, cargo, journal and saves handle the results. No new animal artwork or quest system was added.

Future quest integration can call `dynamicWorld.requestOpportunity(fishId, areaId)`: a valid off-screen spot in that species' area reserves a guaranteed next bite within the next scheduling interval after a 30-second grace period. Other activity remains random; failed attempts retain the request. `/checks/dynamic.html` verifies 80 seeds, terrain validity, limits, rare encounters, trip variation, the opportunity hook and the live catch/sell loop using an isolated save.

Kayak Speed is available at Mara: three levels grant +15%, +30%, and +45% paddling speed for $60, $150, and $320. Acceleration scales alongside cruising speed; currents retain their normal strength. Levels persist in the existing save, and older saves start at speed level zero. Balance remains in `src/game/upgrades/data.ts`; `/checks/speed.html` verifies purchases, actual keyboard-driven speed, limits and save compatibility.

### Audio

The HUD Settings button opens three volume/mute controls: Master, Music and SFX. Arrow keys adjust/select, E or Space toggles the selected mute, and Escape closes. Settings pause gameplay input while Phaser music continues; the old M shortcut is removed. Audio settings share the existing save and survive gameplay saves and browser refreshes.

`assets/audio/background.mp3` is the user-provided track. `AudioManager.ts` prepares a short tail/head crossfade and uses Phaser's scheduled looping, with a gentle initial fade and smoothed gain changes. It owns original generated SFX, per-cue cooldowns, a six-voice limit, and no continuous noise beds. Add semantic cues there and ambient mixes in `AMBIENCE_LAYERS`; no separate audio contexts or UI volume state. `/checks/audio.html` checks trusted-gesture startup, loop continuity, channel isolation, menus, voice limits and refresh persistence with an isolated save.

Continuous wind/water noise beds are disabled at the user’s request. The internal Ambience channel routes occasional wildlife/ice cues but is no longer shown in Settings; background music and short gameplay SFX remain.


### Time and weather

A day lasts 12 minutes, with three-minute morning/day/evening/night phases and 30-second lighting transitions. Weather holds for 3–5 minutes. Aurora has a 12% chance on entering night, lasts until dawn, and cannot occur by day. Weather particles ease between states; world sprites are tinted without dimming interface or fishing cues. Night lights use small amber pixel clusters. No continuous wind/water audio was reintroduced.

`src/game/world/conditions.ts` centralizes durations, weather weights, light palettes, per-fish/per-animal preferences, journal hints and catch-quality limits. Fish tables retain every normal area species; conditions shift relative odds and weight potential. Aurora favors rare fish and unusual activity while the existing shared rare-encounter cooldown still applies. Existing quest opportunity requests override the weighted bite selection in all conditions. Penguins remain common; heavy snow suppresses birds and calm weather favors seals.

Only clock position, weather, remaining weather duration and weather RNG seed are saved. Refresh resumes these without offline catch-up; audio, money, inventory and upgrades retain their existing save paths. `/checks/environment.html` exercises all combinations, 500 seeded hotspot comparisons, 1,000 night rolls, quest opportunities, terrain validity, save coexistence and the live fishing/selling loop. Its preview buttons use an isolated scene and do not change the player save.


### Walkable village

Slow down alongside the dock and press **E — Land**. Walk with WASD/arrows through the village; the empty kayak stays moored. Nessa buys fish at the market, Mara sells existing equipment at her workshop, and Ivo opens the existing gallery beside his research cabin. Press E nearby to talk and Escape to close. Return to the dock and press E to board. The pause/settings panel also pauses walking.

The handcrafted village has an open meeting space, lightly compacted snow paths, a distinctive igloo, market canopy, workshop lean-to and specimen cabin. Authored pine groves, quiet snowy gaps and small domestic/working prop groups integrate it into the wilderness without any visible perimeter. The market NPC and crates sit beside the through-road. `home/villageLayout.ts` owns layout, walking speed, mooring distances and the allowed footprint; buildings, larger props and NPCs have walking collision. Wilderness walking remains unavailable. Wildlife placement reserves the village; river geography is unchanged.

`node scripts/assets/village.mjs` regenerates only village assets using the established palette/reference pipeline, including eight-direction fisherman animation, empty kayaks, seller, buildings, signs and six snowbank variants. `/checks/village.html` verifies actual keyboard routes through all three NPC interactions, selling, an upgrade, records, pause/restoration, village navigation limits and obstacle collision, launching and a subsequent catch. It uses an isolated save. Walking/boarding mode is temporary; refreshing returns to the normal kayak start with all saved cargo and progress intact.

Village scenery is an explicit composition in `VILLAGE.scenery`, not a generator following the walkable boundary. Occasional open snow at the edge is intentional: navigation limits keep walking local without requiring a visible wall. Paths are painted as one merged, lightly compacted surface. `checks/village-view.html` provides isolated overview, walking-scale, night and narrow-screen previews without using the player save.

Village lighting lives in `home/VillageLighting.ts`: daylight lamps are off, dusk/night smoothly activates emissive window/head masks and small stepped warm pools. The firepit has six flame frames, bounded embers, and local light. Lamp bases use 4px circle collision, the fire ring 11px, and bushes 10px; lamps sort against the player’s ground position. `/checks/lighting.html` verifies keyboard collision, front/behind layering, automatic day/evening/night activation and performance in an isolated scene.


## Player gear and kayak modules

Edda's **Player Gear** shop sells named rods (Basic → Reinforced → Arctic → Expedition), bait kits, the Personal Lantern and Handheld Finder. Buy the next rod or equip any owned rod; one rod supplies control, line tolerance and reel effectiveness together. Lantern/finder can be equipped or packed away and never consume module slots.

Paddle into Mara's service bay south of the village dock to use the **Kayak Workshop**. Buy parts, select one of three slots, then fit/remove/swap. Storage Rack, Current Stabilizer, Icebreaker Bow, Turbo Motor, Reinforced Hull, Weather Canopy and Rod Mount only work while installed. Owned parts remain available. Storage cannot be removed if that would leave too few slots for carried fish.

With Turbo Motor fitted, hold **Shift** while paddling for a three-second boost. Release to recharge (six seconds from empty). A small gauge below the kayak shows charge. The Reinforced Hull improves acceleration and turning during collision recovery; it does not alter river collision geometry.

`src/game/upgrades/data.ts` centralizes names, prices, rod profiles and boost tuning. Existing component purchases migrate to the strongest owned complete rod, without charging money; lantern/finder ownership transfers to personal gear and frees any formerly occupied slots. Save schema retains the existing key, cargo, records and permanent world progression. `checks/items.html` exercises migration, purchases, fitting, real keyboard boost and persistence; `checks/module-save.html` checks restoration on a fresh browser page.


Player Tools now use **Q / R** to cycle owned tools and **F** (or the toolbelt icon) to use the selection. The lantern toggles in walking/kayak mode; finder scans briefly instead of constantly revealing activity; binoculars look ahead for three seconds; the probe sounds water in the facing direction; bait cycles Basic and owned kits; the field guide reads local habitat and known species. Menus and fishing suppress tool input. Tool selection, lantern state and active bait share the existing player-gear save fields. New tool prices and timing are in `upgrades/data.ts`; actions/effects in `upgrades/ToolView.ts`.

The quick toolbelt has **five saved slots**. **1–5** select a slot (the default first slot is the current fishing rod); **F** uses a tool and **E / Space** retains the existing cast interaction. **Q / R** cycle assigned slots. Drag icons between slots to swap, or press **I / Edit**: focus an owned item with a click or arrow keys, then press **1–5** to equip it directly into that slot. Escape/I finishes arranging. Tools outside the belt remain owned and can be assigned later. **I** opens/closes the owned Player Tools panel for assigning the five slots. Cargo remains available from the fish-count HUD button. Physical 1–5 keys (including the numeric keypad) select slots without Shift.

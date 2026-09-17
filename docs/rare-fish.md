# Rare visitors

The existing fishing minigame, cargo, merchant, records and journal handle all visitors. No separate legendary encounter mode or currency exists.

- `src/game/fishing/data.ts`: species, rarity colors, base values/weights and fight parameters.
- `src/game/fishing/rareFish.ts`: area/time/weather eligibility, hotspot/bait bonuses, progressive clues, weight ranges and encounter protection.
- `src/game/fishing/FishStruggle.ts`: reusable force rhythms (burst, steady, erratic, ambush, endurance).

Moon Grayling visits Blue Ice Bend at night. Frost Burbot visits Frozen Lake during light or heavy snow. The Pale Crown visits Frozen Lake on clear or aurora nights; an aurora is an alternative, not a hours-long prerequisite. Normal fish remain available in every condition.

Only off-screen dynamic activity evaluations in valid conditions advance protection. A visitor is assigned to the activity before the player sees its species-specific shadow and ripples. There is at most one active rare visitor per area. Chance rises after misses, with an encounter by the fifth eligible spawn evaluation. After an encounter, two normal evaluations (three for the legendary) prevent immediate repetition. Assignments, world clock, RNG state and these counters use the existing save payload and survive travel, sleep and refresh. An escaped legendary is still eligible again later. Quest-reserved bites keep priority.

Journal records unlock related habitat clues. First rare discoveries briefly show the specimen and discovery text; the first legendary gets a longer lake-legend presentation. Selling never removes journal records.

Art: `node scripts/assets/rare-fish.mjs` generates the three native 44×28 specimens through the normal manifest/atlas pipeline. Journal silhouettes and underwater clues reuse those same shapes.

Verification: `/checks/rare.html` checks eligibility, worst-case luck, cooldowns, normal tables, force rhythms and catches at 30/60/120 FPS, then plays all three catches with keyboard input and verifies selling/save/journal integration. It uses an isolated test save.

Dynamic integration: `/checks/dynamic-rares.html` compares twelve days and eight trips, validates water placement, checks identical geography, and verifies that reload preserves assigned visitors and cannot replay an opportunity consumed at cast time. Music and settings saves retain that state.

Nearby and catch cues use the semantic AudioManager IDs `rare-near`, `legendary-near`, `rare-catch`, and `legendary-catch`. The nearby cue plays once per opportunity, with a global per-cue cooldown. Legendary specimens use a compact four-second bordered catch card; the original Fish Gallery automatically includes every defined species.

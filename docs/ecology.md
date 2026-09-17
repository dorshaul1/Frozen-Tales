# River ecology

The fixed river, floes and routes are unchanged. Four authored bank compositions are defined in `world/ecologyLandmarks.ts`: an old landing, frozen cascade, blue arch and drift cave. Blue Ice Bend now retains more existing pine vegetation; the lake remains sparse. Landmark footprints exclude animal movement/spawning.

`ANIMAL_RULES`, `ECOLOGY` and `ANIMAL_SPEED` in `world/spawnRules.ts` extend the existing encounter system with fox, hare, reindeer, otter and owl. Conditions remain in `world/conditions.ts`. Hares and otters favor the starting river; reindeer and seals favor the bend; lake encounters are sparse. Foxes, owls and bears share the existing rare cooldown. Population, spacing, outside-view placement, lifetime and recent-location protections remain active.

Ground animals alternate wandering, resting/head movement, group orientation and gentle avoidance; existing fading tracks now cover the new species. Birds/owls cross the scene, seals slide as they depart, and occasional brief fish jumps use active valid-water spots. No interaction or rewards are attached to these moments. These are ambient behaviors, not navigation or AI systems.

Original recipes in `scripts/assets/renderers.mjs` and `ecology.mjs` generate individual directional frames through the standard manifest/atlas pipeline. Regenerate named definitions with `npm run assets:generate -- assets/definitions/<id>.json`.

`checks/ecology.html` simulates 20 five-minute trips, checks all ground/floe placements and population caps, compares rarity counts, and verifies fixed geometry. It also provides visual direction previews and landmark views. Counts in the reference run: 189 penguin encounters, 74 hare, 37 otter, 104 bird, 57 seal, 21 reindeer, 20 fox, 8 owl and 3 bear.

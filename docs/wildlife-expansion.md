# Wildlife routines and ecology

The expansion adds four native-resolution species through the existing asset generator, atlas, dynamic encounters, animation controller and audio manager. No geography or progression changes.

- Musk ox: Frozen Lake, rare compact herds, long grazing/rest periods and close grouping when approached.
- Arctic wolf: Frozen Lake and Glacier Gorge, rare small packs, longer patrol goals, observation pauses and trailing formations.
- Wolverine: Glacier Gorge, rare solitary cover-to-cover movement and investigation.
- Raven: Starting River, Blue Ice Bend and Glacier Gorge, perches, nearby ground investigation and genuine directional flight frames.

Area eligibility, encounter limits, cooldowns and rarity live in `spawnRules.ts`; time/weather preferences in `conditions.ts`. The existing shared rare cooldown and recent-position avoidance apply. All wildlife excludes cave interiors. The existing global population ceiling and offscreen update suspension remain intact.

`animalBehavior.ts` defines species activities, rest duration, destination preferences, reactions and shared group destinations. Formation offsets follow travel direction, while individual speed and frame timing remain unsynchronized. Penguins retain their original art. Bears pause longer; reindeer travel in staggered herds. Seals retain resting/sliding frames until entering water. Otters choose nearby water when disturbed and use swimming frames after crossing the bank. Water-entry splashes occur at the actual transition.

Art is authored in `scripts/assets/arctic-wildlife-art.mjs`, with separate profiles, front/rear and quarter views. Source dimensions vary by species (48×40 musk ox, 40×36 wolf, 32×32 wolverine/raven). No high-resolution migration or rotated animal sprites. Otter swim frames use the existing original renderer.

Verification: `checks/wildlife-expansion.html` exercises 20 seeded days across four regions, all animation keys, terrain-safe movement, herd reaction, otter water entry and native-scale art comparisons. `checks/animal-collision.html` covers walking/kayak contact and despawn cleanup for old and new species. These scenes use isolated state and do not write the player's save.

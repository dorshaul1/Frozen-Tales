# Moving fishing activity

Schools are movement state on existing DynamicWorld activity entries, not a separate fishing system. Static activity remains in the mix. `src/game/fishing/schools.ts` owns profile probabilities, group size, speed, pauses, turning, roam distance and forgiving approach reactions. Pool-weighted fish temperament influences travel speed, without selecting or exposing the eventual catch.

Common water signs use relaxed groups of 2–5; broad shadows use a slow individual; erratic signs move faster; rare encounters retain their existing conditions and receive the appropriate school profile. Fish pools, bait, quality, minigame and rarity/pity selection remain unchanged.

A school wanders within 48 pixels of its spawn, with occasional pauses/turns. Fast kayak approaches trigger a brief capped retreat and slight spread, followed by a nine-second reaction cooldown. Slow approaches settle the school within casting approach range. Cast targets are protected from all motion. Existing consumption and off-screen respawn retire schools after fishing.

Motion evaluates at 10 Hz against fixed bank/floe clearance, area identity and other activities. Group silhouettes stay inside the center's clearance envelope. State, timers, heading and origin live in the existing dynamic save snapshot; old snapshots safely retain static activity until normal replacement. No map generation changes.

Native shadow art has three anonymous fish shapes and three tail poses each, generated via `scripts/assets/water-signs.mjs`. Rendering pools at most five images per activity, with staggered tail phases and spread offsets. Bubbles follow the moving center, so the interaction hint corresponds to visible activity.

Verification: `checks/schools.html` covers four trips, terrain/area validity, moving positions, gentle approach behavior, cast target locking, persistence and live school rendering. `checks/rare.html` checks actual fishing, rewards, records and saves.

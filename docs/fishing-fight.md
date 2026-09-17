# In-world fishing

Controls: approach a school slowly, hold E/Space, aim with WASD/arrows, release to cast. Charge reaches full range in 0.8 seconds; the lure assists to activity within 55px of the aimed landing point. Invalid/quiet casts consume nothing. Escape cancels; focus loss restores control. No separate scene or screen opens.

At the bite, hold E/Space to reel; release to ease tension. Point WASD/arrows toward the shadow (the compact direction cue agrees with its position) to stabilize the rod, tire the fish more effectively and reduce runs. Keep the tension marker between the danger ends. Labeled stamina and distance meters empty toward landing. Holding continuously snaps; permanent slack escapes. When tired and close, release and tap E/Space to land. A missed three-second landing window adds a small, recoverable fight extension.

`fightBalance.ts` defines charge/range assistance, stamina and distance by difficulty, reel/run pacing and reusable personality effects. `FishStruggle.ts` provides calm/pull/burst/recovery timing. Species keep their existing difficulty data; Salmon now uses the reusable runner profile. Ambush, erratic and endurance profiles can have second winds; these are explicitly signaled. No random failure rolls exist. Release always lowers pressure, and momentary danger recovers.

Rod upgrades widen control tolerance, line extends snap tolerance, reel improves retrieval and recovery, bait keeps existing attraction/weight rules. The existing fish selection, rare/pity assignment, dynamic schools, catch rewards, daily requests, cargo, journal and saves remain in use. School position freezes once aiming starts; encounter consumption happens only on a valid released cast.

Visuals reuse the generated animated underwater silhouettes, pixel bobber, line, splashes and catch animation. The line follows the physical opponent; tension changes slack and color. Runs/bursts splash, the kayak turns gently toward the pull, and landing flows into the existing result card and inventory.

Verification: `checks/fight-redesign.html` simulates 120 controlled fights across all eight species, five seeds and three frame rates, then checks continuous reel/slack failure, directional benefit, equipment benefit, second wind, and forgiving landing windows. It also drives actual keyboard casts and fights for Whitefish, Salmon and the legendary into the existing cargo system. Older tests using the previous automatic-landing policy need the new directional and explicit-landing controls.

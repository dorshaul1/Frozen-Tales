# Daily river conditions

`src/game/world/riverConditions.ts` owns the compact daily balance/state: open, sheltered, surge and fresh thin ice. Weather weights fresh ice; seeded generation avoids repeating a branch's previous condition and caps temporary sheets at two. The authored river contours never change.

`RiverScene.refreshRiverDay` generates after sleep or a safe natural day rollover. If the player is inside a branch, rollover waits until they leave. State and today's broken sheets use the existing SaveStore. A previously opened permanent passage can refreeze temporarily; an unbroken permanent gate still requires its original equipment. Daily ice never changes permanent terrain.

Traversal reuses the five verified single-entrance gate footprints, collision, momentum checks, fragments and audio. Navigation uses bounded 120-pixel surges and reduced sheltered flow. Existing Turbo/Current Stabilizer effects apply normally. Dynamic fishing slightly biases the existing eligible pool by size and fighting behavior; no extra species or fixed encounters are introduced. Finder and Probe report the local condition.

The River Chart remains a permanent geography/discovery chart. Daily state is communicated locally by ice, animated water and tool readings, without additional map markers.

Run `/checks/river-days.html` for 100-day geography/variation checks, save round-trips, current/fish affinity checks, temporary gate reconstruction, and safe morning rollover. Preview buttons compare the same cave entrance under ice, surge and calm conditions using an isolated save.

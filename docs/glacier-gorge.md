# Glacier Gorge

The river now continues south beyond Frozen Lake, from y=4060 to the new world end at 5600. The earlier river geometry is unchanged below y=3780; the former lake end opens into a smooth transition. Existing vegetation positions are retained. The fixed gorge adds winding channels, darker/deeper water, blue ice bank ridges, irregular floes, and three existing-pipeline formation landmarks. There is no gate or loading scene.

`world/areas.ts` owns its boundary and two currents (33/39 versus the bend's 19/24). Both are below starter paddling speed; upgraded speed/acceleration help upstream. Calm gaps remain for casting and turning. `world/spawnRules.ts` owns the gorge's four dynamic activity slots, normal pool and sparse wildlife mix. Penguins/hares are absent; seals, owls, foxes, birds and rare bears remain. Geography and landmarks never consume trip randomness.

New fish definitions in `fishing/data.ts`:
- Dolly Varden: medium runner, base 3.8kg / $34, uncommon.
- Glacier Lenok: hard bursts, base 7.5kg / $58, uncommon.
- Gorge Sleeper: rare ambush fish, base 10.5kg / $125, evening/night only; existing pity, signals and catch presentation apply.

Habitat and weather preferences use existing shared data. Artwork is generated from the three fish definitions through the normal atlas pipeline. Journal, inventory, records, market, selling and saves enumerate the same fish definitions. Old saves retain their cargo/records and discovered map chunks. New chunks remain unexplored.

Verification: `checks/gorge.html` checks a connected collision-clear route from home through the old river into the gorge, eight dynamic days, fish conditions, journal and cargo/record persistence. `checks/gorge-fight.html` runs fight simulations and actual cast/fight/land input for the three species at a calm gorge pocket. No old fish values, upgrades or quests were changed.

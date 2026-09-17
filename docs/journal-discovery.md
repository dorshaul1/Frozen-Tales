# Journal discovery guide

Every silhouette now has practical discovery information before first catch. Details show fish rarity, fight difficulty, habitat areas, time/weather requirements or preferences, bait relevance, live condition marks and availability. Caught entries retain the portrait, best weight, base value and learned water-sign note. Catch count is not tracked, so none is invented.

`journalGuide.ts` derives information directly from `RARE_FISH`, `FISH_CONDITIONS`, `AREA_SPAWNS`, shared `AREA_TRANSITIONS`, and rarity bait attraction. The Pike transition pool was moved from an inline spawning branch into the shared area rule so journal and spawner agree on its southern Starting River reach.

Availability means current time/weather allow encounters somewhere in the listed habitats, not that a particular random school is guaranteed. When the player is elsewhere, the status explicitly says to travel to the habitat. Normal preferences never falsely block fishing. Rare conditions are mandatory and list every valid alternative (including clear nights for the legendary). No depth or bait requirements are invented; this world currently has no area unlock gates. Check marks compare location/time/weather to current state; dash means irrelevant or optional.

Existing journal silhouette/card artwork is reused. An open journal refreshes on time/weather changes. Spawn percentages stay hidden.

Verification: `checks/journal-guide.html` checks all 160 species/time/weather combinations against rare eligibility, normal preference fairness, transition habitat accuracy, and live updates in the existing NPC journal panel.

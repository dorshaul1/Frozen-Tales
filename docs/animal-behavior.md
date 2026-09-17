# Small wildlife lives

`world/animalBehavior.ts` defines species activity cycles, destination ranges, pauses and reactions. `AnimalGoal` owns one shared goal per existing encounter, with three recent destinations to avoid cycling between the same points. Ambience moves individual members into loose slots, staggers their animation clocks, handles separation, and retains the existing footprints/weather/fish-jump/tree-snow effects.

Penguins travel, socialize, inspect and rest; foxes and hares seek cover and forage; reindeer travel together and graze; bears inspect banks and rest; otters investigate shores. Seals rest, inspect, then slide/swim from their floe and fade away. Birds and owls seek real tree crowns, perch, then take flight again. Group targets use the existing fixed river and tree registry. Snow destinations are sampled along their whole direct route; each movement step validates terrain and can steer around an obstruction. Swimming stays inside the river. No world regeneration or new spawning system.

Player proximity prompts species-specific alert, flight, gathering or escape behavior with a cooldown. Weather/time influence rest duration and cover choice; area identity and rarity continue through the existing spawn tables. The expensive goal search only runs at transitions, only for visible encounters. Distant sprites pause animations. Encounters retain existing lifetime, cooldown and global count limits.

Original action frames use the same screen-space renderer and native canvases: forage head dips, tucked resting paws, alert posture, perched birds and swimming movement. Existing AudioManager cues provide quiet distance-scaled wing, splash, call and footstep feedback. Continuous ambience remains disabled.

Verification: `checks/animal-behavior.html` runs 120 seconds of actual Ambience updates for all species, asserts travel and valid terrain, then offers individual live views. It deliberately includes overlapping starts to test separation recovery. `checks/ecology.html` covers trip variation, rarity, terrain and population limits. Asset rebuild uses `scripts/assets/wildlife-quality.mjs`.

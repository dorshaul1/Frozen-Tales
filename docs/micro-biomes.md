# Handcrafted river pockets

Eight fixed compositions live in `src/game/world/microBiomes.ts`: Old Spruce Grove and Windward Snowfield in Starting River; Cobalt Shelves, Trapper’s Rest and Still Shore in Blue Ice Bend; Fractured Flats in Frozen Lake; Shattered Wall and Needle Passage in Glacier Gorge.

They have no rewards, quests, interactions or artificial markers. Existing waterfalls, arches and caves remain in place. Each pocket supplies authored relative offsets and optional shore material. Placement anchors use the outermost existing bank across the composition's height, preserving full land clearance. Ordinary scatter is suppressed locally so it does not compete with these compositions. The map, physics, dynamic encounter rules and saves are untouched.

Four original assets supplement the improved library: ancient spruce, collapsed timber shelter, split glacier wall and flat cracked ice. Regenerate with `node scripts/assets/micro-biomes.mjs`; pack/validate with the standard asset commands.

`checks/micro-biomes.html` provides every pocket plus narrow-view inspection and asserts that the entire sprite rectangles stay off navigable water. `checks/routes.html` retains route, physics clearance and dynamic fishing regression checks.

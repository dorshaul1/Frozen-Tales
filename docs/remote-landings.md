# Remote landing composition

The five existing dock IDs and berth positions are retained. No services, rewards, new docks, or progression are added. Existing saved discoveries continue to resolve to the same IDs.

- Lookout Point: short inland approach, scenic bench, observation instruments and restrained planting.
- Camp Clearing: two small paths around an open clearing, physical firepit, shelter, supplies and log seating.
- Spruce Forest Trail: the largest remote walking area, connected branching trails, three clearings and clustered spruce/fir/young trees. It remains much smaller than the village.
- Old Fisher’s Rest (`old-dock`): yard laid out on the broad snow south of the dock, with a shelter, drying rack, net, barrel, crates and rope. The northern side-channel geography remains unchanged.
- Quiet Frozen Grove: compact shoreline walk, weathered trees, snowbound vegetation, blue ice and a bench. Kept intentionally sparse.

Layout is authored in `Landings.ts`. Walkable clearings augment the existing bounded path corridors; water and physical props still constrain walking. Source artwork is reused from the existing native-resolution asset library. Ground-fit and footprint checks reject props that would intersect paths, other local props or water. Baked decorative rocks/trees yield to landing paths; terrain and functional ice gates do not change.

The shared dock approach/boarding implementation and calm berth protection remain in use. Discovery continues through `Discovery` / `MAP_MARKERS`; names reveal once and markers remain hidden until visited.

`checks/landings.html` verifies every trail against walking and shared scenery collision, all dock transitions, dock bodies, storm-safe berths, hidden/saved map markers and required focal props. Tests use isolated state, not the player's save.

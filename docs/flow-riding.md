# River flow riding

Flow lanes follow the fixed river banks. `world/flowRiding.ts` defines seven short stretches: gentle starting water, curved Blue Ice Bend lanes, one quieter lake stream, and stronger gorge lanes. Side waterways use their existing contours for localized flows. No map or save geometry changes.

Paddle along the moving foam to build speed. Matching the current direction builds momentum over roughly two seconds; crossing a lane or steering against it does not. Speed decays smoothly after leaving, with a short coasting window when paddles are released. Counter-steering still brakes normally. Docking, menus, fishing and anchoring clear the riding bonus.

Weaker upstream ribbons sit toward the river edges. Existing sheltered pockets remain calm. Weather strengthens and slightly shifts lanes using the existing smoothly interpolated weather state. Current force remains under the existing navigation cap.

Turbo multiplies the combined paddling and riding speed. Current Stabilizer improves acceleration/steering response within lanes, in addition to its existing current resistance. Neither is required. Wake density, paddle cadence, camera tracking and quiet current audio respond to earned speed.

## Checks

`checks/flow-riding.html` checks all lane profiles, momentum buildup/decay, upstream direction, actual kayak controls, Turbo, Stabilizer, calm dock approaches and bounded render objects. The optional full-trip button steers around existing ice from the starting river through Glacier Gorge and back with no modules.

Live short-route checks: approximately 172 px/s in Blue Ice Bend and 272 px/s with Turbo, compared with the 125 px/s base paddling speed. These are observed peaks, not guaranteed travel speeds.

Final live route verification passed from y=350 to y=5280 and back using actual keyboard input and physics, no modules: 46.1 seconds downstream and 48.8 seconds upstream. The test planner avoids fixed ice and remote dock footprints; it is test-only and is not player autopilot. `checks/flow-weather.html` passes storm-strength, smooth weather increments, 30/60/120 FPS momentum agreement, unchanged geography and cave-approach flow checks. No console errors were reported.

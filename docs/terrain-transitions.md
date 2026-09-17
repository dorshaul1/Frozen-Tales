# Terrain transition rendering

Shoreline presentation is baked once in `createRiver`, using the existing fixed `waterSpans` collision contour. `terrainDistance` samples that contour on its two-pixel scanline lattice and propagates distance plus the nearest boundary location. It handles island caps, concave forks and steep banks without stretching horizontal shoreline strips across them.

The renderer samples the original native 32×16 shore material profiles by signed distance. Snow/ice/rock material changes cross-fade along the bank; cave and gorge shelves use the same boundary field and are painted before props. Nearest-boundary coordinates avoid the streaks caused by extrapolating a quantized distance gradient. Shelf bands never overwrite water or neighboring shorelines.

Existing habitat depth is sampled into a bake-only scalar field and interpolated for color presentation. This prevents changes in the count/width of river spans from causing horizontal water-color cuts. Fishing habitat and all gameplay depth queries are unchanged. Cave water retains its existing material and entrance fade.

No terrain, gates, routes, collision masks, sprite sizes or camera behavior are changed. Rendering remains native-pixel canvas output with image smoothing disabled. All distance/field work happens during terrain creation; camera movement never recomputes it.

`checks/terrain-transitions.html` provides fixed inspection points across the network and caves. `?small` uses a 640×420 viewport; the default is 900×600. Checks cover contour-sign agreement, geometry immutability, depth-field continuity, native sampling and texture identity during camera travel.

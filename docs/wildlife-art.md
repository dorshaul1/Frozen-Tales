# Directional wildlife art

All nine current species use `scripts/assets/wildlife-poses.mjs`. This replaces the former rotated overhead renderer. The native canvas, species IDs, eight direction keys and two idle/four movement frames remain compatible with the existing Ambience and spawn systems.

Profiles, front/rear and quarter views are drawn in screen coordinates; they never rotate a base image. Penguin belly/beak/flipper poses, bear shoulders/paws, fox tail/muzzle, hare ears/haunches, reindeer neck/antlers/hooves, seal flippers, otter tail and bird wing beats remain species-specific. West-facing art retains upper-left shading. Quarter-view quadruped bodies shorten and shift their head placement.

The existing smooth facing selection drives animation keys. Bears use a slower four-frame-per-second gait; hares use seven; other species retain gentle cadences. Idle frames blink or subtly change head/highlight posture. Existing movement speed, encounters, terrain validation and gameplay are unchanged.

Regenerate: `node scripts/assets/wildlife-quality.mjs`. Review: `checks/wildlife-quality.html` shows all directions, idle/walking and each species. `node scripts/assets/wildlife-review.mjs` produces a native contact sheet in `/tmp/wildlife-directions.png`. Standard asset validation checks all frame canvases, binary alpha, palette and transparent margins.

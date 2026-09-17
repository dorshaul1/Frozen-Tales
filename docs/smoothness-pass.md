# Movement and visual continuity

Camera follow keeps floating-point scroll state. Phaser's `roundPixels` floors scroll before the next interpolation step; slow currents previously lost fractional progress every frame. Native artwork still uses nearest-neighbor sampling and integer zoom. Dock target changes retain the previous scroll instead of `startFollow` immediately recentering.

Current velocity targets blend over 200 ms, with a modest 12% increase. Paddling acceleration is 520 world pixels/s²; initial and subsequent launches reach the 125 px/s baseline within 250 ms.

All six landing docks use `dockInteraction.ts` for front/side approach and nearby boarding. Secondary dock arrival points now sit at the deck tip, and dock collision bodies use the same 96×24 footprint. Workshop service interactions remain separate.

Side-route endpoints have rounded contours shared with collision. Cave water fades laterally at its edges. The decorative fractured-ground placement is removed; breakable ice is unchanged. Cave masks remain cached and follow exact player positions. Discovery notices and preparation messages occupy separate vertical positions; preparation wrapping updates only on resize.

## Verification

- Production build and 177-asset / 1389-frame validation passed.
- `checks/smoothness.html`: all docks, camera handoffs, no distant interactions, launch consistency, stable terrain texture through 300 camera frames.
- `checks/flow-riding.html?trip`: full river downstream 42.1 s and upstream 46.5 s without modules; live Turbo/Stabilizer checks passed.
- `checks/cave-render.html`: 300 synchronized frames, cached geometry, lantern and exterior transitions.
- `checks/exploration.html`: all eight special routes connected, gates respected, escape routes valid, dynamic encounters preserved.
- `checks/weather-presentation.html`: bounded full-screen effects, cave suppression, stable camera-relative rendering below UI.

No new gameplay or asset resolution changes.
- Final terrain checks passed: shoreline collision samples, all floe masks, deterministic placement. The bank-only fixture avoids workshop rails and allows 4px for the 2px stepped contour plus physics-step separation.
- Final integrity checks passed: village occlusion/window ordering and map bounds at 440×650, 880×600, 1040×700, and 1920×1080 with zoom 1–3. No browser errors in the final UI check.

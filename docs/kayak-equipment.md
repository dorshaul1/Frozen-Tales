# Visible kayak equipment

The existing six upgrade levels directly select modular deck attachments. No cosmetic save data or progression was added.

- Cargo: woven basket → framed cargo box → strapped box plus stern roll.
- Speed: improved blade inlays → light blades and bow reinforcement → expedition blades and stern fittings.
- Rod: mounted wooden rod → reinforced rod → finished rod and metal holder.
- Line: rope spool → stronger pale coil → fine reinforced coil.
- Reel: compact steel reel → brass fittings → finished brass reel.
- Bait: small tackle tin → upgraded bait box → fitted green tackle box.

Every attachment has the same native 48×60 canvas, centered origin and transform as the base kayak. Speed has five poses per level: idle, three stroke phases, and stowed. The render sync reads the actual hull frame each post-update, including while walking, fishing or paused. Weather tint, alpha, scale and rotation match the hull. Physics and minigame code are unchanged.

Production calls `Kayak.setEquipmentVisual(levels)` after loading, and with `highlight=true` immediately after merchant purchases. Existing upgrade SFX and purchase feedback remain. Old baked storage artwork stays available for compatibility, but production uses one base hull plus modular layers so cargo is never duplicated.

Generate and validate: `node scripts/assets/kayak-gear.mjs`. All six asset recipes use the original shared palette and kayak reference. The source renderer is `kayakGear` in `scripts/assets/renderers.mjs`.

`checks/kayak-gear.html` verifies mixed and maximum combinations, eight headings, live paddle phase, docked and fishing/idle poses, physics radius, merchant purchase and save reconstruction, with early/mid/expedition preview buttons.

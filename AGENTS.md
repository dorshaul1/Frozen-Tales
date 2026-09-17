# Project rules

- This is a small indie game.
- Prioritize game feel and simplicity.
- True top-down perspective only.
- Minimal retro pixel-art aesthetic.
- Avoid unnecessary abstractions.
- Do not add large systems unless explicitly requested.
- Every step should leave the game playable.
- Prefer modifying existing systems over creating duplicate ones.
- Future assets should be generated and integrated autonomously whenever possible.
- Agents are responsible for creating any assets required by features they implement.
- Do not ask the user to manually create, resize, crop, organize, animate, or integrate normal game assets.
- Reuse existing assets when appropriate and use canonical assets in assets/references/ to maintain visual consistency.
- All generated visual assets must follow docs/art-style.md, the visual source of truth. Read docs/asset-pipeline.md before adding or editing art.
- Preserve the established original arctic visual identity: cozy 16-bit pixel clusters, true top-down perspective, limited palette, no antialiasing.
- Generated sprite sheets must be assembled programmatically from individual frames rather than relying on image-generation layout accuracy.
- Avoid visual placeholders when a proper asset can reasonably be generated.
- Gameplay implementation includes all required visual integration, asset build, validation, and in-game inspection.
- Use stable asset IDs from the generated catalog and centralized Phaser registration; do not scatter hardcoded asset paths across scenes.

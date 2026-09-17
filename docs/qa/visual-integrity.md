# Visual integrity pass — 2026-09-10

No art resolution, map geometry, save format, progression or fishing balance changes.

## Fixes

- Village buildings, NPCs and solid props now occlude the player from behind and yield in front. Building window masks use the same physical base as their building. Remote landing scenery follows the same rule. The corgi also sorts relative to the player instead of always drawing above them.
- Shop, cargo, journal, pause, forecast, requests, chart and trip-summary panels use screen anchoring and integer rendered pixel scale. Chart selection and audio-slider coordinates account for the panel transform.
- River Chart contents use six entries per page, bounded labels and a separate preparation/detail region. Preparation text no longer overlaps the place list.
- Fishing meters remain inside the visible viewport near world edges. Sale feedback is hidden behind an open interface.
- Native pixel font includes ampersand, equals and ellipsis instead of displaying fallback question marks.

## Verification performed

- Production build, TypeScript and 177-asset/1389-frame validation pass.
- `checks/integrity.html`: village occlusion ordering, matching window depth, chart bounds and pointer transforms at 440×650, 880×600, 1040×700, 1920×1080, with camera zoom 1–3.
- `checks/village-composition.html`: all eight path routes clear; actual keyboard walking to seller, gear shop, journal, igloo, request board, service platform and bench; Escape restores control; reboard and water-access workshop interaction pass.
- `checks/landings.html`: all five landing paths/berths, land/reboard, dock collisions and return from dock tips pass.
- `checks/terrain.html`: deterministic ice, contour samples on both banks and opaque ice collision masks pass. Updated the old test to avoid treating a newly connected side-channel entrance as solid main-river shoreline.
- `checks/exploration.html`: all eight special routes have continuous hull clearance, correct closed-gate access and open-route escape; three spawn seeds preserve geometry and valid water; bounded twenty-minute lifecycle.
- `checks/cave-render.html`: 300 camera/player transforms remain synchronized; mask geometry is not rebuilt; lantern and outside-cave visibility pass.
- `checks/weather-presentation.html`: smooth storm ramp, full viewport rain/snow, bounded particle allocations, cave precipitation suppression and UI layer ordering pass.
- `checks/fight-redesign.html`: model checks at 30/60/120 FPS; actual Whitefish, Salmon and Legendary casting/fighting/landing sequences reach inventory; final live report approximately 31 FPS in the test browser.
- Visually inspected village, night transition, cave chamber/entrance, storm, active fight, pause, gear cards, journal gallery and narrow chart. No debug overlay is enabled in the game.

The checks are repeatable development pages, not a claim that every possible camera position and save combination has been exhaustively tested. Existing cached cave lighting and terrain baking were retained because their stability checks passed.

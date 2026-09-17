# Village composition

The village now uses a broad circulation loop and direct spurs instead of a single crowded central lane. The quiet home and research courts sit north of the square; the market and player-gear shop occupy the western court; the communal and supply clearings sit southwest of the shore-fast kayak workshop. The main dock, servicing position and river geometry are preserved.

The central ensemble uses a native-pixel carved-fish lantern beacon, hearth, two benches and notice board, with open snow between them. Main trails use 42-pixel compacted-snow width, secondary links are narrower; the former broad plaza paint was removed. Natural edge clusters leave irregular gaps rather than tracing the walking boundary.

Village geometry, NPC homes, board positions, path widths and props are centralized in `src/game/home/villageLayout.ts`. Home rendering/collision, the corgi, sleep, map marker and warm-light emitters share these definitions. Forecast placement no longer uses separate hardcoded coordinates. Existing building silhouettes remain distinct and use their original native art; seven new small village assets are generated through the established pipeline. The beacon was redrawn after the first composition review. No high-resolution assets or runtime scaling were introduced.

The extra timber finger beside the main dock stores a spare kayak. Its two physical deck rectangles match its L-shaped artwork; the original landing/boarding point remains the player dock. The workshop still accepts the kayak directly from water. Workshop clutter that overlapped the building or merchant was removed/repositioned, and loose rope was removed from open water.

## Verification

`checks/village-expansion.html` creates an isolated scene without a save key and checks:

- Flood-filled access from the dock to every service, home, communal and utility court.
- About 152,848 square world pixels of connected clear walking space, versus roughly 76,600 in the first expansion pass (4-pixel sample grid).
- Every authored path centerline against actual physical obstacles.
- Real walking-controller travel over 3,200 world pixels across eight destinations.
- Relocated seller, gear and journal interactions; sleep and its outside return position.
- Main dock boarding/landing and direct kayak workshop access.
- Full native building, prop and NPC sprite rectangles for unintended overlaps.

Review controls show the complete composition and each district at normal 2× gameplay zoom, in day/night lighting. These controls exist only on the check page. The production village contains no debug overlays. Existing save/progression schemas remain unchanged.

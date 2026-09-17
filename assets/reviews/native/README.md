# Native pixel-art review

The single production atlas again uses the original frame dimensions, original terrain canvas and original animation keys. Experimental source sets, selection config, source/logical scaling adapters, higher-density world baking and experimental recipes/check pages were removed. World geometry, save data, shops, fishing and progression were not rolled back.

## Selective review

| Category | Decision |
| --- | --- |
| Penguins | Preserve all 96 original source frames exactly; checksum baseline retained. Main simplicity/style reference. |
| Bear, fox, hare, seal, otter, reindeer, owl, corgi | Retain original small directional poses. Their existing profile/front/rear silhouettes are preferable to another broad redesign. |
| Small bird | Refine only the 28×28 gull: light body/head, gray wing mass, dark wingtips and readable beak. Preserve frame count, directional keys and behavior. Existing airborne walk poses remain wing beats. |
| Fisherman and villagers | Restore original 32×32 frames and animations. |
| Kayak and installed gear | Restore original 48×60 artwork, paddle frame count and attachment mapping. |
| Fish, trees, buildings, props, caves, ice, rocks, terrain, UI | Restore and retain original assets. No blanket redraw or density increase. |

`wildlife-before.png` shows original native poses; `wildlife-index.json` identifies rows/directions. `gull-after.png` shows the selected small change. Review at native size or the game's integer camera zoom, not smoothed enlargement. The restored village and gull poses were inspected at gameplay scale. `checks/native-art.html` verifies native frame sizes, 1600×5600 terrain, radius-17 kayak and all original animation registrations.

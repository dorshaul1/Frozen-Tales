# Autonomous asset workflow

The repository owns all source art, processing rules, canonical references, and packed output. There is no service lock-in and no manual art preparation step for the user.

## Commands

```sh
npm run assets:generate -- assets/definitions/kayak.json
npm run assets:build
npm run assets:validate
npm run assets:test
npm run assets:preview
```

`assets:generate` reads this style guide, the definition, and named reference files; the default deterministic pixel renderer emits each individual source frame. It updates that asset's manifest entry and builds/validates the atlas. Existing assets are regenerated only when explicitly named. `assets:build` does not redraw sources: it normalizes the manifest's individual source PNGs, packs with code, exports TexturePacker-compatible metadata, and writes the typed Phaser registry. This lets a hand-edited or image-generated source remain authoritative.

`npm run assets:bootstrap` regenerates the complete authored pixel-art collection from the checked-in recipes. Use it for a deliberate whole-set rebuild, not after editing an imported source. Production `npm run build` rebuilds and validates assets before TypeScript and Vite. All outputs are deterministic and committed with the project.

## Image generation or another provider

```sh
npm run assets:generate -- assets/definitions/kayak.json --provider agent
```

This prepares `assets/source/kayak/request.json` and `prompt.md` containing the full style guide, canonical reference paths, individual frame requests, exact dimensions, alpha rules, and output filenames. It does not pretend a local CLI can call an agent-hosted image tool. The agent must inspect the references with its image viewing tool, call its available image-generation/editing tool for **individual frames**, save the original outputs, then run:

```sh
npm run assets:generate -- assets/definitions/kayak.json --provider import --input /absolute/directory/of/individual/frames
```

The agent handles all copying, background cleanup, sizing, palette checks, packing, validation, and in-game inspection. For one-frame definitions `--input` may be a single PNG. Never request a perfectly aligned final sheet from a generator. Original external images remain in `assets/source/<id>/raw/`; normalization is explicit in the definition. Default is strict: reject wrong size/alpha/palette rather than destroy a good drawing. Opt-in nearest-neighbor fit, palette mapping, alpha threshold, or exact background color removal are provided for imports; inspect results before accepting. For difficult matte removal, use the image editing tool to request real transparency rather than eroding the subject with heuristics.

For a connected local provider, `--provider command --command /absolute/provider-executable` invokes that executable with two arguments: request JSON and output directory. It must write the requested individual PNG filenames. No shell string evaluation or provider-specific SDK is embedded. The same import/build path follows. Provider failures do not modify the manifest. Credentials and external API authorization remain outside asset definitions.

## Layout and contract

- `assets/definitions/*.json`: concise reusable generation recipes, native size, animation/direction frame list, references and normalization policy.
- `assets/source/<id>/`: separate original PNG frames, provider metadata/prompt where relevant. Never depend on temporary external files.
- `assets/manifest.json`: IDs, types, individual source paths and dimensions, full frame size, animation timing, directions, tags, references, normalized paths and packed output.
- `assets/generated/<id>/`: normalized individual frames.
- `assets/atlases/game.png` + `game.json`: one padded deterministic atlas and frame metadata.
- `assets/references/`: canonical native assets and a labeled contact sheet. `reference-status.json` records provenance; agent-selected references are not falsely labeled user-approved.
- `src/game/assets/catalog.ts`: generated typed IDs/frame lookup, image imports and animation metadata. Do not edit by hand.
- `src/game/assets/textures.ts`: lightweight shared Phaser preload/animation registration and atlas-frame access for terrain composition. Scene code uses stable IDs, never source paths.

Assets with `collision: true` export merged opaque-pixel spans in the generated catalog. The river places floes using those masks, so irregular art cannot drift away from collision. Shore profiles are sampled along continuous contours instead of stamped as square cells.

Frame packing uses fixed full canvases with two-pixel gutters. No independent trimming; anchors remain stable across animation frames. Add N/NE/E/SE/S/SW/W/NW or idle/paddle/turning/fishing frames to the definition, generate each source, rebuild. Registration and animation metadata are generated automatically. The current renderer preserves the smooth movement-controlled rotation; adding new directional visual behavior is a separate deliberate visual change.

Validation checks schema/IDs, source existence and declared dimensions, output dimensions, binary transparency/padding, palette membership, frame uniqueness, direction/animation consistency, atlas rectangles and pixel equality, packed image bounds, references and registry freshness. It never silently repairs files. `assets:test` exercises rejection paths and deterministic rebuilding.

Before declaring a visual pass complete: build, validate, inspect contact sheet and native assets, inspect the live game at normal and narrow viewport sizes, check console errors and gameplay regression tests. Keep physics geometry and gameplay data unchanged.

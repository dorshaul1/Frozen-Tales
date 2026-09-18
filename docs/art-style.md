# Frozen Tales — visual source of truth

Cozy, cold, isolated, slightly magical. Original overhead pixel art with the material richness of a 16-bit RPG. Warm rust-orange kayak and amber home lights are focal accents against quiet blue water. Do not imitate a named game's assets, palette, characters, or exact visual language.

## Perspective and pixel density

- Strict orthographic view from directly above. Show the crown of the fisherman's hood, boat deck, dock boards, cabin roof. No building facade, faces looking at camera, horizon, foreshortened floor, or isometric sides.
- One source pixel equals one world pixel. Draw native pixels; integer camera zoom and nearest-neighbor sampling only. No antialiasing, blur, smooth gradients, vector-looking edges, or noisy pseudo-pixel textures.
- Terrain material modules use 16px source cells; world shorelines follow 2px scanline contours without visible tile stamping; material swatches are 128×128 seamless textures. Shore strips are 32×16. Kayak uses a native 48×60 canvas, displayed at 1× world scale; its fisherman matches the 32px villagers in body size. Hull radius is 17px and wake offset 24px. Cabin is 72×72; dock 104×40; ice uses its existing footprint plus explicit padding; props 24×24 or 32×32; HUD icons 16×16.
- Larger source artwork may only be reduced with an explicit nearest-neighbor normalization recipe and then visually inspected at native size. Do not assume high-resolution pixel-looking artwork is usable sprite art.

## Palette and lighting

`assets/palette.json` is the shared production palette (39 colors). Snow uses warm ivory highlights, cool off-white midtones, and pale blue shadows. Ice uses desaturated cyan; water uses deep slate blue with restrained teal ripples. Pine greens, timber browns, rust orange, cream fur, and amber light are reserved for readable details.

- Light comes from upper left. Top/left edges receive broken highlights; lower/right edges get a one- or two-pixel shadow cluster. No large drop shadows or ambient gradients.
- Use 3–5 material tones per surface, clustered into connected shapes. Avoid individual randomized multicolor pixels across the entire scene. Highlights must describe structure, not sparkle everywhere.
- Use ink outlines selectively on the character and props. Terrain blends without a continuous black border. Outline the hull with deep rust/ink; snow edges use blue shadow instead of black.
- Village lights use separate emissive amber pixel masks and small pools with four stepped, low-opacity bands. Keep falloff pixel-aligned, with no blur, bloom, or oversized glow. Window spill, the igloo entrance and firelight stay local. Reflections and visual effects may fade using sprite alpha; source image pixels themselves have binary alpha.

## Character and animation

The kayak silhouette is narrow with tapered ends, rust-painted rim, darker cockpit, small deck lashings, and a wood paddle. The fisherman is recognizable from a generous cream fur hood, moss-blue parka shoulders, mittens, and a muted red pack. The hood is exaggerated relative to the body for readability.

Maintain the same anchor and full frame canvas for every animation/direction. Never auto-trim animation frames independently. Direction vocabulary is N, NE, E, SE, S, SW, W, NW. Current hull uses N source frames and the established smooth in-game rotation; future hand-drawn directions can be added through the same manifest without changing frame naming. Idle is still; paddling uses a small three-frame paddle gesture at 6 FPS. Future turning/fishing frames must preserve silhouette and anchor. No elastic squash, flashing outlines, or constant bobbing of the whole screen.

## Terrain and environmental density

- Water is mostly open, deep, and calm: broken wavelets and broad, barely different color clusters. Repeat tiles must wrap cleanly. Avoid stripes aligned into an obvious grid.
- Snow: broad quiet off-white with small blue drift clusters, occasional wind-scoured lines, and a light-facing edge. Texture should not compete with fish shadows.
- Shore: dark submerged ice lip → cyan ice layers → pale snow shelf. Contour geometry and collision share the same scanlines; layered shore materials are sampled along that contour. Visual submerged slivers may extend into water but must not suggest traversable land.
- Ice floes: rounded, elongated, or asymmetric broken silhouettes; collision spans come from opaque sprite pixels. Snow rests on top; blue crevices are sparse.
- Cabin: snowy pitched-roof footprint seen from above, timber/eave detail, restrained amber skylight or porch light. Dock: short boards, grain, worn ends, cleats and posts. No visible front wall.
- Scatter occasional top-down dwarf pine tufts, rock groups and snow drifts on land. Keep a clear margin around shores and the home approach. Decorative props have no collision and must stay off playable water.
- Fish spots use a small dark silhouette plus 2–3 pale bubbles, keeping the existing reaction cue dominant. HUD icons are compact, outlined and legible at 16×16.

## Files, transparency, and consistency

- IDs: lowercase kebab-case. Individual source frames: `<direction>-<animation>-<index>.png`, e.g. `n-paddle-1.png`. Atlas keys are generated as `<id>/<direction>/<animation>/<index>`.
- Transparent sprites must have real RGBA alpha, only 0/255, and transparent outer padding. No painted checkerboard, white rectangle, hidden matte, or cropped paddle tips. Opaque tiles must be fully opaque.
- Use `assets/references/` first: canonical native-pixel kayak/fisherman, snow, water, ice, and cabin references are produced from the actual accepted game assets. The larger image-generated mood reference is inspiration, not permission to change perspective or pixel density.
- A future agent owns generation, cleanup, packing, validation, registration, and in-game inspection. Reuse established materials and references. A new feature is incomplete until its visuals are integrated.
- Review both native size and integer enlargement, then inspect in the game at two viewport sizes. Artistic revision must never silently change movement, hulls, fishing timings, cargo, money, or interaction distances.

## Ambient wildlife and vegetation

Vegetation includes 48px mature pine crowns, 28px young trees, 40px sparse trees, 24px bushes/branches, and small logs/reeds. Preserve overhead radial structure and vary silhouette before palette. Large trees remain inland; reeds sit on snowy shoreline margins.

Wildlife uses fixed native canvases: penguin 32×32, bear 56×56, seal 40×40, bird 28×28. Show backs, crowns and paws/flippers from above. Eight compass directions each have four alternating walk frames and two quiet idle frames, registered through the same atlas pipeline. Penguins gather loosely; a single bear and resting seal are rare accents. Animals have no gameplay collision or interaction prompts. Keep movement quiet, activate land animals near the camera, and leave water open.

## Hub and interaction cards

The dock is only for landing and boarding. The walkable village has Nessa’s fish market, Mara’s workshop, and Ivo’s research cabin. Villagers and the walking fisherman use 32×32 overhead frames with fur hood crowns and subtle hand/stride animation. Pack props beside buildings, never across the main snow paths. Fixed, uneven pine groves, sparse rocks, and open snow fade into the wilderness; no decorative ring traces the navigation limits. The dock and NPC approaches stay clear. Warm lantern clusters and occasional chimney wisps stay restrained.

Equipment uses native 24×24 illustrated icons. Fish specimens use distinct 44×28 portraits with species-specific markings, fins and tails; undiscovered cards reuse their silhouettes. Timber card skins and brass corner pins come from the atlas. Each screen opens through its world interaction, without tabs or remote shortcuts; the river remains visible around the panel.

Village walking uses eight native directional idle/walk frame sets, generated individually with nearest-pixel sampling to keep diagonal silhouettes solid. Parked kayaks have empty cockpit variants, including the existing basket upgrade. Important village buildings use distinct footprints on 96×80 native canvases: a round igloo and entry tunnel, a broad canvas market canopy, a long workshop with tool lean-to, and an offset research cabin with specimen annex. Warm skylights and small work aprons remain strictly overhead. Snowbank variants are 64×48 organic pixel clusters, used only in isolated patches. Never repeat them along a perimeter. Environmental dressing remains off navigable water.

Village lamp posts have native 24×32 silhouettes and an 8px-wide footing. Their 4px-radius collider follows the footing, while the taller cap sorts above characters behind the base and below characters in front. Campfire collision follows its 11px-radius stone ring; flame frames and a few tiny embers provide restrained motion. Village bushes have solid 10px-radius foliage collision.

The walking fisherman's S, SE and SW frames are authored front/front-quarter views, never rotations of the rear sprite. Keep the hood crown above a small visible face, the coat zipper and pockets toward the viewer, and boots/mitten steps beneath the body. Preserve the native 32×32 canvas and common shoulder anchor; the ground and movement remain strictly top-down. Each front direction has two idle and four walk frames under the existing directional animation keys.
E/W and NE/NW also use directly authored screen-space poses: profile face and nose, overlapping coat sleeves and boots, and the red backpack behind the shoulder. Rear-quarter views show the turned hood and a small cheek sliver. Do not rotate or mirror rear artwork to generate player directions; preserve upper-left lighting across every pose.

Wildlife directional views use authored front, back, profile and quarter poses. This is the same camera convention as the walking fisherman: ground remains top-down while south-facing creatures show a readable face and side poses show species-specific legs/flippers. Never rotate a rear animal to create a front/profile. Keep upper-left lighting consistent for east and west, full native frame bounds, and species-specific limb/wing cadence.

## Native-size quality rule

Keep the original small pixel-art identity. Source pixels remain world pixels; use only integer camera zoom with nearest-neighbor sampling. Do not enlarge source resolutions or rescale sprites to add detail. Preserve the original penguin design and animations as a style reference. Improve other artwork selectively at its existing dimensions, and keep originals when comparison at gameplay scale does not show a clear improvement.

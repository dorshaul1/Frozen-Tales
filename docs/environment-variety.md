# Environment art variety

World geometry, landmark positions, floe opacity masks and progression remain unchanged.

`world/environmentArt.ts` owns area-weighted tree/rock/snow choices and contextual bank materials. Visual selection uses fixed geography, never trip randomness. Local patches share tree families, with open space between clusters. Snow detail is sparsely stamped on a quieter base before river water is painted. Village paths remain reserved.

Six native 48px tree families vary branch count, crown proportions, needle spread, bare limbs and snow coverage. Six geology studies use distinct outlines. Five transparent snow studies cover drifts, wind scour, ice, old tracks and uneven ground. Rocky cave banks and exposed blue-ice shores retain the exact collision-bank anchor. Existing floes gain internal material details without changing a single alpha/collision pixel.

Regenerate the new collection: `node scripts/assets/variety.mjs`. Existing snow, formations and floes use their updated original renderers through `assets:generate`; all definitions are retained in the manifest. `assets:build` packs the authoritative source frames; `assets:validate` checks dimensions, alpha and palette.

`checks/variety.html` provides isolated live area views and a narrow viewport. `checks/routes.html` exercises unchanged navigable routes, pockets and dynamic spawn validity.

# Cloudflare Pages

Connect the GitHub repository `dorshaul1/Frozen-Tales` in Cloudflare Workers & Pages → Create application → Pages → Import an existing Git repository.

- Production branch: `main`
- Framework preset: Vite (or None)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Node version: pinned in `.node-version`

The build validates and assembles the committed asset sources, type-checks the game, and produces the static production bundle. No runtime secrets, database, or server are required. The developer console is disabled in production builds.

With Git integration enabled, pushes to `main` publish automatically. Saves are stored in each browser's local storage: localhost saves do not automatically transfer to the hosted domain.

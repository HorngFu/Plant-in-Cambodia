# Plant in Cambodia · រុក្ខជាតិនៅកម្ពុជា

An open data platform listing the plants of Cambodia, in Khmer and English.
Coming soon at **[plantincambodia.org](https://plantincambodia.org)**.

- **Open data:** every entry can be reused under [CC BY 4.0](LICENSE-DATA).
- **Open source:** the website code is [MIT](LICENSE) licensed.
- **Plan:** see [docs/DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md).

## Stack

Next.js (App Router, TypeScript) · Tailwind CSS · Keystatic CMS (content as files in this repo) ·
Cloudflare Workers via OpenNext.

## Quick start

Requirements: Node.js 22+, pnpm, Git.

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. The content admin is at <http://localhost:3000/keystatic>
(local development only, for now).

| Command           | What it does                                                   |
| ----------------- | -------------------------------------------------------------- |
| `pnpm dev`        | Development server                                             |
| `pnpm build`      | Next.js production build                                       |
| `pnpm lint`       | ESLint                                                         |
| `pnpm typecheck`  | TypeScript check                                               |
| `pnpm validate`   | Check every file in `content/` (fields, relations, duplicates) |
| `pnpm test`       | Tests (content validator, search)                              |
| `pnpm data`       | Rebuild `public/data/` (search index); `dev` and `build` run it |
| `pnpm preview`    | Build for Cloudflare and run it in the local Workers runtime   |
| `pnpm deploy`     | Build and deploy to Cloudflare (CI does this automatically)    |

## Repository layout

```text
content/            plant data (YAML + Markdoc), edited in Keystatic or by hand
src/app/            Next.js routes (/km and /en public site, /keystatic admin, /api/keystatic)
src/components/     UI components
messages/           interface text in Khmer (km.json) and English (en.json)
src/lib/content/    typed readers over content/ (build time only)
scripts/            validation, data build (build-data.ts) and test tools
public/data/        generated at build time, git-ignored
docs/               plan, data dictionary
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

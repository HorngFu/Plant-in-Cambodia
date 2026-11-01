# Contributing to Plant in Cambodia

Thank you for helping build an open list of Cambodia's plants. You can help with
**content** (plant names, descriptions, photos, sources) or **code** (the website).

## Ways to help

- **Suggest a correction or a new plant:** open a GitHub issue. (A form on the website without a
  GitHub account is coming in Phase 9.)
- **Edit content directly:** trusted editors use the Keystatic admin (`/keystatic`). See
  [docs/DATA_DICTIONARY.md](docs/DATA_DICTIONARY.md) for what each field means.
- **Improve the website:** see "Development" below.

## Content rules

- **Write in your own words.** Facts can come from anywhere, but don't copy text from books or
  websites. Add a reference for every source you used.
- **Medicinal or edible claims need a reference.** Mark toxic plants clearly.
- **Photos need an author and a license** (for example CC BY 4.0), and you must have the right to
  share them.
- **Sensitive species:** never publish exact locations (GPS points, village names) for threatened or
  poached species such as rosewoods or wild orchids. Province level only.
- All content is published under **CC BY 4.0** (see [LICENSE-DATA](LICENSE-DATA)).

## Development

Requirements: Node.js 22+, pnpm (`npm i -g pnpm`), Git.

```bash
pnpm install
pnpm dev          # http://localhost:3000 (Keystatic admin at /keystatic)
pnpm lint
pnpm typecheck
pnpm validate     # check all content files (see docs/DATA_DICTIONARY.md)
pnpm test
pnpm preview      # run the production build in the local Cloudflare Workers runtime
```

- Branch from `main`; open a pull request. CI must pass.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`,
  and `content:` for data changes.
- Public pages must be statically generated. Content in `content/` is only read at build time.
- Never commit secrets. Use `.dev.vars` locally (see `.dev.vars.example`) and Cloudflare secrets in
  production.

By contributing you agree that code is licensed under MIT and content under CC BY 4.0, and you agree
to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

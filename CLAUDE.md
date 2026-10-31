# Plant in Cambodia

Open data platform listing the plants of Cambodia (Khmer + English) at plantincambodia.org.
Stack: Next.js (App Router, TypeScript) · Keystatic CMS · GitHub · Cloudflare Workers via OpenNext.

## Development plan

The master plan is [docs/DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md).

When asked to "develop Phase N":
1. Read the phase's section and section 4 (Decisions) in that file. Use the user's answers where filled in, otherwise the recommendation.
2. Check the "You do" prerequisites; ask the user about any that aren't done before starting work that depends on them.
3. Build the phase on a branch named `phase-N-short-name`.
4. When finished, tick the phase's "Done when" items that are verified, update the Phase tracker status, and add a Changelog line.

## Rules

- Public pages must be statically generated. Content in `content/` is read only at build time; Cloudflare Workers can't read it at runtime.
- Never publish exact locations for sensitive species; province level only.
- Never commit secrets; use Cloudflare secrets and `.dev.vars` locally.

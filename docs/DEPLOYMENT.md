# Deployment (Cloudflare Workers)

The site runs on **Cloudflare Workers** using the **OpenNext** adapter. Cloudflare **Workers Builds**
watches this GitHub repo: every push to `main` deploys the live site, and every other branch gets
its own preview URL.

You only need to do this once.

## 1. Connect the GitHub repo (Workers Builds)

1. Sign in at <https://dash.cloudflare.com>.
2. In the left menu open **Compute (Workers)** → **Workers & Pages**, then click **Create**.
3. Choose **Import a repository** (Workers tab). Click **Connect GitHub** if asked, and allow
   access to `HorngFu/Plant-in-Cambodia` only.
4. Select the repo and fill in:

   | Setting                             | Value                                   |
   | ----------------------------------- | --------------------------------------- |
   | Project name                        | `plant-in-cambodia` (must match `wrangler.jsonc`) |
   | Production branch                   | `main`                                  |
   | Build command                       | `pnpm run cf-build`                     |
   | Deploy command                      | `pnpm exec opennextjs-cloudflare deploy` |
   | Non-production branch deploy command | `npx wrangler preview` (Cloudflare's default; uses the `previews` block in `wrangler.jsonc`) |
   | Root directory                      | `/`                                     |

5. Open **Advanced settings → Build variables** and add `NODE_VERSION` = `22`.
   (The repo also has a `.node-version` file; this makes it explicit.)
6. Click **Create and deploy**. The first build takes a few minutes. When it's done you get a URL
   like `https://plant-in-cambodia.<your-subdomain>.workers.dev`.
   (Ours: <https://plant-in-cambodia.horngfu.workers.dev>.)
7. In the Worker's **Settings → Build**, check that **Builds for non-production branches** is on,
   and in **Settings → Domains & Routes** that **Preview URLs** is enabled. Branch pushes then get
   their own preview URL, shown on the pull request.

> If the build fails while installing pnpm, add the build variable `PNPM_VERSION` = `12.16.1`
> (the version in `package.json` → `packageManager`).

> If **Settings → Build** says *"This project is disconnected from your Git account"*, pushes won't
> trigger builds. Click **Manage** (or **Disconnect** then **Connect**), sign in to GitHub as the
> repo owner (`HorngFu`) and give the **Cloudflare Workers and Pages** app access to this repo.
> Builds only start on the next push after connecting.

## 2. Add the custom domain

This needs `plantincambodia.org` to be **Active** in your Cloudflare account first
(Phase 0: register it with Cloudflare Registrar, or move its nameservers to Cloudflare).

1. Open the `plant-in-cambodia` Worker → **Settings → Domains & Routes → Add → Custom domain**.
2. Enter `plantincambodia.org` and save. Cloudflare creates the DNS record and the HTTPS
   certificate for you (it can take a few minutes).
3. Add another custom domain: `www.plantincambodia.org`.
4. Redirect `www` to the main domain: go to the domain's dashboard → **Rules → Redirect Rules →
   Create rule → Templates → "Redirect from WWW to root"**, keep **301** and **Preserve query
   string**, then deploy.
5. Open <https://plantincambodia.org>. You should see the "Coming soon" page with a valid padlock.

## Deploying by hand (optional)

You don't normally need this; pushing to `main` deploys. To deploy from your own PC:

```bash
pnpm exec wrangler login
pnpm deploy
```

## Secrets

Never commit secrets. Add them in the Worker's **Settings → Variables and Secrets** (production),
and in `.dev.vars` for local `pnpm preview` (copy `.dev.vars.example`). Keystatic's GitHub secrets
are added in Phase 5.

## Free-tier checks

- Worker size: CI fails if the gzipped worker grows past the free **3 MiB** limit
  (Phase 1 measurement: about 1.1 MiB with Keystatic included).
- Static assets are served free and don't count towards the 100,000 requests/day limit.

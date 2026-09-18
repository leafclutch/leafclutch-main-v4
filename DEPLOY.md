# Deploying to Cloudflare

The site runs on **Cloudflare Workers** via the OpenNext adapter, which supports
the Next.js App Router, server components and dynamic routes.

**Domain:** `leafclutch.com.np` (apex, canonical) · `www.leafclutch.com.np` (redirects to apex)

---

## One-time setup

### 1. Log in

```bash
npx wrangler login
```

### 2. Set the server-only secret

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Paste the value from `.env.local` when prompted.

> The service-role key bypasses all row-level security. It must **never** be a
> `NEXT_PUBLIC_` variable and must never appear in `wrangler.jsonc`.

### 3. Build-time environment variables

This is the part that trips people up. Anything named `NEXT_PUBLIC_*` is
**inlined into the bundle when you build** — setting it as a Worker secret is
too late, because the build already happened.

| Variable | Where it must be set |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | build environment |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | build environment |
| `NEXT_PUBLIC_SITE_URL` | build environment (also in `wrangler.jsonc` vars) |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker secret (runtime) |

Building locally, `.env.local` supplies these automatically. Building on
Cloudflare (Workers Builds / CI), add the three `NEXT_PUBLIC_*` values as
**build variables** in the dashboard.

---

### 4. Create the admin account (do this before you deploy)

The admin panel signs in through Supabase Auth. The hardcoded development
password only works when `NODE_ENV !== 'production'`, so **in production there
is no way in until a real user exists.**

In the Supabase dashboard: **Authentication → Users → Add user**, tick
*Auto Confirm User*, and set an email and password. Then
**Authentication → Providers → Email** and turn *Enable sign-ups* **off**, so
nobody else can create an account.

---

## Building on Cloudflare (Git integration)

If Cloudflare builds from the repository rather than you running `npm run deploy`
locally, set these under **Workers & Pages → leafclutch-website → Settings →
Build**:

| Setting | Value |
|---|---|
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Version / package manager | npm (driven by `package-lock.json`) |

The repository keeps a single lockfile, `package-lock.json`. Do not add a
`pnpm-lock.yaml` or a `yarn.lock` — Cloudflare picks its package manager from
whichever lockfile it finds, and a second, stale one makes the build fail with
`ERR_PNPM_OUTDATED_LOCKFILE` before it ever reaches Next.js.

Remember that the three `NEXT_PUBLIC_*` values from the table above must be
added as **build** variables here, not as Worker secrets.

---

## Deploy

```bash
npm run deploy
```

That builds with OpenNext and pushes to Cloudflare in one step.

To check it locally on the real Workers runtime before shipping:

```bash
npm run preview      # http://localhost:8788
```

`npm run dev` still runs the ordinary Next dev server, which is faster for
day-to-day work. Use `preview` when you want to be sure something behaves the
same on Workers — the runtime is not Node.

---

## Attach the domains

In the Cloudflare dashboard: **Workers & Pages → leafclutch-website → Settings
→ Domains & Routes → Add custom domain**

Add both:

- `leafclutch.com.np`
- `www.leafclutch.com.np`

Cloudflare issues the certificates. `www` is redirected to the apex by a
redirect rule in `next.config.ts`, so both resolve but only one is canonical.

`leafclutch.com.np` must already be a zone in the same Cloudflare account, with
its nameservers pointed at Cloudflare at the registrar.

---

## After the first deploy

1. **Google Search Console** — add `https://leafclutch.com.np`, submit
   `https://leafclutch.com.np/sitemap.xml`
2. **Bing Webmaster Tools** — same
3. **Google Business Profile** — create one for the Siddharthanagar office.
   For "IT company in Bhairahawa" searches this matters more than anything on-site.
4. Confirm `https://leafclutch.com.np/robots.txt` allows crawling — it does in
   this build, but worth checking after DNS settles.

---

## Files involved

| File | Purpose |
|---|---|
| `wrangler.jsonc` | Worker name, compatibility flags, assets, vars |
| `open-next.config.ts` | OpenNext adapter configuration |
| `next.config.ts` | Redirects, including www → apex |
| `src/lib/site.ts` | The canonical site URL, one place |

---

## Notes

**The contact email stays on a different domain.** `info@leafclutchtech.com.np`
is unchanged — only the website moved to `leafclutch.com.np`. Change
`CONTACT_EMAIL` in `src/lib/site.ts` if that is not what you want.

**Leafclutch Academy** in the Others menu still points at
`leafclutchtech.com.np`, which is correct — it is a separate site.

**`nodejs_compat`** is required. The Supabase client and the Next.js server
runtime both need Node APIs that Workers only expose behind that flag.

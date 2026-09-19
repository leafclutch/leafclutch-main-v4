# Security

What is protected, how, and the three things that must be done outside this
repository.

---

## Do these now

### 1. Run `supabase/14security.sql`

**Until this runs, anyone on the internet can take over the site's content.**
Verified against the live project on 19 September 2026:

1. `POST /auth/v1/signup` succeeded for a stranger and returned an access token
   immediately, with no email confirmation.
2. The `on_auth_user_created` trigger gave that account an **active
   `super_admin`** row in `admin_profiles`.
3. Every write policy was `to authenticated using (true)`, so the account could
   insert, edit and delete rows. A test insert into `testimonials` returned
   `201`.

The probe row and account were deleted immediately afterwards.

`14security.sql` requires `public.is_admin()` for every write, creates new
accounts **inactive** with the lowest role, and removes the column privileges
that let an account raise its own `role` or `is_active`.

### 2. Turn off sign-ups

**Authentication → Providers → Email → disable "Enable sign ups".**

This is a project setting, not schema, so the SQL file cannot do it. With
`14security.sql` applied a new account is harmless, but there is no reason to
let strangers create them.

While in there, also enable **leaked password protection** and require
**multi-factor authentication** for the admin account.

### 3. Add rate limiting at Cloudflare

Rate limiting belongs at the edge, in front of the Worker — an application
cannot refuse a request it has already been billed for. In the dashboard under
**Security → WAF → Rate limiting rules**:

| Rule | Match | Limit | Action |
|---|---|---|---|
| Admin brute force | URI Path starts with `/admin` | 10 per 1 min per IP | Block, 10 min |
| Whole site | URI Path starts with `/` | 200 per 1 min per IP | Managed Challenge |
| Sitemap/robots scrapers | URI Path in `/sitemap.xml` `/robots.txt` | 30 per 1 min per IP | Managed Challenge |

Supabase applies its own auth rate limits, but those protect Supabase, not the
Worker. Both are worth having.

---

## What the code already does

### Admin access

- Sign-in goes through Supabase Auth. The built-in development password is
  gated behind `process.env.NODE_ENV !== 'production'`, which the production
  build compiles away — **verified** by attempting it against a production
  build: rejected with "Incorrect email or password."
- `/admin` is disallowed in `robots.txt` and served with
  `X-Robots-Tag: noindex, nofollow`.
- The service-role key is server-only. **Verified** absent from the client
  bundle, absent from the Worker bundle, never committed, and `.env*` is
  ignored by git.

### Database

After `14security.sql`:

- Every write requires an active row in `admin_profiles` via
  `public.is_admin()`.
- Drafts are visible only to admins. Previously anyone merely signed in could
  read unpublished testimonials, blogs, jobs and portfolio entries.
- Contact enquiries and job applications can still be submitted by anyone, but
  only an admin can read them.
- Media uploads, overwrites and deletions require an admin. Reads stay public
  so `<img src>` works without a signed URL. **Verified**: an anonymous upload
  is refused with `new row violates row-level security policy`.

### Injection

- Structured data is written through `src/lib/jsonLd.ts`, which escapes `<`,
  `>`, `&`, U+2028 and U+2029. `JSON.stringify` alone leaves `<` intact, so a
  title containing `</script>` would have closed the tag and let the rest be
  parsed as markup. That content is editable from the admin panel, so it is not
  trusted.
- React escapes interpolated values, and no user content is rendered as raw
  HTML anywhere else.

### Headers

Set in `next.config.ts` so they apply to Worker-rendered HTML, not only to
static assets:

| Header | Value |
|---|---|
| `Content-Security-Policy` | see below |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, payment, usb all denied |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |

The CSP was checked against eleven pages including `/admin` and a product page:
**zero violations, no broken images, fonts still loading**.

Two deliberate loosenings:

- `script-src` includes `'unsafe-inline'`. Next.js inlines its hydration
  payload, and a nonce would have to differ per request, which a prerendered
  page cannot do. The policy still prevents an injected script from loading
  attacker-hosted code, and `object-src 'none'`, `base-uri 'self'` and
  `frame-ancestors 'none'` are all enforced.
- `img-src` allows any `https:` origin, because image URLs are pasted into the
  admin panel and can point anywhere. An image is not executable.

---

## If something looks wrong

Rotate the service-role key in the Supabase dashboard, then update the Wrangler
secret:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Check who holds an account:

```sql
select email, role, is_active, last_login from public.admin_profiles order by created_at;
```

Deactivate one without deleting it:

```sql
update public.admin_profiles set is_active = false where email = '...';
```

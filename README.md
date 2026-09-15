# Leafclutch Technologies Website

Next.js App Router website with a Supabase-backed content admin panel.

## Requirements

- Node.js 22 or newer
- npm or pnpm
- Supabase project credentials in `.env.local`

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the website and `http://localhost:3000/admin` for the admin panel.

## Validation and production

```bash
npm run typecheck
npm run build
npm run start
```

The project uses the Next.js App Router. Public route folders live under `src/app/(site)`, while reusable implementation code lives under `src/features`.

## Source structure

```text
src/
  app/
    (site)/              Public routes and shared public layout
    admin/               Admin route adapter
    components/          Shared layout and UI components
    context/             Client content state and Supabase synchronization
    hooks/               Shared client hooks
    layout.tsx           Root metadata, CSS, and providers
  features/
    home/                Homepage implementation
    services/            Service pages and course data
    admin/               Admin panel implementation
  lib/                   External clients such as Supabase
  imports/               Local image assets
```

Keep `page.tsx` and `layout.tsx` files inside `src/app` because their locations define the URL and layout contracts. Service IDs are also URL slugs and Supabase identifiers, so change them only with a data migration.

## Supabase

The schema is in `supabase-schema.sql`. It includes the `image` column on `service_features`. The reset script drops the content tables, so use it only for a new or intentionally reset project. For an existing database, apply only the required migration and preserve existing rows.

The admin panel requires a Supabase Auth session to persist content changes. The local fallback password is for local access only.
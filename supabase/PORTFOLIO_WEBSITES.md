# Portfolio websites

Run `portfolio-websites.sql` in the same Supabase project used by the app. The migration is repeatable and creates the `portfolio_websites` table, owner-only read policy, publication RPCs, and the public `portfolio-images` bucket. Existing PDF portfolios are preserved in account-scoped browser storage.

## Behavior

- Dashboard → Portofolio → Website online has three templates: Bento, Editorial, Midnight.
- Basic users can prepare a browser-local draft and preview templates. Active Plus users can upload images, save the draft to their account, and publish one website at `/p/{slug}`.
- Plus eligibility uses `auth.users.raw_app_meta_data`, following `PLUS_ACCESS.md`. The server API and database independently check eligibility; client-side flags cannot grant publishing rights.
- Publishing copies the draft into a separate live snapshot. Saving a draft leaves the live snapshot intact. The owner can unpublish even after Plus expires. Public reads recheck current Plus eligibility and return no draft data.
- Slugs are unique, 3–40 lowercase letters/digits/hyphens, with a reserved-name list. Renaming a live site requires publishing the change or taking it offline first. Old URLs then return 404.
- SEO title, description, canonical, Open Graph, and Twitter metadata are rendered on the server. Public pages are dynamic so unpublishing and entitlement changes take effect on the next request.
- Images are resized in the browser to at most 1800 pixels and converted to WebP; server uploads enforce a 2 MB limit, raster signatures, and active Plus ownership. SVG is rejected. Images use random immutable paths in a **public** bucket: removing an image from a draft does not delete its uploaded file or change a live snapshot. Avoid uploading confidential images. The API currently caps uploads at 100 files per account; admins can remove unused files in Supabase Storage.

## Validation

`node --test tests/portfolio-web.test.cjs` covers document validation, URL handling, image ownership, slug rules, auth/Plus/origin enforcement, publication actions, and slug conflicts.

Database checks should run in a transaction that is rolled back: use temporary synthetic auth users to verify draft privacy, snapshot isolation, cross-account RLS, unique slugs, direct Basic RPC denial, expiry handling, and unpublishing after expiry. Never modify real users' plans for testing.

The app needs the existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; no service-role key is required. Configure `NEXT_PUBLIC_SITE_URL` with the real production domain for canonical links.

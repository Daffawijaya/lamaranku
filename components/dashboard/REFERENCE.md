# Dashboard reference

Source: `D:/Gawe/Web/laporaja/src`.

- `glass/liquid-glass-sidebar.*`: original sidebar indicator and refraction animation.
- `glass/mobile-bottomnav.tsx`, `glass/mobile-glass-nav.css`, and
  `glass/liquid-glass-tabs.css`: original mobile navigation. Role-specific routes
  were replaced with the items from `navigation.ts`.
- `lib/dashboard/liquid-glass.ts`: original standalone glass engine.
- `RefListCard.tsx`: original list card, with a local class-name join helper.
- `reference.css`: original used chrome/card rules extracted from `app/globals.css`.
- Typography uses the app's existing `--font-myriad` font, matching the landing page.
- `public/fxfilter/FxFilter.js`: original bundled navbar filter runtime.

`DashboardShell`, `DashboardHeader`, and `DashboardNavigation` keep the reference
layout geometry while using Lamaranku authentication, search, and feature routes.
Theme classes remain inside the dashboard. Content counts read existing local
storage; no report statistics or sample activity from Laporaja are copied.

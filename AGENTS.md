# BiletFlow Frontend

Web app for BiletFlow, a self-service event ticketing platform for Kazakhstan (attendees, organizers, platform admins). The ticket-verification app for Event Admins is a separate React Native project and is **not** part of this repo.

## Stack

- React 19 + TypeScript, Vite
- React Router v7 (data router, `createBrowserRouter`), imported from `react-router`
- Tailwind CSS v4 (via `@tailwindcss/vite`; no `tailwind.config`, entry is `src/app/styles/index.css`)
- oxlint + Steiger (FSD linter)

## Commands

- `npm run dev`: dev server
- `npm run build`: typecheck + production build
- `npm run typecheck`: `tsc -b` only
- `npm run lint`: oxlint + Steiger
- `npm run lint:fsd`: Steiger only

## Zero lint errors

**No lint, type or FSD errors are allowed.** After any change, run `npm run lint` and `npm run build`. Both must pass with no errors before the work counts as done. Fix the cause. Never silence it with `eslint-disable`/`oxlint-disable` comments, `@ts-ignore`/`@ts-expect-error`, `any`, or by disabling or loosening rules in `.oxlintrc.json`, `steiger.config.ts` or `tsconfig`. If a rule seems wrong, ask first.

## Architecture: strict Feature-Sliced Design

We follow [Feature-Sliced Design](https://feature-sliced.design) **strictly**. Steiger enforces it.

### Layers (top → bottom)

```
src/
  app/       app init: providers, router, layouts, global styles (no slices)
  pages/     one slice per route/screen
  widgets/   large self-contained UI blocks composed from features/entities
  features/  user interactions that bring business value (verbs)
  entities/  business entities (nouns)
  shared/    reusable, business-agnostic code (no slices)
```

`processes/` is deprecated. Don't use it.

### Rules

1. **Imports go downward only.** A module may import only from layers strictly below it (`shared` imports nothing from other layers). No upward imports.
2. **No cross-imports between slices on the same layer.** `features/checkout` must not import `features/apply-promo-code`. Compose them one layer up (widget or page). The only exception is entity-to-entity, through the `@x` public API (`entities/order/@x/ticket.ts`).
3. **Public API only.** Every slice exposes an `index.ts`, and code outside the slice imports only from it (`@/entities/event`, never `@/entities/event/ui/EventCard`). `shared` exposes one `index.ts` per segment or sub-module (`@/shared/ui/placeholder-page`, `@/shared/api`).
4. **Inside a slice, use relative imports.** Across slices/layers, use the `@/` alias (`@/` → `src/`).
5. **Segments are named by purpose,** not by type: `ui`, `model`, `api`, `lib`, `config`. No `components/`, `hooks/`, `types/`, `utils/` folders.
6. **`app` and `shared` have no slices,** only segments.
7. **Slice names are kebab-case.** Components are PascalCase files with named exports (no default exports).
8. **Don't create a slice before it's needed.** Code used by only one page stays in that page slice. Extract it to a lower layer when a second consumer appears.
9. **`shared` stays domain-free.** No event, ticket, order or other business concepts in `shared`.

### Where BiletFlow code goes

- **entities**: `user`, `organizer`, `event`, `venue`, `seat`, `ticket-type`, `order`, `ticket`, `payment`, `refund`, `campaign`, `support-case`, `audit-log`, `check-in`
- **features** (verb-named): e.g. `auth-by-email`, `register-for-free-event`, `checkout`, `select-seat`, `apply-promo-code`, `activate-paid-sales`, `refund-order`, `cancel-registration`, `assign-event-admin`, `send-support-message`, `export-to-calendar`, `download-ticket-pdf`, `duplicate-event`, `suspend-event`
- **widgets**: e.g. `seat-map`, `event-activity-timeline`, `organizer-sales-chart`, `ticket-inventory-summary`, `support-thread`
- **pages**: one per route in `src/app/router/router.tsx` (e.g. `event-details`, `checkout`, `organizer-dashboard`, `admin-users`)

### Routing

- All routes are defined in `src/app/router/router.tsx`. Route layouts live in `src/app/layouts/`.
- Unimplemented routes render `PlaceholderPage` from `@/shared/ui/placeholder-page`. When implementing one, create a slice in `src/pages/<name>/` and swap the placeholder for it in the router.

## Domain constraints (from the SRS)

- Currency is KZT. UI locales are Kazakh and Russian, with English as an additional locale.
- Payments, activation fees and payouts are **simulated or sandboxed**. Any demonstration payment must be clearly labelled as such in the UI.
- The client never trusts discount or price values. Promo and campaign tokens are opaque and validated by the server.
- Seat maps and event pages target WCAG 2.1 AA: never use color alone to show status, and always add text or symbol labels.

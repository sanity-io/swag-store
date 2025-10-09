# Attribution Flow Overview

This document outlines the new first-click attribution pipeline spanning the Hydrogen storefront, the Sanity dataset, and the Attribution Sanity App.

## Front-end capture (Hydrogen app)

- `app/lib/attribution.ts` persists the first landing context in `localStorage` (`sq_attribution_first_click`).
  - Captures UTM parameters, landing URL, referrer, page slug/title, and generates a session ID.
  - The data is recorded the first time a visitor hits a `page` route (`($locale).pages.$handle.tsx`) and is reused across navigation.
- `CartCheckout` now calls `sendCheckoutAttributionEvent` before redirecting to Shopify checkout.
  - Sends the stored landing payload plus the current cart totals/lines to `/api/attribution-event` via `navigator.sendBeacon` (fallback to `fetch` with `keepalive`).

## API route (`/api/attribution-event`)

- Implemented in `app/routes/api.attribution-event.ts`.
- Validates the payload, derives useful defaults, and creates an `attributionEvent` document in Sanity using `context.env.SANITY_API_TOKEN`.
- Required environment values (already used elsewhere in the project):
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_VERSION`
  - `SANITY_API_TOKEN` (must allow document writes).

## Sanity schema

- `sanity/schemaTypes/documents/attributionEvent.ts` defines the new document type, referencing landing pages and capturing totals, line items, and UTM metadata.
- Supporting object types:
  - `attributionMoney` for normalized money values.
  - `attributionLineItem` for line-level detail.
  - `attributionUtmParam` for key/value UTM pairs.

## Attribution Sanity App (`sanity-apps/attribution`)

- `AttributionProvider` now queries the new documents, summarises totals by page and UTM source, and exposes them via context.
- Dashboard updates:
  - Metrics overview surfaces total attributed value, event counts, and leaders.
  - Recent events list shows latest checkouts with captured UTMs.
  - Top pages and UTM sources highlight where value concentrates.

## Testing the flow locally

1. Start both projects (example using `pnpm`):
   - `pnpm --filter web dev`
   - `pnpm --filter sanity-apps/attribution dev`
2. Visit a landing page with UTM parameters, e.g. `http://localhost:3000/en/pages/example?utm_source=google&utm_campaign=test`.
3. Add items to the cart and proceed to checkout from the cart drawer/footer (the event fires on click).
4. Confirm an `Attribution Event` document appears in Sanity Studio (or via `sanity dataset query`), with the page reference and cart totals populated.
5. Refresh the Attribution app — the new event should appear in “Recent Attribution Events”, and the page/UTM aggregates should update.

## Deployment considerations

- Ensure the runtime environment exposes the same Sanity credentials with write access.
- The API route trusts requests from the storefront; if exposing publicly, consider adding rate limits or lightweight verification (e.g. signed headers).
- The attribution store retains data in `localStorage` for 30 days; clearing storage or rotating session IDs will reset first-click tracking.

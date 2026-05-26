# Bubbly Handmade Workshop — Design Changelog

## Phase 2 — Checkout + Payments (2026-05-25)

### Added / Changed (Session 4)

**Square Web Payments SDK Integration** (`assets/js/checkout.js`)
- Dynamic SDK loading: checkout.js now loads Square Web SDK on-demand from `BUBBLY_CONFIG.squareWebSdkUrl` — no static `<script>` tag needed
- SDK preload on DOMContentLoaded for faster checkout open
- Proper `Square.payments()` initialization with sandbox/production credentials

**Payment Flow Fixes**
- Fixed parameter mismatch between checkout.js and api.js:
  - `email` → `emailAddress`, `firstName` → `givenName`, `lastName` → `familyName`
  - `amount` → `amountCents` (correct field for api.js createPayment)
  - Currency corrected from `'USD'` to `'CAD'`
- Payment note now includes cart item details

**Checkout UX Improvements**
- Loading spinner animation on Pay button during processing (CSS spinner replaces text)
- Field-level validation with inline error messages below each input
- Bilingual checkout labels (EN/中文) — self-contained, no dependency on app.js `t()` function
- HTML entity escaping for product names in order summary (XSS prevention)
- Proper form reset on modal re-open (clears errors, resets button state)
- Error categorization: network errors, payment failures, and tokenization errors each show appropriate bilingual messages

**shop.html Updates**
- `bubblyAPI.init({ payments: true })` — was `false`, now correctly initializes Square Payments SDK on shop page

### Architecture Notes
- checkout.js is a self-contained IIFE with its own bilingual label system
- Square SDK is loaded once and cached (`sdkLoadPromise` pattern)
- Demo mode still works: if SDK fails to load, checkout falls back to pre-filled test card UI
- Card form is destroyed on modal close and re-created on open (prevents stale payment state)

### What's Next (Phase 3)
- Deploy Cloudflare Worker proxy for server-side Square API auth
- Wire up real Square Catalog service IDs to workshop types
- Add order confirmation emails via Square
- Newsletter subscription via Square customer groups
- Loyalty program integration

---

## Phase 1 Complete — Workshop Booking System (2026-05-25)

### Added (Sessions 1-3: Bubbly Backbone Build)

**Square Integration Layer**
- `assets/js/config.js` — Environment-aware config (sandbox/production auto-detection by hostname)
- `assets/js/api.js` — `bubblyAPI` abstraction layer: bookings, catalog, payments, customers, loyalty
- Custom `BubblyError` class with bilingual error messages (EN/中文)
- Request timeout handling with `AbortController`
- Rate limit detection (HTTP 429)
- Worker health check on init
- Input validation (email, phone, customer info)
- Loading state helper for button disable/spinner
- `assets/js/checkout.js` — Square Web Payments checkout modal with demo fallback

**Workshop Booking Widget** (`workshops.html` + `assets/js/booking.js`)
- 3 workshop types: Artisan Soap Making, Soy Candle Pouring, Wax Melt Workshop
- Multi-step booking flow: Date/Time → Your Info → Confirmation
- Interactive calendar with availability dots and month navigation
- Time slot grid with live spot counts and sold-out states

**Edge Case Handling (Session 3)**
- Timezone support, double-booking prevention, payment/network failure retry
- Sold-out slot display, calendar range limits, cancellation flow
- Fallback definitions for `showFieldError`/`clearFieldError`

**CI/CD**
- `.github/workflows/sync-catalog.yml` — GitHub Action to sync Square Catalog → `products.json`

---

## Session 5 — Real Photos + Full-Site Feature Pass (2026-05-24)

### Added
- Product images from Unsplash for all 14 products in `products.json`
- Instagram handle updated to `@bubbly._studio`
- `prefers-reduced-motion` support

### Fixed
- HTML tag mismatches on sub-pages
- Cart drawer ARIA attributes

## v2.0 — Design Overhaul (May 2026)
- Figtree + Young Serif typography
- OKLCH color palette (terracotta/warm linen/dusty teal)
- Accessibility hardening (focus-visible, skip link, ARIA)
- Scroll animations, cart drawer, delight interactions

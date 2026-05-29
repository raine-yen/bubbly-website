# Bubbly Handmade Workshop — Design Changelog

## Phase 4 — Loyalty + Social (2026-05-29) ✅ PROJECT COMPLETE

### Added (Session 10: Final Integration + QA)

#### Instagram Feed Integration (`assets/js/bubbly-instagram.js`)
- Dynamic Instagram feed on homepage via Cloudflare Worker proxy
- Fallback to curated content (6 posts) when API unavailable
- Clickable grid linking to @bubbly._studio Instagram profile
- Lazy loading for off-screen images, eager loading for first 2
- Staggered fade-in animation on grid items

#### Post-Purchase Review System (`assets/js/bubbly-reviews.js` + `assets/css/bubbly-reviews.css`)
- Review collection modal triggered after order completion
- Interactive 5-star rating with keyboard accessibility
- Bilingual review form (EN/中文) with validation
- Reviews stored via Cloudflare Worker KV + localStorage fallback
- Dynamic testimonials section populated from live + seed reviews
- Language change observer for automatic re-render
- URL param trigger: `?review=true&product=ProductName`
- Worker routes: `GET /reviews`, `POST /reviews` with sanitization + KV storage

#### Documentation
- `BACKBONE-README.md` — Full Square integration architecture documentation
- Updated CHANGELOG with complete Phase 3 + 4 entries

### Added (Session 9: Loyalty Program)
- `assets/js/bubbly-loyalty.js` — Square Loyalty integration (points, tiers, rewards)
- `assets/css/bubbly-loyalty.css` — Loyalty UI styles (OKLCH palette)
- Worker loyalty routes: program, accounts, points, rewards (9 endpoints)
- 4 reward tiers: Free Soap Sample (100pts), Workshop Discount (250pts), Free Candle (500pts), VIP Gift Box (1000pts)
- 2x bonus points on workshop bookings
- Bilingual EN/中文 loyalty UI

### Added (Session 8: Campaign Templates + Automation)
- Email campaign templates for product launches, seasonal drops, workshop promos
- Square Marketing API integration for automated campaigns
- Customer segmentation by purchase history and engagement

### Added (Session 7: Newsletter + Customer Groups)
- Newsletter email capture on homepage → Square Customers API
- Customer group management (VIP, Workshop Attendees, Newsletter)
- Worker routes for customer create/update/group management

---

## Phase 2 — Checkout + Payments (2026-05-25)

### Added / Changed (Session 4)

#### Square Web Payments SDK Integration (`assets/js/checkout.js`)
- Dynamic SDK loading: checkout.js now loads Square Web SDK on-demand from `BUBBLY_CONFIG.squareWebSdkUrl` — no static `<script>` tag needed
- SDK preload on DOMContentLoaded for faster checkout open
- Proper `Square.payments()` initialization with sandbox/production credentials

#### Payment Flow Fixes
- Fixed parameter mismatch between checkout.js and api.js:
  - `email` → `emailAddress`, `firstName` → `givenName`, `lastName` → `familyName`
  - `amount` → `amountCents` (correct field for api.js createPayment)
  - Currency corrected from `'USD'` to `'CAD'`
- Payment note now includes cart item details

#### Checkout UX Improvements
- Loading spinner animation on Pay button during processing
- Field-level validation with inline error messages
- Bilingual checkout labels (EN/中文) — self-contained
- HTML entity escaping for product names (XSS prevention)
- Proper form reset on modal re-open

#### shop.html Updates
- `bubblyAPI.init({ payments: true })` — correctly initializes Square Payments SDK

---

## Phase 1 Complete — Workshop Booking System (2026-05-25)

### Added (Sessions 1-3: Bubbly Backbone Build)

#### Square Integration Layer
- `assets/js/config.js` — Environment-aware config (sandbox/production auto-detection)
- `assets/js/api.js` — bubblyAPI abstraction: bookings, catalog, payments, customers, loyalty
- `assets/js/checkout.js` — Square Web Payments checkout modal with demo fallback

#### Workshop Booking Widget
- 3 workshop types with multi-step booking flow
- Interactive calendar with availability dots and month navigation
- Time slot grid with live spot counts

#### CI/CD
- `.github/workflows/sync-catalog.yml` — GitHub Action to sync Square Catalog → products.json

---

## Session 5 — Real Photos + Full-Site Feature Pass (2026-05-24)

### Added
- Product images from Unsplash for all 14 products
- Instagram handle updated to @bubbly._studio
- `prefers-reduced-motion` support

---

## v2.0 — Design Overhaul (May 2026)
- Figtree + Young Serif typography
- OKLCH color palette (terracotta/warm linen/dusty teal)
- Accessibility hardening (focus-visible, skip link, ARIA)
- Scroll animations, cart drawer, delight interactions

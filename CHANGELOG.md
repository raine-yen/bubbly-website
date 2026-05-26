# Bubbly Handmade Workshop — Design Changelog

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
  - Card form rendering via Square SDK
  - Demo mode with pre-filled test card when SDK unavailable
  - Order summary from cart, bilingual labels
  - Payment error handling with inline messages

**Workshop Booking Widget** (`workshops.html` + `assets/js/booking.js`)
- 3 workshop types: Artisan Soap Making, Soy Candle Pouring, Wax Melt Workshop
- Multi-step booking flow: Date/Time → Your Info → Confirmation
- Interactive calendar with availability dots and month navigation
- Time slot grid with live spot counts and sold-out states
- Customer info form with inline validation
- Booking confirmation with reference number and details
- Graceful demo mode when Square worker not deployed

**Edge Case Handling (Session 3)**
- Timezone support: detects user timezone, shows workshop times in Pacific Time with local time conversion
- Double-booking prevention: `isSubmitting` guard, conflict detection from API, auto-redirect to re-pick slot
- Payment/network failure: retry mechanism (max 2 retries) with error UI and bilingual messages
- Sold-out slot display: disabled buttons with "Sold Out" label
- Calendar range limits: no past dates, max 3 months ahead
- Consistent demo slots: seeded random for deterministic slot generation (no flicker on re-render)
- Cancellation flow: confirm dialog → API call → cancellation confirmation UI
- Fallback definitions for `showFieldError`/`clearFieldError` if not loaded from app.js

**CI/CD**
- `.github/workflows/sync-catalog.yml` — GitHub Action to sync Square Catalog → `products.json`
  - Daily schedule (6 AM UTC / 11 PM PT)
  - Manual trigger with sandbox/production environment selector
  - Preserves bilingual fields from existing products.json
  - Auto-commit only when changes detected

### Architecture Notes
- All Square API calls route through Cloudflare Worker proxy (server-side auth)
- Client-side Square Web SDK used only for payment form rendering
- Demo mode fallback throughout: booking widget, checkout, and API layer all gracefully degrade
- No build step required: vanilla HTML/CSS/JS, static hosting on GitHub Pages

### What's Next (Phase 2: Checkout + Payments)
- Deploy Cloudflare Worker proxy for server-side Square API auth
- Wire up real Square Catalog service IDs to workshop types
- Integrate Square Web Payments SDK for workshop deposit collection
- Add order confirmation emails via Square
- Product checkout flow on shop.html

---

## Session 5 — Real Photos + Full-Site Feature Pass (2026-05-24)

### Added
- Product images from Unsplash for all 14 products in `products.json` (image field with emoji fallback)
- Real product photography in product cards, cart drawer, quick-view modal, and search results
- Instagram grid on homepage now shows real product photos instead of emoji placeholders
- About preview section features artisan workshop photo
- Workshop page: class details section (duration, take-home items, pricing) with SVG icons
- Contact page: inline SVG icons replacing emoji (email, Instagram, location)
- About page: inline SVG icons for value cards (Pure, Craft, Eco) replacing emoji
- `prefers-reduced-motion` support: disables all animations when user prefers reduced motion
- Self-contained preview files for all 5 pages (bubbly-preview-*.html)

### Changed
- Instagram handle updated from `@bubblyhandmadeworkshopmandy` to `@bubbly._studio` across all pages and JS
- Product cards now render `<img>` when image URL exists, falling back to emoji span
- Cart items display product thumbnails instead of emoji
- Quick-view modal shows product photos
- Search results show product photos

### Fixed
- `<button class="nav-cart">` was incorrectly closed with `</div>` on sub-pages (about, shop, workshops, contact)
- `<h4>` tags in contact info cards were closed with `</h3>` — fixed to proper `</h4>`
- Cart drawer on sub-pages now uses `<aside>` with proper ARIA attributes (role="dialog", aria-label)
- Cart overlay on sub-pages now has `role="presentation"`

## v2.0 — Design Overhaul (May 2026)

### Typography
- **Replaced**: Inter (body) + Quicksand (headings)
- **New**: Figtree (body) + Young Serif (headings)
- Fluid type scale using `clamp()` with 1.333 ratio
- `text-wrap: balance` on headings, `text-wrap: pretty` on prose
- Semantic type tokens (`--text-xs` through `--text-lg`)

### Color
- **Replaced**: Pink/cream/sage/gold reflex palette
- **New**: Terracotta/warm linen/dusty teal in OKLCH color space
- Zero pure white (`#fff`) or pure black (`#000`) anywhere
- All neutrals tinted warm toward brand hue
- Strategy: "soft but not obvious" — warm and natural without being guessable as "soap website"

### Layout
- Hero: replaced 4 identical emoji cards with single featured product photo
- Testimonials: replaced 3 identical cards with prominent pullquote + secondary layout
- Removed emoji prefixes from all section tags
- Added asymmetric compositions and varied spacing with `clamp()`
- Moved inline styles to CSS classes

### Accessibility
- Interactive elements: proper `button` elements with `aria-label`
- Cart drawer: semantic `aside` with `role="dialog"`
- Cart count: `aria-live="polite"` for screen reader announcements
- Menu toggle: `aria-expanded` state management
- Contact form: `for`/`id` label associations, `autocomplete` attributes
- Focus indicators: `focus-visible` with gold outline
- Skip link for keyboard navigation
- Heading hierarchy: no skipped levels (h1 > h2 > h3)

### Performance
- Nav underline: `width` transition replaced with `transform: scaleX()` (no layout thrashing)
- Progress bar: `width` replaced with `transform` transition
- Hero image: `loading="eager"` for above-fold content

### Hardening
- Inline form validation with bilingual error messages (EN + 中文)
- Newsletter form: success state feedback
- Empty search results: friendly empty state
- Button disabled states during async operations
- Double-submit prevention on checkout
- Text overflow protection on product/cart item names
- `@media (prefers-reduced-motion: reduce)` — all animations disabled

### Delight
- Logo bubble: gentle floating animation
- Hero: staggered entrance with exponential ease-out
- Product cards: image scale on hover with spring curve
- Sections: scroll-triggered reveal animations
- Testimonial: decorative opening quotation mark
- Newsletter input: focus glow ring
- Toast: spring-curve slide animation
- Cart drawer: smooth exponential slide
- Add-to-cart: tactile press scale

### What's Next
- Source real product photography from Mandy (replacing Unsplash hero + emoji placeholders)
- Implement Stripe checkout integration
- Add product detail pages (individual product views)
- Workshop page: add class details, pricing, duration before Calendly embed
- FAQ page with shipping info and return policy
- Bilingual Calendly integration or custom booking flow

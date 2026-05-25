# Bubbly Handmade Workshop — Design Changelog

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

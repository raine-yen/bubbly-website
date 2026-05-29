# Bubbly Backbone — Square Integration Architecture

## Overview

The "Bubbly Backbone" is the Square-powered backend that transforms [thebubblystudio.com](https://thebubblystudio.com) from a static GitHub Pages site into a full e-commerce + booking platform. All Square API calls are proxied through a Cloudflare Worker to keep credentials server-side.

## Architecture

```
┌──────────────────────────────────────────────────┐
│  GitHub Pages (thebubblystudio.com)               │
│  ├── index.html      (homepage + IG feed)         │
│  ├── shop.html       (products + checkout)        │
│  ├── workshops.html  (booking calendar)           │
│  ├── contact.html    (contact form → CRM)         │
│  └── about.html      (static)                     │
│                                                    │
│  Client JS:                                        │
│  ├── config.js       (env detection)               │
│  ├── api.js          (bubblyAPI abstraction)       │
│  ├── booking.js      (workshop booking flow)       │
│  ├── checkout.js     (Square Web Payments)         │
│  ├── bubbly-instagram.js  (IG feed)                │
│  ├── bubbly-reviews.js    (review collection)      │
│  ├── bubbly-loyalty.js    (loyalty program)        │
│  └── enhancements.js (animations, UX polish)       │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────┐
│  Cloudflare Worker (bubbly-api.workers.dev)       │
│  ├── /bookings/*     → Square Bookings API        │
│  ├── /catalog/*      → Square Catalog API         │
│  ├── /payments/*     → Square Payments API        │
│  ├── /customers/*    → Square Customers API       │
│  ├── /loyalty/*      → Square Loyalty API         │
│  ├── /reviews        → Cloudflare KV storage      │
│  ├── /newsletter     → Square Customer Groups     │
│  └── /instagram/feed → Instagram oEmbed proxy     │
│                                                    │
│  Secrets: SQUARE_ACCESS_TOKEN                      │
│  KV: BUBBLY_REVIEWS                                │
└────────────────────┬─────────────────────────────┘
                     │ HTTPS
                     ▼
┌──────────────────────────────────────────────────┐
│  Square APIs (sandbox → production)               │
│  ├── Bookings     (workshop scheduling)           │
│  ├── Catalog      (product inventory)             │
│  ├── Payments     (Web Payments SDK)              │
│  ├── Customers    (CRM + groups)                  │
│  ├── Loyalty      (points + rewards)              │
│  └── Marketing    (email campaigns)               │
└──────────────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `assets/js/config.js` | Detects sandbox vs production by hostname. Stores worker URL, Square app ID, location ID. |
| `assets/js/api.js` | `bubblyAPI` — unified abstraction over all Square APIs. Handles auth, timeouts, rate limits, bilingual errors. |
| `assets/js/booking.js` | Multi-step workshop booking: calendar → time slots → customer info → payment → confirmation. |
| `assets/js/checkout.js` | Square Web Payments SDK integration. Loads SDK dynamically, tokenizes cards, processes payments. Demo mode fallback. |
| `assets/js/bubbly-instagram.js` | Instagram feed on homepage. Tries worker proxy, falls back to curated Unsplash content. |
| `assets/js/bubbly-reviews.js` | Post-purchase review collection + testimonials display. Modal with star rating, bilingual. |
| `assets/js/bubbly-loyalty.js` | Square Loyalty: points display, enrollment, reward redemption. 4 tiers. |
| `assets/css/bubbly-reviews.css` | Review modal + card styles (OKLCH palette). |
| `assets/css/bubbly-loyalty.css` | Loyalty UI styles. |
| `data/products.json` | Product catalog synced from Square via GitHub Action. |
| `.github/workflows/sync-catalog.yml` | Nightly sync: Square Catalog → products.json. |

## Environment Detection

`config.js` auto-detects the environment:
- **Production**: hostname is `thebubblystudio.com` or `www.thebubblystudio.com`
- **Sandbox**: everything else (localhost, GitHub Pages preview)

Sandbox uses Square sandbox credentials; production uses live credentials via the Cloudflare Worker.

## Bilingual Support

All user-facing strings support EN and 中文 (Traditional Chinese) via:
- `data-i18n` attributes on HTML elements (toggled by `toggleLang()` in app.js)
- Self-contained i18n objects in checkout.js, booking.js, reviews.js, loyalty.js
- Language detection: `document.documentElement.lang` or body class

## Deployment Checklist

### First-time setup:
1. Create Square Developer account + application
2. Deploy Cloudflare Worker: `npx wrangler deploy`
3. Set secret: `npx wrangler secret put SQUARE_ACCESS_TOKEN`
4. Create KV namespace: `npx wrangler kv:namespace create BUBBLY_REVIEWS`
5. Update `config.js` with worker URL, Square app ID, location ID
6. Create products in Square Dashboard
7. Set up Square Loyalty program in Dashboard (~$45/mo or included in Square Plus)
8. Push to GitHub → auto-deploys via GitHub Pages

### Ongoing:
- Products sync nightly via GitHub Action
- Reviews stored in Cloudflare KV (auto-managed)
- Monitor Square Dashboard for orders, bookings, loyalty activity

## Phase Summary

| Phase | Sessions | What was built |
|-------|----------|---------------|
| 1 | S1-S3 | Square SDK setup, bubblyAPI, workshop booking, deploy |
| 2 | S4-S6 | Catalog sync, Web Payments checkout, order flow |
| 3 | S7-S8 | Newsletter capture, customer groups, campaign templates |
| 4 | S9-S10 | Loyalty program, Instagram feed, reviews, final QA |

## Cost Considerations

- **GitHub Pages**: Free
- **Cloudflare Worker**: Free tier (100K requests/day)
- **Square**: Free for payments (2.9% + 30¢ per transaction)
- **Square Loyalty**: ~$45/mo (or included in Square Plus plan)
- **Custom domain**: ~$12/yr via any registrar

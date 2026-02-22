# 🫧 Bubbly Handmade Workshop — Website

A minimal, modern, and friendly e-commerce website for Bubbly Handmade Workshop by Mandy.

## Quick Start

Just open `index.html` in your browser! No build tools needed.

```bash
# Or use a local server for best results:
cd bubbly-website
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## Pages
- **Home** (`index.html`) — Hero, featured products, about preview, Instagram feed
- **Shop** (`shop.html`) — Full product grid with category filters
- **About** (`about.html`) — Mandy's story and brand values
- **Contact** (`contact.html`) — Contact form + info cards

## Features
- 🛒 Shopping cart with localStorage persistence
- 🌐 Bilingual (English / 中文) with one-click toggle
- 💳 Stripe Checkout ready (add your API key in `app.js`)
- 📱 Fully responsive (mobile-first)
- ✨ Smooth animations and hover effects
- 🎨 Soft pink/cream/sage color palette
- 📦 Product data in `data/products.json` (easy to update)

## Stripe Setup
1. Create a [Stripe account](https://stripe.com)
2. Add your products in the Stripe Dashboard
3. Replace the `checkout()` function in `assets/js/app.js` with your Stripe Checkout Session creation
4. Add your publishable key

## Customization
- **Colors:** Edit CSS custom properties in `assets/css/style.css`
- **Products:** Edit `data/products.json`
- **Text/Translations:** Edit the `i18n` object in `assets/js/app.js`
- **Images:** Replace placeholder emoji with real product photos in `assets/images/`

## Hosting
This is a static site — host it anywhere:
- Netlify (drag & drop)
- Vercel
- GitHub Pages
- Squarespace (via custom code injection)
- Any web server

/**
 * Bubbly Instagram Feed Integration
 * Uses Instagram oEmbed via Cloudflare Worker proxy, with curated static fallback.
 * @bubbly._studio
 */

const BubblyInstagram = (() => {
  'use strict';

  // Config
  const INSTAGRAM_HANDLE = 'bubbly._studio';
  const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
  const MAX_POSTS = 6;
  const GRID_SELECTOR = '.insta-grid';

  // Curated fallback posts (real Bubbly content descriptions + Unsplash stand-ins)
  const FALLBACK_POSTS = [
    {
      img: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80',
      alt: 'Rose petal handmade soap with dried botanicals',
      caption: 'Our Rose Petal Dream soap — every bar tells a story 🌹🫧'
    },
    {
      img: 'https://images.unsplash.com/photo-1605264964528-06403738d6dc?auto=format&fit=crop&w=400&q=80',
      alt: 'Handcrafted lavender candles in amber jars',
      caption: 'Lavender Serenity candles, poured with love 💜'
    },
    {
      img: 'https://images.unsplash.com/photo-1636137882424-75276c6f4e5e?auto=format&fit=crop&w=400&q=80',
      alt: 'Workshop scene with soap-making supplies',
      caption: 'Weekend workshop vibes — so much fun making soap together! 🧼✨'
    },
    {
      img: 'https://images.unsplash.com/photo-1711207354615-5b4c454fce1b?auto=format&fit=crop&w=400&q=80',
      alt: 'Wax melts with dried flowers arranged artfully',
      caption: 'New spring collection dropping next week 🌸'
    },
    {
      img: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=400&q=80',
      alt: 'Gift set of artisanal soaps in kraft paper box',
      caption: 'The perfect handmade gift set for someone special 🎁'
    },
    {
      img: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=400&q=80',
      alt: 'Close-up of botanical soap bars stacked',
      caption: 'Small batch, big love. Every bar handcrafted in our studio 🫧'
    }
  ];

  /**
   * Render the Instagram grid with posts
   */
  function renderGrid(posts) {
    const grid = document.querySelector(GRID_SELECTOR);
    if (!grid) return;

    grid.innerHTML = '';

    posts.slice(0, MAX_POSTS).forEach((post, i) => {
      const item = document.createElement('div');
      item.className = 'insta-item';
      item.style.animationDelay = `${i * 0.1}s`;

      const link = document.createElement('a');
      link.href = post.permalink || INSTAGRAM_URL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', post.caption || `Instagram post ${i + 1}`);

      const img = document.createElement('img');
      img.src = post.img || post.media_url;
      img.alt = post.alt || post.caption || 'Bubbly Studio Instagram post';
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';

      const overlay = document.createElement('div');
      overlay.className = 'insta-overlay';
      overlay.innerHTML = '♡';

      link.appendChild(img);
      link.appendChild(overlay);
      item.appendChild(link);
      grid.appendChild(item);
    });
  }

  /**
   * Try fetching live posts from Cloudflare Worker proxy
   */
  async function fetchLivePosts() {
    try {
      if (typeof bubblyAPI !== 'undefined' && bubblyAPI.config && bubblyAPI.config.workerUrl) {
        const resp = await fetch(`${bubblyAPI.config.workerUrl}/instagram/feed`, {
          signal: AbortSignal.timeout(5000)
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.posts && data.posts.length > 0) {
            return data.posts;
          }
        }
      }
    } catch (e) {
      console.log('[Bubbly IG] Live feed unavailable, using curated content');
    }
    return null;
  }

  /**
   * Initialize the Instagram feed
   */
  async function init() {
    const grid = document.querySelector(GRID_SELECTOR);
    if (!grid) return;

    // Try live feed first, fall back to curated
    const livePosts = await fetchLivePosts();
    renderGrid(livePosts || FALLBACK_POSTS);
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, renderGrid };
})();

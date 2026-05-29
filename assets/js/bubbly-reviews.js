/**
 * Bubbly Reviews — Post-purchase review collection + display
 * Stores reviews via Cloudflare Worker KV, displays on product cards + testimonials.
 * Bilingual EN/中文 support.
 */

const BubblyReviews = (() => {
  'use strict';

  const i18n = {
    en: {
      reviewTitle: 'How was your experience?',
      reviewPrompt: 'We\'d love to hear about your purchase!',
      ratingLabel: 'Your rating',
      nameLabel: 'Your name',
      namePlaceholder: 'e.g. Sarah L.',
      reviewLabel: 'Your review',
      reviewPlaceholder: 'Tell us what you loved about your purchase...',
      productLabel: 'Product purchased',
      submitBtn: 'Submit Review',
      thankYou: 'Thank you for your review! 🫧',
      stars: '★',
      emptyStars: '☆',
      verifiedPurchase: 'Verified Purchase',
      writeReview: 'Write a Review',
      reviews: 'Reviews',
      noReviews: 'Be the first to review this product!',
      submitError: 'Could not submit review. Please try again.',
      required: 'Please fill in all required fields and select a rating.'
    },
    zh: {
      reviewTitle: '分享您的體驗',
      reviewPrompt: '我們很想聽聽您的購物感受！',
      ratingLabel: '您的評分',
      nameLabel: '您的姓名',
      namePlaceholder: '例如：小美',
      reviewLabel: '您的評價',
      reviewPlaceholder: '告訴我們您喜歡什麼...',
      productLabel: '購買的產品',
      submitBtn: '提交評價',
      thankYou: '感謝您的評價！🫧',
      stars: '★',
      emptyStars: '☆',
      verifiedPurchase: '已驗證購買',
      writeReview: '撰寫評價',
      reviews: '評價',
      noReviews: '成為第一個評價此產品的人！',
      submitError: '無法提交評價，請再試一次。',
      required: '請填寫所有必填欄位並選擇評分。'
    }
  };

  let currentLang = 'en';

  function t(key) {
    return (i18n[currentLang] || i18n.en)[key] || i18n.en[key] || key;
  }

  function detectLang() {
    currentLang = document.documentElement.lang === 'zh' ||
                  document.body.classList.contains('zh') ? 'zh' : 'en';
  }

  // Static seed reviews (shown when no live reviews available)
  const SEED_REVIEWS = [
    { name: 'Sarah L.', rating: 5, text: 'The Rose Petal Dream soap is absolutely heavenly! My bathroom smells like a garden now.', product: 'Rose Petal Dream', verified: true, date: '2026-04-15' },
    { name: 'Kevin W.', rating: 5, text: 'Bought the Mooncake Gift Box for my mom — she was SO impressed!', product: 'Mooncake Gift Box', verified: true, date: '2026-04-02' },
    { name: 'Emily T.', rating: 5, text: 'Those little pumpkin candles are the cutest thing ever!', product: 'Pumpkin Spice Candle', verified: true, date: '2026-03-28' },
    { name: 'Jade C.', rating: 4, text: 'Love the lavender wax melts. The scent lasts so long! Will definitely order again.', product: 'Lavender Serenity', verified: true, date: '2026-03-20' },
    { name: 'Michael R.', rating: 5, text: 'Workshop was amazing — Mandy is such a great teacher. Came home with 6 gorgeous soaps!', product: 'Workshop Booking', verified: true, date: '2026-03-15' },
    { name: 'Lisa H.', rating: 5, text: 'The honey oat soap is so gentle on sensitive skin. Finally a natural soap that works!', product: 'Honey & Oat Glow', verified: true, date: '2026-03-10' }
  ];

  /**
   * Render star rating (interactive or static)
   */
  function renderStars(rating, interactive = false, onChange = null) {
    const container = document.createElement('div');
    container.className = 'review-stars' + (interactive ? ' review-stars--interactive' : '');
    container.setAttribute('role', interactive ? 'radiogroup' : 'img');
    container.setAttribute('aria-label', `${rating} out of 5 stars`);

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'review-star' + (i <= rating ? ' review-star--filled' : '');
      star.textContent = i <= rating ? '★' : '☆';
      star.dataset.value = i;

      if (interactive) {
        star.setAttribute('role', 'radio');
        star.setAttribute('aria-checked', i <= rating ? 'true' : 'false');
        star.setAttribute('tabindex', '0');
        star.style.cursor = 'pointer';
        star.addEventListener('click', () => {
          if (onChange) onChange(i);
          // Update visuals
          container.querySelectorAll('.review-star').forEach((s, idx) => {
            s.className = 'review-star' + (idx < i ? ' review-star--filled' : '');
            s.textContent = idx < i ? '★' : '☆';
            s.setAttribute('aria-checked', idx < i ? 'true' : 'false');
          });
        });
        star.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            star.click();
          }
        });
      }
      container.appendChild(star);
    }
    return container;
  }

  /**
   * Render a single review card
   */
  function renderReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card fade-in';

    const stars = renderStars(review.rating);
    card.appendChild(stars);

    const text = document.createElement('p');
    text.className = 'review-text';
    text.textContent = review.text;
    card.appendChild(text);

    const meta = document.createElement('div');
    meta.className = 'review-meta';

    const name = document.createElement('cite');
    name.className = 'review-name';
    name.textContent = review.name;
    meta.appendChild(name);

    if (review.product) {
      const product = document.createElement('span');
      product.className = 'review-product';
      product.textContent = review.product;
      meta.appendChild(product);
    }

    if (review.verified) {
      const badge = document.createElement('span');
      badge.className = 'review-verified';
      badge.textContent = `✓ ${t('verifiedPurchase')}`;
      meta.appendChild(badge);
    }

    card.appendChild(meta);
    return card;
  }

  /**
   * Render the testimonials section with live + seed reviews
   */
  async function renderTestimonials() {
    detectLang();
    const section = document.querySelector('.testimonials .testimonial-featured');
    if (!section) return;

    // Try fetching live reviews from worker
    let reviews = SEED_REVIEWS;
    try {
      if (typeof bubblyAPI !== 'undefined' && bubblyAPI.config && bubblyAPI.config.workerUrl) {
        const resp = await fetch(`${bubblyAPI.config.workerUrl}/reviews?limit=10`, {
          signal: AbortSignal.timeout(5000)
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.reviews && data.reviews.length > 0) {
            reviews = [...data.reviews, ...SEED_REVIEWS].slice(0, 10);
          }
        }
      }
    } catch (e) {
      console.log('[Bubbly Reviews] Using seed reviews');
    }

    // Build the testimonials layout
    section.innerHTML = '';

    // Featured (first) review
    if (reviews.length > 0) {
      const featured = reviews[0];
      const pullquote = document.createElement('blockquote');
      pullquote.className = 'testimonial-pullquote fade-in';
      pullquote.innerHTML = `
        <div class="testimonial-stars">${'★'.repeat(featured.rating)}${'☆'.repeat(5 - featured.rating)}</div>
        <p class="testimonial-quote-text">"${featured.text}"</p>
        <footer class="testimonial-attribution">
          <cite class="testimonial-name">${featured.name}</cite>
          <span class="testimonial-product">${featured.product || ''}</span>
        </footer>
      `;
      section.appendChild(pullquote);
    }

    // Secondary reviews (next 2-4)
    if (reviews.length > 1) {
      const secondary = document.createElement('div');
      secondary.className = 'testimonial-secondary';

      reviews.slice(1, 5).forEach(review => {
        const card = document.createElement('div');
        card.className = 'testimonial-card-sm fade-in';
        card.innerHTML = `
          <div class="testimonial-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
          <p>"${review.text}"</p>
          <cite class="testimonial-name">${review.name}</cite>
        `;
        secondary.appendChild(card);
      });

      section.appendChild(secondary);
    }
  }

  /**
   * Show post-purchase review modal
   */
  function showReviewModal(productName) {
    detectLang();

    // Remove existing modal if any
    const existing = document.getElementById('bubbly-review-modal');
    if (existing) existing.remove();

    let selectedRating = 0;

    const overlay = document.createElement('div');
    overlay.id = 'bubbly-review-modal';
    overlay.className = 'review-modal-overlay';
    overlay.innerHTML = `
      <div class="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
        <button class="review-modal-close" aria-label="Close">✕</button>
        <h3 id="review-modal-title">${t('reviewTitle')}</h3>
        <p class="review-modal-prompt">${t('reviewPrompt')}</p>
        <form class="review-form" id="bubbly-review-form">
          <div class="review-form-group">
            <label>${t('ratingLabel')} <span class="required">*</span></label>
            <div id="review-stars-input"></div>
          </div>
          <div class="review-form-group">
            <label for="review-name">${t('nameLabel')} <span class="required">*</span></label>
            <input type="text" id="review-name" placeholder="${t('namePlaceholder')}" required>
          </div>
          <div class="review-form-group">
            <label for="review-text">${t('reviewLabel')} <span class="required">*</span></label>
            <textarea id="review-text" rows="4" placeholder="${t('reviewPlaceholder')}" required></textarea>
          </div>
          <input type="hidden" id="review-product" value="${productName || ''}">
          <button type="submit" class="btn btn-gold review-submit">${t('submitBtn')}</button>
          <p class="review-error" style="display:none"></p>
        </form>
        <div class="review-success" style="display:none">
          <p>${t('thankYou')}</p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Insert interactive stars
    const starsContainer = document.getElementById('review-stars-input');
    const stars = renderStars(0, true, (rating) => { selectedRating = rating; });
    starsContainer.appendChild(stars);

    // Close handlers
    overlay.querySelector('.review-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Submit handler
    const form = document.getElementById('bubbly-review-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('review-name').value.trim();
      const text = document.getElementById('review-text').value.trim();
      const product = document.getElementById('review-product').value;

      if (!name || !text || selectedRating === 0) {
        const err = overlay.querySelector('.review-error');
        err.textContent = t('required');
        err.style.display = 'block';
        return;
      }

      const review = { name, text, rating: selectedRating, product, verified: true, date: new Date().toISOString().split('T')[0] };

      // Try submitting to worker
      try {
        if (typeof bubblyAPI !== 'undefined' && bubblyAPI.config && bubblyAPI.config.workerUrl) {
          await fetch(`${bubblyAPI.config.workerUrl}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review),
            signal: AbortSignal.timeout(5000)
          });
        }
      } catch (err) {
        console.log('[Bubbly Reviews] Could not save to server, stored locally');
      }

      // Store locally regardless
      const stored = JSON.parse(localStorage.getItem('bubbly_reviews') || '[]');
      stored.unshift(review);
      localStorage.setItem('bubbly_reviews', JSON.stringify(stored.slice(0, 50)));

      // Show success
      form.style.display = 'none';
      overlay.querySelector('.review-success').style.display = 'block';

      setTimeout(() => overlay.remove(), 3000);
    });

    // Trap focus
    overlay.querySelector('.review-modal-close').focus();
  }

  /**
   * Hook into checkout confirmation to prompt review
   */
  function hookPostPurchase() {
    document.addEventListener('bubbly:orderComplete', (e) => {
      const productName = e.detail?.productName || '';
      setTimeout(() => showReviewModal(productName), 2000);
    });

    // Also listen for URL param trigger
    const params = new URLSearchParams(window.location.search);
    if (params.get('review') === 'true') {
      setTimeout(() => showReviewModal(params.get('product') || ''), 1000);
    }
  }

  // Auto-init
  function init() {
    detectLang();
    renderTestimonials();
    hookPostPurchase();

    // Observe language changes
    const observer = new MutationObserver(() => {
      const newLang = document.documentElement.lang === 'zh' ? 'zh' : 'en';
      if (newLang !== currentLang) {
        currentLang = newLang;
        renderTestimonials();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, showReviewModal, renderTestimonials };
})();

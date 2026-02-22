/* ============================================
   Bubbly Handmade Workshop — Enhancements
   ============================================ */

// --- 1. Back to Top Button ---
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(btn);
  
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// --- 2. Cookie Banner ---
function initCookieBanner() {
  if (localStorage.getItem('bubbly-cookies-accepted')) return;
  
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <p>🍪 We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies.</p>
    <button class="btn btn-primary btn-sm" onclick="acceptCookies()">Got it!</button>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('show'), 1000);
}

window.acceptCookies = function() {
  localStorage.setItem('bubbly-cookies-accepted', 'true');
  document.querySelector('.cookie-banner')?.classList.remove('show');
  setTimeout(() => document.querySelector('.cookie-banner')?.remove(), 400);
};

// --- 3. Product Quick View Modal ---
window.openQuickView = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeQuickView();
    });
    document.body.appendChild(overlay);
  }
  
  const name = lang === 'zh' ? product.nameCn : product.name;
  const desc = lang === 'zh' ? product.descCn : product.description;
  
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-image" style="background:${product.color}">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        <span>${product.emoji}</span>
        <button class="modal-close" onclick="closeQuickView()">✕</button>
      </div>
      <div class="modal-body">
        <h2>${name}</h2>
        <span class="product-price">$${product.price.toFixed(2)}</span>
        <p class="product-desc">${desc}</p>
        <button class="btn btn-gold" onclick="addToCart('${product.id}'); closeQuickView();">
          🛒 ${lang === 'zh' ? '加入購物車' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;
  
  requestAnimationFrame(() => overlay.classList.add('open'));
  document.body.style.overflow = 'hidden';
};

window.closeQuickView = function() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
};

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuickView();
    // Also close cart
    const cartOverlay = document.querySelector('.cart-overlay');
    if (cartOverlay?.classList.contains('open')) toggleCart();
  }
});

// --- 4. Newsletter Signup ---
window.handleNewsletter = function(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  if (email) {
    showToast(lang === 'zh' ? '感謝訂閱！💕' : 'Thanks for subscribing! 💕');
    e.target.reset();
    // In production: send to Mailchimp/ConvertKit/etc.
  }
};

// --- 5. Search Functionality ---
window.searchProducts = function(query) {
  if (!query.trim()) {
    renderProducts('shop-products', currentFilter || 'all');
    return;
  }
  
  const q = query.toLowerCase();
  const container = document.getElementById('shop-products');
  if (!container) return;
  
  const filtered = products.filter(p => {
    return p.name.toLowerCase().includes(q) ||
           p.nameCn.includes(q) ||
           p.description.toLowerCase().includes(q) ||
           p.category.includes(q);
  });
  
  container.innerHTML = filtered.map(p => `
    <div class="product-card fade-in" data-category="${p.category}" onclick="openQuickView('${p.id}')">
      <div class="product-image" style="background:${p.color}">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <span>${p.emoji}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${lang === 'zh' ? p.nameCn : p.name}</div>
        <div class="product-desc">${lang === 'zh' ? p.descCn : p.description}</div>
        <div class="product-footer">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${p.id}')" title="Add to cart">+</button>
        </div>
      </div>
    </div>
  `).join('');
  
  requestAnimationFrame(() => {
    container.querySelectorAll('.fade-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 80);
    });
  });
};

// --- 6. Announcement Bar ---
function initAnnouncementBar() {
  const announcements = [
    { en: '✨ Free shipping on orders over $50!', zh: '✨ 滿$50免運費！' },
    { en: '🌸 New Spring Collection arriving soon!', zh: '🌸 春季新品即將上市！' },
    { en: '🎁 10% off your first order — Use code BUBBLY10', zh: '🎁 首單9折 — 使用優惠碼 BUBBLY10' },
  ];
  
  const bar = document.createElement('div');
  bar.className = 'announcement-bar';
  const msg = announcements[Math.floor(Math.random() * announcements.length)];
  bar.textContent = lang === 'zh' ? msg.zh : msg.en;
  document.body.insertBefore(bar, document.body.firstChild);
  
  // Adjust header position
  const header = document.querySelector('.header');
  if (header) header.style.top = '32px';
  
  // Adjust hero padding
  const hero = document.querySelector('.hero, .shop-hero, .about-hero, .contact-hero');
  if (hero) hero.style.paddingTop = (parseInt(getComputedStyle(hero).paddingTop) + 32) + 'px';
}

// --- 7. WhatsApp Float Button ---
function initWhatsAppFloat() {
  // Replace with Mandy's actual WhatsApp number
  const link = document.createElement('a');
  link.className = 'whatsapp-float';
  link.href = 'https://wa.me/message/bubblyhandmade';
  link.target = '_blank';
  link.setAttribute('aria-label', 'Chat on WhatsApp');
  link.innerHTML = '💬';
  document.body.appendChild(link);
}

// --- 8. Progress Bar ---
function initProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.style.width = '0%';
  document.body.appendChild(bar);
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  });
}

// --- 9. Lazy Loading for Fade-in Elements ---
function initLazyFade() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// --- 10. Keyboard Accessibility ---
function initKeyboardNav() {
  // Trap focus in modal when open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const modal = document.querySelector('.modal-overlay.open .modal');
      if (modal) {
        const focusable = modal.querySelectorAll('button, a, input, [tabindex]');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
}

// --- Override renderProducts to add quick-view click ---
const _originalRenderProducts = window.renderProducts;
if (typeof renderProducts === 'function') {
  const origRender = renderProducts;
  window.renderProducts = function(containerId, filterCategory, limit) {
    origRender(containerId, filterCategory, limit);
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.product-card').forEach(card => {
      const productId = card.querySelector('.add-to-cart-btn')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      if (productId) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
          if (!e.target.closest('.add-to-cart-btn')) {
            openQuickView(productId);
          }
        });
      }
    });
    // Re-init lazy fade
    initLazyFade();
  };
}

// --- Init All Enhancements ---
document.addEventListener('DOMContentLoaded', () => {
  initBackToTop();
  initCookieBanner();
  initAnnouncementBar();
  initWhatsAppFloat();
  initProgressBar();
  initKeyboardNav();
  
  // Search bar on shop page
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => searchProducts(e.target.value));
  }
  
  // Newsletter form
  const nlForm = document.getElementById('newsletter-form');
  if (nlForm) nlForm.addEventListener('submit', handleNewsletter);
});

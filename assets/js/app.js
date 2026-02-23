/* ============================================
   Bubbly Handmade Workshop — Main JS
   ============================================ */

// --- State ---
let products = [];
let cart = JSON.parse(localStorage.getItem('bubbly-cart') || '[]');
let lang = localStorage.getItem('bubbly-lang') || 'en';
let currentFilter = 'all';

// --- i18n ---
const i18n = {
  en: {
    heroTitle: 'Handcrafted with <span>Love</span> & Botanicals',
    heroSub: 'Every scent tells a story. Discover artisanal soaps, wax melts, and candles made with real dried flowers and pure essential oils.',
    shopNow: 'Shop Now',
    ourStory: 'Our Story',
    featuredTag: '✨ Handpicked for You',
    featuredTitle: 'Featured Products',
    featuredSub: 'Our most loved creations, made with care in small batches.',
    aboutTag: '🌿 Our Philosophy',
    aboutTitle: 'Made by Hand, Given with Heart',
    aboutText1: 'Every bar of soap, every wax melt, and every candle is handcrafted by Mandy with love and intention. We believe self-care should be beautiful, natural, and accessible.',
    aboutText2: 'Using only the finest botanicals, essential oils, and sustainable ingredients — because your skin deserves the best.',
    learnMore: 'Learn More',
    natural: 'Natural',
    handmade: 'Handmade',
    sustainable: 'Sustainable',
    instaTag: '📸 Follow Us',
    instaTitle: '@bubblyhandmadeworkshopmandy',
    instaSub: 'Follow our journey on Instagram for behind-the-scenes, new launches, and daily inspiration.',
    followUs: 'Follow on Instagram',
    all: 'All',
    soaps: 'Soaps',
    waxMelts: 'Wax Melts',
    candles: 'Candles',
    giftSets: 'Gift Sets',
    shopTitle: 'Our Collection',
    shopSub: 'Each product is lovingly handcrafted in small batches using natural ingredients.',
    aboutHeroTitle: 'Our Story',
    aboutHeroSub: 'The heart and soul behind every bubble.',
    aboutStoryTitle: 'Hi, I\'m Mandy 👋',
    aboutStory1: 'What started as a weekend hobby quickly blossomed into a passion. I fell in love with the art of soap-making — the way dried rose petals catch the light, the calming scent of lavender filling the room, the joy of creating something beautiful with my own hands.',
    aboutStory2: 'Bubbly Handmade Workshop was born from a simple belief: self-care products should be as natural and beautiful as the ingredients that make them. Every item is handcrafted in small batches, using real botanicals and pure essential oils.',
    aboutStory3: 'When you choose Bubbly, you\'re not just buying a product — you\'re supporting a family dream and getting a little piece of handmade happiness.',
    valuesTitle: 'What We Stand For',
    pureTitle: 'Pure Ingredients',
    pureSub: 'No harsh chemicals, no artificial colors. Just nature\'s finest botanicals and essential oils.',
    craftTitle: 'Small Batch Craft',
    craftSub: 'Every item is made by hand in small batches to ensure the highest quality and care.',
    ecoTitle: 'Eco-Conscious',
    ecoSub: 'Sustainable packaging, recyclable materials, and a commitment to reducing our footprint.',
    contactTitle: 'Get in Touch',
    contactSub: 'We\'d love to hear from you! Questions, custom orders, or just want to say hi?',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    subject: 'Subject',
    message: 'Your Message',
    send: 'Send Message',
    email: 'Email',
    instagram: 'Instagram',
    location: 'Location',
    cartTitle: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    cartEmptySub: 'Add some bubbly goodness!',
    total: 'Total',
    checkout: 'Checkout with Stripe',
    addedToCart: 'Added to cart!',
    workshopTitle: 'Workshops & Classes',
    workshopSub: 'Handcraft your own aromatherapy creations.',
    bookClass: 'Book a Class',
    home: 'Home', shop: 'Shop', workshops: 'Workshops', about: 'About', contact: 'Contact',
  },
  zh: {
    heroTitle: '用<span>愛</span>與花草手工製作',
    heroSub: '每一種香氛都有它的故事。探索用真正乾燥花和純精油製作的手工皂、蠟片和蠟燭。',
    shopNow: '立即選購',
    ourStory: '我們的故事',
    featuredTag: '✨ 為您精選',
    featuredTitle: '精選商品',
    featuredSub: '我們最受喜愛的作品，小批量精心製作。',
    aboutTag: '🌿 我們的理念',
    aboutTitle: '手工製作，用心給予',
    aboutText1: '每一塊手工皂、每一片蠟片、每一支蠟燭，都是Mandy用愛與心意手工製作的。我們相信自我呵護應該是美麗、天然且觸手可及的。',
    aboutText2: '只使用最優質的植物、精油和永續原料——因為您的肌膚值得最好的。',
    learnMore: '了解更多',
    natural: '天然',
    handmade: '手工',
    sustainable: '永續',
    instaTag: '📸 追蹤我們',
    instaTitle: '@bubblyhandmadeworkshopmandy',
    instaSub: '在Instagram追蹤我們的旅程，獲取幕後花絮、新品發佈和每日靈感。',
    followUs: '追蹤Instagram',
    all: '全部',
    soaps: '手工皂',
    waxMelts: '蠟片',
    candles: '蠟燭',
    giftSets: '禮盒',
    shopTitle: '我們的系列',
    shopSub: '每件商品都是用天然原料小批量手工精心製作。',
    workshopTitle: '工作坊與體驗',
    workshopSub: '親手製作屬於您的香氛與美麗。',
    bookClass: '預約課程',
    aboutHeroTitle: '我們的故事',
    aboutHeroSub: '每一個泡泡背後的心與靈魂。',
    aboutStoryTitle: '嗨，我是Mandy 👋',
    aboutStory1: '一個週末的愛好很快就變成了一種熱情。我愛上了手工皂的藝術——乾燥玫瑰花瓣在光線下的閃耀、薰衣草香氣瀰漫整個房間的寧靜、用自己雙手創造美好事物的喜悅。',
    aboutStory2: 'Bubbly Handmade Workshop誕生於一個簡單的信念：自我呵護的產品應該像製作它們的原料一樣天然美麗。每一件商品都是小批量手工製作，使用真正的植物和純精油。',
    aboutStory3: '當您選擇Bubbly，您不僅僅是購買一件商品——您在支持一個家庭的夢想，並獲得一份手工幸福。',
    valuesTitle: '我們的堅持',
    pureTitle: '純淨原料',
    pureSub: '沒有刺激化學物質，沒有人工色素。只有大自然最好的植物和精油。',
    craftTitle: '小批量手工',
    craftSub: '每一件商品都是手工小批量製作，以確保最高品質和用心。',
    ecoTitle: '環保意識',
    ecoSub: '永續包裝、可回收材料，致力於減少我們的碳足跡。',
    contactTitle: '聯繫我們',
    contactSub: '我們很想聽到您的聲音！有問題、客製訂單，或只是想打個招呼？',
    yourName: '您的姓名',
    yourEmail: '您的電郵',
    subject: '主題',
    message: '您的留言',
    send: '發送訊息',
    email: '電郵',
    instagram: 'Instagram',
    location: '地點',
    cartTitle: '您的購物車',
    cartEmpty: '購物車是空的',
    cartEmptySub: '加入一些Bubbly的美好吧！',
    total: '總計',
    checkout: '使用Stripe結帳',
    addedToCart: '已加入購物車！',
    home: '首頁', shop: '選購', workshops: '工作坊', about: '關於', contact: '聯繫',
  }
};

function t(key) { return (i18n[lang] && i18n[lang][key]) || (i18n.en[key]) || key; }

// --- Load Products ---
async function loadProducts() {
  try {
    const res = await fetch('./data/products.json');
    products = await res.json();
  } catch (e) {
    console.error('Failed to load products:', e);
    products = [];
  }
}

// --- Cart Functions ---
function saveCart() {
  localStorage.setItem('bubbly-cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const counts = document.querySelectorAll('.cart-count');
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  counts.forEach(el => el.textContent = total || '');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: product.id, qty: 1 });
  }
  saveCart();
  showToast(t('addedToCart'));
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(productId); return; }
  saveCart();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const p = products.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

// --- Render Cart Drawer ---
function renderCart() {
  const itemsEl = document.querySelector('.cart-items');
  const totalEl = document.querySelector('.cart-total-amount');
  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-emoji">🫧</div>
        <p>${t('cartEmpty')}</p>
        <p style="font-size:0.85rem;margin-top:4px">${t('cartEmptySub')}</p>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => {
      const p = products.find(pr => pr.id === item.id);
      if (!p) return '';
      return `
        <div class="cart-item">
          <div class="cart-item-image" style="background:${p.color}">${p.emoji}</div>
          <div class="cart-item-details">
            <div class="cart-item-name">${lang === 'zh' ? p.nameCn : p.name}</div>
            <div class="cart-item-price">$${(p.price * item.qty).toFixed(2)}</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty('${p.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${p.id}', 1)">+</button>
          </div>
        </div>`;
    }).join('');
  }

  if (totalEl) totalEl.textContent = '$' + getCartTotal().toFixed(2);
}

function toggleCart() {
  document.querySelector('.cart-overlay')?.classList.toggle('open');
  document.querySelector('.cart-drawer')?.classList.toggle('open');
  renderCart();
}

// --- Toast ---
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = '🫧 ' + message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Product Grid Rendering ---
function renderProducts(containerId, filterCategory, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filtered = products;
  if (filterCategory && filterCategory !== 'all') {
    filtered = products.filter(p => p.category === filterCategory);
  }
  if (limit) filtered = filtered.slice(0, limit);

  container.innerHTML = filtered.map(p => `
    <div class="product-card fade-in" data-category="${p.category}">
      <div class="product-image" style="background:${p.color}">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <span>${p.emoji}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${lang === 'zh' ? p.nameCn : p.name}</div>
        <div class="product-desc">${lang === 'zh' ? p.descCn : p.description}</div>
        <div class="product-footer">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <button class="add-to-cart-btn" onclick="addToCart('${p.id}')" title="Add to cart">+</button>
        </div>
      </div>
    </div>
  `).join('');

  // Trigger fade-in
  requestAnimationFrame(() => {
    container.querySelectorAll('.fade-in').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 80);
    });
  });
}

// --- Language Toggle ---
function toggleLang() {
  lang = lang === 'en' ? 'zh' : 'en';
  localStorage.setItem('bubbly-lang', lang);
  location.reload();
}

// --- Mobile Menu ---
function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('open');
}

// --- Scroll Effects ---
function initScrollEffects() {
  // Header shadow
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  });

  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// --- Stripe Checkout (placeholder) ---
function checkout() {
  if (cart.length === 0) return;
  // In production, this would redirect to Stripe Checkout
  // For now, show a message
  alert('Stripe Checkout integration ready!\n\nTo activate:\n1. Add your Stripe publishable key in app.js\n2. Create products in your Stripe Dashboard\n3. Map product IDs to Stripe Price IDs\n\nTotal: $' + getCartTotal().toFixed(2));
}

// --- Contact Form ---
function handleContactSubmit(e) {
  e.preventDefault();
  showToast(lang === 'zh' ? '訊息已發送！感謝您！' : 'Message sent! Thank you! 💕');
  e.target.reset();
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  updateCartCount();
  initScrollEffects();

  // Update lang toggle button
  const langBtn = document.querySelector('.lang-toggle');
  if (langBtn) langBtn.textContent = lang === 'en' ? '中文' : 'EN';

  // Page-specific init
  const page = document.body.dataset.page;

  if (page === 'home') {
    renderProducts('featured-products', 'all', 4);
  }

  if (page === 'shop') {
    renderProducts('shop-products', 'all');
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProducts('shop-products', currentFilter);
      });
    });
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

  // Apply translations to data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else {
      el.innerHTML = val;
    }
  });
});

/* ============================================
   Bubbly Handmade Workshop â Main JS
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
    featuredTag: 'Handpicked for You',
    featuredTitle: 'Featured Products',
    featuredSub: 'Our most loved creations, made with care in small batches.',
    aboutTag: 'Our Philosophy',
    aboutTitle: 'Made by Hand, Given with Heart',
    aboutText1: 'Every bar of soap, every wax melt, and every candle is handcrafted by Mandy with love and intention. We believe self-care should be beautiful, natural, and accessible.',
    aboutText2: 'Using only the finest botanicals, essential oils, and sustainable ingredients â because your skin deserves the best.',
    learnMore: 'Learn More',
    natural: 'Natural',
    handmade: 'Handmade',
    sustainable: 'Sustainable',
    instaTag: 'Follow Us',
    instaTitle: '@bubbly._studio',
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
    aboutStoryTitle: 'Hi, I\'m Mandy ð',
    aboutStory1: 'What started as a weekend hobby quickly blossomed into a passion. I fell in love with the art of soap-making â the way dried rose petals catch the light, the calming scent of lavender filling the room, the joy of creating something beautiful with my own hands.',
    aboutStory2: 'Bubbly Handmade Workshop was born from a simple belief: self-care products should be as natural and beautiful as the ingredients that make them. Every item is handcrafted in small batches, using real botanicals and pure essential oils.',
    aboutStory3: 'When you choose Bubbly, you\'re not just buying a product â you\'re supporting a family dream and getting a little piece of handmade happiness.',
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
    nameRequired: 'Please enter your name',
    emailInvalid: 'Please enter a valid email address',
    messageRequired: 'Please enter a message',
    newsletterSuccess: 'Welcome to the Bubbly family!',
    newsletterExists: 'You\'re already subscribed!',
    noResults: 'No products found',
    noResultsSub: 'Try a different search or browse all products.',
    cartEmptyAction: 'Browse our collection',

    // --- Workshop Booking Keys ---
    wsTag: 'Hands-On Experience',
    wsDuration: '2 Hours',
    wsDurationDesc: 'Relaxing creative session',
    wsTakeHome: 'Take Home',
    wsTakeHomeDesc: 'Your handmade creations',
    wsGroupSize: 'Small Groups',
    wsGroupDesc: '2â8 people per class',
    wsPrice: 'From $45',
    wsPriceDesc: 'All materials included',
    wsChooseTag: 'Book Your Spot',
    wsChooseTitle: 'Choose Your Workshop',
    wsChooseSub: 'Select a workshop type to get started.',
    wsBadgePopular: 'POPULAR',
    wsBadgeNew: 'NEW',
    wsSoapTitle: 'Soap Making',
    wsSoapDesc: 'Learn cold-process soap making with essential oils and dried botanicals.',
    wsCandleTitle: 'Candle Pouring',
    wsCandleDesc: 'Create hand-poured soy candles with custom scent blends.',
    wsWaxTitle: 'Wax Melt Art',
    wsWaxDesc: 'Design beautiful wax melts with dried flowers and fragrance oils.',
    ws2hrs: '2 hrs',
    ws90min: '90 min',
    wsMaxPeople: 'Max 8',
    wsPerPerson: 'per person',
    wsStepDate: 'Date & Time',
    wsStepInfo: 'Your Info',
    wsStepConfirm: 'Confirm',
    wsPickDateTime: 'Pick a Date & Time',
    wsYourDetails: 'Your Details',
    wsFirstName: 'First Name',
    wsLastName: 'Last Name',
    wsEmail: 'Email',
    wsPhone: 'Phone (optional)',
    wsNotes: 'Special requests or notes...',
    wsBookingProcessing: 'Processing your booking...',
    wsBookingSuccess: 'Booking Confirmed!',
    wsBookingSuccessMsg: 'Check your email for confirmation details.',
    wsBackHome: 'Back to Home',
    wsBack: 'Back',
    wsNext: 'Next',
    // --- Checkout & Shop ---
    shopTag: 'Handmade with Love',
    ckTitle: 'Checkout',
    ckOrderSummary: 'Order Summary',
    ckTotal: 'Total',
    ckName: 'Full Name',
    ckEmail: 'Email',
    ckCardNumber: 'Card Number',
    ckExpiry: 'Expiry',
    ckPayNow: 'Pay Now',
    ckProcessing: 'Processing...',
    ckEmailRequired: 'Please enter a valid email',
    ckSecure: 'Secure payment powered by Square',
    ckSuccess: 'Order Confirmed!',
    ckSuccessMsg: 'A confirmation has been sent to',
    ckDone: 'Done',
  },
  zh: {
    heroTitle: 'ç¨<span>æ</span>èè±èæå·¥è£½ä½',
    heroSub: 'æ¯ä¸ç¨®é¦æ°é½æå®çæäºãæ¢ç´¢ç¨çæ­£ä¹¾ç¥è±åç´ç²¾æ²¹è£½ä½çæå·¥çãè çåè ç­ã',
    shopNow: 'ç«å³é¸è³¼',
    ourStory: 'æåçæäº',
    featuredTag: 'çºæ¨ç²¾é¸',
    featuredTitle: 'ç²¾é¸åå',
    featuredSub: 'æåæååæçä½åï¼å°æ¹éç²¾å¿è£½ä½ã',
    aboutTag: 'æåççå¿µ',
    aboutTitle: 'æå·¥è£½ä½ï¼ç¨å¿çµ¦äº',
    aboutText1: 'æ¯ä¸å¡æå·¥çãæ¯ä¸çè çãæ¯ä¸æ¯è ç­ï¼é½æ¯Mandyç¨æèå¿ææå·¥è£½ä½çãæåç¸ä¿¡èªæåµè­·æè©²æ¯ç¾éºãå¤©ç¶ä¸è§¸æå¯åçã',
    aboutText2: 'åªä½¿ç¨æåªè³ªçæ¤ç©ãç²¾æ²¹åæ°¸çºåæââå çºæ¨çèèå¼å¾æå¥½çã',
    learnMore: 'äºè§£æ´å¤',
    natural: 'å¤©ç¶',
    handmade: 'æå·¥',
    sustainable: 'æ°¸çº',
    instaTag: 'è¿½è¹¤æå',
    instaTitle: '@bubbly._studio',
    instaSub: 'å¨Instagramè¿½è¹¤æåçæç¨ï¼ç²åå¹å¾è±çµ®ãæ°åç¼ä½åæ¯æ¥éæã',
    followUs: 'è¿½è¹¤Instagram',
    all: 'å¨é¨',
    soaps: 'æå·¥ç',
    waxMelts: 'è ç',
    candles: 'è ç­',
    giftSets: 'ç¦®ç',
    shopTitle: 'æåçç³»å',
    shopSub: 'æ¯ä»¶ååé½æ¯ç¨å¤©ç¶åæå°æ¹éæå·¥ç²¾å¿è£½ä½ã',
    workshopTitle: 'å·¥ä½åèé«é©',
    workshopSub: 'è¦ªæè£½ä½å±¬æ¼æ¨çé¦æ°èç¾éºã',
    bookClass: 'é ç´èª²ç¨',
    aboutHeroTitle: 'æåçæäº',
    aboutHeroSub: 'æ¯ä¸åæ³¡æ³¡èå¾çå¿èéé­ã',
    aboutStoryTitle: 'å¨ï¼ææ¯Mandy ð',
    aboutStory1: 'ä¸åé±æ«çæå¥½å¾å¿«å°±è®æäºä¸ç¨®ç±æãææä¸äºæå·¥ççèè¡ââä¹¾ç¥ç«ç°è±ç£å¨åç·ä¸çéèãè°è¡£èé¦æ°£ç°æ¼«æ´åæ¿éçå¯§éãç¨èªå·±éæåµé ç¾å¥½äºç©çåæã',
    aboutStory2: 'Bubbly Handmade Workshopèªçæ¼ä¸åç°¡å®çä¿¡å¿µï¼èªæåµè­·çç¢åæè©²åè£½ä½å®åçåæä¸æ¨£å¤©ç¶ç¾éºãæ¯ä¸ä»¶ååé½æ¯å°æ¹éæå·¥è£½ä½ï¼ä½¿ç¨çæ­£çæ¤ç©åç´ç²¾æ²¹ã',
    aboutStory3: 'ç¶æ¨é¸æBubblyï¼æ¨ä¸ååæ¯è³¼è²·ä¸ä»¶ååââæ¨å¨æ¯æä¸åå®¶åº­çå¤¢æ³ï¼ä¸¦ç²å¾ä¸ä»½æå·¥å¹¸ç¦ã',
    valuesTitle: 'æåçå æ',
    pureTitle: 'ç´æ·¨åæ',
    pureSub: 'æ²æåºæ¿åå­¸ç©è³ªï¼æ²æäººå·¥è²ç´ ãåªæå¤§èªç¶æå¥½çæ¤ç©åç²¾æ²¹ã',
    craftTitle: 'å°æ¹éæå·¥',
    craftSub: 'æ¯ä¸ä»¶ååé½æ¯æå·¥å°æ¹éè£½ä½ï¼ä»¥ç¢ºä¿æé«åè³ªåç¨å¿ã',
    ecoTitle: 'ç°ä¿æè­',
    ecoSub: 'æ°¸çºåè£ãå¯åæ¶ææï¼è´åæ¼æ¸å°æåçç¢³è¶³è·¡ã',
    contactTitle: 'è¯ç¹«æå',
    contactSub: 'æåå¾æ³è½å°æ¨çè²é³ï¼æåé¡ãå®¢è£½è¨å®ï¼æåªæ¯æ³æåæå¼ï¼',
    yourName: 'æ¨çå§å',
    yourEmail: 'æ¨çé»éµ',
    subject: 'ä¸»é¡',
    message: 'æ¨ççè¨',
    send: 'ç¼éè¨æ¯',
    email: 'é»éµ',
    instagram: 'Instagram',
    location: 'å°é»',
    cartTitle: 'æ¨çè³¼ç©è»',
    cartEmpty: 'è³¼ç©è»æ¯ç©ºç',
    cartEmptySub: 'å å¥ä¸äºBubblyçç¾å¥½å§ï¼',
    total: 'ç¸½è¨',
    checkout: 'ä½¿ç¨Stripeçµå¸³',
    addedToCart: 'å·²å å¥è³¼ç©è»ï¼',
    home: 'é¦é ', shop: 'é¸è³¼', workshops: 'å·¥ä½å', about: 'éæ¼', contact: 'è¯ç¹«',
    nameRequired: 'è«è¼¸å¥æ¨çå§å',
    emailInvalid: 'è«è¼¸å¥ææçé»éµå°å',
    messageRequired: 'è«è¼¸å¥çè¨',
    newsletterSuccess: 'æ­¡è¿å å¥Bubblyå¤§å®¶åº­ï¼',
    newsletterExists: 'æ¨å·²ç¶è¨é±äºï¼',
    noResults: 'æ²ææ¾å°åå',
    noResultsSub: 'åè©¦ä¸åçæå°æçè¦½å¨é¨ååã',
    cartEmptyAction: 'çè¦½æåçç³»å',

    // --- å·¥ä½åé ç´ ---
    wsTag: 'è¦ªæé«é©',
    wsDuration: '2 å°æ',
    wsDurationDesc: 'è¼é¬çåµææå',
    wsTakeHome: 'å¸¶åå®¶',
    wsTakeHomeDesc: 'æ¨çæä½ä½å',
    wsGroupSize: 'å°ç­å¶',
    wsGroupDesc: 'æ¯ç­ 2â8 äºº',
    wsPrice: '$45 èµ·',
    wsPriceDesc: 'åå«ææææ',
    wsChooseTag: 'é ç´åé¡',
    wsChooseTitle: 'é¸æå·¥ä½å',
    wsChooseSub: 'é¸æå·¥ä½åé¡åéå§é ç´ã',
    wsBadgePopular: 'ç±é',
    wsBadgeNew: 'æ°èª²ç¨',
    wsSoapTitle: 'æå·¥çè£½ä½',
    wsSoapDesc: 'å­¸ç¿ä½¿ç¨ç²¾æ²¹åä¹¾ç¥è±æè£½ä½å·è£½æå·¥çã',
    wsCandleTitle: 'è ç­è£½ä½',
    wsCandleDesc: 'è£½ä½æå·¥å¤§è±è ç­ï¼æ­éèªé¸é¦æ°ã',
    wsWaxTitle: 'è çèè¡',
    wsWaxDesc: 'ç¨ä¹¾ç¥è±åé¦æ°æ²¹è¨­è¨ç¾éºçè çã',
    ws2hrs: '2 å°æ',
    ws90min: '90 åé',
    wsMaxPeople: 'æå¤ 8 äºº',
    wsPerPerson: 'æ¯äºº',
    wsStepDate: 'æ¥ææé',
    wsStepInfo: 'æ¨çè³æ',
    wsStepConfirm: 'ç¢ºèª',
    wsPickDateTime: 'é¸ææ¥æåæé',
    wsYourDetails: 'æ¨çè³æ',
    wsFirstName: 'å',
    wsLastName: 'å§',
    wsEmail: 'é»å­ä¿¡ç®±',
    wsPhone: 'é»è©±ï¼é¸å¡«ï¼',
    wsNotes: 'ç¹æ®éæ±æåè¨»...',
    wsBookingProcessing: 'æ­£å¨èçæ¨çé ç´...',
    wsBookingSuccess: 'é ç´æåï¼',
    wsBookingSuccessMsg: 'ç¢ºèªè©³æå·²ç¼éè³æ¨çä¿¡ç®±ã',
    wsBackHome: 'åå°é¦é ',
    wsBack: 'è¿å',
    wsNext: 'ä¸ä¸æ­¥',
    // --- Checkout & Shop ---
    shopTag: '手工精心制作',
    ckTitle: '结账',
    ckOrderSummary: '订单摘要',
    ckTotal: '合计',
    ckName: '姓名',
    ckEmail: '电子邮件',
    ckCardNumber: '卡号',
    ckExpiry: '有效期',
    ckPayNow: '立即付款',
    ckProcessing: '处理中...',
    ckEmailRequired: '请输入有效的电子邮件',
    ckSecure: '由 Square 提供安全支付',
    ckSuccess: '订单已确认！',
    ckSuccessMsg: '确认信已发送至',
    ckDone: '完成',
  }
};

function t(key) { return (i18n[lang] && i18n[lang][key]) || (i18n.en[key]) || key; }

// --- Load Products ---
async function loadProducts() {
  // Try Square Catalog API first, fall back to local JSON
  if (typeof bubblyAPI !== 'undefined' && bubblyAPI.isReady()) {
    try {
      const squareItems = await bubblyAPI.getProducts();
      if (squareItems && squareItems.length) {
        products = squareItems.map(item => ({
          id: item.id,
          name: item.itemData?.name || 'Product',
          nameCn: item.itemData?.name || '',
          category: (item.itemData?.categories?.[0]?.name || 'soaps').toLowerCase().replace(/\s+/g, '-'),
          price: (item.itemData?.variations?.[0]?.itemVariationData?.priceMoney?.amount || 0) / 100,
          description: item.itemData?.description || '',
          descCn: item.itemData?.description || '',
          color: '#e8d5c4',
          emoji: '',
          image: item.itemData?.imageIds?.[0] || ''
        }));
        return;
      }
    } catch (e) {
      // Fall through to JSON
    }
  }
  await loadFromJSON();
}

async function loadFromJSON() {
  try {
    const r = await fetch('data/products.json');
    const data = await r.json();
    products = data;
  } catch (err) {
    console.error('Failed to load products:', err);
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
        <div class="cart-empty-emoji">ð«§</div>
        <p>${t('cartEmpty')}</p>
        <p style="font-size:0.85rem;margin-top:4px">${t('cartEmptySub')}</p>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => {
      const p = products.find(pr => pr.id === item.id);
      if (!p) return '';
      return `
        <div class="cart-item">
          <div class="cart-item-image" style="background:${p.color}">${p.image ? `<img src="${p.image}" alt="${lang === 'zh' ? p.nameCn : p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : p.emoji}</div>
          <div class="cart-item-details">
            <div class="cart-item-name">${lang === 'zh' ? p.nameCn : p.name}</div>
            <div class="cart-item-price">$${(p.price * item.qty).toFixed(2)}</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty('${p.id}', -1)">â</button>
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
  toast.innerHTML = 'ð«§ ' + message;
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

  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty-state"><p class="empty-state-title">' + t('noResults') + '</p><p class="empty-state-sub">' + t('noResultsSub') + '</p></div>';
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="product-card fade-in" data-category="${p.category}">
      <div class="product-image" style="background:${p.color}">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        ${p.image ? `<img src="${p.image}" alt="${lang === 'zh' ? p.nameCn : p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius) var(--radius) 0 0;">` : `<span>${p.emoji}</span>`}
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

// --- Filter Products (global, called from onclick in HTML) ---
function filterProducts(category) {
  currentFilter = category || 'all';
  document.querySelectorAll('.filter-btn').forEach(b => {
    const btnCat = b.dataset.filter || '';
    const onclickMatch = (b.getAttribute('onclick') || '').includes("'" + currentFilter + "'");
    b.classList.toggle('active', btnCat === currentFilter || onclickMatch);
  });
  renderProducts('product-grid', currentFilter);
}

// --- Language Toggle ---
function toggleLang() {
  lang = lang === 'en' ? 'zh' : 'en';
  localStorage.setItem('bubbly-lang', lang);
  location.reload();
}

// --- Mobile Menu ---
function toggleMenu() {
  const nav = document.querySelector('.nav-links');
  const btn = document.querySelector('.menu-toggle');
  nav?.classList.toggle('open');
  const expanded = nav?.classList.contains('open');
  btn?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  btn?.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
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

  // Section reveal on scroll
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.section').forEach(el => sectionObserver.observe(el));
}

// --- Stripe Checkout (placeholder) ---
function checkout() {
  if (cart.length === 0) return;
  const btn = document.querySelector('.cart-checkout-btn');
  if (btn?.disabled) return;
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  // In production, this would redirect to Stripe Checkout
  // For now, show a message
  alert('Stripe Checkout integration ready!\n\nTo activate:\n1. Add your Stripe publishable key in app.js\n2. Create products in your Stripe Dashboard\n3. Map product IDs to Stripe Price IDs\n\nTotal: $' + getCartTotal().toFixed(2));
}

// --- Contact Form ---
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(field, message) {
  clearFieldError(field);
  field.classList.add('field-error');
  const errorEl = document.createElement('span');
  errorEl.className = 'field-error-msg';
  errorEl.textContent = message;
  errorEl.setAttribute('role', 'alert');
  field.parentNode.appendChild(errorEl);
}

function clearFieldError(field) {
  field.classList.remove('field-error');
  const existing = field.parentNode.querySelector('.field-error-msg');
  if (existing) existing.remove();
}

function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('input[type="text"]');
  const email = form.querySelector('input[type="email"]');
  const message = form.querySelector('textarea');
  let valid = true;

  // Clear previous errors
  [name, email, message].forEach(f => { if (f) clearFieldError(f); });

  if (name && !name.value.trim()) {
    showFieldError(name, t('nameRequired'));
    valid = false;
  }
  if (email && !validateEmail(email.value)) {
    showFieldError(email, t('emailInvalid'));
    valid = false;
  }
  if (message && !message.value.trim()) {
    showFieldError(message, t('messageRequired'));
    valid = false;
  }

  if (!valid) return;

  // Disable button during submission
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = lang === 'zh' ? 'ç¼éä¸­...' : 'Sending...';
  }

  // Simulate sending (replace with real API)
  setTimeout(() => {
    showToast(lang === 'zh' ? 'è¨æ¯å·²ç¼éï¼æè¬æ¨ï¼' : 'Message sent! Thank you!');
    form.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = t('send');
    }
  }, 800);
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  updateCartCount();
  initScrollEffects();

  // Update lang toggle button
  const langBtn = document.querySelector('.lang-toggle');
  if (langBtn) langBtn.textContent = lang === 'en' ? 'ä¸­æ' : 'EN';

  // Page-specific init
  const page = document.body.dataset.page;

  if (page === 'home') {
    renderProducts('featured-products', 'all', 4);
  }

  if (page === 'shop') {
    renderProducts('product-grid', 'all');
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProducts('product-grid', currentFilter);
      });
    });
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

  // Newsletter form with validation
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (!emailInput || !validateEmail(emailInput.value)) {
        showFieldError(emailInput, t('emailInvalid'));
        return;
      }
      clearFieldError(emailInput);
      const btn = newsletterForm.querySelector('button');
      if (btn) { btn.disabled = true; btn.textContent = '...'; }
      setTimeout(() => {
        showToast(t('newsletterSuccess'));
        emailInput.value = '';
        if (btn) { btn.disabled = false; btn.textContent = lang === 'zh' ? 'è¨é±' : 'Subscribe'; }
      }, 600);
    });
  }

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

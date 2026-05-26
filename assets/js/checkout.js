/* ============================================
   Bubbly Studio — Square Checkout Module
   Phase 2: Full Payment Integration
   ============================================
   Dependencies: config.js, api.js, app.js
   ============================================ */

const bubblyCheckout = (() => {
  let card = null;
  let payments = null;
  let isProcessing = false;
  let sdkLoaded = false;
  let sdkLoadPromise = null;

  // --- Bilingual helpers ---
  function getLang() {
    return document.documentElement.lang === 'zh' ? 'zh' : 'en';
  }

  const labels = {
    en: {
      processing: 'Processing…',
      payNow: 'Pay Now',
      cardNumber: 'Card Number',
      expiry: 'Expiry',
      emailRequired: 'Please enter a valid email address.',
      nameRequired: 'Please enter your name.',
      emptyCart: 'Your cart is empty.',
      paymentFailed: 'Payment could not be processed. Please check your card and try again.',
      networkError: 'Connection issue. Please check your internet and try again.',
      genericError: 'Something went wrong. Please try again.',
      tokenizeError: 'Card verification failed. Please check your card details.',
      orderSummary: 'Order Summary',
      total: 'Total',
      confirmTitle: 'Order Confirmed!',
      confirmMsg: 'A confirmation has been sent to',
      done: 'Done',
      secure: 'Secured by Square',
      title: 'Checkout',
      name: 'Full Name',
      email: 'Email',
      demoMode: 'Demo Mode'
    },
    zh: {
      processing: '處理中…',
      payNow: '立即付款',
      cardNumber: '卡號',
      expiry: '到期日',
      emailRequired: '請輸入有效的電子郵件地址。',
      nameRequired: '請輸入您的姓名。',
      emptyCart: '您的購物車是空的。',
      paymentFailed: '付款無法處理。請檢查您的卡片並重試。',
      networkError: '連線問題。請檢查您的網路並重試。',
      genericError: '發生錯誤。請重試。',
      tokenizeError: '卡片驗證失敗。請檢查您的卡片資訊。',
      orderSummary: '訂單摘要',
      total: '總計',
      confirmTitle: '訂單已確認！',
      confirmMsg: '確認信已發送至',
      done: '完成',
      secure: '由 Square 安全保護',
      title: '結帳',
      name: '姓名',
      email: '電子郵件',
      demoMode: '展示模式'
    }
  };

  function label(key) {
    const lang = getLang();
    return (labels[lang] && labels[lang][key]) || labels.en[key] || key;
  }

  // Also try app.js t() function for data-i18n keys
  function t(key) {
    if (typeof window.t === 'function') return window.t(key);
    return label(key);
  }

  // --- Square SDK Loader ---
  function loadSquareSDK() {
    if (sdkLoaded || typeof Square !== 'undefined') {
      sdkLoaded = true;
      return Promise.resolve(true);
    }

    if (sdkLoadPromise) return sdkLoadPromise;

    sdkLoadPromise = new Promise((resolve) => {
      if (typeof BUBBLY_CONFIG === 'undefined') {
        console.warn('🫧 Checkout: BUBBLY_CONFIG not found');
        resolve(false);
        return;
      }

      const script = document.createElement('script');
      script.src = BUBBLY_CONFIG.squareWebSdkUrl;
      script.onload = () => {
        sdkLoaded = true;
        console.log('🫧 Checkout: Square SDK loaded');
        resolve(true);
      };
      script.onerror = () => {
        console.warn('🫧 Checkout: Square SDK failed to load — demo mode');
        resolve(false);
      };
      document.head.appendChild(script);
    });

    return sdkLoadPromise;
  }

  // --- Square Payments Init ---
  async function initPayments() {
    if (payments) return true;

    const loaded = await loadSquareSDK();
    if (!loaded || typeof Square === 'undefined') {
      console.log('🫧 Checkout: Square SDK not available — demo mode');
      return false;
    }

    try {
      payments = Square.payments(
        BUBBLY_CONFIG.squareAppId,
        BUBBLY_CONFIG.squareLocationId
      );
      console.log('🫧 Checkout: Square Payments initialized');
      return true;
    } catch (e) {
      console.warn('🫧 Checkout: Square Payments init failed:', e.message);
      return false;
    }
  }

  // --- Card Form ---
  async function attachCardForm(containerId) {
    if (!payments) return false;
    try {
      card = await payments.card();
      await card.attach('#' + containerId);
      console.log('🫧 Checkout: Card form attached');
      return true;
    } catch (e) {
      console.warn('🫧 Checkout: Card form attach failed:', e.message);
      return false;
    }
  }

  function showDemoCard(container) {
    container.classList.add('demo-mode');
    container.innerHTML =
      '<div class="demo-card-form">' +
        '<p class="demo-badge">' + label('demoMode') + '</p>' +
        '<div class="demo-field"><label>' + label('cardNumber') + '</label>' +
          '<input type="text" value="4111 1111 1111 1111" disabled></div>' +
        '<div class="demo-row">' +
          '<div class="demo-field"><label>' + label('expiry') + '</label>' +
            '<input type="text" value="12/28" disabled></div>' +
          '<div class="demo-field"><label>CVV</label>' +
            '<input type="text" value="123" disabled></div>' +
        '</div>' +
      '</div>';
  }

  // --- Order Summary ---
  function buildOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('bubblyCart') || '[]');
    if (!cart.length) return '';

    const lang = getLang();
    let total = 0;

    const items = cart.map(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      const name = lang === 'zh' && item.nameCn ? item.nameCn : item.name;
      return '<div class="checkout-item">' +
        '<span class="checkout-item-name">' + escHtml(name) +
          ' <span class="checkout-item-qty">&times;' + item.qty + '</span>' +
        '</span>' +
        '<span class="checkout-item-price">$' + subtotal.toFixed(2) + '</span>' +
      '</div>';
    }).join('');

    return '<div class="checkout-order-summary">' +
      '<h4>' + label('orderSummary') + '</h4>' +
      items +
      '<div class="checkout-divider"></div>' +
      '<div class="checkout-total">' +
        '<span>' + label('total') + '</span>' +
        '<span class="checkout-total-amount">$' + total.toFixed(2) + '</span>' +
      '</div>' +
    '</div>';
  }

  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Cart Helpers ---
  function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('bubblyCart') || '[]');
    let total = 0;
    cart.forEach(item => { total += item.price * item.qty; });
    return total;
  }

  function getCartItems() {
    return JSON.parse(localStorage.getItem('bubblyCart') || '[]');
  }

  // --- Modal Open/Close ---
  async function open() {
    const cart = getCartItems();
    if (!cart.length) return;

    // Close cart drawer if open
    if (typeof toggleCart === 'function') {
      const drawer = document.querySelector('.cart-drawer');
      if (drawer && drawer.classList.contains('open')) toggleCart();
    }

    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    // Reset state
    isProcessing = false;
    const paymentStep = modal.querySelector('.checkout-step-payment');
    const confirmStep = modal.querySelector('.checkout-step-confirm');
    if (paymentStep) paymentStep.style.display = 'block';
    if (confirmStep) confirmStep.style.display = 'none';

    // Clear previous errors
    const errorEl = document.getElementById('checkout-error');
    if (errorEl) errorEl.textContent = '';

    // Reset pay button
    const payBtn = document.getElementById('checkout-pay-btn');
    if (payBtn) {
      payBtn.textContent = label('payNow');
      payBtn.disabled = false;
      payBtn.classList.remove('loading');
    }

    // Build order summary
    const summaryContainer = modal.querySelector('.checkout-summary-container');
    if (summaryContainer) summaryContainer.innerHTML = buildOrderSummary();

    // Show modal
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Initialize Square SDK and card form
    const squareReady = await initPayments();
    const cardContainer = document.getElementById('sq-card-container');

    if (squareReady && cardContainer) {
      cardContainer.innerHTML = '';
      cardContainer.classList.remove('demo-mode');
      const attached = await attachCardForm('sq-card-container');
      if (attached) return; // Card form is live
    }

    // Fallback to demo mode
    if (cardContainer) {
      showDemoCard(cardContainer);
    }
  }

  function close() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    // Cleanup card form
    if (card) {
      try { card.destroy(); } catch (e) { /* ignore */ }
      card = null;
    }
  }

  // --- Validation ---
  function validateForm() {
    const emailEl = document.getElementById('checkout-email');
    const nameEl = document.getElementById('checkout-name');
    const email = emailEl ? emailEl.value.trim() : '';
    const name = nameEl ? nameEl.value.trim() : '';

    // Clear previous field errors
    clearFieldError('checkout-name');
    clearFieldError('checkout-email');

    const errors = [];

    if (!name) {
      showFieldError('checkout-name', label('nameRequired'));
      errors.push(label('nameRequired'));
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError('checkout-email', label('emailRequired'));
      errors.push(label('emailRequired'));
    }

    return errors.length === 0 ? { name, email } : null;
  }

  function showFieldError(fieldId, msg) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.style.borderColor = 'oklch(0.55 0.2 25)';
    // Add error message below field
    let errSpan = el.parentElement.querySelector('.field-error');
    if (!errSpan) {
      errSpan = document.createElement('span');
      errSpan.className = 'field-error';
      errSpan.style.cssText = 'color:oklch(0.55 0.2 25);font-size:0.8rem;display:block;margin-top:4px;';
      el.parentElement.appendChild(errSpan);
    }
    errSpan.textContent = msg;
  }

  function clearFieldError(fieldId) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.style.borderColor = '';
    const errSpan = el.parentElement.querySelector('.field-error');
    if (errSpan) errSpan.remove();
  }

  // --- Payment Flow ---
  async function pay() {
    if (isProcessing) return;

    const formData = validateForm();
    if (!formData) return;

    isProcessing = true;

    const payBtn = document.getElementById('checkout-pay-btn');
    const errorEl = document.getElementById('checkout-error');

    if (errorEl) errorEl.textContent = '';
    if (payBtn) {
      payBtn.textContent = label('processing');
      payBtn.disabled = true;
      payBtn.classList.add('loading');
    }

    try {
      const cart = getCartItems();
      if (!cart.length) throw new Error(label('emptyCart'));

      const total = getCartTotal();
      const amountCents = Math.round(total * 100);

      let sourceId = 'DEMO_TOKEN';
      let customerId = null;
      const isLive = card && typeof bubblyAPI !== 'undefined' && bubblyAPI.isReady();

      if (isLive) {
        // --- Live Square Payment Flow ---

        // 1. Tokenize card
        const tokenResult = await card.tokenize();
        if (tokenResult.status !== 'OK') {
          const errMsg = tokenResult.errors?.[0]?.message || label('tokenizeError');
          throw new Error(errMsg);
        }
        sourceId = tokenResult.token;

        // 2. Create or find customer
        const nameParts = formData.name.split(' ');
        const customerResult = await bubblyAPI.createCustomer({
          emailAddress: formData.email,
          givenName: nameParts[0] || '',
          familyName: nameParts.slice(1).join(' ') || ''
        });
        customerId = customerResult.id;

        // 3. Process payment
        await bubblyAPI.createPayment({
          sourceId: sourceId,
          amountCents: amountCents,
          currency: 'CAD',
          customerId: customerId,
          note: 'Bubbly Studio Online Order — ' + cart.map(i => i.name + ' x' + i.qty).join(', ')
        });

      } else {
        // --- Demo Mode: simulate processing delay ---
        await new Promise(r => setTimeout(r, 1500));
      }

      // Success!
      showConfirmation(formData.email);
      localStorage.removeItem('bubblyCart');
      if (typeof updateCartCount === 'function') updateCartCount();
      if (typeof renderCart === 'function') renderCart();

    } catch (e) {
      console.error('🫧 Checkout error:', e);

      let userMessage = label('genericError');

      if (e.code === 'networkError' || e.name === 'TypeError') {
        userMessage = label('networkError');
      } else if (e.code === 'paymentFailed' || e.code === 'serverError') {
        userMessage = label('paymentFailed');
      } else if (e.message) {
        userMessage = e.message;
      }

      if (errorEl) errorEl.textContent = userMessage;

      if (payBtn) {
        payBtn.textContent = label('payNow');
        payBtn.disabled = false;
        payBtn.classList.remove('loading');
      }

      isProcessing = false;
    }
  }

  // --- Confirmation ---
  function showConfirmation(email) {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const paymentStep = modal.querySelector('.checkout-step-payment');
    const confirmStep = modal.querySelector('.checkout-step-confirm');

    if (paymentStep) paymentStep.style.display = 'none';
    if (confirmStep) {
      confirmStep.style.display = 'block';
      const emailSpan = confirmStep.querySelector('.confirm-email');
      if (emailSpan) emailSpan.textContent = email;
    }
  }

  // --- Public API ---
  return { open, close, pay, loadSquareSDK };
})();

// Global checkout() function called from cart drawer
function checkout() { bubblyCheckout.open(); }

// Preload Square SDK when page loads (non-blocking)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bubblyCheckout.loadSquareSDK());
} else {
  bubblyCheckout.loadSquareSDK();
}

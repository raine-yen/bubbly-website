/* ============================================
   Bubbly Studio — Square Checkout Module
   ============================================ */

const bubblyCheckout = (() => {
  let card = null;
  let payments = null;
  let isProcessing = false;

  async function initPayments() {
    if (typeof Square === 'undefined') {
      console.log('Square SDK not loaded — demo mode');
      return false;
    }
    try {
      payments = Square.payments(BUBBLY_CONFIG.squareAppId, BUBBLY_CONFIG.squareLocationId);
      return true;
    } catch (e) {
      console.log('Square Payments init failed:', e.message);
      return false;
    }
  }

  async function attachCardForm(containerId) {
    if (!payments) return false;
    try {
      card = await payments.card();
      await card.attach('#' + containerId);
      return true;
    } catch (e) {
      console.log('Card form attach failed:', e.message);
      return false;
    }
  }

  function buildOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('bubblyCart') || '[]');
    if (!cart.length) return '';
    const lang = document.documentElement.lang === 'zh' ? 'zh' : 'en';
    let total = 0;
    const items = cart.map(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      const name = lang === 'zh' && item.nameCn ? item.nameCn : item.name;
      return '<div class="checkout-item"><span class="checkout-item-name">' + name +
        ' <span class="checkout-item-qty">&times;' + item.qty + '</span></span>' +
        '<span class="checkout-item-price">$' + subtotal.toFixed(2) + '</span></div>';
    }).join('');
    return '<div class="checkout-order-summary">' +
      '<h4 data-i18n="ckOrderSummary">' + (typeof t === 'function' ? t('ckOrderSummary') : 'Order Summary') + '</h4>' +
      items + '<div class="checkout-divider"></div>' +
      '<div class="checkout-total"><span data-i18n="ckTotal">' + (typeof t === 'function' ? t('ckTotal') : 'Total') + '</span>' +
      '<span class="checkout-total-amount">$' + total.toFixed(2) + '</span></div></div>';
  }

  async function open() {
    const cart = JSON.parse(localStorage.getItem('bubblyCart') || '[]');
    if (!cart.length) return;
    if (typeof toggleCart === 'function') {
      const drawer = document.querySelector('.cart-drawer');
      if (drawer && drawer.classList.contains('open')) toggleCart();
    }
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    isProcessing = false;
    modal.querySelector('.checkout-step-payment').style.display = 'block';
    modal.querySelector('.checkout-step-confirm').style.display = 'none';
    modal.querySelector('.checkout-summary-container').innerHTML = buildOrderSummary();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const squareReady = await initPayments();
    const cardContainer = document.getElementById('sq-card-container');
    if (squareReady && cardContainer) {
      cardContainer.innerHTML = '';
      const attached = await attachCardForm('sq-card-container');
      if (attached) { cardContainer.classList.remove('demo-mode'); return; }
    }
    if (cardContainer) {
      cardContainer.classList.add('demo-mode');
      cardContainer.innerHTML =
        '<div class="demo-card-form"><p class="demo-badge">Demo Mode</p>' +
        '<div class="demo-field"><label>' + (typeof t === 'function' ? t('ckCardNumber') : 'Card Number') + '</label><input type="text" value="4111 1111 1111 1111" disabled></div>' +
        '<div class="demo-row"><div class="demo-field"><label>' + (typeof t === 'function' ? t('ckExpiry') : 'Expiry') + '</label><input type="text" value="12/28" disabled></div>' +
        '<div class="demo-field"><label>CVV</label><input type="text" value="123" disabled></div></div></div>';
    }
  }

  function close() {
    const modal = document.getElementById('checkout-modal');
    if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    if (card) { try { card.destroy(); } catch(e) {} card = null; }
  }

  async function pay() {
    if (isProcessing) return;
    isProcessing = true;
    const payBtn = document.getElementById('checkout-pay-btn');
    const errorEl = document.getElementById('checkout-error');
    if (errorEl) errorEl.textContent = '';
    const origText = payBtn.textContent;
    payBtn.textContent = typeof t === 'function' ? t('ckProcessing') : 'Processing...';
    payBtn.disabled = true;
    try {
      const cart = JSON.parse(localStorage.getItem('bubblyCart') || '[]');
      let total = 0;
      cart.forEach(item => { total += item.price * item.qty; });
      const amountCents = Math.round(total * 100);
      const emailEl = document.getElementById('checkout-email');
      const nameEl = document.getElementById('checkout-name');
      const email = emailEl ? emailEl.value.trim() : '';
      const name = nameEl ? nameEl.value.trim() : '';
      if (!email || !email.includes('@')) {
        throw new Error(typeof t === 'function' ? t('ckEmailRequired') : 'Please enter a valid email');
      }
      let sourceId = 'DEMO_TOKEN';
      let customerId = null;
      if (card && typeof bubblyAPI !== 'undefined' && bubblyAPI.isReady()) {
        const tokenResult = await card.tokenize();
        if (tokenResult.status !== 'OK') throw new Error(tokenResult.errors?.[0]?.message || 'Payment failed');
        sourceId = tokenResult.token;
        const nameParts = name.split(' ');
        const customerResult = await bubblyAPI.createCustomer({ email, firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '' });
        customerId = customerResult.id;
        await bubblyAPI.createPayment({ sourceId, amount: amountCents, currency: 'USD', customerId, note: 'Bubbly Studio Online Order' });
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }
      showConfirmation(email);
      localStorage.removeItem('bubblyCart');
      if (typeof updateCartCount === 'function') updateCartCount();
      if (typeof renderCart === 'function') renderCart();
    } catch (e) {
      if (errorEl) errorEl.textContent = e.message;
      payBtn.textContent = origText;
      payBtn.disabled = false;
      isProcessing = false;
    }
  }

  function showConfirmation(email) {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    modal.querySelector('.checkout-step-payment').style.display = 'none';
    const confirmStep = modal.querySelector('.checkout-step-confirm');
    confirmStep.style.display = 'block';
    const emailSpan = confirmStep.querySelector('.confirm-email');
    if (emailSpan) emailSpan.textContent = email;
  }

  return { open, close, pay };
})();

function checkout() { bubblyCheckout.open(); }

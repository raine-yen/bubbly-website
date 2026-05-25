/* ============================================
   Bubbly Studio — Square API Abstraction Layer
   ============================================

   All Square API calls route through the Cloudflare Worker proxy
   (server-side auth required). Client-side Square Web SDK is used
   only for payment form rendering.

   Dependencies: config.js must be loaded first (provides BUBBLY_CONFIG)
   ============================================ */

const bubblyAPI = (() => {
  // --- Internal State ---
  let _initialized = false;
  let _payments = null; // Square Web Payments SDK instance
  let _config = null;

  // --- Bilingual Error Messages ---
  const errors = {
    en: {
      networkError: 'Unable to connect. Please check your internet and try again.',
      serverError: 'Something went wrong on our end. Please try again shortly.',
      notInitialized: 'System is still loading. Please wait a moment.',
      invalidEmail: 'Please enter a valid email address.',
      invalidName: 'Please enter your name.',
      invalidPhone: 'Please enter a valid phone number.',
      noSlots: 'No available times for this date. Please try another day.',
      bookingFailed: 'Booking could not be completed. Please try again.',
      bookingSuccess: 'Your workshop is booked! Check your email for confirmation.',
      paymentFailed: 'Payment could not be processed. Please check your card and try again.',
      paymentSuccess: 'Payment received! Thank you for your order.',
      productNotFound: 'This product is currently unavailable.',
      rateLimited: 'Too many requests. Please wait a moment and try again.',
      timeout: 'The request took too long. Please try again.'
    },
    zh: {
      networkError: '無法連線。請檢查您的網路並重試。',
      serverError: '系統發生問題。請稍後再試。',
      notInitialized: '系統正在載入，請稍候。',
      invalidEmail: '請輸入有效的電子郵件地址。',
      invalidName: '請輸入您的姓名。',
      invalidPhone: '請輸入有效的電話號碼。',
      noSlots: '此日期無可用時段。請嘗試其他日期。',
      bookingFailed: '預約未能完成。請重試。',
      bookingSuccess: '工作坊已預約成功！請查看您的電子郵件確認。',
      paymentFailed: '付款無法處理。請檢查您的卡片並重試。',
      paymentSuccess: '付款成功！感謝您的訂單。',
      productNotFound: '此商品目前無法使用。',
      rateLimited: '請求過多。請稍候再試。',
      timeout: '請求逾時。請重試。'
    }
  };

  // --- Helpers ---

  function getErrorMsg(key) {
    const currentLang = (typeof lang !== 'undefined') ? lang : 'en';
    return (errors[currentLang] && errors[currentLang][key]) || errors.en[key] || key;
  }

  function log(...args) {
    if (_config && _config.debug) {
      console.log('🫧 bubblyAPI:', ...args);
    }
  }

  async function apiCall(endpoint, options = {}) {
    if (!_initialized) {
      throw new BubblyError('notInitialized', getErrorMsg('notInitialized'));
    }

    const url = `${_config.workerBase}${endpoint}`;
    const timeout = options.timeout || 15000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      log(`${options.method || 'GET'} ${endpoint}`);

      const res = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.status === 429) {
        throw new BubblyError('rateLimited', getErrorMsg('rateLimited'));
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        log('API error:', res.status, errorData);
        throw new BubblyError('serverError', getErrorMsg('serverError'), errorData);
      }

      const data = await res.json();
      log('Response:', endpoint, data);
      return data;

    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof BubblyError) throw err;

      if (err.name === 'AbortError') {
        throw new BubblyError('timeout', getErrorMsg('timeout'));
      }

      throw new BubblyError('networkError', getErrorMsg('networkError'), err);
    }
  }

  // --- Custom Error Class ---
  class BubblyError extends Error {
    constructor(code, message, details = null) {
      super(message);
      this.name = 'BubblyError';
      this.code = code;
      this.details = details;
    }
  }

  // --- Loading State Helper ---
  function setLoading(element, loading) {
    if (!element) return;
    if (loading) {
      element.dataset.originalText = element.textContent;
      element.disabled = true;
      element.classList.add('bubbly-loading');
      element.textContent = '...';
    } else {
      element.disabled = false;
      element.classList.remove('bubbly-loading');
      element.textContent = element.dataset.originalText || element.textContent;
    }
  }

  // --- Validation ---
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    // Accepts international formats, loose check
    return /^[\d\s\-\+\(\)]{7,20}$/.test(phone);
  }

  function validateCustomerInfo(info) {
    const errs = [];
    if (!info.givenName || !info.givenName.trim()) {
      errs.push(getErrorMsg('invalidName'));
    }
    if (!info.emailAddress || !validateEmail(info.emailAddress)) {
      errs.push(getErrorMsg('invalidEmail'));
    }
    if (info.phoneNumber && !validatePhone(info.phoneNumber)) {
      errs.push(getErrorMsg('invalidPhone'));
    }
    return errs;
  }

  // =============================================
  // PUBLIC API
  // =============================================

  return {
    BubblyError,

    /**
     * Initialize the API layer.
     * Must be called once on page load (after config.js loads).
     * Optionally initializes Square Web Payments SDK for payment pages.
     *
     * @param {Object} options
     * @param {boolean} options.payments - Load Square Web Payments SDK (for shop/checkout pages)
     * @returns {Promise<void>}
     */
    async init(options = {}) {
      if (_initialized) {
        log('Already initialized');
        return;
      }

      if (typeof BUBBLY_CONFIG === 'undefined') {
        throw new Error('BUBBLY_CONFIG not found. Load config.js before api.js');
      }

      _config = BUBBLY_CONFIG;
      log('Initializing...', _config.env);

      // Verify worker connectivity
      try {
        const health = await fetch(`${_config.workerBase}/health`, {
          signal: AbortSignal.timeout(5000)
        });
        if (health.ok) {
          log('Worker connected');
        } else {
          console.warn('🫧 bubblyAPI: Worker returned non-OK status');
        }
      } catch (e) {
        console.warn('🫧 bubblyAPI: Worker not reachable — API calls will fail. Is the worker deployed?');
      }

      // Initialize Square Web Payments SDK if requested
      if (options.payments) {
        try {
          if (typeof Square === 'undefined') {
            log('Square SDK not loaded yet — ensure the script tag is in HTML');
          } else {
            _payments = await Square.payments(_config.squareAppId, _config.squareLocationId);
            log('Square Payments SDK initialized');
          }
        } catch (e) {
          console.error('🫧 bubblyAPI: Failed to init Square Payments:', e);
        }
      }

      _initialized = true;
      log('Ready (' + _config.env + ')');

      // Dispatch custom event for other scripts to hook into
      window.dispatchEvent(new CustomEvent('bubbly:ready', { detail: { env: _config.env } }));
    },

    /**
     * Check if the API is initialized.
     * @returns {boolean}
     */
    isReady() {
      return _initialized;
    },

    // =============================================
    // BOOKINGS (Phase 1 — Workshops)
    // =============================================

    /**
     * Get available booking slots for a service.
     *
     * @param {string} serviceId - Square Catalog service ID
     * @param {Object} dateRange
     * @param {string} dateRange.startDate - ISO date string (YYYY-MM-DD)
     * @param {string} dateRange.endDate - ISO date string (YYYY-MM-DD)
     * @returns {Promise<Array>} Array of available time slots
     */
    async getAvailableSlots(serviceId, dateRange) {
      const data = await apiCall('/bookings/availability', {
        method: 'POST',
        body: {
          serviceId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          locationId: _config.squareLocationId
        }
      });
      return data.availabilities || [];
    },

    /**
     * Book a workshop session.
     *
     * @param {Object} params
     * @param {string} params.serviceId - Square Catalog service ID
     * @param {string} params.startAt - ISO 8601 datetime for the booking
     * @param {Object} params.customer - Customer info
     * @param {string} params.customer.givenName
     * @param {string} params.customer.familyName
     * @param {string} params.customer.emailAddress
     * @param {string} [params.customer.phoneNumber]
     * @param {string} [params.note] - Optional booking note
     * @returns {Promise<Object>} Booking confirmation
     */
    async bookWorkshop(params) {
      // Validate customer info
      const validationErrors = validateCustomerInfo(params.customer);
      if (validationErrors.length > 0) {
        throw new BubblyError('validation', validationErrors.join(' '));
      }

      const data = await apiCall('/bookings/create', {
        method: 'POST',
        body: {
          serviceId: params.serviceId,
          startAt: params.startAt,
          locationId: _config.squareLocationId,
          customer: params.customer,
          note: params.note || ''
        }
      });

      return data.booking;
    },

    /**
     * Cancel a booking.
     *
     * @param {string} bookingId
     * @returns {Promise<Object>}
     */
    async cancelBooking(bookingId) {
      return await apiCall(`/bookings/${bookingId}/cancel`, {
        method: 'POST'
      });
    },

    // =============================================
    // CATALOG / PRODUCTS (Phase 2 — Shop)
    // =============================================

    /**
     * Get products from Square Catalog, optionally filtered by category.
     *
     * @param {string} [category] - Category filter (e.g., 'soaps', 'candles')
     * @returns {Promise<Array>} Array of product objects
     */
    async getProducts(category) {
      const params = category ? `?category=${encodeURIComponent(category)}` : '';
      const data = await apiCall(`/catalog/products${params}`);
      return data.products || [];
    },

    /**
     * Get a single product by ID.
     *
     * @param {string} productId
     * @returns {Promise<Object>} Product detail
     */
    async getProduct(productId) {
      const data = await apiCall(`/catalog/products/${productId}`);
      return data.product || null;
    },

    /**
     * Sync Square Catalog with local products.json.
     * (Used in Phase 2 migration)
     *
     * @returns {Promise<Object>} Sync result with counts
     */
    async syncCatalog() {
      return await apiCall('/catalog/sync', { method: 'POST' });
    },

    // =============================================
    // PAYMENTS (Phase 2 — Checkout)
    // =============================================

    /**
     * Get the Square Payments SDK instance (for card form rendering).
     * Only available if init({ payments: true }) was called.
     *
     * @returns {Object|null} Square Payments instance
     */
    getPaymentsInstance() {
      return _payments;
    },

    /**
     * Create a payment via the worker proxy.
     *
     * @param {Object} params
     * @param {string} params.sourceId - Payment token from Square card form
     * @param {number} params.amountCents - Amount in cents
     * @param {string} params.currency - Currency code (default: 'CAD')
     * @param {string} [params.customerId] - Square Customer ID
     * @param {string} [params.orderId] - Square Order ID
     * @param {string} [params.note] - Payment note
     * @returns {Promise<Object>} Payment result
     */
    async createPayment(params) {
      const data = await apiCall('/payments/create', {
        method: 'POST',
        body: {
          sourceId: params.sourceId,
          amountCents: params.amountCents,
          currency: params.currency || 'CAD',
          customerId: params.customerId,
          orderId: params.orderId,
          note: params.note || 'Bubbly Studio order',
          locationId: _config.squareLocationId
        }
      });
      return data.payment;
    },

    // =============================================
    // CUSTOMERS (Phase 1+)
    // =============================================

    /**
     * Create or find a customer in Square.
     *
     * @param {Object} info
     * @param {string} info.givenName
     * @param {string} [info.familyName]
     * @param {string} info.emailAddress
     * @param {string} [info.phoneNumber]
     * @returns {Promise<Object>} Customer object (new or existing)
     */
    async createCustomer(info) {
      const validationErrors = validateCustomerInfo(info);
      if (validationErrors.length > 0) {
        throw new BubblyError('validation', validationErrors.join(' '));
      }

      const data = await apiCall('/customers/create-or-find', {
        method: 'POST',
        body: info
      });
      return data.customer;
    },

    /**
     * Subscribe a customer to a group (e.g., newsletter).
     * (Phase 3)
     *
     * @param {string} customerId
     * @param {string} groupId
     * @returns {Promise<Object>}
     */
    async addCustomerToGroup(customerId, groupId) {
      return await apiCall(`/customers/${customerId}/groups/${groupId}`, {
        method: 'PUT'
      });
    },

    // =============================================
    // LOYALTY (Phase 4)
    // =============================================

    /**
     * Get loyalty account for a customer.
     *
     * @param {string} customerId
     * @returns {Promise<Object|null>} Loyalty account or null
     */
    async getLoyaltyAccount(customerId) {
      try {
        const data = await apiCall(`/loyalty/accounts?customerId=${customerId}`);
        return data.account || null;
      } catch (e) {
        if (e.code === 'serverError') return null;
        throw e;
      }
    },

    /**
     * Get loyalty program details.
     *
     * @returns {Promise<Object>} Loyalty program info
     */
    async getLoyaltyProgram() {
      const data = await apiCall('/loyalty/program');
      return data.program;
    },

    // =============================================
    // UTILITIES
    // =============================================

    /** Set loading state on a button/element */
    setLoading,

    /** Get a bilingual error message by key */
    getErrorMsg,

    /** Validate an email address */
    validateEmail,

    /** Get current config (read-only) */
    getConfig() {
      return _config ? { ..._config } : null;
    }
  };
})();

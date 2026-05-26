  /* ============================================
     Bubbly Workshop Booking Widget — Phase 1 Final
     Session 3: Edge cases, error handling, timezone support
     ============================================ */

  // --- State ---
  let bookingState = {
    workshop: null,
    date: null,
    time: null,
    step: 1,
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
    isSubmitting: false,       // double-submit guard
    bookingId: null,           // returned from API
    slotsCache: {},            // cache slots per date to avoid re-fetch
    retryCount: 0,
    maxRetries: 2
  };

  // Workshop data (will come from Square Catalog in Phase 2)
  const workshops = {
    soap: {
      id: 'soap',
      name: 'Artisan Soap Making',
      nameCn: '手工皂製作',
      price: 65,
      duration: 120,
      maxCapacity: 8,
      serviceId: null // populated from Square Catalog when available
    },
    candle: {
      id: 'candle',
      name: 'Soy Candle Pouring',
      nameCn: '大豆蠟燭製作',
      price: 65,
      duration: 120,
      maxCapacity: 8,
      serviceId: null
    },
    waxmelt: {
      id: 'waxmelt',
      name: 'Wax Melt Workshop',
      nameCn: '蠟片工作坊',
      price: 45,
      duration: 90,
      maxCapacity: 8,
      serviceId: null
    }
  };

  // --- Timezone Utilities ---
  const tzUtil = {
    // Workshop location timezone (Vancouver / Pacific)
    workshopTz: 'America/Vancouver',

    /**
     * Get the user's local timezone
     */
    getUserTz() {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {
        return this.workshopTz; // fallback
      }
    },

    /**
     * Check if user is in a different timezone than the workshop
     */
    isDifferentTz() {
      const userTz = this.getUserTz();
      // Compare UTC offsets at the selected date
      if (!bookingState.date) return false;
      const d = bookingState.date;
      const workshopOffset = this.getOffset(d, this.workshopTz);
      const userOffset = this.getOffset(d, userTz);
      return workshopOffset !== userOffset;
    },

    /**
     * Get UTC offset in minutes for a timezone at a given date
     */
    getOffset(date, tz) {
      try {
        const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
        const tzStr = date.toLocaleString('en-US', { timeZone: tz });
        return (new Date(utcStr) - new Date(tzStr)) / 60000;
      } catch (e) {
        return 0;
      }
    },

    /**
     * Format a time string in the workshop's timezone for display,
     * with optional conversion to user's local time
     */
    formatSlotTime(timeStr, date) {
      const [h, m] = timeStr.split(':').map(Number);

      // Format in workshop timezone
      const workshopTime = formatTime(timeStr);

      if (!this.isDifferentTz()) return workshopTime;

      // Also show user's local time
      try {
        const workshopDate = new Date(date);
        workshopDate.setHours(h, m, 0, 0);

        // Create a date in the workshop timezone, then convert to user's tz
        const userTz = this.getUserTz();
        const localTime = workshopDate.toLocaleTimeString(lang === 'zh' ? 'zh-TW' : 'en-US', {
          timeZone: userTz,
          hour: 'numeric',
          minute: '2-digit',
          hour12: lang !== 'zh'
        });

        const tzAbbr = workshopDate.toLocaleTimeString('en-US', {
          timeZone: userTz,
          timeZoneName: 'short'
        }).split(' ').pop();

        return `${workshopTime} (${localTime} ${tzAbbr})`;
      } catch (e) {
        return workshopTime;
      }
    },

    /**
     * Build an ISO 8601 datetime string in the workshop timezone
     */
    buildISO(date, timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return `${dateStr}T${timeStr}:00-07:00`; // Pacific time offset (adjust for DST if needed)
    }
  };

  // --- Demo time slots (used when worker not deployed) ---
  function getDemoSlots(date) {
    // Check cache first
    const cacheKey = date.toDateString();
    if (bookingState.slotsCache[cacheKey]) {
      return bookingState.slotsCache[cacheKey];
    }

    const day = date.getDay();
    // No slots on Monday/Tuesday
    if (day === 1 || day === 2) return [];

    // Use seeded random based on date so slots are consistent
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const seededRandom = (n) => ((seed * 9301 + 49297 + n * 233) % 233280) / 233280;

    let slots;
    if (day === 0 || day === 6) {
      slots = [
        { time: '10:00', spots: Math.floor(seededRandom(1) * 5) + 2 },
        { time: '13:00', spots: Math.floor(seededRandom(2) * 4) + 1 },
        { time: '15:30', spots: Math.floor(seededRandom(3) * 6) + 2 }
      ];
    } else {
      slots = [
        { time: '14:00', spots: Math.floor(seededRandom(4) * 5) + 3 },
        { time: '18:30', spots: Math.floor(seededRandom(5) * 3) + 1 }
      ];
    }

    bookingState.slotsCache[cacheKey] = slots;
    return slots;
  }

  // --- Error Display ---
  function showBookingError(message, containerId) {
    const container = document.getElementById(containerId || 'booking-flow');
    if (!container) return;

    // Remove existing errors
    container.querySelectorAll('.booking-error').forEach(el => el.remove());

    const errorEl = document.createElement('div');
    errorEl.className = 'booking-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.style.cssText = 'background:oklch(0.95 0.05 25);border:1px solid oklch(0.7 0.15 25);color:oklch(0.4 0.15 25);padding:12px 20px;margin:16px 32px;border-radius:var(--radius-sm);font-size:0.9rem;display:flex;align-items:center;gap:8px;';
    errorEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>${message}</span>`;

    // Insert at top of current step panel
    const activePanel = container.querySelector('.step-panel.active');
    if (activePanel) {
      activePanel.insertBefore(errorEl, activePanel.firstChild);
    } else {
      container.insertBefore(errorEl, container.firstChild);
    }

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      errorEl.style.opacity = '0';
      errorEl.style.transition = 'opacity 0.3s';
      setTimeout(() => errorEl.remove(), 300);
    }, 8000);
  }

  function clearBookingErrors() {
    document.querySelectorAll('.booking-error').forEach(el => el.remove());
  }

  // --- Workshop Selection ---
  function selectWorkshop(type) {
    bookingState.workshop = workshops[type];
    bookingState.date = null;
    bookingState.time = null;
    bookingState.step = 1;
    bookingState.isSubmitting = false;
    bookingState.bookingId = null;
    bookingState.slotsCache = {};
    bookingState.retryCount = 0;

    // Update card selection
    document.querySelectorAll('.workshop-type-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.workshop === type);
    });

    // Show booking flow
    const flow = document.getElementById('booking-flow');
    flow.classList.add('active');
    flow.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Reset steps
    clearBookingErrors();
    updateStepUI();
    renderCalendar();
    document.getElementById('btn-next').disabled = true;
    document.getElementById('time-slots-container').style.display = 'none';
  }

  // --- Calendar ---
  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('cal-month-year');
    const { calendarMonth, calendarYear } = bookingState;

    const monthNames = lang === 'zh'
      ? ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
      : ['January','February','March','April','May','June','July','August','September','October','November','December'];

    const dayLabels = lang === 'zh'
      ? ['日','一','二','三','四','五','六']
      : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    monthYear.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow booking more than 3 months out
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    let html = dayLabels.map(d => `<div class="calendar-day-label">${d}</div>`).join('');

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calendarYear, calendarMonth, d);
      const isPast = date < today;
      const isTooFar = date > maxDate;
      const isToday = date.getTime() === today.getTime();
      const isSelected = bookingState.date && date.toDateString() === bookingState.date.toDateString();
      const dayOfWeek = date.getDay();
      const hasSlots = dayOfWeek !== 1 && dayOfWeek !== 2 && !isPast && !isTooFar;

      let classes = 'calendar-day';
      if (isPast || isTooFar) classes += ' disabled';
      if (isToday) classes += ' today';
      if (isSelected) classes += ' selected';
      if (hasSlots) classes += ' has-slots';

      html += `<button class="${classes}" ${(isPast || isTooFar) ? 'disabled' : ''} onclick="selectDate(${calendarYear},${calendarMonth},${d})">${d}</button>`;
    }

    grid.innerHTML = html;

    // Disable prev button if current month
    const now = new Date();
    document.getElementById('cal-prev').disabled =
      calendarYear === now.getFullYear() && calendarMonth === now.getMonth();

    // Disable next button if 3 months out
    document.getElementById('cal-next').disabled =
      calendarYear === maxDate.getFullYear() && calendarMonth >= maxDate.getMonth();
  }

  function calendarNav(dir) {
    bookingState.calendarMonth += dir;
    if (bookingState.calendarMonth > 11) {
      bookingState.calendarMonth = 0;
      bookingState.calendarYear++;
    } else if (bookingState.calendarMonth < 0) {
      bookingState.calendarMonth = 11;
      bookingState.calendarYear--;
    }
    renderCalendar();
  }

  function selectDate(year, month, day) {
    bookingState.date = new Date(year, month, day);
    bookingState.time = null;
    document.getElementById('btn-next').disabled = true;
    clearBookingErrors();
    renderCalendar();
    renderTimeSlots();
  }

  // --- Time Slots ---
  async function renderTimeSlots() {
    const container = document.getElementById('time-slots-container');
    const dateLabel = document.getElementById('time-slots-date');
    const grid = document.getElementById('time-slot-grid');

    if (!bookingState.date) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';

    const dateStr = bookingState.date.toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });

    // Show timezone notice if user is in a different timezone
    let tzNotice = '';
    if (tzUtil.isDifferentTz()) {
      const userTz = tzUtil.getUserTz().replace(/_/g, ' ').split('/').pop();
      const noticeText = lang === 'zh'
        ? `時間以溫哥華時區 (太平洋時間) 顯示。您的時區: ${userTz}`
        : `Times shown in Vancouver (Pacific Time). Your timezone: ${userTz}`;
      tzNotice = `<div style="font-size:0.78rem;color:var(--text-light);margin-top:4px;display:flex;align-items:center;gap:4px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> ${noticeText}</div>`;
    }

    dateLabel.innerHTML = dateStr + tzNotice;

    // Try real API first, fall back to demo
    let slots;
    let isLive = false;

    try {
      if (typeof bubblyAPI !== 'undefined' && bubblyAPI.isReady() && bookingState.workshop.serviceId) {
        grid.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-light)"><div class="spinner" style="width:24px;height:24px;border:2px solid var(--border);border-top-color:var(--pink);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 8px"></div>Loading...</div>';
        const isoDate = bookingState.date.toISOString().split('T')[0];
        const endDate = new Date(bookingState.date);
        endDate.setDate(endDate.getDate() + 1);
        const availabilities = await bubblyAPI.getAvailableSlots(
          bookingState.workshop.serviceId,
          { startDate: isoDate, endDate: endDate.toISOString().split('T')[0] }
        );
        slots = availabilities.map(a => ({
          time: a.startAt.split('T')[1].substring(0, 5),
          spots: a.availableSpots || 1
        }));
        isLive = true;
      }
    } catch (err) {
      console.log('Slots API unavailable, using demo:', err.message);
    }

    if (!slots) {
      slots = getDemoSlots(bookingState.date);
    }

    if (slots.length === 0) {
      grid.innerHTML = `
        <div class="no-slots" style="grid-column:1/-1">
          <div class="no-slots-icon">📅</div>
          <p>${lang === 'zh' ? '此日期無可用時段' : 'No available slots on this date'}</p>
          <p style="font-size:0.8rem;margin-top:4px">${lang === 'zh' ? '請嘗試其他日期' : 'Try another day'}</p>
        </div>`;
      return;
    }

    grid.innerHTML = slots.map(slot => {
      const isSelected = bookingState.time === slot.time;
      const isSoldOut = slot.spots <= 0;
      const almostFull = slot.spots <= 2 && slot.spots > 0;

      if (isSoldOut) {
        const soldOutText = lang === 'zh' ? '已滿' : 'Sold Out';
        return `
          <button class="time-slot unavailable" disabled aria-label="${formatTime(slot.time)} - ${soldOutText}">
            ${tzUtil.formatSlotTime(slot.time, bookingState.date)}
            <div class="slot-spots" style="color:oklch(0.6 0.18 30);font-weight:600">${soldOutText}</div>
          </button>`;
      }

      const spotsText = lang === 'zh'
        ? `剩 ${slot.spots} 位`
        : `${slot.spots} spot${slot.spots > 1 ? 's' : ''} left`;

      return `
        <button class="time-slot ${isSelected ? 'selected' : ''}"
                onclick="selectTime('${slot.time}')"
                aria-label="${formatTime(slot.time)} - ${spotsText}">
          ${tzUtil.formatSlotTime(slot.time, bookingState.date)}
          <div class="slot-spots" style="${almostFull ? 'color:oklch(0.6 0.18 30);font-weight:600' : ''}">${spotsText}</div>
        </button>`;
    }).join('');
  }

  function selectTime(time) {
    bookingState.time = time;
    document.getElementById('btn-next').disabled = false;
    renderTimeSlots();
  }

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    if (lang === 'zh') return `${h}:${m.toString().padStart(2, '0')}`;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  // --- Step Navigation ---
  function updateStepUI() {
    const { step } = bookingState;

    document.querySelectorAll('.booking-step').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active', 'completed');
      if (s === step) el.classList.add('active');
      if (s < step) el.classList.add('completed');
    });

    document.querySelectorAll('.step-panel').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.panel) === step);
    });

    document.getElementById('booking-actions').style.display = step === 3 ? 'none' : 'flex';

    const nextBtn = document.getElementById('btn-next');
    if (step === 2) {
      nextBtn.textContent = lang === 'zh' ? '確認預約' : 'Book Now';
      nextBtn.disabled = false;
    } else {
      nextBtn.textContent = lang === 'zh' ? '下一步' : 'Next';
    }
  }

  function bookingNext() {
    const { step } = bookingState;

    if (step === 1) {
      if (!bookingState.date || !bookingState.time) return;
      bookingState.step = 2;
      clearBookingErrors();
      updateStepUI();
      populateSummary();
    } else if (step === 2) {
      if (bookingState.isSubmitting) return; // double-submit guard
      if (!validateBookingForm()) return;
      bookingState.step = 3;
      updateStepUI();
      submitBooking();
    }
  }

  function bookingBack() {
    if (bookingState.step > 1) {
      bookingState.step--;
      bookingState.isSubmitting = false;
      clearBookingErrors();
      updateStepUI();
    } else {
      document.getElementById('booking-flow').classList.remove('active');
      document.querySelectorAll('.workshop-type-card').forEach(c => c.classList.remove('selected'));
      bookingState.workshop = null;
    }
  }

  function populateSummary() {
    const ws = bookingState.workshop;
    const nameEl = document.getElementById('summary-workshop-name');
    const dtEl = document.getElementById('summary-datetime');

    nameEl.textContent = lang === 'zh' ? ws.nameCn : ws.name;

    const dateStr = bookingState.date.toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
    dtEl.textContent = `${dateStr} · ${formatTime(bookingState.time)} · $${ws.price}`;
  }

  function validateBookingForm() {
    const firstName = document.getElementById('book-first-name');
    const email = document.getElementById('book-email');
    const phone = document.getElementById('book-phone');
    let valid = true;

    [firstName, email, phone].forEach(f => { if (f) clearFieldError(f); });

    if (!firstName.value.trim()) {
      showFieldError(firstName, lang === 'zh' ? '請輸入您的姓名' : 'Please enter your name');
      valid = false;
    }

    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showFieldError(email, lang === 'zh' ? '請輸入有效的電子郵件' : 'Please enter a valid email');
      valid = false;
    }

    // Optional phone validation
    if (phone.value.trim() && !/^[\d\s\-\+\(\)]{7,20}$/.test(phone.value.trim())) {
      showFieldError(phone, lang === 'zh' ? '請輸入有效的電話號碼' : 'Please enter a valid phone number');
      valid = false;
    }

    return valid;
  }

  // Fallback if showFieldError/clearFieldError aren't defined in app.js
  if (typeof showFieldError === 'undefined') {
    window.showFieldError = function(input, msg) {
      input.style.borderColor = 'oklch(0.6 0.18 30)';
      let errEl = input.parentElement.querySelector('.field-error');
      if (!errEl) {
        errEl = document.createElement('div');
        errEl.className = 'field-error';
        errEl.style.cssText = 'color:oklch(0.5 0.18 30);font-size:0.8rem;margin-top:4px';
        input.parentElement.appendChild(errEl);
      }
      errEl.textContent = msg;
    };
  }
  if (typeof clearFieldError === 'undefined') {
    window.clearFieldError = function(input) {
      input.style.borderColor = '';
      const errEl = input.parentElement.querySelector('.field-error');
      if (errEl) errEl.remove();
    };
  }

  async function submitBooking() {
    if (bookingState.isSubmitting) return;
    bookingState.isSubmitting = true;

    const loadingEl = document.getElementById('booking-loading');
    const successEl = document.getElementById('booking-success');

    loadingEl.style.display = 'block';
    successEl.style.display = 'none';

    const ws = bookingState.workshop;
    const customer = {
      givenName: document.getElementById('book-first-name').value.trim(),
      familyName: document.getElementById('book-last-name').value.trim(),
      emailAddress: document.getElementById('book-email').value.trim(),
      phoneNumber: document.getElementById('book-phone').value.trim()
    };
    const note = document.getElementById('book-notes').value.trim();

    try {
      if (typeof bubblyAPI !== 'undefined' && bubblyAPI.isReady() && ws.serviceId) {
        const startAt = tzUtil.buildISO(bookingState.date, bookingState.time);

        const result = await bubblyAPI.bookWorkshop({
          serviceId: ws.serviceId,
          startAt: startAt,
          customer: customer,
          note: note
        });

        bookingState.bookingId = result.id || null;
        showBookingSuccess(result, customer);
      } else {
        // Demo mode — simulate booking
        await new Promise(resolve => setTimeout(resolve, 1500));
        bookingState.bookingId = 'DEMO-' + Date.now();
        showBookingSuccess(null, customer);
      }
    } catch (err) {
      console.error('Booking failed:', err);

      // Handle specific error types
      if (err && err.code === 'networkError') {
        handleBookingError(
          lang === 'zh' ? '無法連線。請檢查您的網路並重試。' : 'Unable to connect. Please check your internet and try again.',
          true // retryable
        );
      } else if (err && err.code === 'rateLimited') {
        handleBookingError(
          lang === 'zh' ? '請求過多。請稍候再試。' : 'Too many requests. Please wait a moment and try again.',
          true
        );
      } else if (err && err.code === 'timeout') {
        handleBookingError(
          lang === 'zh' ? '請求逾時。請重試。' : 'The request took too long. Please try again.',
          true
        );
      } else if (err && err.details && err.details.code === 'CONFLICT') {
        // Double-booking: slot was taken between selection and submission
        handleBookingError(
          lang === 'zh' ? '很抱歉，此時段剛被其他人預約。請選擇其他時段。' : 'Sorry, this time slot was just booked by someone else. Please select a different time.',
          false
        );
        // Go back to step 1 to pick a new time
        setTimeout(() => {
          bookingState.step = 1;
          bookingState.time = null;
          bookingState.isSubmitting = false;
          bookingState.slotsCache = {}; // clear cache to fetch fresh slots
          updateStepUI();
          renderCalendar();
          renderTimeSlots();
        }, 2000);
        return;
      } else {
        // Generic error
        handleBookingError(
          lang === 'zh' ? '預約未能完成。請重試。' : 'Booking could not be completed. Please try again.',
          true
        );
      }
    }
  }

  function handleBookingError(message, retryable) {
    const loadingEl = document.getElementById('booking-loading');
    const successEl = document.getElementById('booking-success');

    loadingEl.style.display = 'none';

    // Show error in step 3 panel
    const panel = document.querySelector('[data-panel="3"]');
    const errorHtml = `
      <div class="booking-confirmation" id="booking-error-state">
        <div class="confirmation-icon" style="background:oklch(0.95 0.05 25)">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.15 25)" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 style="color:oklch(0.4 0.15 25)">${lang === 'zh' ? '預約失敗' : 'Booking Failed'}</h2>
        <p style="color:var(--text-light);margin-top:8px">${message}</p>
        <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          ${retryable && bookingState.retryCount < bookingState.maxRetries
            ? `<button class="btn btn-primary" onclick="retryBooking()" style="min-width:140px">${lang === 'zh' ? '重試' : 'Try Again'}</button>`
            : ''}
          <button class="btn" onclick="bookingBack()" style="min-width:140px;border:2px solid var(--border)">${lang === 'zh' ? '返回' : 'Go Back'}</button>
        </div>
      </div>`;

    // Replace loading with error
    const existingError = panel.querySelector('#booking-error-state');
    if (existingError) existingError.remove();

    const confirmation = document.getElementById('booking-confirmation');
    confirmation.insertAdjacentHTML('afterend', errorHtml);
    confirmation.style.display = 'none';

    bookingState.isSubmitting = false;
  }

  function retryBooking() {
    bookingState.retryCount++;
    bookingState.isSubmitting = false;

    // Remove error state, show loading again
    const errorState = document.querySelector('#booking-error-state');
    if (errorState) errorState.remove();
    document.getElementById('booking-confirmation').style.display = 'block';

    submitBooking();
  }

  function showBookingSuccess(apiResult, customer) {
    const loadingEl = document.getElementById('booking-loading');
    const successEl = document.getElementById('booking-success');
    const detailsEl = document.getElementById('confirmation-details');
    const ws = bookingState.workshop;

    // Remove any error states
    const errorState = document.querySelector('#booking-error-state');
    if (errorState) errorState.remove();
    document.getElementById('booking-confirmation').style.display = 'block';

    loadingEl.style.display = 'none';
    successEl.style.display = 'block';

    const dateStr = bookingState.date.toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    const labels = {
      workshop: lang === 'zh' ? '工作坊' : 'Workshop',
      date: lang === 'zh' ? '日期' : 'Date',
      time: lang === 'zh' ? '時間' : 'Time',
      name: lang === 'zh' ? '姓名' : 'Name',
      email: lang === 'zh' ? '電郵' : 'Email',
      total: lang === 'zh' ? '金額' : 'Total',
      bookingRef: lang === 'zh' ? '預約編號' : 'Booking Ref',
      cancel: lang === 'zh' ? '取消預約' : 'Cancel Booking'
    };

    const bookingRef = bookingState.bookingId
      ? bookingState.bookingId.substring(0, 8).toUpperCase()
      : 'DEMO';

    detailsEl.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">${labels.bookingRef}</span>
        <span class="detail-value">#${bookingRef}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${labels.workshop}</span>
        <span class="detail-value">${lang === 'zh' ? ws.nameCn : ws.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${labels.date}</span>
        <span class="detail-value">${dateStr}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${labels.time}</span>
        <span class="detail-value">${formatTime(bookingState.time)} (Pacific Time)</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${labels.name}</span>
        <span class="detail-value">${customer.givenName} ${customer.familyName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${labels.email}</span>
        <span class="detail-value">${customer.emailAddress}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${labels.total}</span>
        <span class="detail-value">$${ws.price.toFixed(2)} CAD</span>
      </div>
    `;

    // Add cancel button if we have a booking ID
    if (bookingState.bookingId && !bookingState.bookingId.startsWith('DEMO')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn';
      cancelBtn.style.cssText = 'margin-top:12px;border:2px solid oklch(0.7 0.15 25);color:oklch(0.5 0.15 25);font-size:0.85rem;padding:8px 20px;border-radius:var(--radius-full);cursor:pointer;background:none';
      cancelBtn.textContent = labels.cancel;
      cancelBtn.onclick = () => cancelBooking(bookingState.bookingId);
      detailsEl.appendChild(cancelBtn);
    }
  }

  // --- Cancellation Flow ---
  async function cancelBooking(bookingId) {
    const confirmMsg = lang === 'zh'
      ? '確定要取消此預約嗎？'
      : 'Are you sure you want to cancel this booking?';

    if (!confirm(confirmMsg)) return;

    try {
      if (typeof bubblyAPI !== 'undefined' && bubblyAPI.isReady()) {
        await bubblyAPI.cancelBooking(bookingId);
      }

      // Show cancellation confirmation
      const successEl = document.getElementById('booking-success');
      successEl.innerHTML = `
        <div class="confirmation-icon" style="background:oklch(0.95 0.03 70)">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="oklch(0.5 0.03 70)" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2>${lang === 'zh' ? '預約已取消' : 'Booking Cancelled'}</h2>
        <p style="color:var(--text-light);margin-top:8px">${lang === 'zh' ? '您將收到取消確認電子郵件。' : 'You will receive a cancellation confirmation email.'}</p>
        <a href="workshops.html" class="btn btn-primary" style="margin-top:24px">${lang === 'zh' ? '重新預約' : 'Book Again'}</a>
      `;
    } catch (err) {
      showBookingError(
        lang === 'zh' ? '取消失敗。請稍後再試或聯繫我們。' : 'Cancellation failed. Please try again later or contact us.',
        'booking-flow'
      );
    }
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize bubblyAPI if available
    if (typeof bubblyAPI !== 'undefined') {
      bubblyAPI.init().catch(e => console.log('bubblyAPI init (non-blocking):', e.message));
    }

    // Show timezone info banner if user is in different timezone
    if (tzUtil.isDifferentTz()) {
      const userTz = tzUtil.getUserTz().replace(/_/g, ' ').split('/').pop();
      console.log(`🫧 User timezone: ${userTz} (differs from workshop: Pacific)`);
    }
  });

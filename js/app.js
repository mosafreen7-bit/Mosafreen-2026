/**
 * MOSAFREEN Luxury Airline Experience Application Logic
 * Inspired by Etihad Airways Design Standards
 * Official WhatsApp: +966 56 573 4063
 */

(function () {
  'use strict';

  // Constants
  const WHATSAPP_PHONE = '966565734063';
  const STORAGE_KEY = 'mosafreen_lang';
  const DEFAULT_LANG = 'ar';

  // State
  let currentLang = DEFAULT_LANG;
  let billingCycle = 'annually'; // 'monthly' | 'annually'
  let flightTripType = 'round';   // 'round' | 'oneway' | 'multi'

  /**
   * Initialize App on DOM Ready
   */
  document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initAirlineBookingPanel();
    initBillingToggle();
    initFaqAccordion();
    initModals();
    initMobileDrawer();
  });

  /**
   * Language Initialization & State Management
   */
  function initLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryLang = urlParams.get('lang');
    const savedLang = localStorage.getItem(STORAGE_KEY);
    const path = window.location.pathname.toLowerCase();
    
    let detectedLang = DEFAULT_LANG;

    if (path.includes('/en/') || path.endsWith('/en')) {
      detectedLang = 'en';
    } else if (path.includes('/ar/') || path.endsWith('/ar')) {
      detectedLang = 'ar';
    } else if (queryLang && (queryLang === 'ar' || queryLang === 'en')) {
      detectedLang = queryLang;
    } else if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      detectedLang = savedLang;
    }

    setLanguage(detectedLang, false);

    // Bind Language Switcher Buttons
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetLang = e.currentTarget.getAttribute('data-lang');
        if (targetLang) {
          localStorage.setItem(STORAGE_KEY, targetLang);
          if (btn.tagName.toLowerCase() === 'a') {
            const currentHash = window.location.hash;
            if (currentHash && !btn.getAttribute('href').includes('#')) {
              btn.setAttribute('href', btn.getAttribute('href') + currentHash);
            }
          } else if (targetLang !== currentLang) {
            setLanguage(targetLang, true);
          }
        }
      });
    });
  }

  /**
   * Set Language & Update DOM, Attributes, and Links
   */
  window.setLanguage = function (lang, updateHistory = true) {
    if (!window.mosafreenTranslations || !window.mosafreenTranslations[lang]) {
      return;
    }

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    const isRtl = lang === 'ar';
    const dict = window.mosafreenTranslations[lang];

    // 1. Update HTML document direction and language attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    // 2. Update Page Meta & Title
    if (dict.meta_title) {
      document.title = dict.meta_title;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict.meta_description) {
      metaDesc.setAttribute('content', dict.meta_description);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && dict.meta_title) {
      ogTitle.setAttribute('content', dict.meta_title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && dict.meta_description) {
      ogDesc.setAttribute('content', dict.meta_description);
    }

    // 3. Update Text Content (data-i18n)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // 4. Update HTML Content (data-i18n-html)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    // 5. Update Placeholders (data-i18n-ph)
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // 6. Update Aria Labels (data-i18n-aria)
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) {
        el.setAttribute('aria-label', dict[key]);
      }
    });

    // 7. Update Input Default Values (data-i18n-val)
    document.querySelectorAll('[data-i18n-val]').forEach(el => {
      const key = el.getAttribute('data-i18n-val');
      if (dict[key] !== undefined) {
        el.value = dict[key];
      }
    });

    // 7. Update Language Switcher UI buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // 8. Update Pricing and Period Labels
    updatePlanPricing();

    // 9. Update all WhatsApp buttons and prefilled messages
    updateWhatsAppLinks();

    // 10. Update URL without reload
    if (updateHistory && window.history && window.history.replaceState) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('lang', lang);
      window.history.replaceState({}, '', currentUrl.toString());
    }
  };

  /**
   * Helper to format WhatsApp URL
   */
  function buildWhatsAppUrl(messageText) {
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(messageText)}`;
  }

  /**
   * Update all prefilled WhatsApp links on the page based on current language
   */
  function updateWhatsAppLinks() {
    const msgs = window.mosafreenWhatsAppMessages[currentLang] || window.mosafreenWhatsAppMessages.ar;

    document.querySelectorAll('[data-wa-service]').forEach(btn => {
      const serviceKey = btn.getAttribute('data-wa-service');
      const msg = msgs[serviceKey] || msgs.general;
      btn.setAttribute('href', buildWhatsAppUrl(msg));
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener noreferrer');
    });

    const floatingBtn = document.getElementById('floatingWhatsAppBtn');
    if (floatingBtn) {
      floatingBtn.setAttribute('href', buildWhatsAppUrl(msgs.general));
      floatingBtn.setAttribute('target', '_blank');
      floatingBtn.setAttribute('rel', 'noopener noreferrer');
    }
  }

  /**
   * Airline-Inspired Booking & Service Request Panel Logic
   */
  function initAirlineBookingPanel() {
    // 1. Tab Navigation
    const bookingTabBtns = document.querySelectorAll('.booking-tab-btn');
    const bookingPanes = document.querySelectorAll('.booking-pane');

    bookingTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        bookingTabBtns.forEach(b => b.classList.remove('active'));
        bookingPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add('active');
        }
      });
    });

    // 2. Flight Trip Type Toggle (Round trip / One way / Multi-city)
    const tripBtns = document.querySelectorAll('.trip-type-btn');
    const returnDateGroup = document.getElementById('flightReturnGroup');

    tripBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tripBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        flightTripType = btn.getAttribute('data-trip');

        if (flightTripType === 'oneway') {
          if (returnDateGroup) returnDateGroup.style.display = 'none';
        } else {
          if (returnDateGroup) returnDateGroup.style.display = 'flex';
        }
      });
    });

    // 3. Airport Swap Button (Origin <-> Destination)
    const swapBtn = document.getElementById('btnSwapAirports');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const originInput = document.getElementById('panelFlightOrigin');
        const destInput = document.getElementById('panelFlightDest');
        if (originInput && destInput) {
          const temp = originInput.value;
          originInput.value = destInput.value;
          destInput.value = temp;
        }
      });
    }

    // 4. Flight Panel Submit -> WhatsApp
    const flightSubmitBtn = document.getElementById('panelFlightSubmit');
    if (flightSubmitBtn) {
      flightSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const origin = document.getElementById('panelFlightOrigin')?.value.trim() || 'الرياض (RUH)';
        const dest = document.getElementById('panelFlightDest')?.value.trim() || 'قوانغتشو (CAN)';
        const departDate = document.getElementById('panelFlightDepartDate')?.value || '2026-11-15';
        const returnDate = document.getElementById('panelFlightReturnDate')?.value || '2026-11-25';
        const passengers = document.getElementById('panelFlightPassengers')?.value || '1 بالغ';
        const cabin = document.getElementById('panelFlightCabin')?.value || 'الدرجة السياحية';

        let tripLabel = '';
        if (currentLang === 'ar') {
          tripLabel = flightTripType === 'oneway' ? 'ذهاب فقط' : (flightTripType === 'multi' ? 'وجهات متعددة' : 'ذهاب وعودة');
          let msg = `مرحبًا مسافرين،\nأرغب في الاستفسار عن حجز طيران:\n- مسار الرحلة: من [${origin}] إلى [${dest}]\n- نوع الرحلة: ${tripLabel}\n- تاريخ المغادرة: ${departDate}`;
          if (flightTripType !== 'oneway') {
            msg += `\n- تاريخ العودة: ${returnDate}`;
          }
          msg += `\n- عدد المسافرين: ${passengers}\n- درجة السفر: ${cabin}\n\nيرجى موافاتي بأفضل عروض الأسعار المتاحة.`;
          window.open(buildWhatsAppUrl(msg), '_blank');
        } else {
          tripLabel = flightTripType === 'oneway' ? 'One Way' : (flightTripType === 'multi' ? 'Multi-City' : 'Round Trip');
          let msg = `Hello MOSAFREEN,\nI would like to inquire about a flight booking:\n- Route: From [${origin}] to [${dest}]\n- Trip Type: ${tripLabel}\n- Departure Date: ${departDate}`;
          if (flightTripType !== 'oneway') {
            msg += `\n- Return Date: ${returnDate}`;
          }
          msg += `\n- Passengers: ${passengers}\n- Cabin Class: ${cabin}\n\nPlease provide me with verified flight options.`;
          window.open(buildWhatsAppUrl(msg), '_blank');
        }
      });
    }

    // 5. Sea Travel Panel Submit -> WhatsApp
    const seaSubmitBtn = document.getElementById('panelSeaSubmit');
    if (seaSubmitBtn) {
      seaSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const origin = document.getElementById('panelSeaOrigin')?.value.trim() || 'ميناء جدة الإسلامي';
        const dest = document.getElementById('panelSeaDest')?.value.trim() || 'البحر الأحمر / المتوسط';
        const date = document.getElementById('panelSeaDate')?.value || '2026-12-01';
        const passengers = document.getElementById('panelSeaPassengers')?.value || '2 مسافرين';
        const service = document.getElementById('panelSeaCabin')?.value || 'كروز سياحي فاخر';

        let msg = '';
        if (currentLang === 'ar') {
          msg = `مرحبًا مسافرين،\nأرغب بالاستفسار عن حجز تذكرة بحرية:\n- الخدمة: ${service}\n- ميناء المغادرة: ${origin}\n- الوجهة / المسار: ${dest}\n- التاريخ المفضل: ${date}\n- المسافرون: ${passengers}`;
        } else {
          msg = `Hello MOSAFREEN,\nI would like to inquire about maritime / cruise travel:\n- Service: ${service}\n- Departure Port: ${origin}\n- Destination / Route: ${dest}\n- Preferred Date: ${date}\n- Passengers: ${passengers}`;
        }
        window.open(buildWhatsAppUrl(msg), '_blank');
      });
    }

    // 6. Visas & Consular Panel Submit -> WhatsApp
    const visaSubmitBtn = document.getElementById('panelVisaSubmit');
    if (visaSubmitBtn) {
      visaSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const visaCatSelect = document.getElementById('panelVisaCategory');
        const visaCat = visaCatSelect?.options[visaCatSelect.selectedIndex]?.text || 'تأشيرة';
        const nationality = document.getElementById('panelVisaNationality')?.value.trim() || 'سعودي / مقيم';
        const count = document.getElementById('panelVisaCount')?.value || '1';
        const targetDate = document.getElementById('panelVisaDate')?.value || '2026-11-20';
        const notes = document.getElementById('panelVisaNotes')?.value.trim() || 'لا توجد ملاحظات إضافية';

        let msg = '';
        if (currentLang === 'ar') {
          msg = `مرحبًا مسافرين،\nأرغب بالاستفسار عن خدمة التأشيرات والمعاملات:\n- نوع الخدمة: ${visaCat}\n- الجنسية: ${nationality}\n- عدد الأشخاص: ${count}\n- الموعد المستهدف: ${targetDate}\n- تفاصيل إضافية: ${notes}`;
        } else {
          msg = `Hello MOSAFREEN,\nI would like to inquire about visa & consular services:\n- Service: ${visaCat}\n- Nationality: ${nationality}\n- Applicants: ${count}\n- Target Date: ${targetDate}\n- Additional Notes: ${notes}`;
        }
        window.open(buildWhatsAppUrl(msg), '_blank');
      });
    }

    // 7. Air Cargo Panel Submit -> WhatsApp
    const cargoSubmitBtn = document.getElementById('panelCargoSubmit');
    if (cargoSubmitBtn) {
      cargoSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const origin = document.getElementById('panelCargoOrigin')?.value.trim() || 'قوانغتشو - الصين';
        const dest = document.getElementById('panelCargoDest')?.value.trim() || 'الرياض - السعودية';
        const weight = document.getElementById('panelCargoWeight')?.value || '65';
        const dimensions = document.getElementById('panelCargoDimensions')?.value.trim() || '60x40x40 سم';
        const catSelect = document.getElementById('panelCargoCategory');
        const cat = catSelect?.options[catSelect.selectedIndex]?.text || 'بضائع تجارية';

        let msg = '';
        if (currentLang === 'ar') {
          msg = `مرحبًا مسافرين،\nأود طلب تسعيرة رسمية لخدمة الشحن الجوي:\n- من: ${origin}\n- إلى: ${dest}\n- الوزن التقديري: ${weight} كجم\n- الأبعاد التقريبية: ${dimensions}\n- تصنيف الشحنة: ${cat}`;
        } else {
          msg = `Hello MOSAFREEN,\nI would like to request an official air cargo quotation:\n- From: ${origin}\n- To: ${dest}\n- Estimated Weight: ${weight} kg\n- Dimensions: ${dimensions}\n- Classification: ${cat}`;
        }
        window.open(buildWhatsAppUrl(msg), '_blank');
      });
    }
  }

  /**
   * Subscription Billing Toggle (Monthly / Annual)
   */
  function initBillingToggle() {
    const monthlyBtn = document.getElementById('btnBillingMonthly');
    const annualBtn = document.getElementById('btnBillingAnnual');

    if (!monthlyBtn || !annualBtn) return;

    monthlyBtn.addEventListener('click', () => {
      billingCycle = 'monthly';
      monthlyBtn.classList.add('active');
      annualBtn.classList.remove('active');
      updatePlanPricing();
    });

    annualBtn.addEventListener('click', () => {
      billingCycle = 'annually';
      annualBtn.classList.add('active');
      monthlyBtn.classList.remove('active');
      updatePlanPricing();
    });
  }

  function updatePlanPricing() {
    const dict = window.mosafreenTranslations[currentLang];
    if (!dict) return;

    const silverVal = document.getElementById('planSilverPrice');
    const goldVal = document.getElementById('planGoldPrice');
    const platVal = document.getElementById('planPlatPrice');
    const periodLabels = document.querySelectorAll('.plan-period-text');

    if (billingCycle === 'monthly') {
      if (silverVal) silverVal.textContent = dict.plan_silver_price_m;
      if (goldVal) goldVal.textContent = dict.plan_gold_price_m;
      if (platVal) platVal.textContent = dict.plan_plat_price_m;
      periodLabels.forEach(el => el.textContent = dict.per_month);
    } else {
      if (silverVal) silverVal.textContent = dict.plan_silver_price_y;
      if (goldVal) goldVal.textContent = dict.plan_gold_price_y;
      if (platVal) platVal.textContent = dict.plan_plat_price_y;
      periodLabels.forEach(el => el.textContent = dict.per_year);
    }
  }

  /**
   * FAQ Accordion
   */
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const btn = item.querySelector('.faq-question-btn');
      const answerWrap = item.querySelector('.faq-answer-wrap');

      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const wrap = other.querySelector('.faq-answer-wrap');
            if (wrap) wrap.style.maxHeight = null;
            const b = other.querySelector('.faq-question-btn');
            if (b) b.setAttribute('aria-expanded', 'false');
          }
        });

        if (isActive) {
          item.classList.remove('active');
          answerWrap.style.maxHeight = null;
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          answerWrap.style.maxHeight = answerWrap.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /**
   * Modals & Universal Inquiry Form
   */
  function initModals() {
    const openModalBtns = document.querySelectorAll('[data-open-modal]');
    const closeModalBtns = document.querySelectorAll('.modal-close-btn');
    const overlays = document.querySelectorAll('.modal-overlay');

    openModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetModalId = btn.getAttribute('data-open-modal');
        const modal = document.getElementById(targetModalId);
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        overlays.forEach(m => m.classList.remove('open'));
        document.body.style.overflow = '';
      });
    });

    overlays.forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });

    // Universal Inquiry Form Submission
    const inquiryForm = document.getElementById('universalInquiryForm');
    if (inquiryForm) {
      inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('modalFullName');
        const phoneInput = document.getElementById('modalPhone');
        const serviceSelect = document.getElementById('modalServiceSelect');
        const detailsInput = document.getElementById('modalDetails');

        const nameError = document.getElementById('modalNameError');
        const phoneError = document.getElementById('modalPhoneError');

        let isValid = true;

        if (!nameInput.value.trim()) {
          nameError.classList.add('visible');
          isValid = false;
        } else {
          nameError.classList.remove('visible');
        }

        if (!phoneInput.value.trim() || phoneInput.value.trim().length < 7) {
          phoneError.classList.add('visible');
          isValid = false;
        } else {
          phoneError.classList.remove('visible');
        }

        if (!isValid) return;

        const selectedServiceName = serviceSelect.options[serviceSelect.selectedIndex].text;
        let msg = '';
        if (currentLang === 'ar') {
          msg = `مرحبًا مسافرين،\nالاسم: ${nameInput.value.trim()}\nرقم التواصل: ${phoneInput.value.trim()}\nالخدمة المطلوبة: ${selectedServiceName}\nالملاحظات: ${detailsInput.value.trim() || 'لا توجد'}`;
        } else {
          msg = `Hello MOSAFREEN,\nName: ${nameInput.value.trim()}\nPhone: ${phoneInput.value.trim()}\nRequested Service: ${selectedServiceName}\nNotes: ${detailsInput.value.trim() || 'None'}`;
        }

        showToast(window.mosafreenTranslations[currentLang].form_success_alert);

        setTimeout(() => {
          window.open(buildWhatsAppUrl(msg), '_blank');
          document.getElementById('bookingModal')?.classList.remove('open');
          document.body.style.overflow = '';
          inquiryForm.reset();
        }, 800);
      });
    }
  }

  /**
   * Toast Notification Helper
   */
  function showToast(text) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  /**
   * Mobile Drawer Navigation
   */
  function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const drawerOverlay = document.getElementById('mobileDrawerOverlay');
    const closeBtn = document.getElementById('drawerCloseBtn');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    if (!toggleBtn || !drawerOverlay) return;

    toggleBtn.addEventListener('click', () => {
      drawerOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    const closeDrawer = () => {
      drawerOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) closeDrawer();
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }

})();

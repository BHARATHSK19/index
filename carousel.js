/* OJIX — home hero carousel (v1.0.0). Tabs with autoplay progress, pause button,
   pauses on hover / focus / when off-screen, arrow keys on the tabs, swipe on phones.
   Enhanced with product showcase data mapping & interactive glassmorphism overlay. */
(function () {
  var hero = document.getElementById('ojx-hero');
  if (!hero) return;

  var productShowcase = {
    business: {
      title: "CompanyOS",
      name: "CompanyOS",
      subtitle: "Office ERP & Operations Platform · 99.9% Uptime",
      image: "/assets/images/products/companyos-hero.webp",
      link: "/companyos"
    },
    legal: {
      title: "LegalOS",
      name: "LegalOS",
      subtitle: "Contract Automation & Compliance Vault · Hearing Alerts",
      image: "/assets/images/products/legalos-hero.webp",
      link: "/legalos"
    },
    campus: {
      title: "CampusOS",
      name: "CampusOS",
      subtitle: "Student ERP, Attendance & Exam Management · Zero Paperwork",
      image: "/assets/images/products/campusos-hero.webp",
      link: "/campusos"
    },
    procure: {
      title: "ProcureOS",
      name: "ProcureOS",
      subtitle: "Purchasing, Live Stock & 3-Way GST Bill Matching",
      image: "/assets/images/products/procureos-hero.webp",
      link: "/procureos"
    },
    build: {
      title: "BuildOS",
      name: "BuildOS",
      subtitle: "Daily Labor, Materials & Contractor Cost Control",
      image: "/assets/images/products/buildos-hero.webp",
      link: "/buildos"
    },
    travel: {
      title: "TravelOS",
      name: "TravelOS",
      subtitle: "Tour Pipelines, Hotel/Cab Bookings & Itinerary Builder",
      image: "/assets/images/products/travelos-hero.webp",
      link: "/travelos"
    },
    fit: {
      title: "FitOS",
      name: "FitOS",
      subtitle: "Biometric Turnstiles, WhatsApp Billing & Trainer Portal",
      image: "/assets/images/products/fitos-hero.webp",
      link: "/fitos"
    },
    dpdp: {
      title: "DPDP Vault",
      name: "DPDP Vault",
      subtitle: "Sovereign Document Storage & Statutory Privacy Compliance",
      image: "/assets/images/products/dpdp-hero.webp",
      link: "/dpdp-compliance"
    }
  };

  // Category and alias mappings for flexible tab queries
  productShowcase.overview = productShowcase.business;
  productShowcase.procurement = productShowcase.procure;
  productShowcase.companyos = productShowcase.business;
  productShowcase.legalos = productShowcase.legal;
  productShowcase.campusos = productShowcase.campus;
  productShowcase.procureos = productShowcase.procure;
  productShowcase.buildos = productShowcase.build;
  productShowcase.travelos = productShowcase.travel;
  productShowcase.fitos = productShowcase.fit;
  productShowcase.dpdpvault = productShowcase.dpdp;

  // Expose globally for inspectability
  window.productShowcase = productShowcase;

  var showcaseList = [
    productShowcase.business,
    productShowcase.legal,
    productShowcase.campus,
    productShowcase.procure,
    productShowcase.build,
    productShowcase.travel,
    productShowcase.fit,
    productShowcase.dpdp
  ];

  var INTERVAL = 3000;
  var tabs = Array.prototype.slice.call(hero.querySelectorAll('.ojx-hero__tab'));
  var texts = Array.prototype.slice.call(hero.querySelectorAll('.ojx-hero__text'));
  var media = Array.prototype.slice.call(hero.querySelectorAll('.ojx-hero__media'));
  var pauseBtn = hero.querySelector('.ojx-hero__pause');
  var overlayTitle = hero.querySelector('#ojx-overlay-title');
  var overlaySub = hero.querySelector('#ojx-overlay-sub');
  var overlayLink = hero.querySelector('#ojx-overlay-link');
  var overlayBadge = hero.querySelector('.ojx-hero__overlay');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0, timer = null, userPaused = !!reduce, hovering = false, visible = true;

  hero.style.setProperty('--ojx-hero-interval', INTERVAL + 'ms');
  if (reduce) hero.classList.add('is-static');

  function go(next, fromUser) {
    var n = tabs.length;
    next = ((next % n) + n) % n;
    if (next === index && !fromUser) return;
    index = next;
    tabs.forEach(function (t, i) {
      var on = i === index;
      t.classList.toggle('is-active', on);
      t.classList.toggle('is-done', i < index);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      // restart the progress animation
      var bar = t.querySelector('.ojx-hero__bar i');
      if (on && bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    texts.forEach(function (el, i) {
      var on = i === index;
      el.classList.toggle('is-active', on);
      if (on) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
    });
    media.forEach(function (el, i) { el.classList.toggle('is-active', i === index); });

    var activeTab = tabs[index];
    var prodKey = activeTab ? (activeTab.getAttribute('data-product') || activeTab.getAttribute('data-category')) : null;
    var item = (prodKey && productShowcase[prodKey]) || showcaseList[index] || productShowcase.business;

    if (item) {
      if (overlayTitle) overlayTitle.textContent = item.title;
      if (overlaySub) overlaySub.textContent = item.subtitle;
      if (overlayLink) {
        overlayLink.setAttribute('href', item.link);
        overlayLink.setAttribute('title', 'Explore ' + item.title);
      }
      if (overlayBadge) {
        overlayBadge.style.opacity = '0.7';
        overlayBadge.style.transform = 'translateY(-2px)';
        setTimeout(function () {
          overlayBadge.style.opacity = '1';
          overlayBadge.style.transform = 'none';
        }, 150);
      }
      var activeMedia = media[index];
      if (activeMedia) {
        var activeImg = activeMedia.querySelector('img');
        if (activeImg && item.image && !activeImg.getAttribute('src').includes(item.image)) {
          activeImg.src = item.image;
        }
      }
    }

    hero.classList.remove('is-animating'); void hero.offsetWidth; hero.classList.add('is-animating');
    schedule();
  }

  function running() { return !userPaused && !hovering && visible && !document.hidden; }

  function schedule() {
    clearTimeout(timer);
    hero.classList.toggle('is-paused', userPaused && !reduce);   // icon state: only the user's choice
    hero.classList.toggle('is-holding', !running());               // bar freezes on hover/focus/off-screen
    if (running()) timer = setTimeout(function () { go(index + 1); }, INTERVAL);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { go(i, true); });
    t.addEventListener('mouseenter', function () { go(i, true); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        go(index + (e.key === 'ArrowRight' ? 1 : -1), true);
        tabs[index].focus();
      }
    });
  });

  if (pauseBtn) pauseBtn.addEventListener('click', function () {
    if (reduce) { hero.classList.remove('is-static'); reduce = false; userPaused = false; }
    else userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    // a paused bar restarts from zero on resume, so the slide gets its full time
    go(index, true);
  });

  var stage = hero.querySelector('.ojx-hero__stage');
  [stage, hero.querySelector('.ojx-hero__copy')].forEach(function (el) {
    if (!el) return;
    el.addEventListener('mouseenter', function () { hovering = true; schedule(); });
    el.addEventListener('mouseleave', function () { hovering = false; go(index, true); });
  });
  hero.addEventListener('focusin', function () { hovering = true; schedule(); });
  hero.addEventListener('focusout', function (e) { if (!hero.contains(e.relatedTarget)) { hovering = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0.25 }).observe(hero);
  }

  // swipe on touch screens
  var x0 = null;
  if (stage) {
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
  }

  go(0, true);
})();

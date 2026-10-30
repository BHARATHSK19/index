/* Ported from /carousel.js for the React app (tools/react-port/port_legacy.py + manual fixes).
 * Runs once per page mount; ctx tears down listeners, timers and observers on unmount. */
/* eslint-disable */
export default function init(__ctx) {
  const { on: __on, setTimeout, setInterval, requestAnimationFrame, IntersectionObserver,
    ResizeObserver, MutationObserver, navigate: __navigate } = __ctx;
  /* OJIX — home hero carousel (v1.0.0). Tabs with autoplay progress, pause button,
     pauses on hover / focus / when off-screen, arrow keys on the tabs, swipe on phones.
     Enhanced with product showcase data mapping & interactive glassmorphism overlay. */
  (function () {
    var hero = document.getElementById('ojx-hero');
    if (!hero) return;

    var productShowcase = {
      "company-management-system": {
        title: "Company Management System",
        name: "Company Management System",
        subtitle: "Office, HR & accounting · Run the whole company from one screen",
        image: "/assets/images/products/companyos-hero.webp",
        link: "/company-management-system"
      },
      "legalos": {
        title: "Nyaya Sethu",
        name: "Nyaya Sethu",
        subtitle: "Law firms & legal teams · Never miss a hearing again",
        image: "/assets/images/products/legalos-hero.webp",
        link: "/legalos"
      },
      "procureos": {
        title: "ProcureOS",
        name: "ProcureOS",
        subtitle: "Purchasing & warehouse stock · Every rupee of buying, under control",
        image: "/assets/images/products/procureos-hero.webp",
        link: "/procureos"
      },
      "school-erp": {
        title: "School ERP",
        name: "School ERP",
        subtitle: "Schools & K-12 institutions · Admission to report card, in one place",
        image: "/assets/images/products/campusos-hero.webp",
        link: "/school-erp"
      },
      "university-management-system": {
        title: "University Management System",
        name: "University Management System",
        subtitle: "Universities & multi-campus colleges · Every campus, department and student, connected",
        image: "/assets/images/products/university-hero.webp",
        link: "/university-management-system"
      },
      "ai-proctoring": {
        title: "AI Proctoring",
        name: "AI Proctoring",
        subtitle: "Online exams & assessments · Fair online exams, watched by AI",
        image: "/assets/images/products/proctoring-hero.webp",
        link: "/ai-proctoring"
      },
      "construction-hub": {
        title: "Construction Hub",
        name: "Construction Hub",
        subtitle: "Builders, real estate & contractors · Every site and every bag of cement, in view",
        image: "/assets/images/products/buildos-hero.webp",
        link: "/construction-hub"
      },
      "property-intelligence": {
        title: "Property Intelligence",
        name: "Property Intelligence",
        subtitle: "Developers, landlords & brokers · Every property, unit and lease, measured",
        image: "/assets/images/products/property-hero.webp",
        link: "/property-intelligence"
      },
      "travelos": {
        title: "TravelOS",
        name: "TravelOS",
        subtitle: "Travel agencies & tour operators · From enquiry to trip voucher, automated",
        image: "/assets/images/products/travelos-hero.webp",
        link: "/travelos"
      },
      "fitos": {
        title: "FitOS",
        name: "FitOS",
        subtitle: "Gyms, fitness & wellness · Run one gym or a whole chain",
        image: "/assets/images/products/fitos-hero.webp",
        link: "/fitos"
      },
      "dpdp-compliance": {
        title: "DPDP Privacy Vault",
        name: "DPDP Privacy Vault",
        subtitle: "Secure documents & privacy · Your files. Locked, logged and lawful",
        image: "/assets/images/products/dpdp-hero.webp",
        link: "/dpdp-compliance"
      }
    };

    // Category and alias mappings for flexible tab queries
    productShowcase.business = productShowcase["company-management-system"];
    productShowcase.companyos = productShowcase["company-management-system"];
    productShowcase["company-system"] = productShowcase["company-management-system"];
    productShowcase.overview = productShowcase["company-management-system"];
    productShowcase.legal = productShowcase["legalos"];
    productShowcase["nyaya-sethu"] = productShowcase["legalos"];
    productShowcase.procure = productShowcase["procureos"];
    productShowcase.procurement = productShowcase["procureos"];
    productShowcase.campus = productShowcase["school-erp"];
    productShowcase.campusos = productShowcase["school-erp"];
    productShowcase.school = productShowcase["school-erp"];
    productShowcase["school-erp"] = productShowcase["school-erp"];
    productShowcase.university = productShowcase["university-management-system"];
    productShowcase["university-system"] = productShowcase["university-management-system"];
    productShowcase.proctoring = productShowcase["ai-proctoring"];
    productShowcase.ai = productShowcase["ai-proctoring"];
    productShowcase.build = productShowcase["construction-hub"];
    productShowcase.buildos = productShowcase["construction-hub"];
    productShowcase.construction = productShowcase["construction-hub"];
    productShowcase.property = productShowcase["property-intelligence"];
    productShowcase["property-intel"] = productShowcase["property-intelligence"];
    productShowcase.travel = productShowcase["travelos"];
    productShowcase.fit = productShowcase["fitos"];
    productShowcase.dpdp = productShowcase["dpdp-compliance"];
    productShowcase.dpdpvault = productShowcase["dpdp-compliance"];

    var showcaseList = [
      productShowcase["company-management-system"],
      productShowcase["legalos"],
      productShowcase["procureos"],
      productShowcase["school-erp"],
      productShowcase["university-management-system"],
      productShowcase["ai-proctoring"],
      productShowcase["construction-hub"],
      productShowcase["property-intelligence"],
      productShowcase["travelos"],
      productShowcase["fitos"],
      productShowcase["dpdp-compliance"]
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
      if (activeTab && activeTab.scrollIntoView && window.innerWidth <= 768) {
        try {
          activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        } catch (e) {}
      }
      var prodKey = activeTab ? (activeTab.getAttribute('data-product') || activeTab.getAttribute('data-category') || activeTab.getAttribute('data-product-slug')) : null;
      var item = (prodKey && productShowcase[prodKey]) || showcaseList[index] || productShowcase["company-management-system"];

      if (item) {
        if (overlayTitle) overlayTitle.textContent = item.title;
        if (overlaySub) overlaySub.textContent = item.subtitle;
        if (overlayLink) {
          overlayLink.setAttribute('href', item.link);
          overlayLink.setAttribute('title', 'Explore ' + item.title);
          overlayLink.setAttribute('aria-label', 'Explore ' + item.title);
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
      __on(t, 'click', function () { go(i, true); });
      __on(t, 'mouseenter', function () { go(i, true); });
      __on(t, 'keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          go(index + (e.key === 'ArrowRight' ? 1 : -1), true);
          tabs[index].focus();
        }
      });
    });

    if (pauseBtn) __on(pauseBtn, 'click', function () {
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
      __on(el, 'mouseenter', function () { hovering = true; schedule(); });
      __on(el, 'mouseleave', function () { hovering = false; go(index, true); });
    });
    __on(hero, 'focusin', function () { hovering = true; schedule(); });
    __on(hero, 'focusout', function (e) { if (!hero.contains(e.relatedTarget)) { hovering = false; schedule(); } });
    __on(document, 'visibilitychange', schedule);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0.25 }).observe(hero);
    }

    // swipe on touch screens
    var x0 = null;
    if (stage) {
      __on(stage, 'touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      __on(stage, 'touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
      }, { passive: true });
    }

    go(0, true);
  })();
}

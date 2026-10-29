/* Ported from /app.js for the React app (tools/react-port/port_legacy.py + manual fixes).
 * Runs once per page mount; ctx tears down listeners, timers and observers on unmount. */
/* eslint-disable */
export default function init(__ctx) {
  const { on: __on, setTimeout, setInterval, requestAnimationFrame, IntersectionObserver,
    ResizeObserver, MutationObserver, navigate: __navigate } = __ctx;
  document.documentElement.classList.add("js-enabled");

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobilePerformanceMode = window.matchMedia('(max-width: 1023px), (hover: none), (pointer: coarse)').matches;

  const SECTION_ROUTES = {
    '/products': 'platforms',
    '/services': 'capabilities',
    '/about': 'about',
    '/contact': 'contact',
    '/process': 'about',
    '/who-we-are': 'about',
    '/security': 'security-trust',
    '/industries': 'platforms'
  };

  const scrollToCurrentRouteSection = () => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const hash = window.location.hash ? window.location.hash.slice(1) : null;
    const sectionId = SECTION_ROUTES[path] || (hash ? (SECTION_ROUTES['/' + hash] || hash) : null);
    if (!sectionId) return;
    const target = document.getElementById(sectionId) || (sectionId === 'process' ? document.getElementById('about') : null);
    if (!target) return;
    const performScroll = () => {
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    };
    requestAnimationFrame(performScroll);
    setTimeout(performScroll, 120);
  };

  __on(window, 'popstate', scrollToCurrentRouteSection);
  if (document.readyState === 'loading') {
    __on(document, 'DOMContentLoaded', scrollToCurrentRouteSection, { once: true });
  } else {
    scrollToCurrentRouteSection();
  }

  // 1. SCROLL PROGRESS & HEADER ELEVATION
  const siteHeader = document.querySelector('.site-header');
  const progressBar = document.getElementById('scroll-progress');

  let scrollUpdatePending = false;
  let headerScrolledState = null;

  function updateScrollInterface() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
    }

    if (siteHeader) {
      const shouldBeScrolled = scrollTop > 20;
      if (shouldBeScrolled !== headerScrolledState) {
        siteHeader.classList.toggle('is-scrolled', shouldBeScrolled);
        headerScrolledState = shouldBeScrolled;
      }
    }

    scrollUpdatePending = false;
  }

  function handleScroll() {
    if (scrollUpdatePending) return;
    scrollUpdatePending = true;
    requestAnimationFrame(updateScrollInterface);
  }

  __on(window, 'scroll', handleScroll, { passive: true });
  updateScrollInterface();

  // 1B. BACK TO TOP SMOOTH SCROLL HANDLER
  function handleScrollToTop(e) {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Clear or avoid leaving a dead #top hash if smooth-scroll handlers intercept a[href^="#"]
    if (window.location.hash === '#top' || window.location.hash) {
      __navigate(window.location.pathname + window.location.search, { replace: true });
    }
  }

  function initBackToTop() {
    document.querySelectorAll('a[href="#top"], .back-to-top').forEach((el) => {
      el.addEventListener('click', handleScrollToTop);
    });

    __on(document, 'click', (e) => {
      if (e.defaultPrevented) return;
      const trigger = e.target.closest('a[href="#top"], .back-to-top');
      if (trigger) {
        handleScrollToTop(e);
      }
    });

    // Clear or avoid leaving a dead #top hash on page load if present
    if (window.location.hash === '#top') {
      __navigate(window.location.pathname + window.location.search, { replace: true });
    }
  }

  if (document.readyState === 'loading') {
    __on(document, 'DOMContentLoaded', initBackToTop);
  } else {
    initBackToTop();
  }

  const heroVisual = document.querySelector('.hero-visual');
  const workspaceWindow = document.getElementById('workspace-window') || document.getElementById('discovery-instrument');

  if (heroVisual && workspaceWindow && !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let targetTiltX = -2;
    let targetTiltY = 1;
    let currentTiltX = -2;
    let currentTiltY = 1;
    let isHovered = false;
    let animFrameId = null;

    function updateTilt() {
      const factor = isHovered ? 0.12 : 0.08;
      currentTiltX += (targetTiltX - currentTiltX) * factor;
      currentTiltY += (targetTiltY - currentTiltY) * factor;

      workspaceWindow.style.setProperty('--tilt-x', `${currentTiltX.toFixed(2)}deg`);
      workspaceWindow.style.setProperty('--tilt-y', `${currentTiltY.toFixed(2)}deg`);

      const diff = Math.abs(targetTiltX - currentTiltX) + Math.abs(targetTiltY - currentTiltY);
      if (isHovered || diff > 0.02) {
        animFrameId = requestAnimationFrame(updateTilt);
      } else {
        animFrameId = null;
      }
    }

    heroVisual.addEventListener('pointermove', (e) => {
      isHovered = true;
      const rect = heroVisual.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      targetTiltX = normX * 12;
      targetTiltY = -normY * 10;

      if (!animFrameId) {
        animFrameId = requestAnimationFrame(updateTilt);
      }
    });

    heroVisual.addEventListener('pointerleave', () => {
      isHovered = false;
      targetTiltX = -2;
      targetTiltY = 1;
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(updateTilt);
      }
    });
  }

  // 3. ANIMATED METRIC COUNTERS
  const counterElements = document.querySelectorAll('.counter[data-target]');
  if (counterElements.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          observer.unobserve(el);
          const rawTarget = el.getAttribute('data-target');
          const isDecimal = rawTarget && rawTarget.includes('.');
          const target = isDecimal ? parseFloat(rawTarget) : parseInt(rawTarget, 10);
          const prefix = el.getAttribute('data-prefix') || '';
          if (prefersReducedMotion || isNaN(target)) {
            el.textContent = `${prefix}${rawTarget}`;
            return;
          }

          const duration = 1200;
          const startTime = performance.now();

          function animateCounter(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = target * easeOut;
            const displayVal = isDecimal ? currentVal.toFixed(1) : Math.round(currentVal);
            el.textContent = `${prefix}${displayVal}`;

            if (progress < 1) {
              requestAnimationFrame(animateCounter);
            } else {
              el.textContent = `${prefix}${rawTarget}`;
            }
          }
          requestAnimationFrame(animateCounter);
        }
      });
    }, { threshold: 0.3 });

    counterElements.forEach((el) => counterObserver.observe(el));
  }

  // 4. SOLUTION FINDER WITH SLIDING INDICATOR & CROSS-FADE
  const recommendations = {
    legal: { title: 'Legal Practice Management System', description: 'Track all your cases, court hearing dates, client files, and legal bills in one simple dashboard.', link: 'Explore Legal Practice System', target: '/legalos' },
    operations: { title: 'Company & Purchase Management System', description: 'Manage staff attendance, salary payouts, accounting, vendor orders, and stock levels in one connected system.', link: 'Explore Purchase & Inventory System', target: '/procureos' },
    education: { title: 'School & College Management System', description: 'Handle admissions, daily student attendance, fee collection, exams, and parent updates without paperwork.', link: 'Explore School & College System', target: '/school-erp' },
    automation: { title: 'Smart Workflow & Document Automation', description: 'Read scanned bills and forms automatically, sort incoming requests, and let your team approve them with one click.', link: 'Explore automation capabilities', target: '#capabilities' },
    custom: { title: 'Custom Business Management System', description: 'Get software built specifically around how your team works instead of forcing your staff into complicated tools.', link: 'Discuss a custom system', target: '#contact' }
  };

  const finderButtons = [...document.querySelectorAll('.finder-option')];
  const finderIndicator = document.getElementById('finder-indicator');
  const finderResult = document.getElementById('finder-result');
  const resultIcon = document.getElementById('result-icon');
  const resultTitle = document.getElementById('result-title');
  const resultDescription = document.getElementById('result-description');
  const resultLink = document.getElementById('result-link');

  function updateFinderIndicator(button) {
    if (!finderIndicator || !button) return;
    finderIndicator.style.top = `${button.offsetTop}px`;
    finderIndicator.style.height = `${button.offsetHeight}px`;
    finderIndicator.style.opacity = '1';
  }

  const initialActiveButton = document.querySelector('.finder-option.is-selected');
  if (initialActiveButton) {
    setTimeout(() => updateFinderIndicator(initialActiveButton), 50);
  }
  __on(window, 'resize', () => {
    const current = document.querySelector('.finder-option.is-selected');
    if (current) updateFinderIndicator(current);
  });

  finderButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.classList.contains('is-selected')) return;

      finderButtons.forEach((other) => {
        const active = other === button;
        other.classList.toggle('is-selected', active);
        other.setAttribute('aria-pressed', String(active));
      });
      updateFinderIndicator(button);

      const answer = recommendations[button.dataset.choice];
      if (!answer) return;

      if (finderResult) {
        finderResult.classList.add('is-updating');
        setTimeout(() => {
          if (resultIcon && !resultIcon.querySelector('img')) {
            resultIcon.innerHTML = '<img src="/assets/ojix-appicon-navy-rounded.svg" alt="OJIX" width="56" height="56" />';
          }
          resultTitle.textContent = answer.title;
          resultDescription.textContent = answer.description;
          resultLink.innerHTML = `${answer.link} <span aria-hidden="true">↗</span>`;
          resultLink.href = answer.target;
          finderResult.classList.remove('is-updating');
        }, 120);
      }
    });
  });

  // ============================================================================
  // 4B. ACCESSIBLE TABLIST NAVIGATION (ROVING TABINDEX & ARROW KEYS - WCAG 2.1.1 / APG)
  // ============================================================================
  function setupAccessibleTabs(tablist) {
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    if (tabs.length === 0) return;

    const selectedIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true' || tab.classList.contains('is-active'));
    const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;

    tabs.forEach((tab, index) => {
      tab.setAttribute('tabindex', index === activeIndex ? '0' : '-1');

      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.setAttribute('tabindex', t === tab ? '0' : '-1');
        });
      });

      tab.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          let next = (index + 1) % tabs.length;
          while (tabs[next].hasAttribute('disabled') || tabs[next].getAttribute('aria-disabled') === 'true') {
            if (next === index) break;
            next = (next + 1) % tabs.length;
          }
          targetIndex = next;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          let prev = (index - 1 + tabs.length) % tabs.length;
          while (tabs[prev].hasAttribute('disabled') || tabs[prev].getAttribute('aria-disabled') === 'true') {
            if (prev === index) break;
            prev = (prev - 1 + tabs.length) % tabs.length;
          }
          targetIndex = prev;
        } else if (e.key === 'Home') {
          let first = 0;
          while (tabs[first].hasAttribute('disabled') || tabs[first].getAttribute('aria-disabled') === 'true') {
            first++;
            if (first >= tabs.length) break;
          }
          targetIndex = first < tabs.length ? first : 0;
        } else if (e.key === 'End') {
          let last = tabs.length - 1;
          while (tabs[last].hasAttribute('disabled') || tabs[last].getAttribute('aria-disabled') === 'true') {
            last--;
            if (last < 0) break;
          }
          targetIndex = last >= 0 ? last : tabs.length - 1;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          tabs[targetIndex].focus();
          tabs[targetIndex].click();
        }
      });
    });
  }

  // 4C. OJIX HERO ARCHITECTURE ENGINE INTERACTION (React Bits Pro Hero 3)
  const engineTabs = document.querySelectorAll('.engine-tab[data-engine-tab], .hud-tab[data-engine-tab]');
  const engineViews = document.querySelectorAll('.engine-view, .hud-view-panel');

  if (engineTabs.length > 0) {
    engineTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.engineTab;
        const targetId = `view-${mode}`;

        engineTabs.forEach((t) => {
          const active = t.dataset.engineTab === mode;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
          t.setAttribute('tabindex', active ? '0' : '-1');
        });

        engineViews.forEach((view) => {
          if (view.id === targetId) {
            view.classList.add('is-active');
            view.hidden = false;
          } else {
            view.classList.remove('is-active');
            view.hidden = true;
          }
        });
      });
    });
  }

  // 4D. APPLE-INSPIRED PRODUCT PORTFOLIO CATEGORY FILTERING
  const portfolioFilterPills = document.querySelectorAll('.apple-portfolio-filters .filter-pill[data-filter]');
  const portfolioGrid = document.getElementById('portfolio-products-grid');
  const filterableCards = portfolioGrid ? portfolioGrid.querySelectorAll('.platform-card[data-category]') : [];
  const portfolioResultCount = document.getElementById('portfolio-result-count');
  const portfolioPrevButton = document.querySelector('.portfolio-arrow-prev');
  const portfolioNextButton = document.querySelector('.portfolio-arrow-next');

  const getVisiblePortfolioCards = () => Array.from(filterableCards).filter((card) => !card.classList.contains('is-filtered-out'));

  const updatePortfolioControls = () => {
    if (!portfolioGrid) return;
    const visibleCards = getVisiblePortfolioCards();
    if (portfolioResultCount) {
      const activePill = document.querySelector('.apple-portfolio-filters .filter-pill.is-active');
      const categoryName = activePill?.dataset.filter === 'all'
        ? 'all'
        : (activePill?.textContent || 'selected').replace(/\s*\(\d+\)\s*$/, '').toLowerCase();
      portfolioResultCount.textContent = `Showing ${categoryName} ${visibleCards.length} OJIX ${visibleCards.length === 1 ? 'product' : 'products'}`;
    }

    const maxScroll = Math.max(0, portfolioGrid.scrollWidth - portfolioGrid.clientWidth);
    if (portfolioPrevButton) portfolioPrevButton.disabled = portfolioGrid.scrollLeft <= 4;
    if (portfolioNextButton) portfolioNextButton.disabled = portfolioGrid.scrollLeft >= maxScroll - 4 || maxScroll <= 4;
  };

  const scrollPortfolio = (direction) => {
    if (!portfolioGrid) return;
    const firstCard = getVisiblePortfolioCards()[0];
    const gap = parseFloat(getComputedStyle(portfolioGrid).columnGap) || 20;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : portfolioGrid.clientWidth * 0.85;
    portfolioGrid.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  if (portfolioFilterPills.length > 0) {
    portfolioFilterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const filter = pill.dataset.filter;

        portfolioFilterPills.forEach((p) => {
          const active = p === pill;
          p.classList.toggle('is-active', active);
          p.setAttribute('aria-selected', String(active));
          p.setAttribute('tabindex', active ? '0' : '-1');
        });

        filterableCards.forEach((card) => {
          const slot = card.closest('.scroll-stack__slot');
          const spacer = slot ? slot.previousElementSibling : null;
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('is-filtered-out');
            if (slot) slot.classList.remove('is-filtered-out');
            if (spacer && spacer.classList.contains('scroll-stack__spacer')) spacer.classList.remove('is-filtered-out');
          } else {
            card.classList.add('is-filtered-out');
            if (slot) slot.classList.add('is-filtered-out');
            if (spacer && spacer.classList.contains('scroll-stack__spacer')) spacer.classList.add('is-filtered-out');
          }
        });

        if (portfolioGrid) portfolioGrid.scrollTo({ left: 0, behavior: 'smooth' });
        updatePortfolioControls();

        // Notify React Bits Scroll Stack to recalculate visible stack indices
        window.dispatchEvent(new CustomEvent('scrollstack:refresh'));
      });

      pill.addEventListener('keydown', (event) => {
        const pills = Array.from(portfolioFilterPills);
        const currentIndex = pills.indexOf(pill);
        let nextIndex = currentIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % pills.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + pills.length) % pills.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = pills.length - 1;
        else return;
        event.preventDefault();
        pills[nextIndex].focus();
        pills[nextIndex].click();
      });
    });
  }

  portfolioPrevButton?.addEventListener('click', () => scrollPortfolio(-1));
  portfolioNextButton?.addEventListener('click', () => scrollPortfolio(1));
  portfolioGrid?.addEventListener('scroll', updatePortfolioControls, { passive: true });
  portfolioGrid?.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    scrollPortfolio(event.key === 'ArrowRight' ? 1 : -1);
  });
  __on(window, 'resize', updatePortfolioControls);
  requestAnimationFrame(updatePortfolioControls);

  // 4D-2. STRIPE & PALANTIR STYLE MATRIX TABS INTERACTION
  __on(document, 'click', (e) => {
    const tabBtn = e.target.closest('.matrix-tab-btn[data-matrix-tab]');
    if (!tabBtn) return;
    const card = tabBtn.closest('.platform-card');
    if (!card) return;
    const targetTab = tabBtn.dataset.matrixTab;

    card.querySelectorAll('.matrix-tab-btn').forEach((btn) => {
      const active = btn === tabBtn;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    card.querySelectorAll('.matrix-tab-panel').forEach((panel) => {
      const active = panel.dataset.matrixPanel === targetTab;
      panel.classList.toggle('is-active', active);
      if (active) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  });

  // 4E. REACT BITS PRO FAQ 3: TABBED FAQ BY CATEGORY INTERACTION
  const faqTabBtns = document.querySelectorAll('.faq-tab-btn[data-faq-tab]');
  const faqPanels = document.querySelectorAll('.faq-category-panel');

  if (faqTabBtns.length > 0) {
    faqTabBtns.forEach((tab) => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.faqTab;
        const targetPanelId = `faq-panel-${category}`;

        faqTabBtns.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
          t.setAttribute('tabindex', active ? '0' : '-1');
        });

        faqPanels.forEach((panel) => {
          if (panel.id === targetPanelId) {
            panel.classList.add('is-active');
            panel.hidden = false;
          } else {
            panel.classList.remove('is-active');
            panel.hidden = true;
          }
        });
      });
    });
  }

  // Initialize roving tabindex & arrow key handlers across all role="tablist"
  const initAccessibleTabs = () => {
    document.querySelectorAll('[role="tablist"]').forEach(setupAccessibleTabs);
  };
  if (document.readyState === 'loading') {
    __on(document, 'DOMContentLoaded', initAccessibleTabs);
  } else {
    initAccessibleTabs();
  }

  // ==========================================================================
  // REACT BITS PRO HERO 3: DYNAMIC GRADIENT & CURSOR SPOTLIGHT ENGINE
  // Adapted for OJIX Native Enterprise Architecture & Performance
  // ==========================================================================
  function initHero3CursorEffects() {
    if (prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const heroSections = document.querySelectorAll('.hero, .pillar-hero-section');
    heroSections.forEach((section) => {
      let ticking = false;
      let clientX = 0;
      let clientY = 0;

      const updateHeroSpotlight = () => {
        const rect = section.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          ticking = false;
          return;
        }
        const rawPxX = Math.round(clientX - rect.left);
        const rawPxY = Math.round(clientY - rect.top);
        const pxX = Math.max(0, Math.min(Math.round(rect.width), rawPxX));
        const pxY = Math.max(0, Math.min(Math.round(rect.height), rawPxY));
        const pctX = ((pxX / rect.width) * 100).toFixed(2);
        const pctY = ((pxY / rect.height) * 100).toFixed(2);

        section.style.setProperty('--cursor-px-x', `${pxX}px`);
        section.style.setProperty('--cursor-px-y', `${pxY}px`);
        section.style.setProperty('--cursor-x', `${pctX}%`);
        section.style.setProperty('--cursor-y', `${pctY}%`);

        ticking = false;
      };

      const onPointerMove = (e) => {
        clientX = e.clientX;
        clientY = e.clientY;
        if (!ticking) {
          requestAnimationFrame(updateHeroSpotlight);
          ticking = true;
        }
      };

      const onPointerLeave = () => {
        const rect = section.getBoundingClientRect();
        section.style.setProperty('--cursor-x', '50%');
        section.style.setProperty('--cursor-y', '25%');
        if (rect.width > 0 && rect.height > 0) {
          section.style.setProperty('--cursor-px-x', `${Math.round(rect.width * 0.5)}px`);
          section.style.setProperty('--cursor-px-y', `${Math.round(rect.height * 0.25)}px`);
        }
      };

      section.addEventListener('pointermove', onPointerMove, { passive: true });
      section.addEventListener('pointerleave', onPointerLeave, { passive: true });
    });

    // Interactive Card Border Glow Spotlight
    const interactiveCards = document.querySelectorAll('.hero-engine-surface, .workspace-window');
    interactiveCards.forEach((card) => {
      let cardTicking = false;
      let cX = 0;
      let cY = 0;

      const updateCardSpotlight = () => {
        const rect = card.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          cardTicking = false;
          return;
        }
        const rawCardX = Math.round(cX - rect.left);
        const rawCardY = Math.round(cY - rect.top);
        const cardX = Math.max(0, Math.min(Math.round(rect.width), rawCardX));
        const cardY = Math.max(0, Math.min(Math.round(rect.height), rawCardY));

        card.style.setProperty('--card-cursor-x', `${cardX}px`);
        card.style.setProperty('--card-cursor-y', `${cardY}px`);
        card.style.setProperty('--mouse-x', `${cardX}px`);
        card.style.setProperty('--mouse-y', `${cardY}px`);

        cardTicking = false;
      };

      const onCardMove = (e) => {
        cX = e.clientX;
        cY = e.clientY;
        if (!cardTicking) {
          requestAnimationFrame(updateCardSpotlight);
          cardTicking = true;
        }
      };

      const onCardLeave = () => {
        card.style.setProperty('--card-cursor-x', '50%');
        card.style.setProperty('--card-cursor-y', '50%');
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
      };

      card.addEventListener('pointermove', onCardMove, { passive: true });
      card.addEventListener('pointerleave', onCardLeave, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    __on(document, 'DOMContentLoaded', initHero3CursorEffects);
  } else {
    initHero3CursorEffects();
  }

  // 5. NAVIGATION SCROLLSPY & IN-PAGE ROUTING
  const navLinks = document.querySelectorAll('.main-nav .nav-top-link, .main-nav a[href^="#"]');
  const homeLink = document.querySelector('.main-nav a[href="/"], .main-nav a[href="index.html"]');
  const trackedSections = document.querySelectorAll('section[id], div.anchor-target[id], header[id]');

  // In-page smooth scroll navigation for route & anchor links (e.g. "How we work" -> Who we are)
  __on(document, 'click', (event) => {
    const link = event.target.closest('.main-nav a, a[href^="#"], a[href="/process"], a[href="/#process"]');
    if (!link || link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    // Don't intercept mega menu triggers on mobile
    if (link.matches('.nav-top-link[aria-haspopup="true"]') && window.innerWidth <= 1023) return;

    const rawHref = link.getAttribute('href');
    if (!rawHref) return;

    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const isHomepage = currentPath === '/' || currentPath === '/index.html' || Boolean(SECTION_ROUTES[currentPath]);
    if (!isHomepage) return; // Allow normal navigation if clicking from a subpage

    let targetId = null;
    if (rawHref === '/' || rawHref === '#top') {
      targetId = 'top';
    } else if (rawHref.startsWith('#')) {
      const cleanId = rawHref.slice(1);
      targetId = cleanId === 'process' || cleanId === 'who-we-are' ? 'about' : cleanId;
    } else if (rawHref.startsWith('/#')) {
      const cleanId = rawHref.slice(2);
      targetId = cleanId === 'process' || cleanId === 'who-we-are' ? 'about' : cleanId;
    } else {
      const cleanPath = rawHref.replace(/\/$/, '');
      if (SECTION_ROUTES[cleanPath]) {
        targetId = SECTION_ROUTES[cleanPath];
      }
    }

    if (targetId) {
      const targetEl = targetId === 'top'
        ? document.documentElement
        : (document.getElementById(targetId) || (targetId === 'process' || targetId === 'about' ? document.querySelector('.dx-intro') : null));

      if (targetEl) {
        event.preventDefault();
        try {
          __navigate(targetId === 'top' ? '/' : '/#' + targetId);
        } catch (_) {}

        targetEl.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });

        // Update active nav link
        const navTopLinks = document.querySelectorAll('.main-nav .nav-top-link');
        navTopLinks.forEach((nl) => {
          const h = nl.getAttribute('href');
          const isActive = (h === rawHref) || (rawHref === '/' && h === '/') || ((targetId === 'about' || targetId === 'process') && (h === '/process' || h === '#process'));
          nl.classList.toggle('is-active', isActive);
        });

        // Close mobile drawer if open
        const mainNav = document.getElementById('main-nav');
        const menuToggle = document.querySelector('.menu-toggle');
        if (mainNav && mainNav.classList.contains('is-open')) {
          mainNav.classList.remove('is-open');
          document.body.classList.remove('nav-open');
          menuToggle?.setAttribute('aria-expanded', 'false');
        }
      }
    }
  });

  if (navLinks.length > 0 && trackedSections.length > 0 && 'IntersectionObserver' in window) {
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          let sectionMatched = false;
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            const isMatch = href === `#${id}` ||
              (id === 'platforms' && href === '/products') ||
              (id === 'capabilities' && href === '/services') ||
              ((id === 'about' || id === 'process' || id === 'who-we-are') && href === '/process') ||
              (id === 'security-trust' && href === '/security');
            link.classList.toggle('is-active', isMatch);
            if (isMatch) sectionMatched = true;
          });
          if (isHomePage && homeLink) {
            if (sectionMatched && id !== 'top') {
              homeLink.classList.remove('is-active');
            }
          }
        }
      });
    }, { threshold: 0.25, rootMargin: '-60px 0px -40% 0px' });

    trackedSections.forEach((sec) => sectionObserver.observe(sec));

    if (isHomePage && homeLink) {
      __on(window, 'scroll', () => {
        if ((window.scrollY || document.documentElement.scrollTop) < 120 && !window.location.hash) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          homeLink.classList.add('is-active');
        }
      }, { passive: true });
    }
  }

  // Instant active feedback on nav link click & initial hash load
  if (navLinks.length > 0) {
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.forEach((l) => l.classList.remove('is-active'));
        if (homeLink) homeLink.classList.remove('is-active');
        link.classList.add('is-active');
      });
    });

    if (window.location.hash) {
      const activeByHash = document.querySelector(`.main-nav a[href="${window.location.hash}"]`);
      if (activeByHash) {
        navLinks.forEach((l) => l.classList.remove('is-active'));
        if (homeLink) homeLink.classList.remove('is-active');
        activeByHash.classList.add('is-active');
      }
    }
  }

  // 5. PLATFORM CARDS SPOTLIGHT HOVER EFFECT
  const platformCards = document.querySelectorAll('.platform-card');
  if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    platformCards.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // 6. MOBILE NAVIGATION
  let openMobileServicesModal = () => {};
  let closeNavigation = () => {};
  let closeMobileServicesModal = () => {};

  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('main-nav');
  if (menuToggle && mainNav) {
    closeNavigation = ({ returnFocus = false } = {}) => {
      mainNav.classList.remove('is-open');
      mainNav.querySelectorAll('.nav-item-has-mega.is-mega-open').forEach((container) => {
        container.classList.remove('is-mega-open');
        container.querySelector('.nav-top-link[aria-haspopup="true"]')?.setAttribute('aria-expanded', 'false');
      });
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.classList.remove('nav-open');
      if (returnFocus) menuToggle.focus();
    };

    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      mainNav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      if (open) mainNav.querySelector('a')?.focus();
    });

    mainNav.addEventListener('click', (event) => {
      const parentLink = event.target.closest('.nav-top-link[aria-haspopup="true"]');
      if (!parentLink || window.innerWidth > 1023) return;

      const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
      const isHomepageDocument = currentPath === '/' || currentPath === '/index.html' || Boolean(SECTION_ROUTES[currentPath]);
      if (!isHomepageDocument) return;

      const container = parentLink.closest('.nav-item-has-mega');
      if (!container) return;
      // Build 04: on phones the Products mega-menu has no visible dropdown (the tap used to do
      // nothing), so "Products" simply opens the Products page, as it already did on other pages.
      if (container.getAttribute('data-mega') !== 'capabilities') {
        closeNavigation();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      // Mobile-Only Service Category Carousel Trigger
      if (container.getAttribute('data-mega') === 'capabilities') {
        closeNavigation();
        openMobileServicesModal();
        return;
      }

      const willOpen = !container.classList.contains('is-mega-open');

      mainNav.querySelectorAll('.nav-item-has-mega').forEach((otherContainer) => {
        const isCurrent = otherContainer === container;
        otherContainer.classList.toggle('is-mega-open', isCurrent && willOpen);
        otherContainer.querySelector('.nav-top-link[aria-haspopup="true"]')
          ?.setAttribute('aria-expanded', String(isCurrent && willOpen));
      });

      if (willOpen) {
        const destination = new URL(parentLink.href, window.location.href);
        const sectionId = SECTION_ROUTES[destination.pathname.replace(/\/$/, '')];
        const sectionEl = sectionId && document.getElementById(sectionId);
        if (sectionEl) sectionEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }, true);

    // Global mobile trigger for any Services link across the page
    __on(document, 'click', (event) => {
      if (window.innerWidth > 1023) return;
      const servicesTrigger = event.target.closest('a[href="/services"], a[href="#services"], [data-open-mobile-services]');
      if (servicesTrigger && !servicesTrigger.closest('#ojix-mobile-services-modal')) {
        event.preventDefault();
        closeNavigation();
        openMobileServicesModal();
      }
    });

    // Parent disclosure links must stay open long enough for their submenu handler
    // to run. Only destination links close the mobile navigation.
    mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      if (link.matches('.nav-top-link[aria-haspopup="true"]')) return;
      closeNavigation();
    }));

    __on(window, 'keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        const openSubmenu = mainNav.querySelector('.nav-item-has-mega.is-mega-open');
        if (openSubmenu) {
          openSubmenu.classList.remove('is-mega-open');
          const parentLink = openSubmenu.querySelector('.nav-top-link[aria-haspopup="true"]');
          parentLink?.setAttribute('aria-expanded', 'false');
          parentLink?.focus();
        } else {
          closeNavigation({ returnFocus: true });
        }
      }
    });

    __on(document, 'click', (event) => {
      if (mainNav.classList.contains('is-open') && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeNavigation();
      }
    });

    const handleViewportResize = () => {
      if (window.innerWidth > 1023 && mainNav.classList.contains('is-open')) {
        closeNavigation();
      }
    };
    __on(window, 'resize', handleViewportResize, { passive: true });
    __on(window, 'orientationchange', handleViewportResize, { passive: true });
  }

  // 7. GENTLE REVEAL SYSTEM
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion && !mobilePerformanceMode) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  // 8. CARD INTEREST PRESELECTION & CAPABILITIES SECTION INTERACTIVITY
  function prefillEnquiryForm(desiredInterest, customMessage) {
    const select = document.getElementById('interest');
    const messageInput = document.getElementById('message');
    const contactSection = document.getElementById('contact');
    const nameInput = document.getElementById('name');

    if (select && desiredInterest) {
      const desiredClean = desiredInterest.toLowerCase().trim();
      const option = [...select.options].find((candidate) => {
        const optText = candidate.textContent.toLowerCase().trim();
        const optVal = candidate.value.toLowerCase().trim();
        return optText === desiredClean ||
               optVal === desiredClean ||
               candidate.textContent.trim().startsWith(desiredInterest) ||
               optText.includes(desiredClean) ||
               desiredClean.includes(optText);
      });
      if (option) select.value = option.value;
    }

    if (messageInput && customMessage) {
      messageInput.value = customMessage;
    }

    if (contactSection) {
      contactSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    if (nameInput) {
      setTimeout(() => nameInput.focus(), prefersReducedMotion ? 50 : 450);
    }
  }

  document.querySelectorAll('[data-interest]').forEach((element) => {
    const handler = (e) => {
      const href = element.getAttribute('href');
      if (href && !href.startsWith('#')) {
        return; // Allow standard page navigation to .html pages
      }
      e.preventDefault();
      const desired = element.dataset.interest;
      const msg = element.dataset.message || '';
      prefillEnquiryForm(desired, msg);
    };

    element.addEventListener('click', handler);
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handler(e);
      }
    });
  });

  // 9. SECURE BACKEND FORM TRANSMISSION & DIRECT EMAIL DISPATCH
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    // Inject invisible honeypot field dynamically to defend against automated crawlers
    if (!contactForm.querySelector('input[name="_hp_check"]')) {
      const hpInput = document.createElement('input');
      hpInput.type = 'text';
      hpInput.name = '_hp_check';
      hpInput.className = 'hp-field';
      hpInput.tabIndex = -1;
      hpInput.autocomplete = 'off';
      hpInput.setAttribute('aria-hidden', 'true');
      contactForm.appendChild(hpInput);
    }

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const interestInput = document.getElementById('interest');
      const messageInput = document.getElementById('message');
      const consentInput = document.getElementById('dpdp-consent');
      const hint = document.getElementById('form-hint');

      const nameVal = (nameInput?.value || '').trim();
      const emailVal = (emailInput?.value || '').trim();
      const interestVal = (interestInput?.value || '').trim();
      const messageVal = (messageInput?.value || '').trim();

      // 1. Force strict corporate/work email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        if (emailInput) {
          emailInput.focus();
          emailInput.style.borderColor = '#DC2626';
          emailInput.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.15)';
          setTimeout(() => {
            emailInput.style.borderColor = '';
            emailInput.style.boxShadow = '';
          }, 3000);
        }
        if (hint) {
          hint.innerHTML = `<span style="color:#DC2626;font-weight:700;">Please enter a valid work email address (e.g. name@company.com) so our engineering team can review your request.</span>`;
        }
        return;
      }

      if (consentInput && !consentInput.checked) {
        if (hint) {
          hint.innerHTML = `<span style="color:#DC2626;font-weight:700;">Please check the consent box under Section 6 of the DPDP Act 2023 to proceed.</span>`;
        }
        consentInput.focus();
        return;
      }

      // 2. Prepare structured data payload for direct delivery to info@ojix.in
      const safeText = (txt) => String(txt || '').replace(/[\r\n]+/g, ' ').trim();
      const esc = (txt) => safeText(txt).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const emailSubject = `OJIX Enterprise Inquiry — ${safeText(interestVal || 'Custom Platform')}`;
      const emailBody = [
        `Name: ${safeText(nameVal)}`,
        `Work Email: ${safeText(emailVal)}`,
        `System / Platform Interest: ${safeText(interestVal)}`,
        '',
        'Operational Requirements & Scope:',
        messageVal || 'No additional scope details provided.',
        '',
        '---',
        'Statutory Consent: Section 6 Specified Purpose Consent (DPDP Act, 2023).',
        `Consent Timestamp: ${new Date().toISOString()}`,
        'Directed to: info@ojix.in'
      ].join('\n');

      const mailtoUri = `mailto:info@ojix.in?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // 3. Dispatch directly to user's mail client synchronously
      const mailtoLink = document.createElement('a');
      mailtoLink.href = mailtoUri;
      mailtoLink.style.display = 'none';
      document.body.appendChild(mailtoLink);
      mailtoLink.click();
      setTimeout(() => mailtoLink.remove(), 100);

      // 4. Background API telemetry (silent, non-blocking)
      const formData = new FormData(contactForm);
      const payload = {};
      formData.forEach((value, key) => {
        payload[key] = typeof value === 'string' ? value.trim() : value;
      });
      payload.directMailtoSent = true;
      payload.recipient = 'info@ojix.in';

      const endpoint = contactForm.querySelector('[name="fiduciary-class"]') ? '/api/audit-request' : '/api/inquiry';
      try {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {
          // Intentionally silent fallback - mailto was already triggered directly
        });
      } catch (e) {}

      // 5. Render verified DPDP on-screen receipt with direct mailto fallback button
      const consentId = `DPDP-OJIX-${Date.now().toString(36).toUpperCase()}`;
      const confirmationHtml = `
        <div class="form-feedback-card form-success-box" role="alert">
          <div class="form-success-head">
            <span class="form-success-icon">✓</span>
            <span>Inquiry Registered &amp; Directed to info@ojix.in</span>
          </div>
          <p class="form-success-desc">Your operational requirements have been registered and directed to the OJIX Engineering team at <strong>info@ojix.in</strong>.</p>

          <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;padding:12px 14px;margin:12px 0;font-size:13px;line-height:1.5;color:#334155;">
            <div><strong>Name:</strong> ${esc(nameVal)}</div>
            <div><strong>Work Email:</strong> ${esc(emailVal)}</div>
            <div><strong>Platform:</strong> ${esc(interestVal || 'Custom System')}</div>
          </div>

          <a href="${mailtoUri}" class="btn btn-orange btn-sm" style="display:inline-flex;align-items:center;gap:6px;margin:8px 0 14px;text-decoration:none;">
            <span>Open Email Client Directly (info@ojix.in)</span>
            <span aria-hidden="true">↗</span>
          </a>

          <span class="form-success-meta">Statutory Consent ID: ${consentId}<br>Lawful Basis: Section 6 Specified Purpose Consent (DPDP Act 2023). Zero data sharing with third parties.</span>
          <button type="button" class="form-reset-btn" id="form-reopen-btn" style="margin-top:16px;">Submit Another Inquiry</button>
        </div>
      `;

      contactForm.innerHTML = confirmationHtml;
      const reopenBtn = document.getElementById('form-reopen-btn');
      if (reopenBtn) {
        reopenBtn.addEventListener('click', () => {
          window.location.reload();
        });
      }
    });
  }

  // 10. YEAR & SERVICE WORKER
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Service worker: the React build no longer registers one (main.jsx removes the old one).

  // 11. DPDP ACT (2023) MODAL SYSTEM & ACCESSIBILITY
  let lastActiveElement = null;
  let activeModal = null;

  function getFocusableElements(container) {
    return [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && element.getClientRects().length > 0);
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    lastActiveElement = document.activeElement;
    activeModal = modal;
    modal.removeAttribute('hidden');
    document.body.classList.add('modal-open');
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.focus();
    } else {
      const focusable = getFocusableElements(modal);
      if (focusable.length > 0) focusable[0].focus();
    }
  }

  function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.setAttribute('hidden', '');
    if (activeModal === modalElement) activeModal = null;
    const anyOpen = document.querySelector('.modal-backdrop:not([hidden])');
    if (!anyOpen) {
      document.body.classList.remove('modal-open');
    }
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  // Open modal triggers
  document.querySelectorAll('[data-open-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-open-modal');
      openModal(modalId);
    });
  });

  // Close modal triggers
  document.querySelectorAll('[data-close-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-close-modal');
      const modal = document.getElementById(modalId) || trigger.closest('.modal-backdrop');
      closeModal(modal);
    });
  });

  // Backdrop click closes modal
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // ESC key closes any open modal
  __on(window, 'keydown', (e) => {
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal-backdrop:not([hidden])');
      openModals.forEach((modal) => closeModal(modal));
    }
    if (e.key === 'Tab' && activeModal) {
      const focusable = getFocusableElements(activeModal);
      if (!focusable.length) return;
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
  });

  // Open preferences modal directly from policy modal link
  const openPrefsFromPolicy = document.getElementById('open-preferences-from-policy');
  if (openPrefsFromPolicy) {
    openPrefsFromPolicy.addEventListener('click', (e) => {
      e.preventDefault();
      const policyModal = document.getElementById('cookie-policy-modal');
      if (policyModal) closeModal(policyModal);
      openModal('cookie-modal');
    });
  }

  // 12. DPDP ACT (2023) COOKIE CONSENT BANNER & PREFERENCES
  const CONSENT_STORAGE_KEY = 'ojix_dpdp_cookie_consent';

  function getStoredConsent() {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  }

  function initCookieBanner() {
    const cookieBanner = document.querySelector('.ojix-cookie-banner') || 
                         document.getElementById('cookie-banner') || 
                         document.querySelector('.cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept') || 
                           (cookieBanner ? cookieBanner.querySelector('[data-cookie-accept], .cookie-accept-btn') : null);
    const cookieRejectBtn = document.getElementById('cookie-reject') || 
                           (cookieBanner ? cookieBanner.querySelector('[data-cookie-reject], .cookie-reject-btn') : null);
    const cookiePreferencesBtn = document.getElementById('cookie-preferences');
    const saveCookiePrefsBtn = document.getElementById('save-cookie-preferences') || document.getElementById('cookie-save-prefs');
    const toggleAnalytics = document.getElementById('toggle-analytics') || document.getElementById('cookie-functional');

    function saveConsent(preferences) {
      const consentData = {
        necessary: true,
        analytics: Boolean(preferences.analytics),
        timestamp: new Date().toISOString(),
        jurisdiction: 'DPDP_ACT_2023_AND_RULES_2025_INDIA',
        framework: 'MeitY_DPDP_Rules_2025',
        version: '3.0'
      };
      try {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
      } catch (err) {}

      if (cookieBanner) {
        cookieBanner.classList.remove('is-visible');
        cookieBanner.setAttribute('aria-hidden', 'true');
      }
    }

    // Initialise consent state on page load
    const currentConsent = getStoredConsent();
    if (currentConsent) {
      if (toggleAnalytics) {
        toggleAnalytics.checked = currentConsent.analytics === true;
      }
    } else if (cookieBanner) {
      // Missing/null choice in localStorage: display banner immediately or after micro-delay
      setTimeout(() => {
        if (!getStoredConsent()) {
          cookieBanner.classList.add('is-visible');
          cookieBanner.setAttribute('aria-hidden', 'false');
        }
      }, 150);
    }

    // Cookie banner action buttons
    if (cookieAcceptBtn) {
      cookieAcceptBtn.addEventListener('click', () => {
        if (toggleAnalytics) toggleAnalytics.checked = true;
        saveConsent({ analytics: true });
      });
    }

    if (cookieRejectBtn) {
      cookieRejectBtn.addEventListener('click', () => {
        if (toggleAnalytics) toggleAnalytics.checked = false;
        saveConsent({ analytics: false });
      });
    }

    if (cookiePreferencesBtn) {
      cookiePreferencesBtn.addEventListener('click', () => {
        openModal('cookie-modal');
      });
    }

    if (saveCookiePrefsBtn) {
      saveCookiePrefsBtn.addEventListener('click', () => {
        const isAnalyticsAllowed = toggleAnalytics ? toggleAnalytics.checked : false;
        saveConsent({ analytics: isAnalyticsAllowed });
        const cookieModal = document.getElementById('cookie-modal');
        if (cookieModal) closeModal(cookieModal);
      });
    }
  }

  if (document.readyState === 'loading') {
    __on(document, 'DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }

  // ============================================================================
  // 13. ELEKS-STYLE HEADER MEGA-MENU & CENTRALIZED SERVICES CATALOG
  // ============================================================================

  // Centralized SVG Outline Icons System
  const SERVICE_ICONS = {
    'code': '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    'smartphone': '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    'server': '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    'palette': '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"/>',
    'layout': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    'accessibility': '<circle cx="12" cy="4" r="2"/><path d="M4 9h16"/><path d="M12 9v12"/><path d="m8 21 4-6 4 6"/>',
    'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    'credit-card': '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    'shopping-cart': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    'cpu': '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    'layers': '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
    'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'git-merge': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
    'receipt': '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h4"/>',
    'archive': '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    'bar-chart-2': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'brain': '<path d="M12 2a4 4 0 0 0-4 4v1H7a4 4 0 0 0-4 4 4 4 0 0 0 2 3.46V15a4 4 0 0 0 4 4h1v1a4 4 0 0 0 8 0v-1h1a4 4 0 0 0 4-4v-.54A4 4 0 0 0 21 11a4 4 0 0 0-4-4h-1V6a4 4 0 0 0-4-4z"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/><path d="M9 15h6"/>',
    'bot': '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
    'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    'git-branch': '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
    'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    'hard-drive': '<line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>',
    'pie-chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'workflow': '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    'webhook': '<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c0-2.21 1.79-4 4-4h.75a4 4 0 0 1 3.25-1.68V8a4 4 0 1 1 8 0v2"/>',
    'refresh-cw': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    'grid': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    'corner-down-right': '<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
    'sliders': '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    'cloud': '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    'upload-cloud': '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    'terminal': '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    'play': '<polygon points="5 3 19 12 5 21 5 3"/>',
    'box': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    'wifi': '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
    'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    'shield-check': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    'repeat': '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    'navigation': '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'key': '<path d="m21 2-2 2m-1.5 1.5L14 9a5 5 0 1 0 3 3l5-5-2-2-2.5 2.5"/>',
    'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    'wrench': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'tool': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    'headphones': '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    'monitor': '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    'arrow-up-circle': '<circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/>',
    'compass': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    'git-pull-request': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>',
    'clipboard': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
    'life-buoy': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>',
    'briefcase': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    'award': '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    'send': '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    'bar-chart': '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'feather': '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>',
    'mail': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    'factory': '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
    'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    'truck': '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'hammer': '<path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9"/><path d="M17.64 4.36 20 2l2 2-2.36 2.36"/><path d="m15 7 2 2"/>',
    'tag': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
  };

  const renderIcon = (name, className = '') => {
    const path = SERVICE_ICONS[name] || SERVICE_ICONS['code'];
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  };

  // Centralized Services Catalog (11 Categories, 93 Services)
  const SERVICES_CATALOG = [
    {
      id: 'software-development',
      title: 'Software Development',
      kicker: 'SOFTWARE DEVELOPMENT',
      heading: 'Build Digital Solutions',
      description: 'We create custom software, web and mobile applications, and backend systems that help your business grow, operate efficiently and serve your customers better.',
      bannerImg: '/assets/generated/ui-company-system.jpg',
      badge: 'Build • Scale • Grow',
      icon: 'code',
      services: [
        { title: 'Custom Software & Enterprise Applications', desc: 'Tailored applications for unique business requirements.', icon: 'code', href: '/services/custom-software-enterprise-applications', slug: 'custom-software-enterprise-applications' },
        { title: 'Website & Mobile App Development', desc: 'Responsive websites and mobile applications.', icon: 'smartphone', href: '/services/website-mobile-app-development', slug: 'website-mobile-app-development' },
        { title: 'Backend, API & Microservices Development', desc: 'Scalable backend systems and APIs.', icon: 'server', href: '/services/backend-api-microservices-development', slug: 'backend-api-microservices-development' },
        { title: 'UI/UX Design & Prototyping', desc: 'User-focused interface design and interactive prototypes.', icon: 'palette', href: '/services/uiux-design-prototyping', slug: 'uiux-design-prototyping' },
        { title: 'Website, Mobile App & Branding Design', desc: 'Consistent digital experiences and visual identity.', icon: 'layout', href: '/services/website-mobile-app-branding-design', slug: 'website-mobile-app-branding-design' },
        { title: 'Usability & Accessibility Optimization', desc: 'More accessible and easier-to-use interfaces.', icon: 'accessibility', href: '/services/usability-accessibility-optimization', slug: 'usability-accessibility-optimization' },
        { title: 'E-commerce Website & Marketplace Development', desc: 'Online stores and multi-vendor marketplaces.', icon: 'shopping-bag', href: '/services/e-commerce-website-marketplace-development', slug: 'e-commerce-website-marketplace-development' },
        { title: 'Payment & Subscription Integration', desc: 'Payment gateways, recurring billing and subscriptions.', icon: 'credit-card', href: '/services/payment-subscription-integration', slug: 'payment-subscription-integration' },
        { title: 'Online Store Maintenance & Optimization', desc: 'Improve store reliability, speed and usability.', icon: 'shopping-cart', href: '/services/online-store-maintenance-optimization', slug: 'online-store-maintenance-optimization' },
        { title: 'Product Development', desc: 'Take software products from concept to release.', icon: 'cpu', href: '/services/product-development', slug: 'product-development' }
      ]
    },
    {
      id: 'business-applications',
      title: 'Business Applications',
      kicker: 'BUSINESS APPLICATIONS',
      heading: 'Enterprise Operations & ERP',
      description: 'Connect finance, purchasing, inventory, staff records, and daily business operations in one unified workspace.',
      bannerImg: '/assets/generated/ui-purchase-system.jpg',
      badge: 'Automate • Streamline',
      icon: 'grid',
      services: [
        { title: 'ERP Solutions', desc: 'Connect finance, purchasing, inventory and business operations.', icon: 'layers', href: '/services/erp-solutions', slug: 'erp-solutions' },
        { title: 'CRM Solutions', desc: 'Manage customer records, sales pipelines and relationships.', icon: 'users', href: '/services/crm-solutions', slug: 'crm-solutions' },
        { title: 'HR Management Systems', desc: 'Manage employees, recruitment, attendance and leave.', icon: 'user-check', href: '/services/hr-management-systems', slug: 'hr-management-systems' },
        { title: 'Project & Task Management', desc: 'Coordinate projects, responsibilities and deadlines.', icon: 'check-square', href: '/services/project-task-management', slug: 'project-task-management' },
        { title: 'Workflow Automation', desc: 'Automate approvals, reminders and repetitive processes.', icon: 'git-merge', href: '/services/workflow-automation', slug: 'workflow-automation' },
        { title: 'Billing & Invoicing Systems', desc: 'Manage invoices, payments and financial records.', icon: 'receipt', href: '/services/billing-invoicing-systems', slug: 'billing-invoicing-systems' },
        { title: 'Inventory Management', desc: 'Track stock, warehouses and inventory movements.', icon: 'archive', href: '/services/inventory-management', slug: 'inventory-management' },
        { title: 'Document Management', desc: 'Organize business documents, versions and permissions.', icon: 'file-text', href: '/services/document-management', slug: 'document-management' },
        { title: 'Booking & Reservation Systems', desc: 'Manage appointments, availability and reservations.', icon: 'calendar', href: '/services/booking-reservation-systems', slug: 'booking-reservation-systems' },
        { title: 'Business Reporting Systems', desc: 'Present business performance and operational reports.', icon: 'bar-chart-2', href: '/services/business-reporting-systems', slug: 'business-reporting-systems' }
      ]
    },
    {
      id: 'ai-and-data',
      title: 'AI and Data',
      kicker: 'AI & DATA ENGINEERING',
      heading: 'Intelligent Systems & Analytics',
      description: 'Transform raw organizational data into automated workflows, intelligent assistants, and predictive foresight.',
      bannerImg: '/assets/generated/hero-campus-ai.jpg',
      badge: 'Predict • Automate',
      icon: 'bot',
      services: [
        { title: 'AI Integration', desc: 'Add AI capabilities to existing software.', icon: 'cpu', href: '/services/ai-integration', slug: 'ai-integration' },
        { title: 'AI Assistants & Chatbots', desc: 'Build assistants for customer and employee support.', icon: 'bot', href: '/services/ai-assistants-chatbots', slug: 'ai-assistants-chatbots' },
        { title: 'Enterprise Knowledge Systems', desc: 'Search company documents and internal knowledge.', icon: 'search', href: '/services/enterprise-knowledge-systems', slug: 'enterprise-knowledge-systems' },
        { title: 'Machine Learning Development', desc: 'Build models for classification and prediction.', icon: 'git-branch', href: '/services/machine-learning-development', slug: 'machine-learning-development' },
        { title: 'Predictive Analytics', desc: 'Identify trends and estimate future outcomes.', icon: 'trending-up', href: '/services/predictive-analytics', slug: 'predictive-analytics' },
        { title: 'Database Engineering', desc: 'Design, migrate and optimize databases.', icon: 'database', href: '/services/database-engineering', slug: 'database-engineering' },
        { title: 'Data Engineering & Pipelines', desc: 'Collect, transform and process business data.', icon: 'activity', href: '/services/data-engineering-pipelines', slug: 'data-engineering-pipelines' },
        { title: 'Data Warehousing', desc: 'Consolidate data for reporting and analysis.', icon: 'hard-drive', href: '/services/data-warehousing', slug: 'data-warehousing' },
        { title: 'Business Analytics', desc: 'Analyze sales, finance and operational performance.', icon: 'pie-chart', href: '/services/business-analytics', slug: 'business-analytics' },
        { title: 'Data Reconciliation', desc: 'Detect inconsistencies between systems and records.', icon: 'check-circle', href: '/services/data-reconciliation', slug: 'data-reconciliation' }
      ]
    },
    {
      id: 'integration-and-modernization',
      title: 'Integration and Modernization',
      kicker: 'INTEGRATION & MODERNIZATION',
      heading: 'Connected Tools & Upgrades',
      description: 'Unify disparate tools and migrate legacy applications to modern, decoupled microservice systems.',
      bannerImg: '/assets/generated/ui-travel-system.jpg',
      badge: 'Connect • Modernize',
      icon: 'workflow',
      services: [
        { title: 'System Integration', desc: 'Connect business applications and enterprise systems.', icon: 'link', href: '/services/system-integration', slug: 'system-integration' },
        { title: 'API & Webhook Integration', desc: 'Exchange data and trigger cross-system workflows.', icon: 'webhook', href: '/services/api-webhook-integration', slug: 'api-webhook-integration' },
        { title: 'Legacy Software Modernization', desc: 'Upgrade outdated applications and technology.', icon: 'refresh-cw', href: '/services/legacy-software-modernization', slug: 'legacy-software-modernization' },
        { title: 'Microservices Migration', desc: 'Restructure suitable systems into independently deployable services.', icon: 'grid', href: '/services/microservices-migration', slug: 'microservices-migration' },
        { title: 'Data Migration', desc: 'Transfer data safely between platforms.', icon: 'corner-down-right', href: '/services/data-migration', slug: 'data-migration' },
        { title: 'Platform Customization', desc: 'Adapt existing platforms to business requirements.', icon: 'sliders', href: '/services/platform-customization', slug: 'platform-customization' }
      ]
    },
    {
      id: 'cloud-and-infrastructure',
      title: 'Cloud and Infrastructure',
      kicker: 'CLOUD & INFRASTRUCTURE',
      heading: 'High-Availability Cloud Systems',
      description: 'Provision and operate resilient Indian and global cloud environments with automated DevOps deployment pipelines.',
      bannerImg: '/assets/generated/ui-privacy-vault.jpg',
      badge: 'Scale • 99.99% Uptime',
      icon: 'cloud',
      services: [
        { title: 'Cloud Infrastructure Management', desc: 'Provision and manage cloud resources.', icon: 'cloud', href: '/services/cloud-infrastructure-management', slug: 'cloud-infrastructure-management' },
        { title: 'Cloud Hosting & Deployment', desc: 'Host applications and manage releases.', icon: 'upload-cloud', href: '/services/cloud-hosting-deployment', slug: 'cloud-hosting-deployment' },
        { title: 'DevOps Engineering', desc: 'Improve software delivery and operations.', icon: 'terminal', href: '/services/devops-engineering', slug: 'devops-engineering' },
        { title: 'CI/CD Automation', desc: 'Automate builds, tests and deployments.', icon: 'play', href: '/services/cicd-automation', slug: 'cicd-automation' },
        { title: 'Containerization & Orchestration', desc: 'Package and manage containerized applications.', icon: 'box', href: '/services/containerization-orchestration', slug: 'containerization-orchestration' },
        { title: 'Network Management', desc: 'Configure and maintain network connectivity.', icon: 'wifi', href: '/services/network-management', slug: 'network-management' },
        { title: 'IT Infrastructure Management', desc: 'Manage servers, devices and core IT systems.', icon: 'server', href: '/services/it-infrastructure-management', slug: 'it-infrastructure-management' },
        { title: 'Cloud Cost Optimization', desc: 'Reduce waste and improve resource utilization.', icon: 'dollar-sign', href: '/services/cloud-cost-optimization', slug: 'cloud-cost-optimization' }
      ]
    },
    {
      id: 'quality-and-security',
      title: 'Quality and Security',
      kicker: 'QUALITY & SECURITY',
      heading: 'Rigorous QA & Security Compliance',
      description: 'Ensure software reliability, verify complex user journeys, and protect enterprise data under statutory DPDP Act standards.',
      bannerImg: '/assets/generated/hero-legal-chamber.jpg',
      badge: 'DPDP 2023 • ISO 27001',
      icon: 'shield-check',
      services: [
        { title: 'Functional & Integration Testing', desc: 'Verify features and system interactions.', icon: 'check-square', href: '/services/functional-integration-testing', slug: 'functional-integration-testing' },
        { title: 'Test Automation', desc: 'Automate repeatable software tests.', icon: 'repeat', href: '/services/test-automation', slug: 'test-automation' },
        { title: 'API & End-to-End Testing', desc: 'Validate APIs and complete user journeys.', icon: 'navigation', href: '/services/api-end-to-end-testing', slug: 'api-end-to-end-testing' },
        { title: 'Performance Testing', desc: 'Evaluate speed, concurrency and system capacity.', icon: 'zap', href: '/services/performance-testing', slug: 'performance-testing' },
        { title: 'Security Auditing', desc: 'Identify security weaknesses and configuration problems.', icon: 'shield', href: '/services/security-auditing', slug: 'security-auditing' },
        { title: 'Penetration Testing', desc: 'Perform authorized testing for exploitable vulnerabilities.', icon: 'key', href: '/services/penetration-testing', slug: 'penetration-testing' },
        { title: 'Application Security', desc: 'Strengthen authentication, authorization and data protection.', icon: 'lock', href: '/services/application-security', slug: 'application-security' },
        { title: 'Security Monitoring', desc: 'Detect suspicious activity and investigate alerts.', icon: 'eye', href: '/services/security-monitoring', slug: 'security-monitoring' }
      ]
    },
    {
      id: 'maintenance-and-support',
      title: 'Maintenance and Support',
      kicker: 'MAINTENANCE & SUPPORT',
      heading: 'Reliable Support & System Health',
      description: 'Keep applications dependable and secure with continuous monitoring, defect triage, and regular dependency updates.',
      bannerImg: '/assets/generated/hero-overview-office.jpg',
      badge: '24/7 • Active SLA',
      icon: 'settings',
      services: [
        { title: 'Software Maintenance', desc: 'Keep applications stable and up to date.', icon: 'wrench', href: '/services/software-maintenance', slug: 'software-maintenance' },
        { title: 'Bug Fixing & Enhancements', desc: 'Resolve defects and add improvements.', icon: 'tool', href: '/services/bug-fixing-enhancements', slug: 'bug-fixing-enhancements' },
        { title: 'Technical Support', desc: 'Help users and teams solve technical problems.', icon: 'headphones', href: '/services/technical-support', slug: 'technical-support' },
        { title: 'Incident Management', desc: 'Coordinate responses to production failures.', icon: 'alert-triangle', href: '/services/incident-management', slug: 'incident-management' },
        { title: 'Application Monitoring', desc: 'Track errors, performance and availability.', icon: 'monitor', href: '/services/application-monitoring', slug: 'application-monitoring' },
        { title: 'Managed Application Services', desc: 'Operate and maintain applications continuously.', icon: 'settings', href: '/services/managed-application-services', slug: 'managed-application-services' },
        { title: 'Version Upgrades', desc: 'Upgrade software frameworks, dependencies and platforms.', icon: 'arrow-up-circle', href: '/services/version-upgrades', slug: 'version-upgrades' }
      ]
    },
    {
      id: 'marketing-and-growth',
      title: 'Marketing and Growth',
      kicker: 'MARKETING & GROWTH',
      heading: 'Data-Driven Digital Growth',
      description: 'Maximize acquisition, organic search visibility, and customer lifetime value with automated growth engines.',
      bannerImg: '/assets/generated/ui-construction-system.jpg',
      badge: 'Attract • Convert',
      icon: 'trending-up',
      services: [
        { title: 'Digital Marketing', desc: 'Plan and manage digital marketing campaigns.', icon: 'send', href: '/services/digital-marketing', slug: 'digital-marketing' },
        { title: 'Search Engine Optimization', desc: 'Improve organic search visibility.', icon: 'search', href: '/services/search-engine-optimization', slug: 'search-engine-optimization' },
        { title: 'Marketing Analytics', desc: 'Measure campaigns, leads and conversions.', icon: 'bar-chart', href: '/services/marketing-analytics', slug: 'marketing-analytics' },
        { title: 'Advertising Management', desc: 'Manage paid advertising campaigns.', icon: 'target', href: '/services/advertising-management', slug: 'advertising-management' },
        { title: 'Content Marketing', desc: 'Develop content to attract and inform customers.', icon: 'feather', href: '/services/content-marketing', slug: 'content-marketing' },
        { title: 'Email Automation', desc: 'Automate email campaigns and follow-ups.', icon: 'mail', href: '/services/email-automation', slug: 'email-automation' },
        { title: 'Conversion Optimization', desc: 'Improve digital experiences and conversion rates.', icon: 'trending-up', href: '/services/conversion-optimization', slug: 'conversion-optimization' }
      ]
    },
    {
      id: 'industry-solutions',
      title: 'Industry Solutions',
      kicker: 'INDUSTRY SOLUTIONS',
      heading: 'Specialized Industry Software',
      description: 'Engineered platforms tailored to the statutory, operational, and billing requirements of your business sector.',
      bannerImg: '/assets/generated/ui-campus-system.jpg',
      badge: 'Industry-Grade Systems',
      icon: 'factory',
      services: [
        { title: 'Healthcare Software', desc: 'Clinic, hospital, laboratory and patient applications.', icon: 'activity', href: '/services/healthcare-software', slug: 'healthcare-software' },
        { title: 'Education Software', desc: 'School, college and learning management systems.', icon: 'book', href: '/services/education-software', slug: 'education-software' },
        { title: 'Retail Software', desc: 'Point-of-sale, inventory and retail operations.', icon: 'shopping-cart', href: '/services/retail-software', slug: 'retail-software' },
        { title: 'Logistics Software', desc: 'Shipment, delivery, fleet and warehouse management.', icon: 'truck', href: '/services/logistics-software', slug: 'logistics-software' },
        { title: 'Manufacturing Software', desc: 'Production planning and quality management.', icon: 'settings', href: '/services/manufacturing-software', slug: 'manufacturing-software' },
        { title: 'Financial Software', desc: 'Billing, reconciliation and financial operations.', icon: 'credit-card', href: '/services/financial-software', slug: 'financial-software' },
        { title: 'Real Estate Software', desc: 'Property listings, tenant and facility management.', icon: 'home', href: '/services/real-estate-software', slug: 'real-estate-software' },
        { title: 'Construction Software', desc: 'Project tracking, contractor coordination and cost management.', icon: 'hammer', href: '/services/construction-software', slug: 'construction-software' },
        { title: 'Insurance Software', desc: 'Policy, claims and customer management.', icon: 'shield', href: '/services/insurance-software', slug: 'insurance-software' },
        { title: 'Industrial IoT Solutions', desc: 'Device integration and equipment monitoring.', icon: 'cpu', href: '/services/industrial-iot-solutions', slug: 'industrial-iot-solutions' }
      ]
    },
    {
      id: 'commercial-models',
      title: 'Commercial Models',
      kicker: 'COMMERCIAL MODELS',
      heading: 'Transparent & Flexible Models',
      description: 'Select the engagement structure that aligns with your delivery schedule, financial planning, and governance needs.',
      bannerImg: '/assets/generated/ui-legal-system.jpg',
      badge: 'Transparent • Zero Lock-In',
      icon: 'file-text',
      services: [
        { title: 'Fixed-Price Projects', desc: 'Deliver an agreed scope for a defined price.', icon: 'tag', href: '/services/fixed-price-projects', slug: 'fixed-price-projects' },
        { title: 'Time-Based Development', desc: 'Provide development services based on agreed effort.', icon: 'clock', href: '/services/time-based-development', slug: 'time-based-development' },
        { title: 'Monthly Retainers', desc: 'Provide recurring support or development capacity.', icon: 'calendar', href: '/services/monthly-retainers', slug: 'monthly-retainers' },
        { title: 'Managed Service Contracts', desc: 'Take responsibility for agreed systems and service levels.', icon: 'shield-check', href: '/services/managed-service-contracts', slug: 'managed-service-contracts' },
        { title: 'Consulting Engagements', desc: 'Provide specialist advice and technical assessments.', icon: 'message-square', href: '/services/consulting-engagements', slug: 'consulting-engagements' }
      ]
    }
  ];

  // Initialize Services Mega-Menu (10 Categories in Products-style 2-column layout + Preview)
  function initServicesMegaMenu(container) {
    const sidebar = container.querySelector('.eleks-mega-left');
    const rightPanel = container.querySelector('.eleks-mega-right');
    const topLink = container.querySelector('.nav-top-link');
    if (!sidebar || !rightPanel) return;

    let activeIndex = 0;
    const isSubdir = window.location.pathname.includes('/services/');
    const resolveImgSrc = (src) => {
      if (!src) return '';
      if (src.startsWith('http://') || src.startsWith('https://')) return src;
      const clean = src.replace(/^(\.\.\/|\/)/, '');
      return `/${clean}`;
    };

    // 1. Build the left panel with all 10 service categories in products mega-menu style
    sidebar.setAttribute('role', 'tablist');
    sidebar.setAttribute('aria-label', 'Select service category');
    sidebar.innerHTML = SERVICES_CATALOG.map((cat, idx) => {
      const primaryHref = cat.services && cat.services.length ? cat.services[0].href : '/services';
      return `
        <a href="${primaryHref}" class="eleks-subtab ${idx === 0 ? 'is-active' : ''}"
          role="tab"
          id="services-subtab-${cat.id}"
          aria-selected="${idx === 0 ? 'true' : 'false'}"
          data-preview-title="${cat.title}"
          data-preview-desc="${cat.description}"
          data-preview-badge="${cat.kicker || 'OUR SERVICES'}"
          data-preview-img="${resolveImgSrc(cat.bannerImg)}"
          data-preview-href="${primaryHref}"
          data-cat-index="${idx}">
          <span class="eleks-subtab-icon" aria-hidden="true">
            ${renderIcon(cat.icon)}
          </span>
          <span class="eleks-subtab-info">
            <span class="eleks-subtab-label">${cat.title}</span>
            <span class="eleks-subtab-count">${cat.services.length} Services</span>
          </span>
        </a>
      `;
    }).join('');

    // 2. Build the right preview card in products mega-menu style
    const firstCat = SERVICES_CATALOG[0];
    const firstHref = firstCat.services && firstCat.services.length ? firstCat.services[0].href : '/services';
    rightPanel.setAttribute('aria-live', 'polite');
    rightPanel.innerHTML = `
      <a href="${firstHref}" class="eleks-mega-preview-media" aria-label="Explore ${firstCat.title}" tabindex="-1">
        <img src="${resolveImgSrc(firstCat.bannerImg)}" alt="${firstCat.title} preview" class="eleks-preview-img" loading="lazy" />
      </a>
      <div class="eleks-mega-preview-head">
        <span class="eleks-preview-kicker">${firstCat.kicker || 'OUR SERVICES'}</span>
        <h3 class="eleks-preview-title">${firstCat.title}</h3>
        <p class="eleks-preview-desc">${firstCat.description}</p>
        <a href="${firstHref}" class="eleks-preview-cta">
          <span>Explore Services</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    `;

    // 3. Hover / Focus activation with smooth transition
    const subtabs = sidebar.querySelectorAll('.eleks-subtab');
    const previewKicker = rightPanel.querySelector('.eleks-preview-kicker');
    const previewTitle = rightPanel.querySelector('.eleks-preview-title');
    const previewDesc = rightPanel.querySelector('.eleks-preview-desc');
    const previewImg = rightPanel.querySelector('.eleks-preview-img');
    const previewLinks = rightPanel.querySelectorAll('a');

    const activateSubtab = (subtab) => {
      if (!subtab) return;
      const idx = parseInt(subtab.getAttribute('data-cat-index'), 10);
      if (idx === activeIndex && subtab.classList.contains('is-active')) return;
      activeIndex = idx;

      subtabs.forEach((tab) => {
        const active = tab === subtab;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });

      const cat = SERVICES_CATALOG[idx];
      if (!cat) return;
      const primaryHref = cat.services && cat.services.length ? cat.services[0].href : '/services';

      rightPanel.classList.add('is-switching');
      if (previewKicker) previewKicker.textContent = cat.kicker || 'OUR SERVICES';
      if (previewTitle) previewTitle.textContent = cat.title;
      if (previewDesc) previewDesc.textContent = cat.description;
      if (previewImg) {
        previewImg.src = resolveImgSrc(cat.bannerImg);
        previewImg.alt = `${cat.title} preview`;
      }
      previewLinks.forEach((link) => {
        link.setAttribute('href', primaryHref);
        link.setAttribute('aria-label', `Explore ${cat.title}`);
      });

      setTimeout(() => rightPanel.classList.remove('is-switching'), 160);
    };

    subtabs.forEach((subtab) => {
      subtab.addEventListener('pointerenter', () => activateSubtab(subtab));
      subtab.addEventListener('focus', () => activateSubtab(subtab));
      subtab.addEventListener('click', () => {
        container.classList.remove('is-mega-open');
        const hdr = document.querySelector('.eleks-header');
        if (hdr) hdr.classList.remove('has-mega-open');
        if (topLink) topLink.setAttribute('aria-expanded', 'false');
      });
    });

    // Keyboard navigation within tablist
    sidebar.addEventListener('keydown', (e) => {
      const buttons = Array.from(sidebar.querySelectorAll('.eleks-subtab'));
      const currentBtn = document.activeElement;
      const currentIndex = buttons.indexOf(currentBtn);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (currentIndex + 1) % buttons.length;
        buttons[nextIdx].focus();
        activateSubtab(buttons[nextIdx]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (currentIndex - 1 + buttons.length) % buttons.length;
        buttons[prevIdx].focus();
        activateSubtab(buttons[prevIdx]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        buttons[0].focus();
        activateSubtab(buttons[0]);
      } else if (e.key === 'End') {
        e.preventDefault();
        buttons[buttons.length - 1].focus();
        activateSubtab(buttons[buttons.length - 1]);
      }
    });
  }

  // Master Mega-Menus Initialization
  const megaContainers = document.querySelectorAll('.nav-item-has-mega');
  const eleksHeader = document.querySelector('.eleks-header');

  megaContainers.forEach((container) => {
    const topLink = container.querySelector('.nav-top-link');
    const megaType = container.getAttribute('data-mega');

    if (megaType === 'capabilities') {
      // 10 Categories Services Mega-Menu (Products style)
      initServicesMegaMenu(container);
    } else {
      // Products Subtabs (Platforms)
      const subtabs = container.querySelectorAll('.eleks-subtab');
      const rightPanel = container.querySelector('.eleks-mega-right');
      const previewKicker = container.querySelector('.eleks-preview-kicker');
      const previewTitle = container.querySelector('.eleks-preview-title');
      const previewDesc = container.querySelector('.eleks-preview-desc');
      const previewImg = container.querySelector('.eleks-preview-img');

      const activateSubtab = (subtab) => {
        if (!subtab) return;
        subtabs.forEach((tab) => {
          const active = tab === subtab;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', String(active));
        });

        if (rightPanel && previewTitle && previewDesc) {
          const newTitle = subtab.getAttribute('data-preview-title') || '';
          const newDesc = subtab.getAttribute('data-preview-desc') || '';
          const newBadge = subtab.getAttribute('data-preview-badge') || '';
          const newImg = subtab.getAttribute('data-preview-img') || '';
          const newHref = subtab.getAttribute('href') || '#';

          if (previewTitle.textContent !== newTitle) {
            rightPanel.classList.add('is-switching');
            if (previewKicker && newBadge) previewKicker.textContent = newBadge;
            previewTitle.textContent = newTitle;
            previewDesc.textContent = newDesc;
            if (previewImg && newImg) {
              previewImg.src = newImg;
              previewImg.alt = `${newTitle} preview`;
            }
            const rightLinks = rightPanel.querySelectorAll('a');
            rightLinks.forEach((link) => link.setAttribute('href', newHref));
            setTimeout(() => rightPanel.classList.remove('is-switching'), 160);
          }
        }
      };

      subtabs.forEach((subtab) => {
        subtab.addEventListener('pointerenter', () => activateSubtab(subtab));
        subtab.addEventListener('focus', () => activateSubtab(subtab));
        subtab.addEventListener('click', () => {
          container.classList.remove('is-mega-open');
          if (eleksHeader) eleksHeader.classList.remove('has-mega-open');
          if (topLink) topLink.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Common Dropdown Hover and Dismissal Interactions
    if (topLink) {
      // Remove link navigation when clicking Services navbar option
      if (megaType === 'capabilities') {
        // Services works like Products: hover opens the mega-menu, click opens the Services page.
        const servicesHref = '/services';
        topLink.setAttribute('href', servicesHref);
        topLink.removeAttribute('role');
        topLink.style.cursor = 'pointer';

        topLink.addEventListener('click', (e) => {
          if (window.innerWidth > 1023) {
            return; // normal navigation to /services
          }
          e.preventDefault();
          e.stopPropagation();
          {
            closeNavigation();
            openMobileServicesModal();
          }
        });
      }

      let leaveTimer = null;

      const openDropdown = () => {
        if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimer = null;
        }
        topLink.setAttribute('aria-expanded', 'true');
        container.classList.add('is-mega-open');
        if (eleksHeader) eleksHeader.classList.add('has-mega-open');
      };

      const closeDropdown = () => {
        if (leaveTimer) clearTimeout(leaveTimer);
        leaveTimer = setTimeout(() => {
          topLink.setAttribute('aria-expanded', 'false');
          container.classList.remove('is-mega-open');
          if (eleksHeader) eleksHeader.classList.remove('has-mega-open');
        }, 140);
      };

      topLink.addEventListener('mouseenter', openDropdown);
      container.addEventListener('mouseenter', openDropdown);
      container.addEventListener('mouseleave', closeDropdown);
      topLink.addEventListener('focus', openDropdown);
    }
  });

  // Global outside-click and Escape listeners for Mega-Menus
  __on(document, 'keydown', (e) => {
    if (e.key === 'Escape') {
      megaContainers.forEach((container) => {
        if (container.classList.contains('is-mega-open') || container.querySelector('.eleks-mega-dropdown:hover')) {
          container.classList.remove('is-mega-open');
          const topLink = container.querySelector('.nav-top-link');
          if (topLink) {
            topLink.setAttribute('aria-expanded', 'false');
            topLink.focus();
          }
        }
      });
      if (eleksHeader) eleksHeader.classList.remove('has-mega-open');
    }
  });

  // ============================================================================
  // 13B. OJIX MOBILE-ONLY SERVICE CATEGORY CAROUSEL MODAL
  // ============================================================================
  function initMobileServicesCarousel() {
    let modal = document.getElementById('ojix-mobile-services-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ojix-mobile-services-modal';
      modal.className = 'ojix-mobile-services-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Services Catalog');
      modal.setAttribute('hidden', '');
      modal.innerHTML = `
        <div class="mobile-services-backdrop" data-close-mobile-services></div>
        <div class="mobile-services-sheet">
          <header class="mobile-services-header">
            <a href="#top" class="mobile-services-brand" aria-label="OJIX home">
              <img src="/assets/ojix-navbar-logo.svg" alt="OJIX" width="96" height="46" />
            </a>
            <button type="button" class="mobile-services-close-btn" data-close-mobile-services aria-label="Close services panel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </header>
          <div class="mobile-services-nav-bar">
            <div class="mobile-services-nav-top">
              <span class="mobile-services-eyebrow">OUR SERVICES</span>
              <span class="mobile-services-counter" aria-live="polite">
                <span class="mobile-counter-current">01</span><span class="mobile-counter-sep">/</span><span class="mobile-counter-total">10</span>
              </span>
            </div>
            <div class="mobile-services-tabs-scroll" role="tablist" aria-label="Service Categories" tabindex="0"></div>
          </div>
          <div class="mobile-services-carousel-wrap">
            <div class="mobile-services-carousel" id="mobile-services-carousel" tabindex="0" role="region" aria-label="Service category carousel"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const tabsContainer = modal.querySelector('.mobile-services-tabs-scroll');
    const carousel = modal.querySelector('#mobile-services-carousel');
    const counterCurrent = modal.querySelector('.mobile-counter-current');
    const counterTotal = modal.querySelector('.mobile-counter-total');
    const closeBtn = modal.querySelector('.mobile-services-close-btn');
    if (!tabsContainer || !carousel) return;

    const totalCategories = SERVICES_CATALOG.length;
    if (counterTotal) {
      counterTotal.textContent = String(totalCategories).padStart(2, '0');
    }

    const CATEGORY_SHORT_NAMES = {
      'software-development': 'Software',
      'business-applications': 'Business',
      'ai-and-data': 'AI & Data',
      'integration-and-modernization': 'Integrations',
      'cloud-and-infrastructure': 'Cloud',
      'quality-and-security': 'Security',
      'maintenance-and-support': 'Support',
      'marketing-and-growth': 'Marketing',
      'industry-solutions': 'Industry Solutions',
      'commercial-models': 'Commercial Models'
    };

    // 1. Render Category Tabs (Horizontally scrollable selector)
    tabsContainer.innerHTML = SERVICES_CATALOG.map((cat, idx) => {
      const shortName = CATEGORY_SHORT_NAMES[cat.id] || cat.title;
      return `
        <button type="button"
          class="mobile-cat-tab ${idx === 0 ? 'is-active' : ''}"
          role="tab"
          id="mobile-cat-tab-${cat.id}"
          aria-controls="mobile-cat-panel-${cat.id}"
          aria-selected="${idx === 0 ? 'true' : 'false'}"
          title="${cat.title} (${cat.services.length} services)"
          data-cat-index="${idx}">
          <span class="mobile-cat-tab-icon" aria-hidden="true">${renderIcon(cat.icon)}</span>
          <span class="mobile-cat-tab-text">${shortName}</span>
        </button>
      `;
    }).join('');

    // 2. Render Carousel Slides (One prominent category card per slide)
    carousel.innerHTML = SERVICES_CATALOG.map((cat, idx) => {
      const rowCount = Math.ceil(cat.services.length / 2);
      return `
        <article class="mobile-carousel-slide"
          role="tabpanel"
          id="mobile-cat-panel-${cat.id}"
          aria-labelledby="mobile-cat-tab-${cat.id}"
          data-cat-index="${idx}">
          <div class="mobile-cat-card">
            <!-- Category Header: Title & Description -->
            <div class="mobile-cat-header">
              <h3 class="mobile-cat-title">${cat.title}</h3>
              <p class="mobile-cat-desc">${cat.description}</p>
            </div>

            <!-- Category Banner Image -->
            ${cat.bannerImg ? `
              <div class="mobile-cat-banner-wrap">
                <img src="${cat.bannerImg}" alt="${cat.title} banner" class="mobile-cat-banner-img" loading="lazy" />
              </div>
            ` : ''}

            <!-- Section Heading: Services -->
            <div class="mobile-cat-section-header">
              <span class="mobile-cat-section-title">Services</span>
              <span class="mobile-cat-section-count">${cat.services.length}</span>
            </div>

            <!-- Compact Service List (Two-Column Grid) -->
            <div class="mobile-cat-services-grid" style="grid-template-rows: repeat(${rowCount}, auto);">
              ${cat.services.map((svc) => `
                <a href="${svc.href}" class="mobile-cat-svc-item" title="${svc.title}">
                  <span class="mobile-cat-svc-icon" aria-hidden="true">${renderIcon(svc.icon)}</span>
                  <span class="mobile-cat-svc-name">${svc.title}</span>
                </a>
              `).join('')}
            </div>

            <!-- Compact Bottom Call-To-Action (CTA) -->
            <div class="mobile-cat-cta">
              <div class="mobile-cat-cta-header">
                <div class="mobile-cat-cta-bulb" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                    <path d="M9 18h6"/><path d="M10 22h4"/>
                  </svg>
                </div>
                <div class="mobile-cat-cta-text">
                  <span class="mobile-cat-cta-eyebrow">LET'S BUILD SOMETHING GREAT</span>
                  <h4 class="mobile-cat-cta-title">Need a custom solution?</h4>
                </div>
              </div>
              <a href="/contact" class="mobile-cat-cta-btn">
                <span>Discuss a project</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    let currentCategoryIndex = 0;
    const tabButtons = tabsContainer.querySelectorAll('.mobile-cat-tab');

    const updateActiveTab = (index) => {
      if (index < 0 || index >= totalCategories) return;
      currentCategoryIndex = index;

      tabButtons.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        if (active) {
          tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });

      if (counterCurrent) {
        counterCurrent.textContent = String(index + 1).padStart(2, '0');
      }
    };

    const goToSlide = (index, { smooth = true } = {}) => {
      if (index < 0 || index >= totalCategories) return;
      const slideWidth = carousel.clientWidth;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      carousel.scrollTo({
        left: index * slideWidth,
        behavior: (smooth && !reducedMotion) ? 'smooth' : 'auto'
      });
      updateActiveTab(index);
    };

    // Category tab clicks
    tabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.mobile-cat-tab');
      if (!tab) return;
      e.preventDefault();
      const idx = parseInt(tab.getAttribute('data-cat-index'), 10);
      goToSlide(idx);
    });

    // Carousel scroll sync with debouncing / rAF
    let scrollRaf = null;
    carousel.addEventListener('scroll', () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const slideWidth = carousel.clientWidth;
        if (!slideWidth) return;
        const detected = Math.round(carousel.scrollLeft / slideWidth);
        if (detected !== currentCategoryIndex && detected >= 0 && detected < totalCategories) {
          updateActiveTab(detected);
        }
      });
    }, { passive: true });

    // Mouse Drag Support (allows desktop/touch-emulator dragging)
    let isDragging = false;
    let dragStartX = 0;
    let dragScrollLeft = 0;

    carousel.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      dragStartX = e.pageX;
      dragScrollLeft = carousel.scrollLeft;
      carousel.style.scrollBehavior = 'auto';
    });

    __on(window, 'mousemove', (e) => {
      if (!isDragging) return;
      const walk = e.pageX - dragStartX;
      carousel.scrollLeft = dragScrollLeft - walk;
    });

    __on(window, 'mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      carousel.style.scrollBehavior = 'smooth';
      const slideWidth = carousel.clientWidth;
      const target = Math.round(carousel.scrollLeft / slideWidth);
      goToSlide(target);
    });

    // Keyboard navigation when inside carousel or modal
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        if (currentCategoryIndex < totalCategories - 1) {
          e.preventDefault();
          goToSlide(currentCategoryIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentCategoryIndex > 0) {
          e.preventDefault();
          goToSlide(currentCategoryIndex - 1);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeMobileServicesModal();
      }
    });

    // Open and Close implementations
    let lastFocusedElement = null;

    openMobileServicesModal = (targetIndex = 0) => {
      lastFocusedElement = document.activeElement;
      modal.removeAttribute('hidden');
      modal.classList.add('is-open');
      document.body.classList.add('mobile-services-modal-open');
      document.documentElement.classList.add('mobile-services-modal-open');

      // Go to requested category index or default to 0
      requestAnimationFrame(() => {
        goToSlide(targetIndex, { smooth: false });
        if (closeBtn) closeBtn.focus();
      });
    };

    closeMobileServicesModal = () => {
      if (!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('hidden', '');
      document.body.classList.remove('mobile-services-modal-open');
      document.documentElement.classList.remove('mobile-services-modal-open');

      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    };

    // Close triggers
    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-mobile-services]')) {
        e.preventDefault();
        closeMobileServicesModal();
        return;
      }
      // Clicking any service link or CTA or brand closes the panel
      const navLink = e.target.closest('a');
      if (navLink) {
        closeMobileServicesModal();
      }
    });

    // Auto-close if screen resized above 1023px
    __on(window, 'resize', () => {
      if (window.innerWidth > 1023 && modal.classList.contains('is-open')) {
        closeMobileServicesModal();
      }
    }, { passive: true });
  }

  // Initialize Mobile Services Carousel
  initMobileServicesCarousel();

  // ============================================================================
  // 14. ELEKS-STYLE HERO HORIZONTAL EXPANDING ACCORDION SUBTABS
  // ============================================================================
  const heroCardsContainer = document.getElementById('eleks-hero-cards');
  const heroCards = heroCardsContainer ? Array.from(heroCardsContainer.querySelectorAll('.eleks-hero-card')) : [];
  const heroArrows = heroCardsContainer ? heroCardsContainer.querySelector('.eleks-hero-arrows') : null;
  const heroPrevBtn = document.getElementById('eleks-hero-prev');
  const heroNextBtn = document.getElementById('eleks-hero-next');

  if (heroCards.length > 0) {
    let activeHeroIndex = 0;
    let heroAutoTimer = null;
    let heroTouchStartX = 0;
    let heroTouchStartY = 0;
    let suppressHeroClickUntil = 0;
    let heroShowcaseVisible = true;
    const HERO_AUTOPLAY_MS = 10000;
    const compactHeroQuery = window.matchMedia('(max-width: 1023px)');
    const singleSlideHeroQuery = window.matchMedia('(max-width: 767px), (max-width: 1023px) and (max-height: 600px)');

    const alignActiveHeroCard = (card) => {
      if (!card || !compactHeroQuery.matches || singleSlideHeroQuery.matches) return;
      requestAnimationFrame(() => {
        const targetLeft = card.offsetLeft - (heroCardsContainer.clientWidth - card.offsetWidth) / 2;
        heroCardsContainer.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    };

    const syncHeroArrowsPlacement = (activeCard) => {
      if (!heroArrows || !activeCard) return;
      if (heroArrows.parentElement !== activeCard) {
        activeCard.appendChild(heroArrows);
      }
    };

    const restartProgressBar = (card) => {
      const bar = card ? card.querySelector('.eleks-progress-bar') : null;
      if (!bar) return;
      bar.style.animation = 'none';
      // Force reflow so keyframe animation restarts cleanly
      void bar.offsetWidth;
      bar.style.animation = '';
    };

    const setActiveHeroSlide = (index) => {
      const normalized = ((index % heroCards.length) + heroCards.length) % heroCards.length;
      activeHeroIndex = normalized;

      heroCards.forEach((card, idx) => {
        const isActive = idx === normalized;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-selected', String(isActive));
        if (isActive) {
          syncHeroArrowsPlacement(card);
          restartProgressBar(card);
          alignActiveHeroCard(card);
        }
      });
    };

    const resetHeroAutoplay = () => {
      if (heroAutoTimer) clearInterval(heroAutoTimer);
      if (!prefersReducedMotion && !compactHeroQuery.matches && heroShowcaseVisible) {
        heroAutoTimer = setInterval(() => {
          setActiveHeroSlide(activeHeroIndex + 1);
        }, HERO_AUTOPLAY_MS);
      }
    };

    // Initial placement of arrows inside the active card
    syncHeroArrowsPlacement(heroCards[0]);
    resetHeroAutoplay();
    __on(compactHeroQuery, 'change', resetHeroAutoplay);

    if ('IntersectionObserver' in window) {
      const heroVisibilityObserver = new IntersectionObserver(([entry]) => {
        heroShowcaseVisible = Boolean(entry?.isIntersecting);
        resetHeroAutoplay();
      }, { threshold: 0.08 });
      heroVisibilityObserver.observe(heroCardsContainer);
    }

    heroCards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        if (Date.now() < suppressHeroClickUntil) return;
        // Do not intercept clicks on links or arrow buttons inside the active card
        if (e.target.closest('a, .eleks-hero-arrows')) return;
        if (idx !== activeHeroIndex) {
          setActiveHeroSlide(idx);
          resetHeroAutoplay();
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.target !== card) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveHeroSlide(idx);
          resetHeroAutoplay();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIdx = (idx + 1) % heroCards.length;
          setActiveHeroSlide(nextIdx);
          heroCards[nextIdx].focus();
          resetHeroAutoplay();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIdx = (idx - 1 + heroCards.length) % heroCards.length;
          setActiveHeroSlide(prevIdx);
          heroCards[prevIdx].focus();
          resetHeroAutoplay();
        }
      });
    });

    heroCardsContainer.addEventListener('touchstart', (e) => {
      if (!compactHeroQuery.matches || e.touches.length !== 1) return;
      heroTouchStartX = e.touches[0].clientX;
      heroTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    heroCardsContainer.addEventListener('touchend', (e) => {
      if (!compactHeroQuery.matches || e.changedTouches.length !== 1) return;
      const deltaX = e.changedTouches[0].clientX - heroTouchStartX;
      const deltaY = e.changedTouches[0].clientY - heroTouchStartY;
      if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

      suppressHeroClickUntil = Date.now() + 400;
      setActiveHeroSlide(activeHeroIndex + (deltaX < 0 ? 1 : -1));
      resetHeroAutoplay();
    }, { passive: true });

    if (heroPrevBtn) {
      heroPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveHeroSlide(activeHeroIndex - 1);
        resetHeroAutoplay();
      });
    }

    if (heroNextBtn) {
      heroNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveHeroSlide(activeHeroIndex + 1);
        resetHeroAutoplay();
      });
    }
  }


  // HOW WE WORK — wave timeline (ojix.vercel.app #process style)
  (function initProcessWave() {
    const wave = document.getElementById('process-wave');
    const svg = document.getElementById('process-wave-svg');
    if (!wave || !svg) return;
    const steps = [...wave.querySelectorAll('.process-step')];
    const NS = 'http://www.w3.org/2000/svg';
    const ORANGE = '#C84B15';
    const NAVY = '#0f1c2f';
    const R = 66;
    const HALF = 59.8; // half chord where arc meets the connector
    const DY = Math.sqrt(R * R - HALF * HALF);
    let active = 0;
    let timer = null;

    function centers() {
      const box = wave.getBoundingClientRect();
      return steps.map((s) => {
        const n = s.querySelector('.process-node').getBoundingClientRect();
        return { x: n.left - box.left + n.width / 2, y: n.top - box.top + n.height / 2 };
      });
    }

    function draw() {
      if (window.matchMedia('(max-width: 900px)').matches) return;
      [...svg.querySelectorAll('path, circle')].forEach((el) => el.remove());
      const c = centers();
      const ends = c.map((p, i) => {
        const down = i % 2 === 0; // even steps: arc below; odd: arc above
        const y = down ? p.y + DY : p.y - DY;
        return { l: { x: p.x - HALF, y }, r: { x: p.x + HALF, y }, down };
      });
      const mk = (d, color, width, glow) => {
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', width);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('fill', 'none');
        if (width === 3) path.setAttribute('stroke-dasharray', '6 6');
        if (glow) path.setAttribute('filter', 'url(#wave-orange-glow)');
        svg.appendChild(path);
        return path;
      };
      for (let i = 0; i < c.length - 1; i++) {
        const d = `M ${ends[i].r.x} ${ends[i].r.y} L ${ends[i + 1].l.x} ${ends[i + 1].l.y}`;
        const lit = i < active + 1 && i <= active;
        mk(d, lit ? ORANGE : NAVY, 3, lit);
        if (i === active) {
          const dot = document.createElementNS(NS, 'circle');
          dot.setAttribute('r', '4');
          dot.setAttribute('fill', ORANGE);
          dot.setAttribute('filter', `drop-shadow(0 0 5px ${ORANGE})`);
          const anim = document.createElementNS(NS, 'animateMotion');
          anim.setAttribute('path', d);
          anim.setAttribute('dur', '1.6s');
          anim.setAttribute('repeatCount', 'indefinite');
          dot.appendChild(anim);
          svg.appendChild(dot);
        }
      }
      ends.forEach((e, i) => {
        const sweep = e.down ? 0 : 1;
        const lit = i <= active;
        mk(`M ${e.l.x} ${e.l.y} A ${R} ${R} 0 0 ${sweep} ${e.r.x} ${e.r.y}`, lit ? ORANGE : NAVY, 11, i === active);
      });
    }

    function setActive(i) {
      active = i;
      steps.forEach((s, k) => {
        s.classList.toggle('is-active', k === i);
        s.classList.toggle('is-done', k < i);
      });
      draw();
    }

    function start() {
      if (prefersReducedMotion) return;
      stop();
      timer = setInterval(() => setActive((active + 1) % steps.length), 3200);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    steps.forEach((s, i) => {
      s.addEventListener('mouseenter', () => { stop(); setActive(i); });
      s.addEventListener('focus', () => { stop(); setActive(i); });
      s.addEventListener('click', () => { stop(); setActive(i); });
    });
    wave.addEventListener('mouseleave', start);

    __on(window, 'resize', draw, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    setActive(0);
    setTimeout(draw, 400);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => en.forEach((x) => (x.isIntersecting ? (draw(), start()) : stop())), { threshold: 0.25 }).observe(wave);
    } else start();
  })();

  // ============================================================================
  // 16. OJIX DUAL-DEVICE SHOWCASE AUTO-CROSSFADE CAROUSEL (OPTION B MOCKUPS)
  // ============================================================================
  (function initDeviceShowcaseCarousel() {
    const showcases = document.querySelectorAll('.ojix-device-showcase');
    if (!showcases.length) return;

    showcases.forEach((showcase) => {
      const desktopSlides = showcase.querySelectorAll('.ds-slide');
      const phoneSlides = showcase.querySelectorAll('.phone-slide');
      const dots = showcase.querySelectorAll('.ds-dot');
      const capsuleText = showcase.querySelector('.ds-capsule-badge .capsule-text');
      const totalSlides = desktopSlides.length;
      if (totalSlides === 0) return;

      let currentIndex = 0;
      let timer = null;
      const INTERVAL_MS = 4000;

      function goToSlide(index) {
        currentIndex = (index + totalSlides) % totalSlides;

        // Update Desktop Slides
        desktopSlides.forEach((slide, idx) => {
          slide.classList.toggle('is-active', idx === currentIndex);
        });

        // Update Phone Slides
        phoneSlides.forEach((slide, idx) => {
          slide.classList.toggle('is-active', idx === currentIndex);
        });

        // Update Dots
        dots.forEach((dot, idx) => {
          dot.classList.toggle('is-active', idx === currentIndex);
        });

        // Update Floating Capsule Badge Text
        if (capsuleText && desktopSlides[currentIndex]) {
          const badgeLabel = desktopSlides[currentIndex].getAttribute('data-badge-text');
          if (badgeLabel) {
            capsuleText.textContent = badgeLabel;
          }
        }
      }

      function startTimer() {
        stopTimer();
        timer = setInterval(() => {
          goToSlide(currentIndex + 1);
        }, INTERVAL_MS);
      }

      function stopTimer() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      // Dot click listeners
      dots.forEach((dot, idx) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          goToSlide(idx);
          startTimer();
        });
      });

      // Pause on hover
      showcase.addEventListener('mouseenter', stopTimer);
      showcase.addEventListener('mouseleave', startTimer);

      // Initial slide
      goToSlide(0);
      startTimer();
    });
  })();

  /**
   * Portfolio Card Image Lightbox Modal Controller
   * Expands high-resolution UI screen mockups with backdrop blur and keyboard navigation
   */
  (function initPortfolioLightbox() {
    const modal = document.getElementById('portfolio-lightbox-modal');
    if (!modal) return;

    const modalImg = modal.querySelector('#portfolio-lightbox-img');
    const modalTitle = modal.querySelector('#portfolio-lightbox-title');
    const modalBadge = modal.querySelector('#portfolio-lightbox-badge');
    const closeBtns = modal.querySelectorAll('[data-close-portfolio-lightbox]');

    function openPortfolioModal(card) {
      if (!card) return;
      const imgEl = card.querySelector('.product-expand-img');
      const titleEl = card.querySelector('.product-title');
      const badgeEl = card.querySelector('.discipline-tag span:last-child') || card.querySelector('.platform-badge');

      if (!imgEl) return;

      // Use full-resolution local image asset path directly
      const highResSrc = imgEl.getAttribute('data-full-src') || imgEl.getAttribute('src');
      const title = (titleEl ? titleEl.textContent : 'Portfolio System Interface').trim();
      const badge = (badgeEl ? badgeEl.textContent : 'OJIX System').trim();

      if (modalImg) {
        modalImg.src = highResSrc;
        modalImg.alt = imgEl.alt || title;
      }
      if (modalTitle) modalTitle.textContent = title;
      if (modalBadge) modalBadge.textContent = badge;

      modal.removeAttribute('hidden');
      document.body.classList.add('modal-open');

      // Accessibility focus on close button
      const closeBtn = modal.querySelector('.portfolio-lightbox-close');
      if (closeBtn) closeBtn.focus();
    }

    function closePortfolioModal() {
      modal.setAttribute('hidden', '');
      document.body.classList.remove('modal-open');
      if (modalImg) modalImg.src = '';
    }

    // Bind to zoom trigger buttons and expand-bg triggers
    document.querySelectorAll('.ojix-products-grid .product-zoom-trigger').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = btn.closest('.product-card');
        openPortfolioModal(card);
      });
    });

    // Close triggers
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closePortfolioModal();
      });
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePortfolioModal();
      }
    });

    // ESC key listener
    __on(window, 'keydown', (e) => {
      if (e.key === 'Escape' && !modal.hasAttribute('hidden')) {
        closePortfolioModal();
      }
    });
  })();

  // ==========================================================================
  // INTERACTIVE TABBED FEATURE SHOWCASE HANDLER
  // ==========================================================================
  (function initShowcaseTabs() {
    function setupShowcase(container) {
      const tabList = container.querySelector('[role="tablist"]');
      if (!tabList) return;
      const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
      const panels = Array.from(container.querySelectorAll('[role="tabpanel"]'));

      function activateTab(tab, focus = false) {
        tabs.forEach((t) => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        });
        panels.forEach((p) => {
          p.classList.remove('is-active');
          p.setAttribute('hidden', '');
        });

        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        tab.removeAttribute('tabindex');

        const targetId = tab.getAttribute('aria-controls');
        const targetPanel = container.querySelector(`#${targetId}`);
        if (targetPanel) {
          targetPanel.classList.add('is-active');
          targetPanel.removeAttribute('hidden');
        }

        if (focus) {
          tab.focus();
        }
      }

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          activateTab(tab);
        });

        tab.addEventListener('keydown', (e) => {
          let newIndex = null;
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            newIndex = (index + 1) % tabs.length;
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            newIndex = (index - 1 + tabs.length) % tabs.length;
          } else if (e.key === 'Home') {
            e.preventDefault();
            newIndex = 0;
          } else if (e.key === 'End') {
            e.preventDefault();
            newIndex = tabs.length - 1;
          }

          if (newIndex !== null) {
            activateTab(tabs[newIndex], true);
          }
        });
      });
    }

    function init() {
      document.querySelectorAll('.showcase-tabs-layout').forEach(setupShowcase);
    }

    if (document.readyState === 'loading') {
      __on(document, 'DOMContentLoaded', init);
    } else {
      init();
    }
  })();

}

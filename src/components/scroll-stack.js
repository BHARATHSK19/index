/**
 * React Bits Pro: Scroll Stack Component
 * Native ESM implementation matching React Bits Pro (@reactbits-starter/scroll-stack-tw)
 * 
 * Cards pin and stack as you scroll, settling back into a dimmed deck with smooth, jitter-free motion.
 * Reference: https://pro.reactbits.dev/docs/components/scroll-stack
 */

const resolveOffset = (value, size) => {
  if (typeof value === 'number') return value;
  const text = String(value).trim();
  if (text.endsWith('%')) return (parseFloat(text) / 100) * size;
  return parseFloat(text) || 0;
};

export function initScrollStack(containerElement, options = {}) {
  const container = typeof containerElement === 'string'
    ? document.querySelector(containerElement)
    : containerElement;

  if (!container) return null;

  const inner = container.querySelector('.scroll-stack__inner') || container;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Extract config from data attributes or options
  const isMobile = window.innerWidth <= 768;
  const config = {
    itemDistance: parseFloat(container.dataset.itemDistance || options.itemDistance || (isMobile ? 80 : 120)),
    itemStackDistance: parseFloat(container.dataset.itemStackDistance || options.itemStackDistance || (isMobile ? 18 : 28)),
    stackPosition: container.dataset.stackPosition || options.stackPosition || (isMobile ? '72px' : '11%'),
    itemScale: parseFloat(container.dataset.itemScale || options.itemScale || (isMobile ? 0.03 : 0.045)),
    baseScale: parseFloat(container.dataset.baseScale || options.baseScale || 0.82),
    dimAmount: parseFloat(container.dataset.dimAmount || options.dimAmount || 0.22),
    blurAmount: parseFloat(container.dataset.blurAmount || options.blurAmount || (isMobile ? 0 : 0.8)),
    tiltAmount: parseFloat(container.dataset.tiltAmount || options.tiltAmount || (isMobile ? 0 : 12)),
    rotationAmount: parseFloat(container.dataset.rotationAmount || options.rotationAmount || 0),
    holdDistance: parseFloat(container.dataset.holdDistance || options.holdDistance || (isMobile ? 120 : 220)),
    useWindowScroll: true,
    ...options
  };

  let endElement = inner.querySelector('.scroll-stack__end');
  if (!endElement) {
    endElement = document.createElement('div');
    endElement.className = 'scroll-stack__end';
    endElement.setAttribute('aria-hidden', 'true');
    inner.appendChild(endElement);
  }

  // Get active (unfiltered) slots
  const getActiveSlots = () => {
    return Array.from(inner.querySelectorAll('[data-stack-slot]')).filter((slot) => {
      const card = slot.querySelector('.scroll-stack-card') || slot.firstElementChild;
      return card && !card.classList.contains('is-filtered-out') && slot.style.display !== 'none';
    });
  };

  // Ensure shade element on cards
  inner.querySelectorAll('.scroll-stack-card').forEach((card) => {
    if (!card.querySelector('.scroll-stack-card__shade')) {
      const shade = document.createElement('span');
      shade.className = 'scroll-stack-card__shade';
      shade.setAttribute('aria-hidden', 'true');
      card.appendChild(shade);
    }
  });

  // Re-index slots based on visibility and category filters
  function layoutSlots() {
    const allSlots = Array.from(inner.querySelectorAll('[data-stack-slot]'));
    const isMobileNow = window.innerWidth <= 768;
    const offset = isMobileNow ? 18 : config.itemStackDistance;
    const distance = isMobileNow ? 80 : config.itemDistance;
    const stackPos = isMobileNow ? '72px' : config.stackPosition;

    // Filter slots based on card .is-filtered-out
    const visibleSlots = [];
    allSlots.forEach((slot) => {
      const card = slot.querySelector('.scroll-stack-card') || slot.firstElementChild;
      const isFiltered = card && card.classList.contains('is-filtered-out');
      if (isFiltered) {
        slot.style.display = 'none';
      } else {
        slot.style.display = 'block';
        visibleSlots.push(slot);
      }
    });

    const total = visibleSlots.length;
    visibleSlots.forEach((slot, index) => {
      const topStr = typeof stackPos === 'number' ? `${stackPos}px` : stackPos;
      slot.style.top = `calc(${topStr} + ${index * offset}px)`;
      slot.style.marginBottom = `${(total - 1 - index) * offset}px`;
      slot.style.zIndex = `${index + 1}`;

      // Adjust preceding spacer if present
      const prev = slot.previousElementSibling;
      if (prev && prev.classList.contains('scroll-stack__spacer')) {
        if (index > 0) {
          const gap = distance - (total - index) * offset;
          prev.style.display = 'block';
          prev.style.height = `${Math.max(0, gap)}px`;
          prev.style.marginTop = `${Math.min(0, gap)}px`;
        } else {
          prev.style.display = 'none';
        }
      }
    });

    if (endElement) {
      endElement.style.height = `${config.holdDistance}px`;
    }
  }

  let rafId = 0;
  function scheduleUpdate() {
    if (!rafId) {
      rafId = requestAnimationFrame(updateStack);
    }
  }

  function updateStack() {
    rafId = 0;
    const slots = getActiveSlots();
    if (!slots.length) return;

    if (isReducedMotion.matches) {
      slots.forEach((slot) => {
        const card = slot.querySelector('.scroll-stack-card') || slot.firstElementChild;
        if (card) {
          card.style.transform = '';
          card.style.filter = '';
          card.style.setProperty('--scroll-stack-dim', '0');
        }
      });
      return;
    }

    const viewHeight = window.innerHeight;
    const viewTop = 0;
    const stackTop = resolveOffset(config.stackPosition, viewHeight);
    const isMobileNow = window.innerWidth <= 768;
    const offset = isMobileNow ? 18 : config.itemStackDistance;
    const tilt = isMobileNow ? 0 : config.tiltAmount;
    const itemScale = isMobileNow ? 0.03 : config.itemScale;
    const blurAmount = isMobileNow ? 0 : config.blurAmount;

    const heights = slots.map((slot) => slot.offsetHeight);
    const tops = slots.map((slot) => slot.getBoundingClientRect().top);

    // Calculate depths
    const depths = slots.map(() => 0);
    let lastCover = 0;
    for (let j = 1; j < slots.length; j++) {
      const pinBefore = viewTop + stackTop + (j - 1) * offset;
      const start = pinBefore + heights[j - 1];
      const span = Math.max(1, start - pinBefore - offset);
      const cover = Math.min(1, Math.max(0, (start - tops[j]) / span));
      for (let i = 0; i < j; i++) {
        depths[i] += cover;
      }
      lastCover = cover;
    }

    const dimStep = Math.min(Math.max(config.dimAmount, 0), 1);

    slots.forEach((slot, i) => {
      const card = slot.querySelector('.scroll-stack-card') || slot.firstElementChild;
      if (!card) return;

      const depth = depths[i];
      const lean = Math.min(depth, 1);
      const scale = Math.max(Math.min(config.baseScale, 1), 1 - depth * itemScale);
      const cardTilt = -lean * tilt;
      const turn = lean * config.rotationAmount * (i % 2 ? -1 : 1);
      const blur = depth * blurAmount;
      const dim = 1 - Math.pow(1 - dimStep, depth);

      const transform = depth < 0.0005
        ? ''
        : `perspective(1200px) rotateX(${cardTilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;

      card.style.transform = transform;
      card.style.filter = blur > 0.02 ? `blur(${blur.toFixed(2)}px)` : '';
      card.style.setProperty('--scroll-stack-dim', dim.toFixed(3));
    });

    if (slots.length > 1 && lastCover >= 0.999 && typeof config.onStackComplete === 'function') {
      config.onStackComplete();
    }
  }

  // Event handlers
  const onScroll = () => {
    scheduleUpdate();
  };

  const onResize = () => {
    layoutSlots();
    scheduleUpdate();
  };

  const onRefresh = () => {
    layoutSlots();
    setTimeout(scheduleUpdate, 30);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scrollstack:refresh', onRefresh);

  let resizeObserver = null;
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      layoutSlots();
      scheduleUpdate();
    });
    resizeObserver.observe(inner);
  }

  // Initial layout
  layoutSlots();
  scheduleUpdate();

  return {
    refresh: onRefresh,
    destroy: () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scrollstack:refresh', onRefresh);
      resizeObserver?.disconnect();
    }
  };
}

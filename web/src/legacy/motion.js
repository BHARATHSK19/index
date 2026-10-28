/* Ported from /motion.js for the React app (tools/react-port/port_legacy.py + manual fixes).
 * Runs once per page mount; ctx tears down listeners, timers and observers on unmount. */
/* eslint-disable */
export default function init(__ctx) {
  const { on: __on, setTimeout, setInterval, requestAnimationFrame, IntersectionObserver,
    ResizeObserver, MutationObserver, navigate: __navigate } = __ctx;
  /* arriving from a product-open transition: keep the hero name still (v1.2.0) */
  (function () {
    try {
      if (sessionStorage.getItem('ojx-from-products') === '1') {
        document.documentElement.setAttribute('data-from-px', '1');
        sessionStorage.removeItem('ojx-from-products');
      }
    } catch (e) {}
  })();
  /* OJIX — intro loader (v1.1.0). Loaded right after the .ojx-intro markup, not deferred,
     so a repeat visit hides the intro before first paint. Shows once per browser session. */
  (function () {
    var intro = document.getElementById('ojx-intro');
    if (!intro) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false;
    try { seen = sessionStorage.getItem('ojx-intro-seen') === '1'; } catch (e) {}

    function remove() { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); intro = null; }

    var forceIntro = window.location.search && window.location.search.indexOf('intro') !== -1;
    if (!forceIntro && (seen || reduce)) { intro.classList.add('is-skipped'); remove(); return; }
    try { sessionStorage.setItem('ojx-intro-seen', '1'); } catch (e) {}

    var count = intro.querySelector('.ojx-intro__count');
    var DURATION = 2600, DELAY = 200, GLYPHS = '0123456789#%/_';
    var start = null, finished = false;

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    function frame(now) {
      if (!intro) return;
      if (start === null) start = now + DELAY;
      var t = Math.min(1, Math.max(0, (now - start) / DURATION));
      var n = Math.round(ease(t) * 100);
      var txt = String(n);
      // brief decode flicker on the last digit while counting
      if (t > 0 && t < 1 && Math.random() < 0.35) {
        txt = txt.slice(0, -1) + GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
      }
      if (count) count.textContent = txt + '%';
      if (t < 1) requestAnimationFrame(frame); else finish(250);
    }

    function finish(wait) {
      if (finished) return;
      finished = true;
      if (count) count.textContent = '100%';
      setTimeout(function () {
        if (!intro) return;
        intro.classList.add('is-done');
        setTimeout(remove, 650);
      }, wait);
    }

    intro.addEventListener('click', function () { finish(0); });
    requestAnimationFrame(frame);
  })();
}

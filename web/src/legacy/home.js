/* Ported from /home.js for the React app (tools/react-port/port_legacy.py + manual fixes).
 * Runs once per page mount; ctx tears down listeners, timers and observers on unmount. */
/* eslint-disable */
export default function init(__ctx) {
  const { on: __on, setTimeout, setInterval, requestAnimationFrame, IntersectionObserver,
    ResizeObserver, MutationObserver, navigate: __navigate } = __ctx;
  /* OJIX — homepage "DXM" interactions (v1.0.0): scroll reveals, word-by-word statement,
     count-up stats, chapter card stacks, services list + card, hand-drawn arrows. */
  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasIO = 'IntersectionObserver' in window;

    function onView(els, cb, opts) {
      if (!els.length) return;
      if (!hasIO || reduce) { els.forEach(cb); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); } });
      }, opts || { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el) { io.observe(el); });
    }

    function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

    // 1. reveals + chapter stacks
    onView(all('.dx-reveal, .dx-chapter, .dx-stats, .dx-services, .dx-intro__card'), function (el) { el.classList.add('is-in'); });

    // 2. arrows draw when seen
    onView(all('.dx-arrow'), function (el) { el.classList.add('is-drawn'); }, { threshold: 0.6 });

    // 3. count-up stats
    function fmt(n) { return n.toLocaleString('en-IN'); }
    onView(all('[data-dx-count]'), function (el) {
      var target = parseInt(el.getAttribute('data-dx-count'), 10) || 0;
      if (reduce) { el.textContent = fmt(target); return; }
      var t0 = null, D = 1600;
      function step(now) {
        if (t0 === null) t0 = now;
        var t = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - t, 4);
        el.textContent = fmt(Math.round(target * e));
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, { threshold: 0.5 });

    // 4. statement: words light up as the card scrolls through the viewport
    var words = all('[data-dx-words] .dx-word');
    if (words.length) {
      var card = words[0].closest('.dx-intro__card');
      var lit = function () {
        if (reduce) { words.forEach(function (w) { w.classList.add('is-lit'); }); return; }
        var r = card.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (r.height * 0.9);           // 0 → 1 while it crosses the screen
        var n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
        words.forEach(function (w, i) { w.classList.toggle('is-lit', i < n); });
      };
      var ticking = false;
      __on(window, 'scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () { ticking = false; lit(); });
      }, { passive: true });
      __on(window, 'resize', lit);
      lit();
    }

    // 5. services list drives the detail card
    var svcs = all('.dx-svc');
    var box = document.querySelector('.dx-services__card');
    if (svcs.length && box) {
      var kick = box.querySelector('.dx-services__card-kicker');
      var text = box.querySelector('.dx-services__card-text');
      var tags = box.querySelector('.dx-services__card-tags');
      var arrow = box.querySelector('.dx-arrow');
      var select = function (btn) {
        if (btn.classList.contains('is-active')) return;
        svcs.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        kick.textContent = btn.querySelector('.dx-svc__name').textContent;
        text.textContent = btn.getAttribute('data-desc');
        tags.innerHTML = '';
        btn.getAttribute('data-tags').split('|').forEach(function (t) {
          var li = document.createElement('li'); li.textContent = t; tags.appendChild(li);
        });
        box.classList.remove('is-swap'); void box.offsetWidth; box.classList.add('is-swap');
        if (arrow && !reduce) { arrow.classList.remove('is-drawn'); void arrow.getBoundingClientRect(); arrow.classList.add('is-drawn'); }
      };
      svcs.forEach(function (b) {
        b.addEventListener('mouseenter', function () { select(b); });
        b.addEventListener('focus', function () { select(b); });
        b.addEventListener('click', function () { select(b); });
      });
    }
  })();
}

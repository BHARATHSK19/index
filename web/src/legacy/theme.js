/* Ported from /theme.js for the React app (tools/react-port/port_legacy.py + manual fixes).
 * Runs once per page mount; ctx tears down listeners, timers and observers on unmount. */
/* eslint-disable */
export default function init(__ctx) {
  const { on: __on, setTimeout, setInterval, requestAnimationFrame, IntersectionObserver,
    ResizeObserver, MutationObserver, navigate: __navigate } = __ctx;
  /**
   * OJIX — light / dark theme switch (v1.0.0)
   * The inline <head> script sets data-theme before paint; this file wires the toggle button,
   * swaps the header logo, and defaults to dark mode until the visitor picks one.
   */
  (function () {
    'use strict';
    var KEY = 'ojix_theme';
    var root = document.documentElement;

    function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function save(t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

    function swapLogos(theme) {
      document.querySelectorAll('img[src*="ojix-primary-transparent-on"]').forEach(function (img) {
        var src = img.getAttribute('src');
        var next = theme === 'dark' ? src.replace('-onlight.svg', '-ondark.svg') : src.replace('-ondark.svg', '-onlight.svg');
        if (next !== src && !img.closest('.site-footer, footer')) img.setAttribute('src', next);
      });
      var imgs = document.querySelectorAll('img[src*="ojix-navbar-logo"]');
      imgs.forEach(function (img) {
        var src = img.getAttribute('src');
        var next = theme === 'dark'
          ? src.replace(/ojix-navbar-logo(-dark)?\.svg/, 'ojix-navbar-logo-dark.svg')
          : src.replace(/ojix-navbar-logo-dark\.svg/, 'ojix-navbar-logo.svg');
        if (next !== src) img.setAttribute('src', next);
      });
    }

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B1626' : '#FFFFFF');
      swapLogos(theme);
      document.querySelectorAll('.theme-toggle-btn').forEach(function (b) {
        b.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        b.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        b.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
      });
    }

    function init() {
      apply(current());
      __on(document, 'click', function (e) {
        var btn = e.target.closest && e.target.closest('.theme-toggle-btn');
        if (!btn) return;
        e.preventDefault();
        var next = current() === 'dark' ? 'light' : 'dark';
        save(next);
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Circular reveal growing out of the toggle (View Transitions API: Chrome, Edge, Safari 18+).
        if (document.startViewTransition && !reduce) {
          var r = btn.getBoundingClientRect();
          var x = r.left + r.width / 2, y = r.top + r.height / 2;
          var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
          var vt = document.startViewTransition(function () { apply(next); });
          vt.ready.then(function () {
            root.animate(
              { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + end + 'px at ' + x + 'px ' + y + 'px)'] },
              { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' }
            );
          }).catch(function () {});
          return;
        }

        // Fallback (Firefox, reduced motion): quick colour cross-fade.
        if (!reduce) root.classList.add('ojx-theme-anim');
        apply(next);
        setTimeout(function () { root.classList.remove('ojx-theme-anim'); }, 450);
      });
    }

    if (document.readyState === 'loading') __on(document, 'DOMContentLoaded', init);
    else init();
  })();
}

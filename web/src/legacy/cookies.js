/* Ported from /cookies.js for the React app (tools/react-port/port_legacy.py + manual fixes).
 * Runs once per page mount; ctx tears down listeners, timers and observers on unmount. */
/* eslint-disable */
export default function init(__ctx) {
  const { on: __on, setTimeout, setInterval, requestAnimationFrame, IntersectionObserver,
    ResizeObserver, MutationObserver, navigate: __navigate } = __ctx;
  /**
   * OJIX — Cookie consent + newsletter popup (v2.0.0)
   * One controller for every page. Renders its own markup, so pages only need:
   *   <script src="/cookies.js?v=2.0.0" defer></script>
   * Flow: consent banner (first visit) -> choice saved -> newsletter popup (until subscribed / dismissed).
   * Consent is stored in the same key the analytics code reads (ojix_dpdp_cookie_consent).
   */
  (function () {
    'use strict';

    var CONSENT_KEY = 'ojix_dpdp_cookie_consent';
    var LEGACY_CONSENT_KEY = 'ojix_cookie_consent';
    var NEWS_KEYS = ['ojix_newsletter_dismissed', 'ojix_newsletter_popup_dismissed'];
    var COOKIE_URL = '/cookies';

    if (/^\/admin/.test(location.pathname)) return;

    function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    function hasConsent() { return !!(get(CONSENT_KEY) || get(LEGACY_CONSENT_KEY)); }
    function newsDone() { return NEWS_KEYS.some(function (k) { return !!get(k); }); }
    function markNewsDone() { NEWS_KEYS.forEach(function (k) { set(k, 'true'); }); }

    function beacon(url, data) {
      try {
        var body = JSON.stringify(data);
        if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
        else fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
      } catch (e) {}
    }

    var ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
    var CLOSE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

    function el(html) {
      var d = document.createElement('div');
      d.innerHTML = html.trim();
      return d.firstChild;
    }

    function show(node) {
      document.body.appendChild(node);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          node.classList.add('is-visible');
          node.setAttribute('aria-hidden', 'false');
        });
      });
    }

    function hide(node) {
      node.classList.remove('is-visible');
      node.setAttribute('aria-hidden', 'true');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 500);
    }

    /* ---------------- Cookie banner ---------------- */
    function cookieBanner() {
      var node = el(
        '<section class="ojx-consent" role="dialog" aria-labelledby="ojx-consent-title" aria-describedby="ojx-consent-text" aria-hidden="true">' +
          '<p class="ojx-consent__eyebrow"><span class="ojx-consent__dot" aria-hidden="true"></span>Cookies</p>' +
          '<h2 class="ojx-consent__title" id="ojx-consent-title">Your data stays yours.</h2>' +
          '<p class="ojx-consent__text" id="ojx-consent-text">We use essential cookies to run this site. With your permission we also use privacy-friendly, first-party analytics — never sold, never used for ads.</p>' +
          '<p class="ojx-consent__links">' +
            '<a href="' + COOKIE_URL + '">Cookie Policy</a>' +
            '<span aria-hidden="true">·</span>' +
            '<a href="' + COOKIE_URL + '#choices">Manage</a>' +
          '</p>' +
          '<div class="ojx-consent__actions">' +
            '<button type="button" class="ojx-consent__btn" data-choice="declined">Decline</button>' +
            '<button type="button" class="ojx-consent__btn ojx-consent__btn--solid" data-choice="accepted">Accept <span class="ojx-consent__arrow">' + ARROW + '</span></button>' +
          '</div>' +
        '</section>'
      );

      node.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-choice]');
        if (!btn) return;
        var accepted = btn.getAttribute('data-choice') === 'accepted';
        var record = JSON.stringify({
          necessary: true,
          analytics: accepted,
          choice: accepted ? 'accepted' : 'declined',
          timestamp: new Date().toISOString(),
          jurisdiction: 'DPDP_ACT_2023_AND_RULES_2025_INDIA',
          version: '3.1'
        });
        set(CONSENT_KEY, record);
        set(LEGACY_CONSENT_KEY, record);
        beacon('/api/consent', { choice: accepted ? 'accepted' : 'declined', path: location.pathname });
        if (accepted) beacon('/api/track', { path: location.pathname, ref: document.referrer ? document.referrer.slice(0, 200) : '' });
        hide(node);
        if (!newsDone()) setTimeout(newsletterPopup, 650);
      });

      show(node);
    }

    /* ---------------- Newsletter popup ---------------- */
    function newsletterPopup() {
      if (newsDone() || document.querySelector('.ojx-newsbox')) return;
      var node = el(
        '<section class="ojx-newsbox" role="dialog" aria-labelledby="ojx-newsbox-title" aria-describedby="ojx-newsbox-text" aria-hidden="true">' +
          '<button type="button" class="ojx-newsbox__close" aria-label="Close newsletter">' + CLOSE + '</button>' +
          '<p class="ojx-news__kicker"><b>—</b> Newsletter</p>' +
          '<h2 class="ojx-newsbox__title" id="ojx-newsbox-title">Notes from <span>OJIX.</span></h2>' +
          '<p class="ojx-newsbox__text" id="ojx-newsbox-text">One short email when we ship something worth reading. No spam. Unsubscribe anytime.</p>' +
          '<form class="ojx-news__form ojx-newsbox__form" novalidate>' +
            '<label class="ojx-news__label" for="ojx-newsbox-email">Your email</label>' +
            '<div class="ojx-news__row">' +
              '<input type="email" id="ojx-newsbox-email" placeholder="you@company.com" required autocomplete="email" inputmode="email" />' +
              '<button type="submit" class="ojx-newsbox__go">Subscribe <span aria-hidden="true">→</span></button>' +
            '</div>' +
            '<input type="text" name="_hp_check" class="ojx-news__hp" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
            '<p class="ojx-news__note">By subscribing you agree to receive emails from OJIX. Read our <a href="' + COOKIE_URL + '">cookie &amp; privacy policy</a>.</p>' +
            '<p class="ojx-news__status ojx-newsbox__status" role="status" aria-live="polite"></p>' +
          '</form>' +
        '</section>'
      );

      var form = node.querySelector('form');
      var input = node.querySelector('#ojx-newsbox-email');
      var hp = node.querySelector('[name="_hp_check"]');
      var go = node.querySelector('.ojx-newsbox__go');
      var status = node.querySelector('.ojx-newsbox__status');

      function say(msg, ok) {
        status.textContent = msg;
        status.classList.toggle('is-ok', !!ok);
        status.classList.toggle('is-error', !ok);
      }

      node.querySelector('.ojx-newsbox__close').addEventListener('click', function () {
        markNewsDone();
        hide(node);
      });

      __on(document, 'keydown', function esc(e) {
        if (e.key === 'Escape' && node.parentNode) { markNewsDone(); hide(node); document.removeEventListener('keydown', esc); }
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = (input.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          say('Please enter a valid email address.', false);
          input.focus();
          return;
        }
        go.disabled = true;
        node.classList.add('is-busy');
        say('Subscribing…', true);
        fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, _hp_check: hp.value })
        })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
          .then(function (res) {
            node.classList.remove('is-busy');
            if (res.ok && res.d.success) {
              say(res.d.message || 'You’re subscribed. Thank you.', true);
              markNewsDone();
              form.reset();
              setTimeout(function () { hide(node); }, 2400);
            } else {
              say(res.d.error || 'Something went wrong. Please try again.', false);
              go.disabled = false;
            }
          })
          .catch(function () {
            node.classList.remove('is-busy');
            say('Couldn’t reach the server. Please try again in a moment.', false);
            go.disabled = false;
          });
      });

      show(node);
    }

    function init() {
      if (!hasConsent()) setTimeout(cookieBanner, 900);
    }

    if (document.readyState === 'loading') __on(document, 'DOMContentLoaded', init);
    else init();
  })();
}

/* Ported from /extras.js for the React app (tools/react-port/port_legacy.py + manual fixes).
 * Runs once per page mount; ctx tears down listeners, timers and observers on unmount. */
/* eslint-disable */
export default function init(__ctx) {
  const { on: __on, setTimeout, setInterval, requestAnimationFrame, IntersectionObserver,
    ResizeObserver, MutationObserver, navigate: __navigate } = __ctx;
  /* OJIX — shared extras (v1.0.0): newsletter signup. Posts to /api/newsletter. */
  (function () {
    var form = document.getElementById('ojx-news-form');
    if (!form) return;
    var input = form.querySelector('input[type="email"]');
    var hp = form.querySelector('.ojx-news__hp');
    var btn = form.querySelector('button[type="submit"]');
    var status = form.querySelector('.ojx-news__status');

    function say(msg, ok) {
      status.textContent = msg;
      status.classList.toggle('is-ok', !!ok);
      status.classList.toggle('is-error', !ok);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        say('Please enter a valid email address.', false);
        input.focus();
        return;
      }
      btn.disabled = true;
      say('Subscribing…', true);
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, _hp_check: hp ? hp.value : '' })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok && res.d.success) {
            say(res.d.message || 'You’re subscribed. Check your inbox.', true);
            form.reset();
          } else {
            say(res.d.error || 'Something went wrong. Please try again.', false);
          }
        })
        .catch(function () { say('Couldn’t reach the server. Please try again in a moment.', false); })
        .then(function () { btn.disabled = false; });
    });
  })();

  /* OJIX — first-party analytics (v1.1.0)
     · Page views are sent ONLY when the visitor has accepted analytics cookies.
     · Accept / Decline choices are recorded so the admin can see consent rates.
     · Everything goes to our own server (/api/track, /api/consent); nothing third-party. */
  (function () {
    var KEY = 'ojix_dpdp_cookie_consent';
    var path = location.pathname || '/';
    if (/^\/admin/.test(path)) return;

    function beacon(url, data) {
      try {
        var body = JSON.stringify(data);
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
        } else {
          fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
        }
      } catch (e) {}
    }

    function allowed() {
      try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); return !!(c && c.analytics); } catch (e) { return false; }
    }

    var sent = false;
    function track() {
      if (sent || !allowed()) return;
      sent = true;
      beacon('/api/track', { path: path, ref: document.referrer ? document.referrer.slice(0, 200) : '' });
    }

    function on(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
    on('cookie-accept', function () { beacon('/api/consent', { choice: 'accepted', path: path }); setTimeout(track, 50); });
    on('cookie-reject', function () { beacon('/api/consent', { choice: 'declined', path: path }); });
    ['save-cookie-preferences', 'cookie-save-prefs'].forEach(function (id) {
      on(id, function () {
        setTimeout(function () {
          beacon('/api/consent', { choice: allowed() ? 'custom-on' : 'custom-off', path: path });
          track();
        }, 50);
      });
    });

    track();
  })();

  /* OJIX — header hide/show on scroll (v1.2.0) */
  (function () {
    var h = document.querySelector('.site-header');
    if (!h) return;
    var last = window.scrollY, ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      var busy = document.body.classList.contains('nav-open') || document.body.classList.contains('ojx-pm-open') ||
                 h.querySelector('.is-mega-open') || h.matches(':focus-within');
      if (busy || y < 120) { h.classList.remove('ojx-hide'); }
      else if (y > last + 6) { h.classList.add('ojx-hide'); }
      else if (y < last - 6) { h.classList.remove('ojx-hide'); }
      h.classList.toggle('ojx-float', y > 120 && !h.classList.contains('ojx-hide'));
      last = y;
    }
    __on(window, 'scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  })();

  /* OJIX — "Discuss a project" pop-up (v1.2.0). Posts to /api/project. */
  (function () {
    var triggers = document.querySelectorAll('a.nav-cta, [data-discuss], a[href="/contact"], a[href$="#contact"], a[href$="#contact-advisory"]');
    if (!triggers.length) return;
    var PRODUCTS = ['Not sure yet', 'OJIX OS — office, HR & accounts', 'Nyaya Sethu — law firms', 'ProcureOS — purchasing & stock',
      'AI proctX — schools & colleges', 'BuildOS — construction', 'TravelOS — travel agencies', 'FitOS — gyms & fitness',
      'DPDP Privacy Vault', 'Custom software', 'Website / web app', 'AI automation'];
    var modal = null, lastFocus = null;

    function build() {
      var opts = PRODUCTS.map(function (p) { return '<option>' + p + '</option>'; }).join('');
      modal = document.createElement('div');
      modal.className = 'ojx-pm';
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML =
        '<div class="ojx-pm__scrim" data-pm-close></div>' +
        '<div class="ojx-pm__sheet" role="dialog" aria-modal="true" aria-labelledby="ojx-pm-title">' +
          '<span class="ojx-pm__grab" aria-hidden="true"></span>' +
          '<button type="button" class="ojx-pm__close" data-pm-close aria-label="Close">×</button>' +
          '<form class="ojx-pm__form" novalidate>' +
            '<p class="ojx-pm__k">Discuss a project</p>' +
            '<h2 class="ojx-pm__title" id="ojx-pm-title">Tell us what <span>you need.</span></h2>' +
            '<p class="ojx-pm__sub">A few details and our team will get back to you—usually within one working day.</p>' +
            '<div class="ojx-pm__grid">' +
              '<label class="ojx-pm__f"><span>Name</span><input name="name" autocomplete="name" required maxlength="100" placeholder="Full name"></label>' +
              '<label class="ojx-pm__f"><span>Email</span><input name="email" type="email" autocomplete="email" inputmode="email" required placeholder="you@company.com"></label>' +
              '<label class="ojx-pm__f"><span>Phone <i>(optional)</i></span><input name="phone" type="tel" autocomplete="tel" maxlength="30" placeholder="+91"></label>' +
              '<label class="ojx-pm__f"><span>Company <i>(optional)</i></span><input name="company" autocomplete="organization" maxlength="120"></label>' +
              '<label class="ojx-pm__f ojx-pm__f--full"><span>Interested in</span><select name="interest">' + opts + '</select></label>' +
              '<label class="ojx-pm__f ojx-pm__f--full"><span>Your requirement</span><textarea name="message" maxlength="2500" placeholder="What should the system do? Who will use it?"></textarea></label>' +
            '</div>' +
            '<input type="hidden" name="mode" value="">' +
            '<input type="text" name="_hp_check" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
            '<label class="ojx-pm__consent"><input type="checkbox" name="consent"><span>I agree that OJIX may use these details to reply to my enquiry. See the <a href="/cookies">privacy &amp; cookie policy</a>.</span></label>' +
            '<button type="submit" class="ojx-pm__send">Send requirement →</button>' +
            '<p class="ojx-pm__msg" role="status" aria-live="polite"></p>' +
          '</form>' +
        '</div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target.closest('[data-pm-close]')) close(); });
      modal.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
        if (e.key === 'Tab') {
          var f = modal.querySelectorAll('button, input:not([tabindex="-1"]), select, textarea, a');
          f = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      });
      modal.querySelector('form').addEventListener('submit', submit);
    }

    function open(e) {
      if (e) e.preventDefault();
      if (modal && !modal.querySelector('form')) { modal.remove(); modal = null; }   // fresh form after a sent one
      if (!modal) build();
      var t0 = e && e.currentTarget && e.currentTarget.getAttribute ? e.currentTarget : null;
      var topic = t0 ? t0.getAttribute('data-topic') : '';
      var demo = t0 && t0.getAttribute('data-mode') === 'demo';
      var form = modal.querySelector('form');
      form.elements.namedItem('mode').value = demo ? 'demo' : '';
      modal.querySelector('.ojx-pm__k').textContent = demo ? 'Book a demo' + (topic ? ' · ' + topic : '') : 'Discuss a project';
      modal.querySelector('.ojx-pm__title').innerHTML = demo ? 'Book a <span class="is-lit">' + (topic || 'live') + ' demo.</span>' : 'Tell us what <span class="is-lit">you need.</span>';
      modal.querySelector('.ojx-pm__sub').textContent = demo
        ? 'Pick a time that suits you and we’ll walk you through it on a call—usually within one working day.'
        : 'A few details and our team will get back to you—usually within one working day.';
      modal.querySelector('.ojx-pm__send').textContent = demo ? 'Request demo →' : 'Send requirement →';
      var sel = form.elements.namedItem('interest');
      if (topic) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text.indexOf(topic) === 0) { sel.selectedIndex = i; break; }
        }
      } else { sel.selectedIndex = 0; }
      lastFocus = document.activeElement;
      // close the phone menu if it is open
      var t = document.querySelector('.menu-toggle[aria-expanded="true"]');
      if (t) t.click();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('ojx-pm-open');
      setTimeout(function () { var n = modal.querySelector('input[name="name"]'); if (n) n.focus(); }, 350);
    }

    function close() {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('ojx-pm-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function submit(e) {
      e.preventDefault();
      var form = e.target, msg = form.querySelector('.ojx-pm__msg'), btn = form.querySelector('.ojx-pm__send');
      var f = function (n) { return form.elements.namedItem(n); };
      var payload = {
        full_name: f('name').value.trim(),
        email: f('email').value.trim(),
        phone: f('phone').value.trim(),
        company: f('company').value.trim(),
        interested_in: f('interest').value,
        requirement: f('message').value.trim(),
        consent_agreed: f('consent').checked,
        _hp_check: f('_hp_check').value,
        mode: f('mode').value
      };

      if (!payload.full_name) {
        msg.textContent = 'Please enter your name.';
        f('name').focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
        msg.textContent = 'Please enter a valid email address.';
        f('email').focus();
        return;
      }
      if (!payload.consent_agreed) {
        msg.textContent = 'Please tick the consent box so we can reply.';
        return;
      }

      msg.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Sending...';

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (data) {
            data.__ok = r.ok;
            return data;
          });
        })
        .then(function (res) {
          if (!res.__ok || !res.success) {
            msg.textContent = res.error || 'Something went wrong. Please try again.';
            alert(res.error || 'Failed to submit enquiry. Please try again.');
            btn.disabled = false;
            btn.textContent = form.elements.namedItem('mode').value === 'demo' ? 'Request demo →' : 'Send requirement →';
            return;
          }

          var firstName = payload.full_name.split(' ')[0] || 'there';
          // Clear inputs
          form.reset();

          // Display clear confirmation card
          form.outerHTML =
            '<div class="ojx-pm__done" tabindex="-1">' +
              '<p class="ojx-pm__k">Received</p>' +
              '<h2 class="ojx-pm__title">Thank you, <span>' + firstName.replace(/[<>&"]/g, '') + '.</span></h2>' +
              '<p>' + (res.message || 'Enquiry submitted successfully. Our team will get in touch shortly.') + '</p>' +
              (res.id ? '<small>Lead ID #' + res.id + '</small>' : '') +
            '</div>';

          var done = modal.querySelector('.ojx-pm__done');
          if (done) done.focus();

          // Automatically close modal after user reads confirmation
          setTimeout(function () {
            close();
          }, 3000);
        })
        .catch(function () {
          msg.textContent = 'Couldn’t reach the server. Please email info@ojix.in.';
          alert('Could not reach the server. Please check your network connection.');
          btn.disabled = false;
          btn.textContent = form.elements.namedItem('mode').value === 'demo' ? 'Request demo →' : 'Send requirement →';
        });
    }

    Array.prototype.forEach.call(triggers, function (t) { t.addEventListener('click', open); });
  })();

  /* OJIX — light up headline highlights when they scroll into view (v1.3.0) */
  (function () {
    var marks = Array.prototype.slice.call(document.querySelectorAll('h1 span, h1 em, h2 span, h2 em'))
      .filter(function (el) { return !el.classList.contains('dx-word') && !el.closest('.ojx-hero'); });
    if (!marks.length) return;
    if (!('IntersectionObserver' in window)) { marks.forEach(function (m) { m.classList.add('is-lit'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-lit'); io.unobserve(e.target); } });
    }, { threshold: 0.3 });
    marks.forEach(function (m) { io.observe(m); });
    // pop-up heading is created later
    __on(document, 'click', function () {
      setTimeout(function () {
        document.querySelectorAll('.ojx-pm h2 span:not(.is-lit)').forEach(function (s) { s.classList.add('is-lit'); });
      }, 450);
    });
  })();

  /* OJIX — sequential newsletter subscription popup (v1.0.0)
     · Displays immediately after accepting or declining cookie consent.
     · Reuses the exact same dimensions, card styles, and /api/newsletter endpoint.
     · Stores dismissal/subscription state in localStorage to prevent re-triggering. */
  (function () {
    var STORAGE_KEY = 'ojix_newsletter_popup_dismissed';

    function isDismissed() {
      try {
        return !!localStorage.getItem(STORAGE_KEY);
      } catch (e) {
        return false;
      }
    }

    function setDismissed() {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {}
    }

    function createPopup() {
      if (document.getElementById('newsletter-popup')) return document.getElementById('newsletter-popup');

      var popup = document.createElement('div');
      popup.id = 'newsletter-popup';
      popup.className = 'cookie-banner ojx-cookie ojx-news-popup';
      popup.setAttribute('role', 'dialog');
      popup.setAttribute('aria-labelledby', 'newsletter-popup-title');
      popup.setAttribute('aria-describedby', 'newsletter-popup-desc');
      popup.setAttribute('aria-hidden', 'true');

      popup.innerHTML =
        '<div class="cookie-banner-inner">' +
          '<p class="ojx-cookie__title" id="newsletter-popup-title">Stay updated with OJIX.</p>' +
          '<p class="ojx-cookie__text" id="newsletter-popup-desc">' +
            'Get occasional updates on product engineering, architecture notes, and systems for modern business. No spam.' +
          '</p>' +
          '<form id="ojx-news-popup-form" novalidate>' +
            '<div class="ojx-news-popup__input-wrap">' +
              '<input type="email" id="ojx-news-popup-email" class="ojx-news-popup__input" placeholder="you@company.com" required autocomplete="email" inputmode="email" />' +
            '</div>' +
            '<input type="text" name="_hp_check" class="ojx-news__hp" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
            '<div class="ojx-cookie__actions">' +
              '<button type="button" id="ojx-news-popup-decline" class="ojx-cookie__btn">No thanks</button>' +
              '<button type="submit" id="ojx-news-popup-submit" class="ojx-cookie__btn ojx-cookie__btn--solid">Subscribe</button>' +
            '</div>' +
            '<p class="ojx-news-popup__status" id="ojx-news-popup-status" role="status" aria-live="polite"></p>' +
          '</form>' +
        '</div>';

      document.body.appendChild(popup);
      bindPopupEvents(popup);
      return popup;
    }

    function hidePopup(popup) {
      if (!popup) return;
      popup.classList.remove('is-visible');
      popup.setAttribute('aria-hidden', 'true');
    }

    function showPopup() {
      if (isDismissed()) return;
      var popup = createPopup();
      if (!popup) return;

      // Small delay for smooth transition after cookie popup hides
      setTimeout(function () {
        if (isDismissed()) return;
        popup.classList.add('is-visible');
        popup.setAttribute('aria-hidden', 'false');
        var input = popup.querySelector('#ojx-news-popup-email');
        if (input && typeof input.focus === 'function') {
          input.focus();
        }
      }, 450);
    }

    function bindPopupEvents(popup) {
      var form = popup.querySelector('#ojx-news-popup-form');
      var input = popup.querySelector('#ojx-news-popup-email');
      var hp = popup.querySelector('.ojx-news__hp');
      var submitBtn = popup.querySelector('#ojx-news-popup-submit');
      var declineBtn = popup.querySelector('#ojx-news-popup-decline');
      var status = popup.querySelector('#ojx-news-popup-status');

      function say(msg, ok) {
        if (!status) return;
        status.textContent = msg;
        status.classList.toggle('is-ok', !!ok);
        status.classList.toggle('is-error', !ok);
      }

      if (declineBtn) {
        declineBtn.addEventListener('click', function () {
          setDismissed();
          hidePopup(popup);
        });
      }

      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var email = (input && input.value ? input.value : '').trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            say('Please enter a valid email address.', false);
            if (input) input.focus();
            return;
          }

          if (submitBtn) submitBtn.disabled = true;
          say('Subscribing…', true);

          fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, _hp_check: hp ? hp.value : '' })
          })
            .then(function (r) {
              return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; });
            })
            .then(function (res) {
              if (res.ok && res.d.success) {
                say(res.d.message || 'You’re subscribed. Thank you.', true);
                setDismissed();
                if (form) form.reset();
                setTimeout(function () {
                  hidePopup(popup);
                }, 2200);
              } else {
                say(res.d.error || 'Something went wrong. Please try again.', false);
                if (submitBtn) submitBtn.disabled = false;
              }
            })
            .catch(function () {
              say('Couldn’t reach the server. Please try again in a moment.', false);
              if (submitBtn) submitBtn.disabled = false;
            });
        });
      }
    }

    // Hook into cookie banner events
    function initSequenceTrigger() {
      if (isDismissed()) return;

      var cookieAcceptBtn = document.getElementById('cookie-accept');
      var cookieRejectBtn = document.getElementById('cookie-reject');

      if (cookieAcceptBtn) {
        cookieAcceptBtn.addEventListener('click', function () {
          showPopup();
        });
      }

      if (cookieRejectBtn) {
        cookieRejectBtn.addEventListener('click', function () {
          showPopup();
        });
      }
    }

    if (document.readyState === 'loading') {
      __on(document, 'DOMContentLoaded', initSequenceTrigger);
    } else {
      initSequenceTrigger();
    }
  })();

}

/* OJIX — admin (v1.0.0): password → emailed code → dashboard. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var auth = $('#ad-auth'), app = $('#ad-app');
  var loginForm = $('#ad-login'), codeForm = $('#ad-code');
  var challenge = null;

  function msg(form, text, isError) {
    var el = $('.ad-msg', form);
    el.textContent = text || '';
    el.classList.toggle('is-error', !!isError);
  }

  function post(url, body) {
    return fetch(url, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { d.__ok = r.ok; return d; }); });
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function when(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function rows(tbody, list, render, cols) {
    tbody.innerHTML = list.length
      ? list.map(render).join('')
      : '<tr class="ad-empty"><td colspan="' + cols + '">Nothing yet.</td></tr>';
  }

  function browser(ua) {
    ua = ua || '';
    var b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other';
    var os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
    return b + (os ? ' · ' + os : '');
  }

  function showApp() { auth.hidden = true; app.hidden = false; load(); }
  function showAuth() {
    app.hidden = true; auth.hidden = false;
    codeForm.hidden = true; loginForm.hidden = false;
    loginForm.reset(); codeForm.reset(); msg(loginForm, ''); msg(codeForm, '');
  }

  // ---------- sign in ----------
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('button', loginForm); btn.disabled = true; msg(loginForm, 'Checking…');
    post('/api/admin/login', { username: $('#ad-user').value.trim(), password: $('#ad-pass').value })
      .then(function (d) {
        if (!d.__ok || !d.success) return msg(loginForm, d.error || 'Could not sign in.', true);
        challenge = d.challenge;
        $('[data-sent-to]').textContent = d.sentTo || 'the admin email';
        loginForm.hidden = true; codeForm.hidden = false; msg(codeForm, '');
        $('#ad-otp').focus();
      })
      .catch(function () { msg(loginForm, 'Could not reach the server.', true); })
      .then(function () { btn.disabled = false; });
  });

  codeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = $('button[type="submit"]', codeForm); btn.disabled = true; msg(codeForm, 'Verifying…');
    post('/api/admin/verify', { challenge: challenge, code: $('#ad-otp').value.trim() })
      .then(function (d) {
        if (!d.__ok || !d.success) return msg(codeForm, d.error || 'That code is not right.', true);
        showApp();
      })
      .catch(function () { msg(codeForm, 'Could not reach the server.', true); })
      .then(function () { btn.disabled = false; });
  });

  $('[data-restart]').addEventListener('click', showAuth);
  $('#ad-logout').addEventListener('click', function () { post('/api/admin/logout').then(showAuth); });
  $('#ad-refresh').addEventListener('click', load);

  // ---------- dashboard ----------
  function load() {
    fetch('/api/admin/summary', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { if (r.status === 401) { showAuth(); throw new Error('signed out'); } return r.json(); })
      .then(function (res) { render(res.data); })
      .catch(function () {});
  }

  function render(d) {
    var t = d.totals;
    var consentTotal = t.accepted + t.declined;
    var rate = consentTotal ? Math.round((t.accepted / consentTotal) * 100) + '%' : '—';
    var kpis = [
      [t.views30, 'Page views'],
      [t.visitors30, 'Visitors'],
      [t.subscribers, 'Subscribers'],
      [rate, 'Accepted cookies'],
      [t.inquiries, 'Enquiries'],
      [d.logins.filter(function (l) { return l.step === 'code' && l.success; }).length, 'Admin sign-ins']
    ];
    $('[data-kpis]').innerHTML = kpis.map(function (k) {
      return '<div class="ad-kpi"><span class="ad-kpi__num">' + esc(typeof k[0] === 'number' ? k[0].toLocaleString('en-IN') : k[0]) + '</span><span class="ad-kpi__label">' + k[1] + '</span></div>';
    }).join('');
    $('[data-updated]').textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    var max = Math.max.apply(null, [1].concat(d.topPages.map(function (p) { return p.views; })));
    $('[data-top-pages]').innerHTML = d.topPages.length ? d.topPages.map(function (p) {
      return '<li><span class="ad-bar__path">' + esc(p.path) + '</span><span class="ad-bar__n">' + p.views + '</span>' +
        '<span class="ad-bar__track"><i style="width:' + (p.views / max * 100).toFixed(1) + '%"></i></span></li>';
    }).join('') : '<li><span class="ad-bar__path" style="color:#8e8e93">No visits counted yet.</span></li>';

    // fill 14 days, including days with zero visits
    var byDay = {}; d.daily.forEach(function (x) { byDay[x.day] = x.views; });
    var days = [];
    for (var i = 13; i >= 0; i--) {
      var k = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days.push({ day: k, views: byDay[k] || 0 });
    }
    var dmax = Math.max.apply(null, [1].concat(days.map(function (x) { return x.views; })));
    $('[data-daily]').innerHTML = days.map(function (x) {
      return '<div class="ad-col" title="' + x.day + ': ' + x.views + '"><b>' + (x.views || '') + '</b><i style="height:' + (x.views / dmax * 85).toFixed(1) + '%"></i><span>' + x.day.slice(8) + '</span></div>';
    }).join('');

    rows($('[data-subscribers]'), d.subscribers, function (s) {
      return '<tr><td>' + esc(s.email) + '</td><td>' + when(s.created_at) + '</td><td><span class="ad-pill ad-pill--ok">' + esc((s.status || '').toLowerCase()) + '</span></td></tr>';
    }, 3);

    $('[data-consent-split]').textContent = consentTotal
      ? t.accepted + ' accepted · ' + t.declined + ' declined (' + rate + ' accepted)'
      : 'No cookie choices recorded yet.';
    rows($('[data-consents]'), d.consents, function (c) {
      return '<tr><td><span class="ad-pill ' + (c.choice === 'accepted' ? 'ad-pill--ok' : 'ad-pill--no') + '">' + esc(c.choice) + '</span></td><td>' + esc(c.path || '/') + '</td><td>' + when(c.created_at) + '</td><td class="mono">' + esc(c.visitor) + '</td></tr>';
    }, 4);

    rows($('[data-logins]'), d.logins, function (l) {
      return '<tr><td>' + when(l.created_at) + '</td><td>' + (l.step === 'code' ? 'Email code' : 'Password') + '</td><td><span class="ad-pill ' + (l.success ? 'ad-pill--ok' : 'ad-pill--no') + '">' + (l.success ? 'success' : 'failed') + '</span></td><td class="mono">' + esc(l.device) + '</td><td class="ua" title="' + esc(l.user_agent) + '">' + esc(browser(l.user_agent)) + '</td></tr>';
    }, 5);

    rows($('[data-inquiries]'), d.inquiries, function (q) {
      return '<tr><td>' + when(q.created_at) + '</td><td>' + esc(q.name) + '</td><td>' + esc(q.email) + '</td><td>' + esc(q.organization) + '</td><td>' + esc(q.interest) + '</td></tr>';
    }, 5);
  }

  // already signed in?
  fetch('/api/admin/summary', { credentials: 'same-origin', cache: 'no-store' })
    .then(function (r) { if (r.ok) return r.json().then(function (res) { auth.hidden = true; app.hidden = false; render(res.data); }); })
    .catch(function () {});
})();

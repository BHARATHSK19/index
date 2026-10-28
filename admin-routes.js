/**
 * OJIX — admin + first-party analytics routes (v1.0.0)
 *
 *  Public (rate-limited):
 *    POST /api/track            { path, ref }       page view — only sent by the browser after "Accept"
 *    POST /api/consent          { choice, path }    records Accept / Decline
 *
 *  Admin sign-in (two steps):
 *    POST /api/admin/login      { username, password }  → emails a 6-digit code to ADMIN_OTP_EMAIL
 *    POST /api/admin/verify     { challenge, code }     → sets an HttpOnly session cookie (8 h)
 *    POST /api/admin/logout
 *    GET  /api/admin/summary                         (session required)
 *    GET  /api/admin/subscribers.csv                 (session required)
 *
 *  .env:  ADMIN_USER, ADMIN_PASSWORD, ADMIN_OTP_EMAIL  (defaults: admin / admin123 / info@ojix.in)
 */
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { sendAdminOTP } = require('./mailer');

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|axios/i;
const SESSION_HOURS = 8;
const OTP_MINUTES = 10;

module.exports = function mountAdmin(app, { db, mailer, isProd }) {
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  const OTP_TO = process.env.ADMIN_OTP_EMAIL || 'info@ojix.in';

  if (!process.env.ADMIN_PASSWORD) {
    console.warn('[OJIX ADMIN] Using the default admin password. Set ADMIN_PASSWORD in .env.');
  }

  const sessions = new Map();   // token -> expiresAt
  const challenges = new Map(); // id -> { hash, expiresAt, attempts }

  const sha = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');
  const same = (a, b) => {
    const x = Buffer.from(sha(a)), y = Buffer.from(sha(b));
    return crypto.timingSafeEqual(x, y);
  };
  const clientIp = (req) => req.ip || (req.socket && req.socket.remoteAddress) || '0.0.0.0';
  const mask = (email) => email.replace(/^(.{2}).*(@.*)$/, '$1•••$2');

  function readCookie(req, name) {
    const raw = req.headers.cookie || '';
    const m = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
    return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
  }

  function requireAdmin(req, res, next) {
    const token = readCookie(req, 'ojx_admin');
    const exp = token && sessions.get(token);
    if (!exp || exp < Date.now()) {
      if (token) sessions.delete(token);
      return res.status(401).json({ success: false, error: 'Please sign in.' });
    }
    next();
  }

  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false,
    message: { success: false, error: 'Too many attempts. Try again in 15 minutes.' } });
  const trackLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false,
    message: { success: false } });

  // ---------------------------------------------------------------- analytics
  app.post('/api/track', trackLimiter, (req, res) => {
    try {
      const ua = req.get('user-agent') || '';
      const path = String((req.body && req.body.path) || '').trim();
      if (!path.startsWith('/') || path.startsWith('/api') || path.startsWith('/admin') || BOT.test(ua)) {
        return res.status(204).end();
      }
      db.recordPageView({ path: path.replace(/\.html$/, '').replace(/\/index$/, '/') || '/', ip: clientIp(req), referrer: (req.body && req.body.ref) || '' });
    } catch (e) { console.warn('[OJIX TRACK]', e.message); }
    res.status(204).end();
  });

  app.post('/api/consent', trackLimiter, (req, res) => {
    try {
      const choice = req.body && req.body.choice;
      if (['accepted', 'declined', 'custom-on', 'custom-off'].includes(choice)) {
        db.recordConsentEvent({ choice: choice === 'custom-on' ? 'accepted' : choice === 'custom-off' ? 'declined' : choice,
          path: (req.body && req.body.path) || '', ip: clientIp(req) });
      }
    } catch (e) { console.warn('[OJIX CONSENT]', e.message); }
    res.status(204).end();
  });

  // ---------------------------------------------------------------- sign-in
  app.post('/api/admin/login', loginLimiter, async (req, res) => {
    const { username = '', password = '' } = req.body || {};
    const ok = same(username, ADMIN_USER) && same(password, ADMIN_PASSWORD);
    db.recordAdminLogin({ username, step: 'password', success: ok, ip: clientIp(req), userAgent: req.get('user-agent') });
    if (!ok) return res.status(401).json({ success: false, error: 'Wrong username or password.' });

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const challenge = crypto.randomBytes(16).toString('hex');
    challenges.set(challenge, { hash: sha(code), expiresAt: Date.now() + OTP_MINUTES * 60000, attempts: 0 });

    try {
      await sendAdminOTP(code);
      console.log(`[OJIX ADMIN] Sign-in code sent to ${mask(OTP_TO)}.`);
    } catch (err) {
      console.error('[OJIX ADMIN] Failed to dispatch verification code:', err.message || err);
      challenges.delete(challenge);
      return res.status(500).json({ success: false, error: 'Failed to dispatch verification code.' });
    }
    return res.json({ success: true, challenge, sentTo: mask(OTP_TO) });
  });

  app.post('/api/admin/verify', loginLimiter, (req, res) => {
    const { challenge = '', code = '' } = req.body || {};
    const c = challenges.get(String(challenge));
    const fail = (msg) => {
      db.recordAdminLogin({ username: ADMIN_USER, step: 'code', success: false, ip: clientIp(req), userAgent: req.get('user-agent') });
      return res.status(401).json({ success: false, error: msg });
    };
    if (!c || c.expiresAt < Date.now()) { challenges.delete(challenge); return fail('Code expired. Sign in again.'); }
    c.attempts += 1;
    if (c.attempts > 5) { challenges.delete(challenge); return fail('Too many wrong codes. Sign in again.'); }
    if (!crypto.timingSafeEqual(Buffer.from(sha(String(code).trim())), Buffer.from(c.hash))) return fail('That code is not right.');

    challenges.delete(challenge);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + SESSION_HOURS * 3600000);
    db.recordAdminLogin({ username: ADMIN_USER, step: 'code', success: true, ip: clientIp(req), userAgent: req.get('user-agent') });
    res.setHeader('Set-Cookie', `ojx_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${isProd ? '; Secure' : ''}`);
    return res.json({ success: true });
  });

  app.post('/api/admin/logout', (req, res) => {
    const token = readCookie(req, 'ojx_admin');
    if (token) sessions.delete(token);
    res.setHeader('Set-Cookie', 'ojx_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    res.json({ success: true });
  });

  // ---------------------------------------------------------------- data
  app.get('/api/admin/summary', requireAdmin, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ success: true, data: db.adminSummary() });
  });

  app.get('/api/admin/subscribers.csv', requireAdmin, (req, res) => {
    const rows = db.adminSummary().subscribers;
    const csv = ['email,subscribed_at,status'].concat(rows.map((r) => `"${r.email.replace(/"/g, '""')}",${r.created_at},${r.status}`)).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ojix-subscribers.csv"');
    res.setHeader('Cache-Control', 'no-store');
    res.send(csv);
  });

  // keep the admin page out of search engines and caches
  app.use(['/admin', '/admin.html'], (req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
};

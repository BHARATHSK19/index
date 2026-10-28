/**
 * OJIX — local sovereign data store (v1.0.0)
 * Keeps inquiries, consent audit, newsletter subscribers, page views, cookie choices and admin
 * sign-ins in data/ojix_secure.db (same schema as before). Uses Node's built-in SQLite
 * (Node 22.5+); on older Node it falls back to a JSON file, data/ojix_store.json.
 * All functions are synchronous, as server.js and admin-routes.js expect.
 * IP addresses are never stored — only an HMAC-SHA256 hash (DPDP s.8(7)).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'ojix_secure.db');
const JSON_FILE = path.join(DATA_DIR, 'ojix_store.json');
const SALT = process.env.DPDP_SALT || 'ojix-local-salt-change-me';
const RETENTION_DAYS = parseInt(process.env.DATA_RETENTION_DAYS, 10) || 180;
const NOTICE_VERSION = 'DPDP-NOTICE-2025.1';

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const now = () => new Date().toISOString();
const hashIp = (ip) => crypto.createHmac('sha256', SALT).update(String(ip || '0.0.0.0')).digest('hex');
const short = (h) => String(h || '').slice(0, 10);
const daysFromNow = (d) => new Date(Date.now() + d * 86400000).toISOString();

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL,
    name TEXT NOT NULL, email TEXT NOT NULL, organization TEXT, fiduciary_class TEXT, interest TEXT,
    message TEXT, consent_id TEXT NOT NULL, status TEXT DEFAULT 'PENDING');
  CREATE TABLE IF NOT EXISTS consent_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, inquiry_uuid TEXT NOT NULL, consent_timestamp TEXT NOT NULL,
    notice_version TEXT NOT NULL, purpose TEXT NOT NULL, ip_hash TEXT NOT NULL, user_agent TEXT,
    lawful_basis TEXT NOT NULL, retention_until TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL,
    ip_hash TEXT NOT NULL, user_agent TEXT, consent_text TEXT NOT NULL, status TEXT DEFAULT 'SUBSCRIBED');
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT NOT NULL, created_at TEXT NOT NULL,
    ip_hash TEXT NOT NULL, referrer TEXT);
  CREATE TABLE IF NOT EXISTS consent_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, choice TEXT NOT NULL, path TEXT, created_at TEXT NOT NULL,
    ip_hash TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS admin_logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, username TEXT, step TEXT NOT NULL,
    success INTEGER NOT NULL, ip_hash TEXT NOT NULL, user_agent TEXT);
`;

/* ------------------------------------------------------------------ engines */
function sqliteEngine() {
  // Silence the one-time "SQLite is experimental" warning on Node 22.
  const emit = process.emitWarning;
  process.emitWarning = (w, ...rest) => (String(w).includes('SQLite') ? undefined : emit.call(process, w, ...rest));
  const { DatabaseSync } = require('node:sqlite');
  process.emitWarning = emit;
  const db = new DatabaseSync(DB_FILE);
  db.exec(SCHEMA);
  return {
    kind: 'sqlite',
    insert(table, row) {
      const keys = Object.keys(row);
      const r = db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`).run(...keys.map((k) => row[k]));
      return Number(r.lastInsertRowid);
    },
    all(sql, ...p) { return db.prepare(sql).all(...p); },
    get(sql, ...p) { return db.prepare(sql).get(...p); },
    run(sql, ...p) { return db.prepare(sql).run(...p).changes; }
  };
}

function jsonEngine() {
  let data = { inquiries: [], consent_audit_log: [], newsletter_subscribers: [], page_views: [], consent_events: [], admin_logins: [] };
  try { data = Object.assign(data, JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'))); } catch (e) {}
  const save = () => {
    const tmp = JSON_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data));
    fs.renameSync(tmp, JSON_FILE);
  };
  return {
    kind: 'json',
    data,
    save,
    insert(table, row) {
      const list = data[table];
      const id = (list.length ? list[list.length - 1].id : 0) + 1;
      list.push(Object.assign({ id }, row));
      save();
      return id;
    }
  };
}

let E;
try { E = sqliteEngine(); } catch (e) {
  console.warn('[OJIX STORE] Built-in SQLite unavailable (' + e.message + '). Using JSON file store.');
  E = jsonEngine();
}

/* ------------------------------------------------------------------ API */
function recordInquiry(d) {
  const uuid = crypto.randomUUID();
  const ts = now();
  const consentId = 'DPDP-CON-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  const referenceId = 'OJX-' + ts.slice(0, 10).replace(/-/g, '') + '-' + uuid.slice(0, 6).toUpperCase();
  E.insert('inquiries', {
    uuid, created_at: ts, name: d.name || '', email: d.email || '', organization: d.organization || '',
    fiduciary_class: d.fiduciaryClass || '', interest: d.interest || '', message: d.message || '',
    consent_id: consentId, status: 'PENDING'
  });
  E.insert('consent_audit_log', {
    inquiry_uuid: uuid, consent_timestamp: ts, notice_version: NOTICE_VERSION,
    purpose: 'Responding to a business enquiry', ip_hash: hashIp(d.ip), user_agent: d.userAgent || '',
    lawful_basis: 'Consent', retention_until: daysFromNow(RETENTION_DAYS)
  });
  return { referenceId, consentId, timestamp: ts, lawfulBasis: 'Consent' };
}

function addSubscriber({ email, ip, userAgent }) {
  email = String(email || '').trim().toLowerCase();
  if (E.kind === 'sqlite') {
    const row = E.get('SELECT id, status FROM newsletter_subscribers WHERE email = ?', email);
    if (row) {
      if (row.status !== 'SUBSCRIBED') E.run("UPDATE newsletter_subscribers SET status = 'SUBSCRIBED' WHERE id = ?", row.id);
      return { existing: row.status === 'SUBSCRIBED', id: row.id };
    }
  } else {
    const row = E.data.newsletter_subscribers.find((s) => s.email === email);
    if (row) {
      const was = row.status === 'SUBSCRIBED';
      row.status = 'SUBSCRIBED'; E.save();
      return { existing: was, id: row.id };
    }
  }
  const id = E.insert('newsletter_subscribers', {
    email, created_at: now(), ip_hash: hashIp(ip), user_agent: userAgent || '',
    consent_text: 'Subscribed to OJIX newsletter via website form', status: 'SUBSCRIBED'
  });
  return { existing: false, id };
}

function recordPageView({ path: p, ip, referrer }) {
  E.insert('page_views', { path: String(p || '/').slice(0, 200), created_at: now(), ip_hash: hashIp(ip), referrer: String(referrer || '').slice(0, 200) });
}

function recordConsentEvent({ choice, path: p, ip }) {
  E.insert('consent_events', { choice: String(choice), path: String(p || '').slice(0, 200), created_at: now(), ip_hash: hashIp(ip) });
}

function recordAdminLogin({ username, step, success, ip, userAgent }) {
  E.insert('admin_logins', {
    created_at: now(), username: String(username || '').slice(0, 80), step: String(step), success: success ? 1 : 0,
    ip_hash: hashIp(ip), user_agent: String(userAgent || '').slice(0, 300)
  });
}

function requestErasureByEmail(email) {
  email = String(email || '').trim().toLowerCase();
  let inquiries = 0, subscribers = 0;
  if (E.kind === 'sqlite') {
    const uuids = E.all('SELECT uuid FROM inquiries WHERE lower(email) = ?', email).map((r) => r.uuid);
    uuids.forEach((u) => E.run('DELETE FROM consent_audit_log WHERE inquiry_uuid = ?', u));
    inquiries = E.run('DELETE FROM inquiries WHERE lower(email) = ?', email);
    subscribers = E.run('DELETE FROM newsletter_subscribers WHERE lower(email) = ?', email);
  } else {
    const d = E.data;
    const uuids = d.inquiries.filter((r) => r.email.toLowerCase() === email).map((r) => r.uuid);
    inquiries = uuids.length;
    d.inquiries = d.inquiries.filter((r) => r.email.toLowerCase() !== email);
    d.consent_audit_log = d.consent_audit_log.filter((r) => !uuids.includes(r.inquiry_uuid));
    const before = d.newsletter_subscribers.length;
    d.newsletter_subscribers = d.newsletter_subscribers.filter((r) => r.email !== email);
    subscribers = before - d.newsletter_subscribers.length;
    E.save();
  }
  return {
    success: true,
    message: inquiries + subscribers
      ? 'Your personal data has been erased under Section 12 of the DPDP Act 2023.'
      : 'No personal data was found for that email address.',
    erased: { inquiries, subscribers },
    timestamp: now()
  };
}

function tableRows(table) {
  return E.kind === 'sqlite' ? E.all(`SELECT * FROM ${table} ORDER BY id DESC`) : E.data[table].slice().reverse();
}

function getStorageStats() {
  const count = (t) => (E.kind === 'sqlite' ? E.get(`SELECT COUNT(*) AS n FROM ${t}`).n : E.data[t].length);
  return {
    engine: E.kind === 'sqlite' ? 'SQLite (local, India)' : 'JSON file (local, India)',
    inquiries: count('inquiries'),
    subscribers: count('newsletter_subscribers'),
    pageViews: count('page_views'),
    consentEvents: count('consent_events'),
    retentionDays: RETENTION_DAYS
  };
}

function adminSummary() {
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const since14 = new Date(Date.now() - 14 * 86400000).toISOString();
  const views = tableRows('page_views');
  const v30 = views.filter((v) => v.created_at >= since30);
  const consents = tableRows('consent_events');
  const subs = tableRows('newsletter_subscribers');
  const inquiries = tableRows('inquiries');
  const logins = tableRows('admin_logins');

  const pages = {};
  v30.forEach((v) => { pages[v.path] = (pages[v.path] || 0) + 1; });
  const daily = {};
  views.filter((v) => v.created_at >= since14).forEach((v) => { const k = v.created_at.slice(0, 10); daily[k] = (daily[k] || 0) + 1; });

  return {
    totals: {
      views30: v30.length,
      visitors30: new Set(v30.map((v) => v.ip_hash)).size,
      subscribers: subs.filter((s) => s.status === 'SUBSCRIBED').length,
      accepted: consents.filter((c) => c.choice === 'accepted').length,
      declined: consents.filter((c) => c.choice === 'declined').length,
      inquiries: inquiries.length
    },
    topPages: Object.keys(pages).map((p) => ({ path: p, views: pages[p] })).sort((a, b) => b.views - a.views).slice(0, 10),
    daily: Object.keys(daily).sort().map((k) => ({ day: k, views: daily[k] })),
    subscribers: subs.map((s) => ({ email: s.email, created_at: s.created_at, status: s.status })),
    consents: consents.slice(0, 50).map((c) => ({ choice: c.choice, path: c.path, created_at: c.created_at, visitor: short(c.ip_hash) })),
    logins: logins.slice(0, 50).map((l) => ({ created_at: l.created_at, step: l.step, success: !!l.success, device: short(l.ip_hash), user_agent: l.user_agent })),
    inquiries: inquiries.slice(0, 100).map((q) => ({ created_at: q.created_at, name: q.name, email: q.email, organization: q.organization, interest: q.interest }))
  };
}

module.exports = {
  engine: E.kind,
  recordInquiry, addSubscriber, recordPageView, recordConsentEvent, recordAdminLogin,
  requestErasureByEmail, getStorageStats, adminSummary
};

/**
 * OJIX Enterprise Application & API Server
 * Production-ready, hardened Node.js/Express server.
 * Implements strict security safeguards and DPDP Act 2023 statutory compliance.
 */

'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const mailer = require('./mailer');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

// Trust proxy for rate limiting behind load balancers / cloud platforms (Fly.io, Render, AWS, etc.)
app.set('trust proxy', 1);

// Disable X-Powered-By
app.disable('x-powered-by');

// 1. HARDENED HTTP SECURITY HEADERS VIA HELMET
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'", "mailto:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
        connectSrc: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'"],
        upgradeInsecureRequests: IS_PROD ? [] : null
      }
    },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: IS_PROD
      ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
      : false
  })
);

// Custom Permissions-Policy header
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()'
  );
  // Statutory Data Localization & DPDP Header
  res.setHeader('X-DPDP-Compliance-Jurisdiction', 'Republic of India (Act No. 22 of 2023)');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// 2. CORS CONFIGURATION
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080', 'http://127.0.0.1:8080', 'https://ojix.in', 'https://www.ojix.in'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin) || !IS_PROD) {
        return callback(null, true);
      }
      return callback(new Error('CORS request blocked by statutory policy.'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
  })
);

// 3. BODY PARSING WITH STRICT SIZE LIMITS (Prevents payload-based DoS)
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// 4. RATE LIMITING
const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please wait a moment before trying again.'
  }
});

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 form submissions per 15 minutes per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Submission rate limit reached. Under security safeguards, please retry in a few minutes.'
  }
});

app.use('/api/', globalApiLimiter);

// 5. SANITIZATION AND VALIDATION HELPERS
function sanitizeString(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Strip script injection tags
    .replace(/[\0\x08\x09\x1a\n\r]/g, ' ') // Strip control chars
    .trim()
    .slice(0, maxLen);
}

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // RFC 5322 regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 120;
}

// 6. API ENDPOINTS

/**
 * Health check & liveness probe for Docker / K8s / Cloud Run / Railway
 */
app.get(['/health', '/api/health'], (req, res) => {
  const stats = db.getStorageStats();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: NODE_ENV,
    jurisdiction: 'India (DPDP 2023)',
    storage: stats,
    complianceStatus: 'ACTIVE'
  });
});

/**
 * Lead & Project Inquiry Endpoint (contact form and product demo requests)
 */
app.post('/api/inquiry', submissionLimiter, async (req, res) => {
  try {
    const { name, email, interest, message, honeypot, _hp_check } = req.body;

    // Honeypot bot trap
    if (honeypot || _hp_check) {
      console.warn('[SPAM BOT CAUGHT] Honeypot field was filled.');
      return res.status(200).json({
        success: true,
        message: 'Your inquiry has been queued for verification.'
      });
    }

    // Required fields check
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Full name and official work email are statutory requirements.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid corporate or official email address.'
      });
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const sanitizedData = {
      name: sanitizeString(name, 100),
      email: email.trim().toLowerCase(),
      interest: sanitizeString(interest || 'General Platform Inquiry', 100),
      message: sanitizeString(message || 'No additional notes provided.', 2500),
      ip: clientIp,
      userAgent
    };

    // Save into Neon PostgreSQL contact_leads table
    let neonLeadId = null;
    try {
      const neonRes = await db.query(
        `INSERT INTO contact_leads (full_name, email, phone, company, interested_in, requirement, consent_agreed)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          sanitizedData.name,
          sanitizedData.email,
          req.body.phone ? sanitizeString(req.body.phone, 50) : null,
          req.body.company ? sanitizeString(req.body.company, 150) : null,
          sanitizedData.interest,
          sanitizedData.message,
          true
        ]
      );
      neonLeadId = neonRes.rows && neonRes.rows[0] ? neonRes.rows[0].id : null;
      console.log('[Neon Postgres] Inseted inquiry into contact_leads ID:', neonLeadId);
    } catch (neonErr) {
      console.error('[Neon Postgres Error in /api/inquiry]:', neonErr.message);
    }

    let auditRecord = { referenceId: neonLeadId, consentId: `DPDP-${Date.now()}`, timestamp: new Date().toISOString(), lawfulBasis: 'Consent' };
    if (db && typeof db.recordInquiry === 'function') {
      try {
        auditRecord = db.recordInquiry(sanitizedData);
      } catch (e) {}
    }

    return res.status(201).json({
      success: true,
      message: 'Inquiry received. Our engineering team will review and respond within 24 hours under DPDP statutory guidelines.',
      id: neonLeadId,
      referenceId: auditRecord.referenceId,
      consentId: auditRecord.consentId,
      consentTimestamp: auditRecord.timestamp,
      lawfulBasis: auditRecord.lawfulBasis
    });
  } catch (err) {
    console.error('[API ERROR] Failed to record inquiry:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your statutory request. Please email info@ojix.in directly.'
    });
  }
});

/**
 * DPDP Technical Architecture Audit Request Endpoint (dpdp-compliance.html)
 */
app.post('/api/audit-request', submissionLimiter, (req, res) => {
  try {
    const {
      name,
      email,
      organization,
      'fiduciary-class': fiduciaryClass,
      interest,
      message,
      honeypot,
      _hp_check
    } = req.body;

    // Honeypot bot trap
    if (honeypot || _hp_check) {
      return res.status(200).json({
        success: true,
        message: 'Your compliance audit request has been registered.'
      });
    }

    if (!name || !email || !organization) {
      return res.status(400).json({
        success: false,
        error: 'Enterprise Name, Officer Name, and Official Email are required for audit scheduling.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid corporate or statutory DPO email address.'
      });
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const sanitizedData = {
      name: sanitizeString(name, 100),
      email: email.trim().toLowerCase(),
      organization: sanitizeString(organization, 150),
      fiduciaryClass: sanitizeString(fiduciaryClass || 'Standard Data Fiduciary', 100),
      interest: sanitizeString(interest || 'DPDP Technical Architecture Audit', 100),
      message: sanitizeString(message || 'Requesting technical architecture audit and readiness review under DPDP Act 2023 & Rules 2025.', 2500),
      ip: clientIp,
      userAgent
    };

    const auditRecord = db.recordInquiry(sanitizedData);

    return res.status(201).json({
      success: true,
      message: 'Confidential DPDP architecture audit request registered. An OJIX principal solutions engineer will contact you under NDA.',
      referenceId: auditRecord.referenceId,
      consentId: auditRecord.consentId,
      consentTimestamp: auditRecord.timestamp,
      fiduciaryClass: sanitizedData.fiduciaryClass,
      lawfulBasis: auditRecord.lawfulBasis
    });
  } catch (err) {
    console.error('[API ERROR] Failed to record audit request:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process compliance audit request. Please email info@ojix.in.'
    });
  }
});

/**
 * Data Principal Right to Erasure Endpoint (DPDP Act 2023 Section 12)
 */

// NEWSLETTER — store subscriber, send plain "Welcome to OJIX" email
app.post('/api/newsletter', submissionLimiter, async (req, res) => {
  try {
    if (req.body && req.body._hp_check) return res.json({ success: true, message: 'You’re subscribed.' });
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    const result = db.addSubscriber({ email, ip: req.ip, userAgent: req.get('user-agent') || '' });
    if (result.existing) {
      return res.json({ success: true, message: 'You’re already on the list — thank you.' });
    }
    mailer.sendWelcome(email)
      .then((r) => { if (r.sent) console.log('[OJIX MAIL] Welcome email sent.'); })
      .catch((err) => console.warn('[OJIX MAIL] Welcome email failed:', err.message));
    return res.json({
      success: true,
      message: mailer.isConfigured()
        ? 'You’re subscribed. A welcome note is on its way to your inbox.'
        : 'You’re subscribed. Thank you.'
    });
  } catch (err) {
    console.error('[OJIX NEWSLETTER]', err.message);
    return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

// ADMIN + first-party analytics (see admin-routes.js)
require('./admin-routes')(app, { db, mailer, isProd: IS_PROD });


// CONTACT MODAL ("Discuss a project") — Inserts leads into Neon PostgreSQL contact_leads table
app.post('/api/contact', submissionLimiter, async (req, res) => {
  try {
    const b = req.body || {};
    if (b._hp_check) {
      return res.status(200).json({ success: true, message: 'Enquiry submitted successfully' });
    }

    const full_name = sanitizeString(b.full_name || b.name || '', 150);
    const email = String(b.email || '').trim().toLowerCase();
    const phone = sanitizeString(b.phone || '', 50);
    const company = sanitizeString(b.company || '', 150);
    const interested_in = sanitizeString(b.interested_in || b.interest || '', 100);
    const requirement = sanitizeString(b.requirement || b.message || '', 2500);
    const consent_agreed = Boolean(b.consent_agreed ?? b.consent);

    // Validate required fields
    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Full name and email are required fields.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }

    const insertSql = `
      INSERT INTO contact_leads (
        full_name, email, phone, company, interested_in, requirement, consent_agreed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at;
    `;
    const params = [
      full_name,
      email,
      phone || null,
      company || null,
      interested_in || null,
      requirement || null,
      consent_agreed
    ];

    const result = await db.query(insertSql, params);
    const leadId = result.rows && result.rows[0] ? result.rows[0].id : null;

    // Also trigger email notification asynchronously if mailer is configured
    if (mailer && typeof mailer.sendEnquiryMails === 'function') {
      mailer.sendEnquiryMails({
        name: full_name,
        email,
        phone,
        organization: company,
        interest: interested_in,
        message: requirement,
        referenceId: leadId
      }).catch((err) => console.warn('[OJIX MAIL] Failed to send enquiry email:', err.message));
    }

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      id: leadId
    });
  } catch (err) {
    console.error('[POST /api/contact ERROR]:', err);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while saving your enquiry. Please try again.'
    });
  }
});

// DISCUSS A PROJECT (pop-up form) — stores enquiry in Neon Postgres + emails visitor
app.post('/api/project', submissionLimiter, async (req, res) => {
  try {
    const b = req.body || {};
    if (b._hp_check) return res.json({ success: true, message: 'Thanks — we’ll be in touch.' });
    const name = sanitizeString(b.full_name || b.name || '', 100);
    const email = String(b.email || '').trim().toLowerCase();
    if (!name) return res.status(400).json({ success: false, error: 'Please enter your name.' });
    if (!isValidEmail(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    if (!b.consent && !b.consent_agreed) return res.status(400).json({ success: false, error: 'Please tick the consent box so we can reply.' });

    const company = sanitizeString(b.company || '', 150);
    const phone = sanitizeString(b.phone || '', 50);
    const interest = sanitizeString(b.interested_in || (b.mode === 'demo' ? 'Demo request — ' : '') + (b.interest || 'Discuss a project'), 100);
    const requirement = sanitizeString(b.requirement || b.message || '', 2500);
    const consent_agreed = Boolean(b.consent_agreed ?? b.consent);

    // 1. Always insert into Neon PostgreSQL contact_leads table
    let leadId = null;
    try {
      const insertSql = `
        INSERT INTO contact_leads (
          full_name, email, phone, company, interested_in, requirement, consent_agreed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at;
      `;
      const result = await db.query(insertSql, [
        name,
        email,
        phone || null,
        company || null,
        interest || null,
        requirement || null,
        consent_agreed
      ]);
      leadId = result.rows && result.rows[0] ? result.rows[0].id : null;
      console.log('[Neon Postgres] Saved enquiry to contact_leads ID:', leadId);
    } catch (neonErr) {
      console.error('[Neon Postgres Error in /api/project]:', neonErr.message);
    }

    // 2. Also record in local audit inquiry and trigger email notifications
    const data = {
      name,
      email,
      organization: company,
      phone,
      interest,
      message: requirement,
      ip: req.ip,
      userAgent: req.get('user-agent') || ''
    };

    let refId = leadId;
    if (db && typeof db.recordInquiry === 'function') {
      try {
        const rec = db.recordInquiry({
          name: data.name, email: data.email, organization: data.organization,
          interest: data.interest, message: [data.phone ? 'Phone: ' + data.phone : '', data.message].filter(Boolean).join('\n'),
          ip: data.ip, userAgent: data.userAgent
        });
        refId = rec.referenceId || leadId;
      } catch (e) {}
    }

    if (mailer && typeof mailer.sendEnquiryMails === 'function') {
      mailer.sendEnquiryMails({ ...data, referenceId: refId })
        .then((r) => { if (r.sent) console.log('[OJIX MAIL] Enquiry emails sent.'); })
        .catch((err) => console.warn('[OJIX MAIL] Enquiry emails failed:', err.message));
    }

    return res.status(201).json({
      success: true,
      id: leadId,
      referenceId: refId,
      message: mailer && typeof mailer.isConfigured === 'function' && mailer.isConfigured()
        ? 'Thank you. We’ve emailed you a confirmation — our team will get in touch shortly.'
        : 'Thank you. Our team will get in touch shortly.'
    });
  } catch (err) {
    console.error('[OJIX PROJECT]', err.message);
    return res.status(500).json({ success: false, error: 'Something went wrong. Please email info@ojix.in.' });
  }
});

app.post('/api/dpdp/erasure', submissionLimiter, (req, res) => {
  try {
    const { email, confirmation } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'A valid email address is required to locate records for erasure.'
      });
    }
    if (confirmation !== 'ERASE_PERSONAL_DATA') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation token ERASE_PERSONAL_DATA is required to execute statutory erasure.'
      });
    }

    const result = db.requestErasureByEmail(email);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[API ERROR] Erasure request failed:', err);
    return res.status(500).json({
      success: false,
      error: 'Erasure execution error. Contact info@ojix.in directly.'
    });
  }
});

// 7. REACT FRONT END (web/dist) — build it with `npm run build`
// Only the built site is public. Earlier versions served the whole project folder, which also
// exposed server code and data/ojix_secure.db; that is no longer possible.
const WEB_DIST = path.join(__dirname, 'web', 'dist');
const SPA_INDEX = path.join(WEB_DIST, 'index.html');
const fs = require('fs');

// Every URL the React app renders (anything else gets a real 404 status).
const PRODUCT_PAGES = [
  'company-management-system', 'legalos', 'procureos', 'school-erp', 'university-management-system',
  'ai-proctoring', 'construction-hub', 'property-intelligence', 'travelos', 'fitos', 'dpdp-compliance'
];
const SITE_PAGES = new Set(['/', '/about', '/contact', '/process', '/security', '/industries', '/who-we-are',
  '/products', '/services', '/cookies', ...PRODUCT_PAGES.map((p) => '/' + p)]);
const SERVICE_SLUGS = new Set(
  fs.existsSync(path.join(__dirname, 'web', 'src', 'data', 'serviceSlugs.json'))
    ? JSON.parse(fs.readFileSync(path.join(__dirname, 'web', 'src', 'data', 'serviceSlugs.json'), 'utf8'))
    : []
);
// Old URLs -> new ones (301). Covers renamed products and every old *.html address.
const RENAMED = { '/companyos': '/company-management-system', '/campusos': '/school-erp', '/buildos': '/construction-hub', '/dpdp': '/dpdp-compliance' };

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  let p = req.path;
  if (p.startsWith('/api/') || p === '/admin' || p === '/admin.html') return next();
  let target = null;
  if (p.length > 1 && p.endsWith('/')) target = p.replace(/\/+$/, '');
  const base = target || p;
  if (/\.html$/.test(base)) target = base.replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/';
  const renamed = RENAMED[(target || p)];
  if (renamed) target = renamed;
  if (target && target !== p) {
    const q = req.originalUrl.indexOf('?');
    return res.redirect(301, target + (q === -1 ? '' : req.originalUrl.slice(q)));
  }
  next();
});

app.use(express.static(WEB_DIST, {
  index: false,
  dotfiles: 'ignore',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.includes(path.sep + 'static' + path.sep)) {
      // hashed build files never change
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(css|js|woff2|svg|png|jpg|jpeg|webp)$/.test(filePath)) {
      res.setHeader('Cache-Control', IS_PROD ? 'public, max-age=604800, stale-while-revalidate=86400' : 'no-cache');
    }
  }
}));

// Admin console (plain page, not part of the React app)
app.get(['/admin', '/admin.html'], (req, res) => res.sendFile(path.join(WEB_DIST, 'admin.html')));

function sendApp(res, status) {
  if (!fs.existsSync(SPA_INDEX)) {
    return res.status(503).type('text').send('Front end not built yet. Run: npm run build');
  }
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  return res.status(status).sendFile(SPA_INDEX);
}

app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const m = req.path.match(/^\/services\/([a-z0-9-]+)$/);
  const known = SITE_PAGES.has(req.path) || (m && SERVICE_SLUGS.has(m[1]));
  if (!known && /\.[a-z0-9]{2,5}$/i.test(req.path)) return next(); // missing file -> plain 404
  return sendApp(res, known ? 200 : 404);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint or resource not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    error: IS_PROD ? 'Internal server error.' : err.message
  });
});

// 8. START SERVER & GRACEFUL SHUTDOWN
if (require.main === module) {
  // Ensure database tables exist if Neon DB is configured
  if (db && typeof db.initDb === 'function') {
    db.initDb().catch((err) => console.error('[DB INIT ERROR]:', err));
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  OJIX Premium Platform Server is running`);
    console.log(`  Environment: ${NODE_ENV}`);
    console.log(`  Listening at: http://localhost:${PORT}`);
    console.log(`  Health probe: http://localhost:${PORT}/health`);
    // Phone / other devices on the same Wi-Fi
    const nets = require('os').networkInterfaces();
    Object.values(nets).flat().filter((n) => n && n.family === 'IPv4' && !n.internal)
      .forEach((n) => console.log(`  On your phone (same Wi-Fi): http://${n.address}:${PORT}`));
    console.log(`  DPDP Act 2023 Statutory Compliance: ACTIVE`);
    console.log(`====================================================`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`[OJIX SERVER] Received ${signal}. Closing HTTP server gracefully...`);
    server.close(() => {
      console.log('[OJIX SERVER] HTTP server closed. Process terminating safely.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

module.exports = app;

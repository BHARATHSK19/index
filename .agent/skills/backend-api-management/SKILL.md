---
name: ojix-backend-api-management
description: Standards and security guardrails for Node.js, Express 5, rate limiting, helmet, admin-routes.js, mailer.js, db.js, and DPDP Act compliance.
---

# OJIX Node.js & Express API Route Management

This skill outlines guidelines, security patterns, and error handling for the OJIX backend services (`server.js`, `admin-routes.js`, `mailer.js`, `db.js`).

## 1. Core Architecture & Stack
- **Runtime**: Node.js (CommonJS `require`/`module.exports`).
- **Framework**: Express 5.x.
- **Security Middleware**: `helmet`, `cors`, `express-rate-limit`.
- **Statutory Mandate**: Digital Personal Data Protection (DPDP) Act 2023 compliance.

## 2. Hardened Security & CSP Configurations
- **Content Security Policy (CSP)** in `server.js`:
  - When referencing external scripts or fonts, explicitly declare domains in CSP directives (`scriptSrc`, `styleSrc`, `fontSrc`, `imgSrc`).
  - Do not introduce `unsafe-eval`.
- **Sensitive Headers**:
  - Keep `x-powered-by` disabled (`app.disable('x-powered-by')`).
  - Send statutory headers: `X-DPDP-Compliance-Jurisdiction: Republic of India (Act No. 22 of 2023)` and `X-Content-Type-Options: nosniff`.
- **Rate Limiting**:
  - Apply `express-rate-limit` to all public API endpoints:
    - Login / Auth attempts: strict limits (e.g., 15 requests / 15 minutes).
    - Analytics / Consent tracking (`/api/track`, `/api/consent`): reasonable throttles to prevent traffic flooding.

## 3. Route Modularization Pattern
Keep `server.js` clean by delegating route domains to modular controllers:
```js
// Mounting admin and analytics routes
const mountAdmin = require('./admin-routes');
mountAdmin(app, { db, mailer, isProd });
```

### Route Conventions
- **Authentication**:
  - Two-step OTP for admin: `POST /api/admin/login` (generates temporary challenge) -> `POST /api/admin/verify` (sets HttpOnly session cookie).
  - Timing attack prevention: Always use `crypto.timingSafeEqual` when validating hashes or credentials.
- **Cookie Security**:
  ```js
  res.cookie('ojx_admin', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  });
  ```

## 4. Mailer & Background Resilience (`mailer.js`)
- Fail Gracefully:
  - When SMTP credentials (`SMTP_HOST`, `SMTP_USER`, etc.) are missing or unconfigured, log a single warning and bypass without throwing unhandled exceptions.
  - Subscriptions and user actions must not fail even if background transactional email delivery fails.

## 5. DPDP Act 2023 Data Privacy Rules
- Never log raw personally identifiable information (PII) to standard out or persistent logs without masking (e.g., mask emails: `sa•••@domain.com`).
- Store timestamps and consent decisions (`/api/consent`) for auditability.

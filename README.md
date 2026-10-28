# OJIX Premium Website

A responsive, light-first website for OJIX Engineering & Technology LLP. It uses the provided OJIX brand kit, with navy `#0F1C2E`, orange `#C9662F`, white and muted neutral surfaces. The layout and UI are original; Apple and Grok were treated as quality/clarity references rather than copied layouts.

## Front end (React) — since Build 04

The site is a React app in `web/` (Vite + React 19 + React Router). The Express server serves the built files from `web/dist`.

```bash
npm install
npm run build     # builds web/ -> web/dist   (required after every front-end change)
npm start         # http://localhost:3000
npm run dev:web   # optional: live-reload front end on :5173 (start `npm start` too for the /api routes)
```

Where things live:

| What | File |
|---|---|
| Product names, order, menu text, images | `web/src/data/products.jsx` |
| Text of the newer product pages (University, AI Proctoring, Property) | `web/src/data/newProducts.js` |
| Service pages (81, one template) | `web/src/pages/ServicePage.jsx` + `web/src/generated/servicePages.json` |
| Home / original product pages / DPDP / cookies | `web/src/generated/*.jsx` |
| Header and page shell | `web/src/components/` |
| Menus, carousels, forms, theme, cookie banner | `web/src/legacy/*.js` |
| Images, robots.txt, sitemap, admin page | `web/public/` |

Note: if `.env` sets `NODE_ENV=production`, the server sends HTTPS-only headers, so plain `http://localhost` will not load styles. Use `NODE_ENV=development` locally.

## Production Deployment & Backend

The repository includes a production-grade, secure Node.js backend (`server.js`) compliant with the **Digital Personal Data Protection Act (DPDP Act 2023) & Rules 2025**.

### 1. Run with Docker (Recommended for Production)

```bash
# Build the container image
docker build -t ojix-site .

# Run the secure container on port 3000
docker run -d --name ojix-platform -p 3000:3000 -v $(pwd)/data:/app/data --restart unless-stopped ojix-site
```

The container runs as an unprivileged user (`node`), includes an automated health probe (`/health`), and mounts `/app/data` for persistent sovereign data storage.

### 2. Run with Node.js directly

```bash
npm install
npm run build
npm start
# or for development with auto-reload:
npm run dev
```

Server listens on `http://localhost:3000` (configurable via `PORT` in `.env`).

### 3. Backend Security & DPDP Compliance Architecture

- **Sovereign Indian Data Storage:** Built-in parameterized SQLite database (`db.js`) in `data/ojix_secure.db` with automated JSON backup fallback.
- **Section 6 Purpose-Limitation Consent:** Each submission is recorded with an immutable consent token (`DPDP-CON-...`), exact statutory consent timestamp, and purpose specification.
- **Section 8(7) Data Minimization & IP Anonymization:** Client IP addresses are never stored in plaintext; they are irreversibly hashed via HMAC-SHA256 with a local salt.
- **Section 12 Right to Erasure:** Dedicated statutory erasure endpoint (`POST /api/dpdp/erasure`) purges all personal data records on request.
- **Section 9 Retention Ceilings:** Automatically computes 180-day expiry dates on all inquiries.
- **Military-grade HTTP Security Headers:** Helmet CSP (Content-Security-Policy), HSTS (`max-age=31536000; includeSubDomains; preload`), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and restricted `Permissions-Policy`.
- **Bot Mitigation:** Honeypot field trap (`_hp_check`) silently drops automated scrapers and spam bots without disruption to genuine users.
- **Rate Limiting:** Express rate-limiting defends endpoints against volumetric brute-force and DDoS (120 req/min general, 10 submissions/15min for forms).
- **Progressive Fallback:** If the backend is ever unreachable or offline, the client-side JavaScript (`app.js`) automatically falls back to an encoded direct `mailto:info@ojix.in` transmission so no lead is ever lost.

### 4. API Endpoints

- `GET /health` or `/api/health` — Liveness/readiness probe reporting uptime, DB stats, and DPDP compliance status.
- `POST /api/inquiry` — General enterprise inquiries (homepage, Nyaya Sethu, AI proctX, ProcureOS, OJIX OS).
- `POST /api/audit-request` — DPDP technical architecture review inquiries.
- `POST /api/dpdp/erasure` — Data principal statutory erasure requests.

## Before production launch

1. **Verify portfolio scope.** Product names and descriptions reflect the OJIX portfolio discussed to date. Confirm which solutions are available now, in pilot, or still in development; replace any descriptions that overstate release readiness.
2. **Confirm client permissions.** The names Jain Anveshana, BSG Karnataka, BNN Law Firm, GVS Law Chambers, Worexa and Nele are shown as portfolio context. Confirm the correct legal names, whether each relationship can be public, and secure written permission before adding logos or case studies.
3. **Verify legal details.** Confirm registered address, GSTIN, company name and public contact details before deployment.
4. **Domain and SSL.** Point DNS records to your server/reverse proxy (Nginx / Cloudflare), install a valid TLS certificate (or Let's Encrypt), and submit `sitemap.xml` to Google Search Console.
5. **Installability.** The PWA service worker caches core assets for offline resilience and fast loads.

## Production Deployment on Firebase (Zero-Cost Spark Tier)

The site is configured for 100% free hosting under the Firebase **Spark Plan ($0/month)**:
- **Project Name:** `OJIX-WEB-ALPHA`
- **Project ID:** `ojix-web-alpha`
- **Quota Highlights:** 10 GB storage, free SSL certificate, CDN edge caching, and zero database or function billing.

### 1. Authenticate with Firebase
```bash
npx firebase-tools login
# Or non-interactive if deploying via CI/CD:
# export FIREBASE_TOKEN="<your-ci-token>"
```

### 2. Verify or Switch Active Project
```bash
npx firebase-tools use ojix-web-alpha
```

### 3. Deploy to Production
```bash
npm run deploy:firebase
# or directly:
npx firebase-tools deploy --only hosting
```

The site will be immediately live on:
- `https://ojix-web-alpha.web.app`
- `https://ojix-web-alpha.firebaseapp.com`
(Custom enterprise domain `ojix.in` can be linked in Firebase Console without extra charges.)

---

## Directory Structure

- `index.html` — Flagship homepage with Operations Overview cockpit card, interactive solution matrix, and DPDP compliance notice
- `legalos.html` — Nyaya Sethu legal practice operating system landing page with High Court cause list cockpit
- `campusos.html` — AI proctX institutional education platform landing page with multi-campus operations stream
- `procureos.html` — Reconciliation operating system landing page with live 3-way match pipeline
- `dpdp-compliance.html` — Enterprise technical architecture blueprint for DPDP Act 2023 & Rules 2025
- `styles.css` — Enterprise light-first design tokens, responsive typography, and animations
- `app.js` — Client-side logic, 3D tilt interactions, work email validation, and direct mailto submission
- `firebase.json` / `.firebaserc` — Zero-cost Firebase Hosting configuration with security and CDN headers
- `server.js` / `db.js` — Optional self-hosted Node.js / SQLite backend with DPDP Section 6 audit logging
- `Dockerfile` / `.dockerignore` — Hardened container configuration for sovereign on-premise deployments
- `src/visual-effects-entry.js` — Source entry point for WebGL visual effects
- `assets/` — Production vector logos, typography assets, favicons, and bundled vendor scripts
- `manifest.webmanifest` / `service-worker.js` — Progressive Web App (PWA) manifest and caching worker
- `robots.txt` / `sitemap.xml` / `security.txt` — SEO and statutory security contact disclosures

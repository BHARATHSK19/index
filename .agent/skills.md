# OJIX Project Operating Manual & Agent Ruleset

This document serves as the persistent system memory, architectural boundary contract, and operating manual for all AI agents and engineers working in this repository.

---

## 1. Project Context & Stack Architecture

- **Primary Application**: The live production application is a Single Page Application (SPA) built with **React 19** and bundled with **Vite 8**, located in `./web/`.
- **Component & Application Code**: All active application source code lives inside `./web/src/`.
- **Public & Static Assets**: Static media, images, client logos, and datasets are hosted in `./web/public/`.
- **Build Output**: The production compilation target is `./web/dist/`, compiled via `npm run build` from the repository root (invoking `vite build --config web/vite.config.mjs`).
- **Backend & Serving**: An Express 5 server (`server.js`) serves the compiled assets from `web/dist/` and provides API routing (`/api/*`), rate limiting, mail dispatching, and database interactions.

---

## 2. Directory Structure & File Map

```text
index/
├── .agent/                             # Agent configuration & workspace skills
│   ├── skills/                         # Domain-specific agent guardrails
│   └── skills.md                       # Synchronized copy of project operating manual
├── AGENTS.md                           # Master project memory & operating manual
├── package.json                        # Root NPM scripts (build, dev, preview)
├── server.js                           # Express 5 production server
│
├── web/                                # MODERN APPLICATION ROOT (React 19 + Vite 8)
│   ├── index.html                      # Single Page Application HTML entrypoint
│   ├── vite.config.mjs                 # Vite bundler configuration
│   ├── public/                         # Public static assets
│   │   ├── assets/
│   │   │   ├── clients/                # Client partner logos
│   │   │   └── logos/                  # Client partner logos (e.g. 6senai.png, novus.png)
│   │   └── datasets/                   # GeoJSON polygons (e.g. ne_110m_admin_0_countries.geojson)
│   ├── src/                            # Application Source Code
│   │   ├── App.jsx                     # Router and page composition root
│   │   ├── main.jsx                    # React 19 hydration entrypoint
│   │   ├── components/                 # Reusable UI components
│   │   │   ├── Header.jsx              # Navigation header with mega-menus
│   │   │   ├── InteractiveGlobe.jsx    # Three.js / Globe.gl static 3D network globe
│   │   │   ├── Page.jsx                # Layout wrapper
│   │   │   └── ProductRows.jsx         # Product catalog showcase rows
│   │   ├── data/                       # Product, service, and network data catalogs
│   │   │   └── products.jsx            # Single source of truth for all platform products
│   │   ├── generated/                  # Extracted and generated page components
│   │   │   ├── HomeMain.jsx            # Homepage content, hero, client logo marquee
│   │   │   └── SiteChrome.jsx          # Site chrome, newsletter modal, and footer
│   │   ├── legacy/                     # Scoped ES-module legacy script adapters
│   │   ├── pages/                      # Dynamic and standalone view pages
│   │   └── styles/                     # Cascading stylesheets
│   │       ├── styles.css              # Base layout, typography tokens, utilities
│   │       ├── home.css                # Homepage hero, logo marquee (.dx-logos__track)
│   │       ├── typography.css          # Apple-style typography & glassmorphism pill rules
│   │       ├── responsive.css          # Responsive breakpoint overrides
│   │       └── theme.css               # Dark & light theme variables & inverted logo filters
│   └── dist/                           # [AUTO-GENERATED] Static production build target
│
├── [LEGACY / READ-ONLY DIRECTORIES]
├── tools/react-port/                   # [READ-ONLY] Historical migration scripts (extract.py, html2jsx.py)
├── *.html (root)                       # [READ-ONLY] Legacy vanilla HTML pages (index.html, companyos.html, etc.)
└── *.js (root, except server.js)       # [READ-ONLY] Legacy vanilla JavaScript files (app.js, home.js, etc.)
```

---

## 3. Protected Files & Boundary Rules

1. **Active Code Scope**:
   - Active development, feature work, bug fixes, and style updates must take place **exclusively** inside `web/src/` and `web/public/`.
2. **Never Edit Root Legacy Files**:
   - Do **NOT** edit root `.html` files (`index.html`, `buildos.html`, `companyos.html`, `campusos.html`, `procureos.html`, `legalos.html`, `fitos.html`, `travelos.html`, `cookies.html`, etc.).
   - Do **NOT** edit root script files (`app.js`, `home.js`, `products.js`, `carousel.js`, `extras.js`, etc.) or root `.css` files.
   - Do **NOT** edit scripts in `tools/react-port/` unless explicitly requested by the user.
3. **Never Edit Build Output Directly**:
   - Do **NOT** edit files in `web/dist/` directly. All changes must be made in `web/src/` or `web/public/` and compiled cleanly via `npm run build`.
4. **Automated Browser Checking Disabled**:
   - Do **NOT** launch automated browser subagents, headless browsers, or call automated UI preview tools.
   - Do **NOT** attempt automated checks against `localhost` servers.
   - UI layout and visual validation are handled manually by the user.

---

## 4. Brand Tokens & Theme Invariants

### Canonical Color Palette
| Token Name | HEX / RGBA Value | Usage |
| :--- | :--- | :--- |
| **Deep Navy** | `#09121E` | 3D Globe base sphere surface, dark contrast backgrounds |
| **Surface Navy** | `#0F1C2E` | Page background, cards, header background, modal sheets |
| **Primary Orange** | `#C9662F` | Primary accents, interactive indicators, radar rings, CTA highlights |
| **Lite Brand Orange** | `#F39C6B` | 3D Globe landmass polygons, atmosphere glow, pin borders |
| **Clean White** | `#F8FAFC` | Primary text on dark surfaces, pill label text over dark media |

### Pill Contrast Invariants
- **Over Dark Cards / Media Overlays**:
  Pill kickers, section markers, and eyebrows inside dark cards, media overlays, and sections with background imagery (e.g. `.dx-intro__card` *"Your business has grown..."*, `.ojx-hero`, `.ojx-cta`, and `.dx-kicker--light`) **MUST** retain:
  - Font color: `#F8FAFC` (`-webkit-text-fill-color: #F8FAFC`)
  - Background: `rgba(15, 28, 46, 0.75)` (dark glassmorphic backdrop)
  - Border: `1px solid rgba(243, 156, 107, 0.35)`
  - Backdrop blur: `blur(10px)`
  - **Invariant**: This styling **must never** flip to navy text, even when `html.light`, `body.light`, or `html[data-theme="light"]` is active.
- **On Plain Light Backgrounds**:
  Dark navy text (`#0F1C2E`) is strictly reserved for pills sitting on plain white/light body surfaces.

---

## 5. Development History & Completed Milestones

- **Branch Merges**: Merged feature branches `raj/service-pg-layout` and `raj/service-to-product-branch-continue-product-hover` into branch `v1`.
- **Static 3D Globe Implementation** (`web/src/components/InteractiveGlobe.jsx`):
  - Recolor continents to Lite Brand Orange (`#F39C6B`) with navy base sphere (`#09121E`) and atmosphere glow (`#F39C6B`).
  - Frozen static camera centered midway between North America and India (`lat: 38, lng: 8, altitude: 2.1`) with auto-rotation disabled.
  - Solid white great-circle trajectory arc (`#FFFFFF`, altitude `0.32`, stroke `1.8`) connecting USA (`40.7128, -74.0060`) and Bengaluru, India (`12.9716, 77.5946`).
  - Rich glassmorphic HTML location pin badges via `.htmlElementsData()` featuring inline SVG pin icons, uppercase labels ("USA" and "INDIA"), and anchored bases (`translate(-50%, -100%)`).
  - Removed redundant static bottom pill badge (`.ojx-globe-badge` "USA · INDIA"), keeping the 3D globe surface clean while retaining on-globe location pins and trajectory arc.
- **Typography Pill Contrast System** (`web/src/styles/typography.css`):
  - Established persistent `#F8FAFC` text on `rgba(15, 28, 46, 0.75)` glass for dark cards and image sections under light mode.
  - Constrained dark `#0F1C2E` pill text exclusively to plain light body backgrounds.
- **Header Mega-Menu Refinement** (`web/src/data/products.jsx`, `web/src/components/Header.jsx`, `web/src/styles/styles.css`):
  - Removed all "New" tag badges from product catalog items (University Management System, AI Proctoring, Property Intelligence).
  - Enforced `display: none !important` rule on `.eleks-subtab-new`.
- **Client Partner Logo Expansion** (`web/public/assets/logos/`, `web/src/generated/HomeMain.jsx`):
  - Integrated white brand-compliant version of **6SEN AI** (`6senai.png`) into both primary and loop tracks.
  - Integrated white brand-compliant version of **NOVUS APPAREL LIMITED** (`novus.png`) with brackets into both primary and loop tracks.
  - Configured inverted grayscale filters for light mode contrast and white monochrome glow for dark mode.
- **Footer Statutory Cleanup** (`web/src/generated/SiteChrome.jsx`, `tools/react-port/extract.py`):
  - Removed statutory `GSTIN: 29AAKF03656Q1ZB` tag from the site footer address column and extraction scripts.
- **Mega-Menu Dismissal & Route Navigation Teardown** (`web/src/components/Header.jsx`, `web/src/styles/styles.css`):
  - Added Route Change teardown via `useLocation()` listening to `location.pathname` to reset dropdown state and dismiss open menus on navigation.
  - Implemented explicit click dismissal on all mega-menu `<Link>` elements, action buttons, and container delegation via `closeMenu()`.
  - Added `onMouseLeave` reset on `.nav-item-has-mega` containers and global `mousedown`/`touchstart` document listeners to cleanly dismiss dropdowns on outside clicks.
  - Enforced `.nav-item-has-mega.is-closed > .eleks-mega-dropdown` CSS override rule (`opacity: 0 !important; visibility: hidden !important; pointer-events: none !important;`) preventing desktop `:hover` state from keeping dropdowns stuck open following item selection.
- **macOS Social Dock Component** (`web/src/components/SocialDock.jsx`, `web/src/generated/HomeMain.jsx`, `web/src/styles/home.css`):
  - Created interactive macOS-style dock with `framer-motion` cursor-proximity spring scaling (40px to 56px).
  - Implemented authentic brand icons for Instagram (radial gradient squircle + camera glyph), YouTube (official red `#FF0000` squircle + play triangle), and Google Maps Location (white squircle + `#EA4335` coral red pin with white center).
  - Formatted container as glassmorphic capsule (`rgba(9, 18, 30, 0.8)`, `border: 1px solid rgba(51, 65, 85, 0.6)`, `backdrop-filter: blur(24px)`, `rounded-full`).
  - Positioned directly beneath the bottom `"OJIX Engineering & Technology LLP · Bengaluru"` pill in the "Who We Are" statement card.
- **Mobile Product Showcase Full-Width Bottom Bar** (`web/src/generated/HomeMain.jsx`, `web/src/styles/mobile.css`, `web/src/styles/carousel.css`):
  - Converted product navigation tab capsule into a full-width bottom tray spanning 100% of the media card width on mobile (`w-full border-t border-white/10 bg-[#0F1C2E]/90 backdrop-blur-md px-4 py-3`).
  - Wrapped parent media card in `.ojx-hero__card-wrap` (`relative overflow-hidden rounded-2xl md:rounded-3xl md:contents`), ensuring the bottom tray seamlessly clips to the card's rounded bottom corners without separate pill geometry.
  - Formatted tab strip with `flex items-center gap-6 overflow-x-auto no-scrollbar` for smooth touch scrolling.
  - Positioned active tab indicator as a bottom accent line (`h-[2px] bg-[#C9662F]`) directly below the active tab title.
  - Preserved pure white text (`#F8FAFC` / `text-white`) for active tab and `text-slate-300 hover:text-white` for inactive tabs.
  - Desktop layout (`md:` / >= 768px) remains completely untouched and isolated via `md:contents`.
- **Mobile Service Preview Card & Arrow Suppression** (`web/src/generated/HomeMain.jsx`, `web/src/styles/home.css`):
  - Applied `hidden md:block` to `.dx-services__card` and its child `.dx-arrow--card` SVG.
  - Added responsive CSS guards (`@media (max-width: 767px)`) enforcing `display: none !important; margin: 0 !important;` to suppress both the preview card and the directional arrow on mobile.
  - Eliminated legacy mobile margin (`margin: 28px 0 96px;`) so the capabilities headline and lede paragraph transition directly into the interactive service list items (`.dx-services__list`) with natural 32px grid gap.
  - Preserved desktop rendering (`@media (min-width: 768px)`), retaining card geometry, box shadow, active service preview swaps, and arrow positioning untouched.
- **Mobile 11 Platforms Accordion Directory** (`web/src/components/PlatformsAccordion.jsx`, `web/src/components/ProductRows.jsx`, `web/src/styles/home.css`):
  - Created interactive mobile accordion (`PlatformsAccordion.jsx`) strictly active on mobile viewports (`< 768px` / `block md:hidden`).
  - Isolated existing 11-row desktop platform showcase inside `.ojx-platforms-desktop` (`hidden md:block`), preserving desktop styling and layout completely untouched (`>= 768px`).
  - Implemented Framer Motion (`AnimatePresence`, `motion.div`) for smooth height expansion and chevron rotation.
  - Formatted default state with the first platform ("01 Company Management System") expanded.
  - Closed state displays two-digit accent number (`#F39C6B`), clean white platform name (`#F8FAFC`), and rotating chevron arrow with ≥ 52px tap targets.
  - Open state reveals punchy headline, subtitle, descriptive summary, dark glassmorphic badge pills (`rgba(15, 28, 46, 0.75)` with `#F8FAFC` text), and full-width "Explore [Platform] →" link button with ≥ 44px tap targets.
  - Bound styling to brand tokens: deep navy background (`#0F1C2E`), active border outline (`#C9662F`), accent numbering (`#F39C6B`), and persistent contrast invariants.
- **Mobile 4 Security Guarantees Swipe Deck** (`web/src/components/SecuritySwipeDeck.jsx`, `web/src/generated/HomeMain.jsx`, `web/src/styles/home.css`):
  - Created horizontal touch swipe deck (`SecuritySwipeDeck.jsx`) strictly active on mobile viewports (`< 768px` / `block md:hidden`).
  - Isolated existing 4-card desktop sequential grid inside `.ojx-security-desktop` (`hidden md:block`), preserving desktop styling and grid layout completely untouched (`>= 768px`).
  - Implemented touch scroll snap track (`flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 no-scrollbar`) with card dimensions `w-[84vw] max-w-[320px] rounded-2xl bg-[#0F1C2E] border border-slate-800 p-5`.
  - Configured real-time scroll position detection linked to an interactive 4-dot indicator row, where active card morphs into a brand orange (`#C9662F`) pill indicator with direct tap-to-scroll navigation.
  - Rendered authentic pillar icons, titles, full regulatory copy, dark glassmorphic badge pills (`rgba(15, 28, 46, 0.75)` with `#F8FAFC` text), and "DPDP Architecture Guide →" link with persistent contrast invariants.
- **Google Workspace SMTP Configuration & Secret Protection** (`.env.local`, `.env.example`, `.gitignore`, `mailer.js`, `server.js`, `api/contact.js`, `api/admin/otp.js`):
  - Created `.env.local` with Google Workspace SMTP credentials and `CONTACT_RECEIVER=kiran@ojix.in`.
  - Created `.env.example` with sanitized template configuration tracked in version control.
  - Verified `.gitignore` blocks `.env`, `.env.local`, and `.env.*.local` from ever being staged or committed.
  - Verified client-side secret isolation: zero `SMTP_*` or credential variables leaked into `web/src/`.
  - Configured server-side Node.js fallback defaults (`process.env.SMTP_HOST || 'smtp.gmail.com'`, `Number(process.env.SMTP_PORT) || 465`, `process.env.SMTP_SECURE === 'true'`, `auth: { user, pass }`).
  - Added seamless `.env.local` override loading in `mailer.js` and `server.js` for local runtime execution.
- **Dedicated Inbound & Admin OTP Routing to kiran@ojix.in** (`api/contact.js`, `api/admin/send-otp.js`, `api/admin/verify-otp.js`, `api/admin/otp-store.js`, `admin-routes.js`, `mailer.js`, `web/src/legacy/extras.js`, `web/public/admin.html`, `web/public/admin.js`):
  - Configured `api/contact.js` to dispatch client inquiries directly to `kiran@ojix.in` with branded HTML cards, customer acknowledgment, and `replyTo: email`.
  - Created `api/admin/send-otp.js` and `api/admin/verify-otp.js` with shared `otp-store.js`, generating cryptographically secure 6-digit OTPs with 5-minute expiry delivered directly to `kiran@ojix.in`.
  - Enforced strict authorization restricting administrative login requests to `kiran@ojix.in`.
  - Updated `web/src/legacy/extras.js` payload with dual parameter aliasing (`{ name, email, phone, company, service, message }`) and replaced disruptive browser alerts with inline feedback states.
  - Aligned `web/public/admin.html` and `web/public/admin.js` to reference `kiran@ojix.in` and 5-minute validity window.
- **Admin OTP Nodemailer Configuration & Error Transparency** (`api/admin/send-otp.js`, `admin-routes.js`, `mailer.js`, `api/contact.js`):
  - Configured Nodemailer transporters across serverless functions and Express routes to use `service: 'gmail'` for reliable Google Workspace dispatch.
  - Implemented dynamic whitespace stripping for `process.env.SMTP_PASS` via `.replace(/\s+/g, '')`.
  - Added strict credential validation guarding against missing `SMTP_USER` or `SMTP_PASS` prior to dispatch attempts.
  - Integrated `await transporter.verify()` connection pre-flight validation.
  - Replaced masked generic 500 error responses with transparent `err.message` reporting to eliminate silent failure ambiguity.
- **Project Inquiry Modal Contrast & Resilient Submission Handling** (`web/src/legacy/extras.js`, `web/src/styles/extras.css`, `server.js`, `api/contact.js`, `db.js`):
  - Injected `[&>option]:bg-[#0F1C2E] [&>option]:text-white` onto the "Interested in" `<select>` and explicit CSS rules `.ojx-pm__f select option { background-color: #0F1C2E !important; color: #F8FAFC !important; }` to eliminate white-on-white illegibility in browser dropdowns.
  - Harmonized payload mapping across frontend and backend for `{ name, full_name, email, phone, company, organization, service, interested_in, interest, interestedIn, message, requirement, consent_agreed, consent }`.
  - Encapsulated database queries and mail operations in isolated `try/catch` blocks in `/api/contact`, falling back seamlessly to local sovereign storage (`db.recordInquiry`) when PostgreSQL is unconfigured or offline.
  - Replaced masked generic 500 error strings with transparent `error: err.message` responses and connected frontend `res.error` rendering.
- **Product Page Transitions, Cross-Link Routing & Scroll Restoration Hardening** (`web/src/components/Page.jsx`, `web/src/components/ProductBits.jsx`, `web/src/legacy/product.js`, `web/src/data/products.jsx`, `server.js`):
  - **Scroll Restoration to Top (y: 0)**: Resolved the bug where navigating from one product to the next via bottom transition banners (e.g. Company OS -> Nyaya Sethu) left the incoming page anchored at the bottom (y ≈ 4500px). In `Page.jsx`, enforced `document.documentElement.style.scrollBehavior = "auto"` and `window.scrollTo({ top: 0, left: 0, behavior: "instant" })` across both `useLayoutEffect` and route-change `useEffect` for all non-anchor transitions, bypassing smooth-scroll cancellation.
  - **Bottom Banner Immediate Scroll Reset**: In `ProductBits.jsx` (`NextProduct`), added an instant scroll reset handler to `pd-next__link` and in `product.js` at the 900ms transition completion before `__navigate()`. Added cleanup of lingering `.px-open` overlays and `px-opening` classes on unmount to eliminate FOUC, blank flash, or layout jump during route swaps.
  - **Product Route & Alias Resolution**: Expanded `PRODUCT_REDIRECTS` in `products.jsx` and `server.js` to map `/nyaya-sethu`, `/products/nyaya-sethu`, `/products/legalos`, and all `/products/<slug>` permutations directly to their canonical destinations (`/legalos`, `/company-management-system`, etc.), eliminating 404s and URL hash collisions.
  - **Production Build Verification**: Full test suite and production build verified clean via `npm test` and `npm run build` with exit code 0.
- **Product Overview Section Showcase Standardization** (`web/src/components/ProductDevicePreview.jsx`, `web/src/components/ProductMockups.jsx`, `web/src/styles/product.css`, `web/src/generated/products/LegalOS.jsx`, `web/src/pages/ProductTemplate.jsx`, `web/src/generated/products/ConstructionHub.jsx`, `web/src/generated/products/TravelOS.jsx`, `web/src/generated/products/FitOS.jsx`, `web/src/generated/DpdpMain.jsx`):
  - **Unified Dual-Device Architecture**: Standardized the "01 OVERVIEW" section across all target product pages (Nyaya Sethu, AI Proctoring, Construction Hub, TravelOS, FitOS, and DPDP Privacy Vault) to match the layout architecture of `/company-management-system`.
  - **High-Contrast Dark Glass Mockup UI**: Created dedicated domain-specific desktop and mobile preview components in `ProductMockups.jsx` adhering strictly to dark glass UI tokens (`rgba(15, 28, 46, 0.75)` surface, `#09121E` deep navy desktop frame, `#C9662F` orange accents, and `#F8FAFC` clean white text):
    - **Nyaya Sethu**: Cause list sync badge (`Synced 7:00 PM`), 3 KPIs (7 Hearings today, 38 Active matters, ₹1.2L Unbilled fees), today's hearing schedule with court hall / item chips, and mobile court alert card.
    - **AI Proctoring**: Live session badge (`Mid-term · 2,348 Live`), 3 KPIs (2,348 Candidates live, 98.6% Integrity score, 17 Flags to review), real-time invigilation logs (tab switch, face mismatch, audio anomaly), and mobile critical alert card.
    - **Construction Hub**: Active sites badge (`8 Sites Live`), 3 KPIs (8 Active sites, 420 Workers logged, 87.4% Budget on track), site milestones & concrete indent logs, and mobile material gate entry card.
    - **Travel OS**: Live booking engine badge (`126 Trips this month`), 3 KPIs (126 Active bookings, 340 Travellers en route, ₹4.8L Claims processed), live PNR tracking & hotel voucher status, and mobile flight boarding card.
    - **Fit OS**: Multi-branch badge (`4 Branches Active`), 3 KPIs (3,840 Active members, 642 Check-ins today, 94.2% Renewal rate), biometric turnstile check-in logs & studio session status, and mobile turnstile QR entry card.
    - **DPDP Privacy Vault**: Statutory compliance badge (`DPDP Act 2023 Compliant`), 3 KPIs (18,420 Active consents, 42 Principal requests, 100% Sovereign audit), immutable consent & erasure audit logs, and mobile verified consent notice card.
  - **Responsive Layout & Mobile Alignment**: Enforced 2-column 50/50 desktop layout (`pd-intro__grid`), with copy on the left and browser window with overlapping mobile phone on the right. On mobile viewports (≤ 768px), gracefully hidden the floating mobile frame (`pd-mobile-device-preview`) and expanded the desktop browser window to 100% width with zero horizontal overflow (`overflow-x`).
  - **Build & Test Verification**: Verified clean compilation via `npm test` and `npm run build` with exit code 0.
- **Product Device Preview Shell Standardization & High-Resolution Vector Assets** (`web/public/assets/images/products/*`, `web/src/components/ProductDevicePreview.jsx`, `web/src/data/products.jsx`, `web/src/data/newProducts.js`, `web/src/styles/product.css`, `web/src/generated/products/LegalOS.jsx`, `web/src/pages/ProductTemplate.jsx`, `web/src/generated/products/ConstructionHub.jsx`, `web/src/generated/products/TravelOS.jsx`, `web/src/generated/products/FitOS.jsx`, `web/src/generated/DpdpMain.jsx`):
  - **Standardized Vector Mockup Assets**: Generated production-grade, resolution-independent SVG desktop dashboards (16:10 aspect ratio, 1600x1000) and mobile companion screens (9:19 ratio, 400x860) across all previously missing platforms:
    - **Nyaya Sethu / Legal OS**: `nyaya-sethu-device.svg`, `OJIX-Analytics-Dashboard-Workspace.png`, `nyaya-sethu-mobile.svg`, `legalos-mobile.svg` (cause lists, CNR tracking, case matters, courtroom status).
    - **AI Proctoring**: `proctoring-device.svg`, `ai-proctoring-device.svg`, `proctoring-mobile.svg`, `ai-proctoring-mobile.svg` (live multi-camera wall, face-tracking bounding boxes, malpractice flags).
    - **Construction Hub**: `construction-device-v2.png`, `construction-hub-device.svg`, `construction-mobile.svg`, `construction-hub-mobile.svg` (site logistics, BOQ tracking, transit mixer gate entries).
    - **TravelOS**: `travel-device.svg`, `travelos-device.svg`, `travel-mobile.svg`, `travelos-mobile.svg` (flight PNR live tracking, airport cab dispatch, corporate hotel vouchers).
    - **FitOS**: `fitos-device.svg`, `fitos-mobile.svg` (turnstile biometric telemetry, Indiranagar flagship, recurring UPI renewals).
    - **DPDP Privacy Vault**: `dpdp-device.svg`, `dpdp-mobile.svg` (sovereign data enclave, SHA-256 immutable ledger, verifiable citizen consent notices).
  - **Component & Catalog Parity**: Enhanced `ProductDevicePreview.jsx` with dual parameter aliasing (`desktopSrc`/`desktopImg`, `mobileSrc`/`mobileImg`, `alt`/`desktopAlt`/`mobileAlt`, `variant="dark"`). Standardized catalog entries in `products.jsx` and `newProducts.js` with validated paths for `desktopImage`, `mobileImage`, and `previewUrl`.
  - **Mid-Tier & Clipping Protection**: Enforced `overflow-x: clip;` on `.pd-intro` and added `@media (min-width: 769px) and (max-width: 1280px)` breakpoint protection in `product.css` to dock the overlapping phone companion cleanly without horizontal scrollbars.
  - **Build & Distribution Verification**: Verified exit code 0 on `npm test` and `npm run build`; confirmed all SVG assets bundle cleanly into `web/dist/`.

- **Frontend Codebase Audit, Dead Code Removal & Structural Optimization** (`web/src/styles/home.css`, `web/src/styles/react-additions.css`, `web/src/App.jsx`, `web/src/components/*`):
  - **Comprehensive Reference & Dependency Verification**: Audited package dependencies, component tree, stylesheets, legacy runtime modules, and public static assets. Verified 0 unused imports across all JS/JSX files in `web/src/`.
  - **Dead Code & Residual Selector Elimination**:
    - Removed obsolete `.eleks-subtab-new` declaration from `web/src/styles/react-additions.css`, matching the removal of "New" badges from `products.jsx` and `Header.jsx`.
    - Removed residual `.dx-chapter`, `.dx-panel`, and `.dx-card` rules from an early experimental chapter layout in `web/src/styles/home.css` (lines 386–515, and corresponding responsive media queries).
    - Removed dead `.hero.pillar-hero-21` and `.hero-21-title` styles in `web/src/styles/home.css`, superseding legacy selectors in favor of canonical `.pd-hero h1.pd-hero__name` in `product.css`.
  - **Bundle Footprint Optimization**: Reduced the production CSS bundle from 653.65 kB to 649.62 kB (-4.03 kB net / -700 B gzipped) without altering UI/UX or responsive design.
  - **Asset & Code Categorization**: Formally categorized assets into SAFE TO REMOVE, NEEDS MANUAL REVIEW (portfolio mockups, variant brand assets), and MUST KEEP.
  - **Compilation & Test Verification**: Verified clean build and test suite passes via `npm test` and `npm run build` with exit code 0.
- **Unused Static Image Assets Pruning & Storage Optimization** (`web/public/assets/`, `web/src/data/products.jsx`):
  - **Comprehensive Image Reference Verification**: Traced all 173 static image files in `web/public/assets/` across code files, router tables, product catalogs, service catalogs, `index.html`, `manifest.webmanifest`, and dynamic theme swaps.
  - **86 Unreferenced Image Files Removed**:
    - Discarded generated hero & showcase mockups (13 files in `assets/generated/`, ~1.7 MB).
    - Legacy portfolio mockups (8 files in `assets/images/portfolio/`, ~3.1 MB).
    - Obsolete product `*-ui.webp` files replaced by modern UI mockups (8 files in `assets/images/products/`, ~617 KB).
    - Redundant product directories and unused mockups (19 files across `construction/`, `nyaya-sethu/`, `travel/`, and draft mockups in `dpdp/`, `fitos/`, `ai-proctoring/`, ~3.6 MB).
    - Unused partner logo duplicates (8 files in `assets/clients/` and `assets/logos/`, ~670 KB).
    - Unreferenced brand identity renders and legacy favicon duplicates (24 files in `assets/`, ~1.4 MB).
    - Removed empty residual subdirectories (`portfolio/`, `construction/`, `nyaya-sethu/`, `travel/`, and empty `darkmode` folders).
  - **Case-Sensitivity Hardening**: Aligned `products.jsx` line 24 to use canonical lowercase `company-os-mobile.jpeg`, guarding against Linux/Unix deployment case-sensitivity mismatches.
  - **Storage & Distribution Impact**: Freed **10.48 MB** of disk and bundle space; reduced image count in `web/public/` and `web/dist/` from 173 to exactly 86 actively referenced images.
  - **Build Verification**: Verified zero missing asset regressions; `npm test` and `npm run build` passed with exit code 0.

---

## 6. Active Roadmap & Pending Tasks

1. **Marquee Infinite Loop Verification**:
   - Ensure the logo count and spacing between the primary track and duplicate loop track in `.dx-logos__track` maintain 100% smooth, continuous scrolling across mobile and desktop breakpoints.
2. **Branch Push Verification**:
   - Ensure local changes on `Version1` are verified and synchronized cleanly to remote repository `ojix-admin/OJIX_Website`.
3. **Local Production Build Verification**:
   - Guarantee `npm run build` runs cleanly without Vite bundle errors or chunk regressions.

---

## 7. Command Guardrails & Standard Workflow

### 1. Non-Interactive Command Execution
- Never execute commands that open interactive terminal sessions (e.g., `git merge` without flags, `nano`, `vim`). Always pass non-interactive flags like `--no-edit`.
- Do not run continuous blocking dev servers (`node server.js`, `npm run dev`) unless specifically requested as a daemon task.

### 2. Mandatory Verification Step
- After every set of file edits, run:
  ```powershell
  npm run build
  ```
- Any commit or task completion must verify exit code `0` and confirmation that assets were emitted into `web/dist/`.

### 3. Agent Maintenance Responsibility
- Every incoming AI agent working on this repository **must** read this document first.
- As new tasks, fixes, and milestones are completed, incoming agents **must update Section 5 (Development History) and Section 6 (Active Roadmap)** to maintain cumulative repository context.

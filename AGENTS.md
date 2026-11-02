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

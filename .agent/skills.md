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


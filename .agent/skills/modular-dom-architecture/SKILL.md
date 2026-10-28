---
name: ojix-modular-dom-architecture
description: Rules for maintaining vanilla HTML/CSS/JS modularity across all OJIX pages (index.html, companyos.html, legalos.html, procureos.html, etc.).
---

# OJIX Clean Modular CSS & Vanilla JS DOM Architecture

This skill governs the development and maintenance of vanilla HTML pages, modular CSS stylesheets, and vanilla JavaScript interaction patterns in the OJIX workspace.

## 1. Page & Layout Uniformity
All top-level product and informational pages must share uniform structure:
- `index.html` (Home hub)
- `companyos.html`, `legalos.html`, `procureos.html`, `campusos.html`, `buildos.html`, `travelos.html`, `fitos.html`
- `products.html`, `cookies.html`, `dpdp-compliance.html`, `admin.html`

### Mandatory Shell & Semantic Hierarchy
- Every page must contain:
  1. Semantic `<header class="site-header">` with standard navigation.
  2. Exactly one `<h1>` containing the primary value proposition.
  3. Structured `<main id="main-content">` containing self-contained `<section class="shell">` blocks.
  4. Standardized `<footer>` with legal disclaimers, DPDP statutory badges, and copyright notices.
  5. Accessibility skip link: `<a href="#main-content" class="skip-link">Skip to main content</a>`.

## 2. CSS Specificity & Modularity Guidelines
- **Avoid Global `!important` escalation**:
  Reserve `!important` solely for intentional state overrides (such as `.is-hidden`, `.is-open`, or mobile override layers).
- **Style Order in HTML `<head>`**:
  1. `styles.css` (Base design system & tokens)
  2. `typography.css` (Fonts, weights, scales)
  3. Page-specific CSS (`home.css` or `product.css`)
  4. Component CSS (`carousel.css`, `motion.css`)
  5. Breakpoint overrides: `responsive.css` then `mobile.css`
- **Component Class Names**:
  Prefix reusable custom modules with `ojx-` or `ojix-` to prevent collisions (e.g., `.ojx-hero`, `.ojx-card`, `.ojx-badge`).

## 3. Vanilla JavaScript DOM Practices
- **No Heavy External DOM Libraries**:
  All client logic must remain dependency-free vanilla JS.
- **Event Delegation**:
  Attach interactive event listeners at container levels where elements are dynamic (e.g., FAQ accordions, tab switchers):
  ```js
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-accordion-trigger]');
    if (!trigger) return;
    const item = trigger.closest('.accordion-item');
    if (item) item.classList.toggle('is-open');
  });
  ```
- **Lifecycle & Script Execution**:
  Load scripts with `defer` at the end of the `<body>`:
  ```html
  <script src="app.js" defer></script>
  ```
- **Performance Guardrails**:
  - Throttle or debounce `scroll` and `resize` handlers using `requestAnimationFrame`.
  - Use `IntersectionObserver` for scroll-triggered reveal animations and lazy loading rather than manual scroll position polling.

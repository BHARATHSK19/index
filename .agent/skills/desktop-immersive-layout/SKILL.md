---
name: ojix-desktop-immersive-layout
description: Guidelines and patterns for OJIX full-bleed desktop layouts, hero sections, fluid typography scaling with clamp(), and high-contrast dark theme aesthetics.
---

# OJIX Desktop Immersive & Full-Bleed Layout Design

This skill provides architectural rules and CSS patterns for engineering immersive desktop interfaces across OJIX enterprise platforms (CompanyOS, LegalOS, ProcureOS, CampusOS, BuildOS, TravelOS, FitOS).

## 1. Visual & Color Foundation (High-Contrast Dark & Enterprise Contrast)
- **Primary Navy Palette**:
  - Deep Surface: `#09121E` (`--navy-deep`)
  - Primary Surface / Base Navy: `#0F1C2E` (`--navy`)
  - Elevated Container / Hover: `#16263B` (`--navy-light`)
- **Accent Orange**:
  - Core Brand Orange: `#C9662F` (`--orange`)
  - Deep Amber / Active: `#B65525` (`--orange-deep`)
  - Subtle Highlights: `rgba(201, 102, 47, 0.08)` (`--orange-subtle`)
  - Glow Effects: `rgba(201, 102, 47, 0.22)` (`--orange-glow`)
- **Typography Tokens**:
  - Headings: `'Manrope', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Body: `'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Monospace / Stat Data: `'JetBrains Mono', monospace`

## 2. Full-Bleed & Viewport Scaled Layouts
- **Large Viewport Max-Widths**:
  - Default shell container: `max-width: 1240px` with responsive padding `clamp(20px, 4vw, 48px)`.
  - Full-bleed hero banners & media backdrops: `width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw)`.
  - Prevent accidental horizontal scrolling by enforcing `overflow-x: clip` (prefer over `overflow-x: hidden` to preserve `position: sticky`).

## 3. Fluid Typography Scaling with `clamp()`
Never use static `px` font sizes for prominent headers or lede text. Always enforce fluid scaling:
- **Hero Title**:
  ```css
  font-size: clamp(40px, 6.5vw, 84px);
  line-height: 1.05;
  letter-spacing: -0.035em;
  ```
- **Section Headers (H2)**:
  ```css
  font-size: clamp(28px, 3.8vw, 48px);
  line-height: 1.15;
  letter-spacing: -0.025em;
  ```
- **Sub-headers & Card Titles (H3)**:
  ```css
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.25;
  ```
- **Lede / Sub-headline Copy**:
  ```css
  font-size: clamp(16px, 1.35vw, 20px);
  line-height: 1.5;
  ```

## 4. Immersive Glassmorphism & Elevated Surfaces
For dark mode modules, floating toolbars, and mega-menus:
```css
.ojix-glass-surface {
  background: rgba(15, 28, 46, 0.75);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(229, 232, 236, 0.12);
  box-shadow: 0 20px 48px rgba(9, 18, 30, 0.45);
}
```

## 5. Desktop Grid & Interactive States
- Multi-column product layouts must scale smoothly:
  - 4 columns on displays ≥1280px (`repeat(4, minmax(0, 1fr))`)
  - 3 columns on displays 1024px–1279px (`repeat(3, minmax(0, 1fr))`)
- Micro-interactions:
  - Cards should elevate with subtle transform: `transform: translateY(-4px)` with spring easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Glow borders: transition `border-color` and `box-shadow: 0 0 24px var(--orange-glow)`.

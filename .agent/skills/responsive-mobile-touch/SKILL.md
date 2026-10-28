---
name: ojix-responsive-mobile-touch
description: Best practices for OJIX mobile views (≤768px and ≤1023px), touch carousels, mobile.css, responsive.css, and carousel.css touch gestures.
---

# OJIX Responsive Mobile UI & Touch Carousel Optimization

This skill provides guidelines and patterns for mobile breakpoints, touch carousel mechanics, safe-area insets, and gesture responsiveness.

## 1. Breakpoint Architecture & Hierarchy
The OJIX stylesheet pipeline cascades across:
1. `styles.css`: Base variables, utility classes, common components.
2. `responsive.css`: Breakpoints for desktop down to tablet (1024px, 900px, 768px).
3. `mobile.css`: Mobile-first shell overrides (≤1023px and ≤768px), full-screen hamburger menu drawer.
4. `carousel.css`: Touch carousel viewport, slides, pagination tabs, and autoplay bars.

**Standard Breakpoints**:
- Mobile Compact: `max-width: 480px`
- Mobile Standard / Tablet Portrait: `max-width: 768px`
- Tablet Landscape / Touch Laptops: `max-width: 1023px`
- Desktop Shell: `min-width: 1024px`

## 2. Touch Carousels & Gesture Mechanics (`carousel.css`, `carousel.js`)
- **Scroll Snap & Touch Scrolling**:
  - Always pair CSS Scroll Snap with passive touch listeners:
  ```css
  .ojx-carousel-track {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }
  .ojx-carousel-track::-webkit-scrollbar {
    display: none;
  }
  .ojx-carousel-slide {
    flex: 0 0 100%;
    min-width: 100%;
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }
  ```
- **Touch Event Optimization in JS**:
  - Always register touch event listeners with `{ passive: true }` unless `preventDefault()` is required to suppress native scroll.
  - Compute horizontal swipe distance `deltaX = touchEndX - touchStartX`. Trigger slide change only if `Math.abs(deltaX) > 40px` and horizontal movement exceeds vertical movement (`Math.abs(deltaX) > Math.abs(deltaY)`).

## 3. Mobile Navigation & Tap Target Hygiene
- **Minimum Tap Dimensions**: Minimum `44px x 44px` for touch targets (buttons, links, carousel toggles, hamburger trigger).
- **Safe Area Insets**:
  Always respect notches and home indicators on iOS and modern Android:
  ```css
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  padding-top: env(safe-area-inset-top);
  ```
- **Mobile Gutters**: Standardize shell gutters to `20px` (or `16px` on screens ≤375px) via `.shell { padding-left: 20px; padding-right: 20px; }`.

## 4. Mobile Stacking Rules
- 4-column product grids (`.ojix-products-grid`) must collapse cleanly:
  - Displays ≤768px: Single column (`grid-template-columns: 1fr`) or horizontal touch snap slider.
  - Displays 769px–1023px: 2 columns (`repeat(2, minmax(0, 1fr))`).
- Floating CTA bars and bottom navigation drawers must avoid covering input fields when virtual keyboards open.

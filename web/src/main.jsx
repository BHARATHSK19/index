import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Site styles, in the order the original pages loaded them.
import "./styles/styles.css";
import "./styles/responsive.css";
import "./styles/typography.css";
import "./styles/motion.css";
import "./styles/mobile.css";
import "./styles/extras.css";
import "./styles/home.css";
import "./styles/products.css";
import "./styles/product.css";
import "./styles/carousel.css";
import "./styles/cookies.css";
import "./styles/theme-auto.css";
import "./styles/theme.css";
import "./styles/react-additions.css";

// The old static site registered a service worker that cached pages. Remove it and its caches
// so returning visitors always get the current React build.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
}
if (window.caches && caches.keys) {
  caches
    .keys()
    .then((keys) => keys.filter((k) => k.indexOf("ojix-site-") === 0).forEach((k) => caches.delete(k)))
    .catch(() => {});
}

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

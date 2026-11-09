import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import Header from "./Header.jsx";
import { Newsletter, Footer, Modals, MobileServicesModal } from "../generated/SiteChrome.jsx";
import { createScope } from "../lib/scope.js";
import { applyHead } from "../lib/head.js";
import initMotion from "../legacy/motion.js";

// The intro loader shows once per browser session, on the first page only.
let introPending = (() => {
  try {
    const force = window.location.search.indexOf("intro") !== -1;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return force || (!reduce && sessionStorage.getItem("ojx-intro-seen") !== "1");
  } catch (e) {
    return false;
  }
})();

const scrollPositions = new Map();

/** One page of the site: shared chrome + page body + the page's behaviour modules.
 * Behaviour modules (legacy/*.js) run after the page is in the DOM and are fully torn down on
 * unmount, so moving between pages behaves exactly like a fresh page load. */
export default function Page({ meta, scripts, active, scrollProgress = false, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const navType = useNavigationType();
  const showIntro = introPending;

  useLayoutEffect(() => {
    introPending = false;
    const html = document.documentElement;
    const body = document.body;
    const htmlClass = html.className;
    const bodyClass = body.className;
    const bodyKids = new Set(body.children);

    try {
      if (sessionStorage.getItem("ojx-from-products") === "1") {
        html.setAttribute("data-from-px", "1");
        sessionStorage.removeItem("ojx-from-products");
      }
    } catch (e) {
      /* storage blocked */
    }

    const key = location.key;
    if (navType === "POP" && scrollPositions.has(key)) {
      const y = scrollPositions.get(key);
      requestAnimationFrame(() => window.scrollTo(0, y));
    } else if (!location.hash) {
      window.scrollTo(0, 0);
    }
    applyHead(meta, location.pathname);

    const go = (to, opts) => {
      const u = new URL(String(to), window.location.href);
      if (u.origin !== window.location.origin) {
        window.location.href = u.href;
        return;
      }
      navigate(u.pathname + u.search + u.hash, opts);
    };
    const scope = createScope(go);
    const mods = showIntro ? [initMotion, ...scripts] : scripts;
    mods.forEach((init) => {
      try {
        init(scope);
      } catch (err) {
        console.error("[ojix] page behaviour failed:", err);
      }
    });

    return () => {
      scrollPositions.set(key, window.scrollY);
      scope.dispose();
      Array.from(body.children).forEach((n) => {
        if (!bodyKids.has(n) && n.id !== "root") n.remove();
      });
      html.className = htmlClass;
      body.className = bodyClass;
      html.removeAttribute("data-from-px");
      body.style.removeProperty("overflow");
      html.style.removeProperty("overflow");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update document head & handle smooth section and anchor scrolling on route/hash changes
  useEffect(() => {
    applyHead(meta, location.pathname);

    // Prevent background scrolling if an inquiry modal is currently active
    const isModalOpen = typeof document !== "undefined" && (
      document.body.classList.contains("ojx-pm-open") ||
      document.body.classList.contains("modal-open") ||
      Boolean(document.querySelector(".ojx-pm.is-open"))
    );
    if (isModalOpen) return;

    const hash = location.hash ? location.hash.replace(/^#/, "") : null;
    const path = location.pathname.replace(/\/$/, "") || "/";
    const SECTION_MAP = {
      "/about": "about",
      "/contact": "contact",
      "/discuss": "contact",
      "/inquiry": "contact",
      "/enquiry": "contact",
      "/start-a-project": "contact",
      "/process": "process",
      "/who-we-are": "who-we-are",
      "/security": "security-trust",
      "/industries": "platforms"
    };

    const targetId = hash || SECTION_MAP[path];
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        requestAnimationFrame(() => {
          const modalActive = typeof document !== "undefined" && (
            document.body.classList.contains("ojx-pm-open") ||
            document.body.classList.contains("modal-open") ||
            Boolean(document.querySelector(".ojx-pm.is-open"))
          );
          if (!modalActive) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    } else if (path === "/" && !hash && navType !== "POP") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash, meta, navType]);

  return (
    <div className="ojx-page" id="top">
      {showIntro ? (
        <div className="ojx-intro" id="ojx-intro" aria-hidden="true">
          <div className="ojx-intro__inner">
            <img className="ojx-intro__mark" src="/assets/ojix-navbar-logo.svg" alt="OJIX" width="280" height="135" />
            <span className="ojx-intro__count">0%</span>
          </div>
        </div>
      ) : null}
      {scrollProgress ? <div className="scroll-progress" id="scroll-progress"></div> : null}
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="topline">
        <span className="topline-dot"></span> OJIX Engineering &amp; Technology LLP <span className="topline-sep">·</span> Bengaluru, India
      </div>
      <Header active={active} />
      {children}
      <Newsletter />
      <Footer />
      <Modals />
      <MobileServicesModal />
    </div>
  );
}

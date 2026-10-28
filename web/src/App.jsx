import { lazy, Suspense, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Page from "./components/Page.jsx";
import META from "./generated/pageMeta.json";
import { PRODUCTS, PRODUCT_REDIRECTS } from "./data/products.jsx";
import { NEW_PRODUCT_PAGES } from "./data/newProducts.js";
import SERVICE_SLUG_LIST from "./data/serviceSlugs.json";

import HomeMain from "./generated/HomeMain.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ServicesMain from "./generated/ServicesMain.jsx";
import CookiesMain from "./generated/CookiesMain.jsx";
import DpdpMain from "./generated/DpdpMain.jsx";
import ProductTemplate from "./pages/ProductTemplate.jsx";
import NotFound from "./pages/NotFound.jsx";
import CompanyManagementSystem from "./generated/products/CompanyManagementSystem.jsx";
import LegalOS from "./generated/products/LegalOS.jsx";
import ProcureOS from "./generated/products/ProcureOS.jsx";
import SchoolERP from "./generated/products/SchoolERP.jsx";
import ConstructionHub from "./generated/products/ConstructionHub.jsx";
import TravelOS from "./generated/products/TravelOS.jsx";
import FitOS from "./generated/products/FitOS.jsx";

import app from "./legacy/app.js";
import extras from "./legacy/extras.js";
import home from "./legacy/home.js";
import products from "./legacy/products.js";
import product from "./legacy/product.js";
import carousel from "./legacy/carousel.js";
import theme from "./legacy/theme.js";
import cookies from "./legacy/cookies.js";

// The 81 service pages share one template; its data (~470 KB) loads only when a service page opens.
const ServicePage = lazy(() => import("./pages/ServicePage.jsx"));
const SERVICE_SLUGS = new Set(SERVICE_SLUG_LIST);

// Behaviour modules per page type, in the same order the original pages loaded their scripts.
const SCRIPTS = {
  home: [carousel, home, extras, app, theme, cookies],
  products: [home, extras, products, app, theme, cookies],
  services: [extras, home, products, app, theme, cookies],
  detail: [extras, home, product, app, theme, cookies],
  plain: [home, extras, app, theme, cookies],
};

// Home-page sections that also have their own URL (scrolls to the section).
const HOME_SECTIONS = new Set(["/", "/about", "/contact", "/process", "/security", "/industries", "/who-we-are"]);

const EXISTING_PRODUCT_PAGES = {
  "company-management-system": CompanyManagementSystem,
  legalos: LegalOS,
  procureos: ProcureOS,
  "school-erp": SchoolERP,
  "construction-hub": ConstructionHub,
  travelos: TravelOS,
  fitos: FitOS,
};

/** Work out which page a URL is. `key` decides when React mounts a fresh page. */
export function resolve(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (/\.html$/.test(path)) {
    const clean = path.replace(/\/index\.html$/, "/").replace(/\.html$/, "") || "/";
    return { redirect: PRODUCT_REDIRECTS[clean] || clean };
  }
  if (PRODUCT_REDIRECTS[path]) return { redirect: PRODUCT_REDIRECTS[path] };
  if (HOME_SECTIONS.has(path)) return { key: "home", kind: "home", meta: { ...META["/"], jsonLd: [] }, active: "home", el: <HomeMain /> };
  if (path === "/products") return { key: path, kind: "products", meta: META["/products"] || { title: "Products | OJIX" }, active: "products", el: <ProductsPage /> };
  if (path === "/services") return { key: path, kind: "services", meta: META["/services"], active: "services", progress: true, el: <ServicesMain /> };
  if (path === "/cookies") return { key: path, kind: "plain", meta: META["/cookies"], el: <CookiesMain /> };
  if (path === "/dpdp-compliance") return { key: path, kind: "detail", meta: META["/dpdp-compliance"], active: "products", progress: true, el: <DpdpMain /> };
  const slug = path.slice(1);
  if (EXISTING_PRODUCT_PAGES[slug]) {
    const C = EXISTING_PRODUCT_PAGES[slug];
    return { key: path, kind: "detail", meta: META[path], active: "products", progress: true, el: <C /> };
  }
  if (NEW_PRODUCT_PAGES[slug]) {
    const d = NEW_PRODUCT_PAGES[slug];
    const p = PRODUCTS.find((x) => x.slug === slug);
    const meta = { ...d.meta, canonical: "https://ojix.in" + path, ogImage: "https://ojix.in" + p.heroImg };
    return { key: path, kind: "detail", meta, active: "products", progress: true, el: <ProductTemplate data={d} /> };
  }
  const m = path.match(/^\/services\/([a-z0-9-]+)$/);
  if (m && SERVICE_SLUGS.has(m[1])) {
    return { key: path, kind: "detail", meta: null, serviceSlug: m[1], active: "services", progress: true, el: <ServicePage slug={m[1]} /> };
  }
  return { key: "404:" + path, kind: "plain", meta: { title: "Page not found | OJIX" }, el: <NotFound /> };
}

/** Internal <a href> clicks become client-side navigations (after the page's own handlers ran). */
function useLinkInterception() {
  const navigate = useNavigate();
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const raw = a.getAttribute("href") || "";
      if (/^(mailto:|tel:|javascript:|sms:|whatsapp:)/i.test(raw)) return;
      const u = new URL(a.href, window.location.href);
      if (u.origin !== window.location.origin) return;
      if (/^\/(api|admin)(\/|$)/.test(u.pathname) || /\.[a-z0-9]{2,5}$/i.test(u.pathname.replace(/\.html$/, ""))) return;
      if (u.pathname === window.location.pathname && u.search === window.location.search) {
        if (u.hash) return; // in-page anchor: let the browser jump
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      e.preventDefault();
      navigate(u.pathname + u.search + u.hash);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [navigate]);
}

export default function App() {
  useLinkInterception();
  const location = useLocation();
  const r = resolve(location.pathname);
  if (r.redirect) return <Navigate to={r.redirect + location.search + location.hash} replace />;
  return (
    <Suspense fallback={<div className="ojx-page-loading" aria-busy="true" />}>
      <ServiceMetaPage key={r.key} r={r} />
    </Suspense>
  );
}

function ServiceMetaPage({ r }) {
  return (
    <Page meta={r.meta || serviceMeta(r.serviceSlug)} scripts={SCRIPTS[r.kind]} active={r.active} scrollProgress={!!r.progress}>
      {r.el}
    </Page>
  );
}

// Service meta lives with the (lazy) service data; ServicePage registers it when its chunk loads.
const serviceMetaCache = (window.__ojixServiceMeta = window.__ojixServiceMeta || {});
function serviceMeta(slug) {
  return slug ? serviceMetaCache[slug] || { title: "Services | OJIX" } : null;
}

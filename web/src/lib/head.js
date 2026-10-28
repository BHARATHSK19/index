/* Per-page <title>, description, canonical, Open Graph and JSON-LD. */
const SITE = "https://ojix.in";

function setMeta(selector, attr, value, create) {
  let el = document.head.querySelector(selector);
  if (!el && create) {
    el = create();
    document.head.appendChild(el);
  }
  if (el) el.setAttribute(attr, value);
}

export function applyHead(meta, pathname) {
  const m = meta || {};
  const title = m.title || "OJIX | Enterprise Software & Custom ERP Development India";
  document.title = title;
  const canonical = m.canonical || SITE + (pathname === "/" ? "" : pathname);
  const mk = (tag, attrs) => () => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };
  if (m.description) {
    setMeta('meta[name="description"]', "content", m.description, mk("meta", { name: "description" }));
    setMeta('meta[property="og:description"]', "content", m.description, mk("meta", { property: "og:description" }));
    setMeta('meta[name="twitter:description"]', "content", m.description, mk("meta", { name: "twitter:description" }));
  }
  setMeta('link[rel="canonical"]', "href", canonical, mk("link", { rel: "canonical" }));
  setMeta('meta[property="og:url"]', "content", canonical, mk("meta", { property: "og:url" }));
  setMeta('meta[property="og:title"]', "content", title, mk("meta", { property: "og:title" }));
  setMeta('meta[name="twitter:title"]', "content", title, mk("meta", { name: "twitter:title" }));
  if (m.ogImage) {
    setMeta('meta[property="og:image"]', "content", m.ogImage, mk("meta", { property: "og:image" }));
    setMeta('meta[name="twitter:image"]', "content", m.ogImage, mk("meta", { name: "twitter:image" }));
  }
  document.head.querySelectorAll("script[data-page-ld]").forEach((s) => s.remove());
  (m.jsonLd || []).forEach((obj) => {
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.setAttribute("data-page-ld", "");
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  });
}

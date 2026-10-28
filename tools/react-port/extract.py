"""Generate the React page bodies + data for the OJIX React port from the legacy HTML.

Run from the project root:  python3 tools/react-port/extract.py
Reads the legacy *.html pages (kept in legacy-html/ after the port) and writes into web/src/generated/.
"""
import json
import os
import re
import sys

from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(__file__))
from html2jsx import html_to_jsx  # noqa: E402

ROOT = os.getcwd()
SRC = os.path.join(ROOT, sys.argv[1] if len(sys.argv) > 1 else ".")
OUT = os.path.join(ROOT, "web", "src", "generated")
os.makedirs(os.path.join(OUT, "products"), exist_ok=True)

WARN = []

RENAMES = [
    (re.compile(r"OJIX\s+OS"), "Company Management System"),
    (re.compile(r"AI\s+proctX", re.I), "School ERP"),
    (re.compile(r"BuildOS"), "Construction Hub"),
    (re.compile(r"\b([Aa])n (Company Management System|School ERP|Construction Hub)"), r"\1 \2"),
    (re.compile(r'href="/companyos(["#])'), r'href="/company-management-system\1'),
    (re.compile(r'href="/campusos(["#])'), r'href="/school-erp\1'),
    (re.compile(r'href="/buildos(["#])'), r'href="/construction-hub\1'),
    # legacy .html links -> clean URLs
    (re.compile(r'href="/?services/([a-z0-9-]+)\.html"'), r'href="/services/\1"'),
    (re.compile(r'href="(?:\.\./)?(?:/)?(cookies|index|services|products)\.html"'), lambda m: 'href="/' + ("" if m.group(1) == "index" else m.group(1)) + '"'),
]


def rename(s):
    for rx, rep in RENAMES:
        s = rx.sub(rep, s)
    return s


def read(name):
    with open(os.path.join(SRC, name), encoding="utf-8-sig") as f:
        return f.read()


def segment(html, start_rx, end_tag):
    m = re.search(start_rx, html)
    if not m:
        raise ValueError("start not found: " + start_rx)
    i = m.start()
    j = html.index(end_tag, i) + len(end_tag)
    return html[i:j]


def write(path, text):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(text)


def component(name, jsx, imports=""):
    return (
        "/* Auto-generated from the legacy HTML by tools/react-port/extract.py. */\n"
        + imports
        + f"export default function {name}() {{\n  return (\n    <>\n{jsx}\n    </>\n  );\n}}\n"
    )


SLOT_RX = re.compile(r'<ojx-slot name="([A-Za-z]+)"((?: [a-z]+="[^"]*")*)\s*/>')


def slots_to_jsx(jsx):
    def rep(m):
        name, attrs = m.group(1), m.group(2)
        return f"<{name}{attrs} />"
    return SLOT_RX.sub(rep, jsx)


def page_meta(html, path):
    soup = BeautifulSoup(html, "html.parser")
    def meta(sel, attr="content"):
        el = soup.select_one(sel)
        return rename(el.get(attr, "")) if el else ""
    title = rename(soup.title.get_text(strip=True)) if soup.title else "OJIX"
    lds = []
    for s in soup.find_all("script", attrs={"type": "application/ld+json"}):
        txt = rename(s.get_text())
        try:
            lds.append(json.loads(txt))
        except Exception:
            WARN.append(f"bad JSON-LD in {path}")
    canon = meta('link[rel="canonical"]', "href")
    canon = re.sub(r"\.html$", "", canon)
    return {
        "title": title,
        "description": meta('meta[name="description"]'),
        "canonical": canon,
        "ogImage": meta('meta[property="og:image"]'),
        "jsonLd": lds,
    }


META = {}

# ---------------------------------------------------------------- shared chrome (from index.html)
index = read("index.html")
after_main = index[index.index("</main>") + len("</main>"):]
news = segment(after_main, r'<section class="ojx-news"', "</section>")
footer = segment(after_main, r'<footer class="site-footer"', "</footer>")
footer = (footer
          .replace('href="#capabilities"', 'href="/#capabilities"')
          .replace('href="#process"', 'href="/process"')
          .replace('href="#security-trust"', 'href="/security"')
          .replace('href="#about"', 'href="/about"')
          .replace('href="#faq"', 'href="/#faq"')
          .replace('href="#contact"', 'href="/contact"'))
if "GSTIN" not in footer:  # every page except the old home page showed it
    footer = re.sub(r'(<a href="/contact">Get in touch <span aria-hidden="true">→</span></a>)', r'\1\n        <small>GSTIN: 29AAKF03656Q1ZB</small>', footer)
    assert "GSTIN" in footer
footer = footer.replace('<span id="year">2026</span>', '<span id="year"><ojx-slot name="Year" /></span>')


def block(start_id):
    m = re.search(r'<div id="%s"' % start_id, after_main)
    i = m.start()
    # find matching closing div by counting
    depth = 0
    for t in re.finditer(r"<(/?)div\b[^>]*?>", after_main[i:]):
        if t.group(1):
            depth -= 1
        else:
            depth += 1
        if depth == 0:
            return after_main[i:i + t.end()]
    raise ValueError(start_id)


modals = "\n".join(block(x) for x in ["cookie-modal", "privacy-modal", "cookie-policy-modal", "portfolio-lightbox-modal"])
mobile_services = block("ojix-mobile-services-modal")

chrome = "/* Auto-generated from the legacy HTML by tools/react-port/extract.py. */\n"
chrome += "function Year() { return new Date().getFullYear(); }\n\n"
for name, frag in [("Newsletter", news), ("Footer", footer), ("Modals", modals), ("MobileServicesModal", mobile_services)]:
    jsx = slots_to_jsx(html_to_jsx(rename(frag), 3, WARN))
    chrome += f"export function {name}() {{\n  return (\n    <>\n{jsx}\n    </>\n  );\n}}\n\n"
write("SiteChrome.jsx", chrome)

# ---------------------------------------------------------------- home
home_main = segment(index, r"<main\b", "</main>")
home_main = re.sub(r'<section class="dx-products".*?</section>\s*(?=<section)', '<ojx-slot name="ProductRows" />\n    ', home_main, count=1, flags=re.S)
assert "ProductRows" in home_main
write("HomeMain.jsx", component("HomeMain", slots_to_jsx(html_to_jsx(rename(home_main), 3, WARN)),
                                'import ProductRows from "../components/ProductRows.jsx";\n\n'))
META["/"] = page_meta(index, "index.html")

# ---------------------------------------------------------------- simple pages
for fname, comp, route in [("services.html", "ServicesMain", "/services"),
                           ("cookies.html", "CookiesMain", "/cookies"),
                           ("dpdp-compliance.html", "DpdpMain", "/dpdp-compliance")]:
    html = read(fname)
    main = segment(html, r"<main\b", "</main>")
    imports = ""
    if fname == "dpdp-compliance.html":
        main = re.sub(r'<p class="pd-hero__k">Product \d+ / \d+</p>', '<ojx-slot name="ProductCounter" slug="dpdp-compliance" />', main)
        main = re.sub(r'<section class="pd-next".*?</section>', '<ojx-slot name="NextProduct" slug="dpdp-compliance" />', main, flags=re.S)
        imports = 'import { ProductCounter, NextProduct } from "../components/ProductBits.jsx";\n\n'
    write(comp + ".jsx", component(comp, slots_to_jsx(html_to_jsx(rename(main), 3, WARN)), imports))
    META[route] = page_meta(html, fname)

# ---------------------------------------------------------------- product pages
PRODUCTS = [
    ("companyos.html", "company-management-system", "CompanyManagementSystem"),
    ("legalos.html", "legalos", "LegalOS"),
    ("procureos.html", "procureos", "ProcureOS"),
    ("campusos.html", "school-erp", "SchoolERP"),
    ("buildos.html", "construction-hub", "ConstructionHub"),
    ("travelos.html", "travelos", "TravelOS"),
    ("fitos.html", "fitos", "FitOS"),
]
for fname, slug, comp in PRODUCTS:
    html = read(fname)
    main = segment(html, r"<main\b", "</main>")
    n1 = len(re.findall(r'<p class="pd-hero__k">Product \d+ / \d+</p>', main))
    main = re.sub(r'<p class="pd-hero__k">Product \d+ / \d+</p>', f'<ojx-slot name="ProductCounter" slug="{slug}" />', main)
    n2 = len(re.findall(r'<section class="pd-next"', main))
    main = re.sub(r'<section class="pd-next".*?</section>', f'<ojx-slot name="NextProduct" slug="{slug}" />', main, flags=re.S)
    if n1 != 1 or n2 != 1:
        WARN.append(f"{fname}: counter={n1} next={n2}")
    if slug == "school-erp":
        # University Management System now covers higher-ed; School ERP is the K-12 product.
        main = main.replace('<p class="pd-hero__k">Schools, colleges &amp; universities</p>', '<p class="pd-hero__k">Schools &amp; K-12 institutions</p>')
    jsx = slots_to_jsx(html_to_jsx(rename(main), 3, WARN))
    write(f"products/{comp}.jsx", component(comp, jsx, 'import { ProductCounter, NextProduct } from "../../components/ProductBits.jsx";\n\n'))
    META["/" + slug] = page_meta(html, fname)

# School ERP is the K-12 product now; the multi-campus/higher-ed story moved to University Management System.
META["/school-erp"]["title"] = "School ERP — K-12 School Management & Academic ERP | OJIX"
META["/company-management-system"]["title"] = "Company Management System — Enterprise Operations, HR & Accounting | OJIX"

# ---------------------------------------------------------------- service pages -> data
services = []
sdir = os.path.join(SRC, "services")
for fn in sorted(os.listdir(sdir)):
    html = read(os.path.join("services", fn))
    slug = fn[:-5]
    soup = BeautifulSoup(html, "html.parser")
    main = soup.find("main")
    t = lambda el: el.get_text(" ", strip=True) if el else ""
    hero = main.select_one(".pd-hero")
    intro = main.select_one(".pd-intro")
    pv = intro.select_one(".pv")
    d = {
        "slug": slug,
        "title": t(hero.select_one(".pd-hero__name")),
        "heroImg": hero.select_one("img")["src"],
        "heroKicker": t(hero.select_one(".pd-hero__k")),
        "category": t(intro.select_one(".dx-kicker")).replace("01 ", "", 1),
        "introTitle": intro.select_one(".pd-intro__title").contents[0].strip(),
        "introTitleSpan": t(intro.select_one(".pd-intro__title span")),
        "lede": t(intro.select_one(".pd-lede")),
        "pv": {
            "url": t(pv.select_one(".pv-url")),
            "live": t(pv.select_one(".pv-live")),
            "mark": t(pv.select_one(".pv-mark")),
            "badge": t(pv.select_one(".pv-badge")),
            "kpis": [[t(k.b), t(k.span)] for k in pv.select(".pv-kpi")],
            "panelTitle": t(pv.select_one(".pv-panel__t")),
            "bars": [[b.get("style", ""), t(b.span)] for b in pv.select(".pv-bar")],
            "app": t(pv.select_one(".pv-papp b")),
            "noteTitle": t(pv.select_one(".pv-note strong")),
            "noteText": t(pv.select_one(".pv-note small")),
            "pkpis": [[t(k.span), t(k.b)] for k in pv.select(".pv-pkpi")],
        },
        "stats": [[t(s.select_one(".pd-stat__num")), t(s.select_one(".pd-stat__label")), t(s.select_one(".pd-stat__desc"))] for s in main.select(".pd-stat")],
    }
    cmp_ = main.select_one(".pd-cmp")
    d["cmpKicker"] = t(cmp_.select_one(".dx-kicker")).replace("02 ", "", 1)
    h2 = cmp_.select_one(".pd-h2")
    d["cmpTitle"] = h2.contents[0].strip()
    d["cmpTitleSpan"] = t(h2.select_one("span"))
    cols = []
    for col in cmp_.select(".pd-cmp__col"):
        cols.append({
            "badge": t(col.select_one(".pd-cmp__badge")),
            "title": t(col.select_one(".pd-cmp__title")),
            "items": [[t(li.select_one("b")), li.select("span")[-1].get_text(" ", strip=True)[len(t(li.select_one("b"))):].strip()] for li in col.select("li")],
        })
    d["cmp"] = cols
    trust = main.select_one(".pd-trust")
    th2 = trust.select_one(".pd-h2")
    d["trustTitle"] = th2.contents[0].strip()
    d["trustTitleSpan"] = t(th2.select_one("span"))
    d["trust"] = [[t(c.select_one(".pd-trust__k")), t(c.select_one(".pd-trust__t")), t(c.select_one(".pd-trust__d"))] for c in trust.select(".pd-trust__cell")]
    d["faqs"] = [[t(x.select_one("summary span")), t(x.select_one("p"))] for x in main.select(".pd-faq__item")]
    cta = main.select_one(".ojx-cta")
    ch2 = cta.select_one(".ojx-cta__title")
    d["ctaTitle"] = ch2.contents[0].strip()
    d["ctaTitleSpan"] = t(ch2.select_one("span"))
    d["ctaText"] = t(cta.select_one(".ojx-cta__text"))
    extra = [s.get("class", [""])[0] for s in main.find_all("section", recursive=False)]
    expected = ["pd-hero", "pd-intro", "pd-stats", "pd-cmp", "pd-trust", "pd-faq", "ojx-cta", "pd-next"]
    if extra != expected:
        WARN.append(f"service {slug} has sections {extra}")
    d["meta"] = page_meta(html, fn)
    services.append(d)

write("servicePages.json", json.dumps(services, ensure_ascii=False, indent=1))
write("pageMeta.json", json.dumps(META, ensure_ascii=False, indent=1))

for w in WARN:
    print("WARN:", w)
print("done:", len(services), "services,", len(META), "meta entries")

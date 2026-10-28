"""Wrap the legacy behaviour scripts as ES modules that the React app runs per page.

Each module exports `init(ctx)`. Listeners on window/document, timers, animation frames and
observers go through ctx, so everything is torn down when React unmounts the page.
Run from the project root: python3 tools/react-port/port_legacy.py
"""
import os
import re

ROOT = os.getcwd()
OUT = os.path.join(ROOT, "web", "src", "legacy")
os.makedirs(OUT, exist_ok=True)

FILES = ["app.js", "extras.js", "home.js", "products.js", "product.js", "carousel.js", "theme.js",
         "cookies.js", "motion.js"]

HEADER = """/* Ported from /{name} for the React app (tools/react-port/port_legacy.py + manual fixes).
 * Runs once per page mount; ctx tears down listeners, timers and observers on unmount. */
/* eslint-disable */
export default function init(__ctx) {{
  const {{ on: __on, setTimeout, setInterval, requestAnimationFrame, IntersectionObserver,
    ResizeObserver, MutationObserver, navigate: __navigate }} = __ctx;
"""

for name in FILES:
    src = open(os.path.join(ROOT, name), encoding="utf-8-sig").read()
    s = src
    s = re.sub(r"\bwindow\.addEventListener\(", "__on(window, ", s)
    s = re.sub(r"\bdocument\.addEventListener\(", "__on(document, ", s)
    s = re.sub(r"\bcompactHeroQuery\.addEventListener\?\.\(", "__on(compactHeroQuery, ", s)
    s = re.sub(r"\bwindow\.requestAnimationFrame\(", "requestAnimationFrame(", s)
    s = re.sub(r"window\.location\.href\s*=\s*([^;]+);", r"__navigate(\1);", s)
    body = "\n".join(("  " + line) if line.strip() else "" for line in s.splitlines())
    out = HEADER.format(name=name) + body + "\n}\n"
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(out)
    print(name, "ok")

"""HTML fragment -> JSX converter used for the OJIX React port.

Keeps the original markup 1:1 (classes, ids, data-* attributes) so the existing
CSS and behaviour code keep working, while emitting valid React JSX.
Whitespace is converted so the rendered DOM matches what the browser rendered
for the original HTML (collapsed runs become a single explicit space).
"""
import json
import re
from html.parser import HTMLParser

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "source", "track", "wbr"}
NO_WS_PARENTS = {"table", "thead", "tbody", "tfoot", "tr", "colgroup", "select", "html", "head"}
SVG_TAGS = {t.lower(): t for t in [
    "linearGradient", "radialGradient", "clipPath", "foreignObject", "textPath", "feGaussianBlur",
    "feOffset", "feMerge", "feMergeNode", "feBlend", "feColorMatrix", "feComposite", "feFlood",
    "feMorphology", "feTurbulence", "feDisplacementMap", "animateTransform", "animateMotion",
    "fePointLight", "feSpotLight", "feDistantLight", "feTile", "feImage", "feSpecularLighting",
    "feDiffuseLighting", "feComponentTransfer", "feFuncA", "feFuncR", "feFuncG", "feFuncB",
    "feDropShadow"]}
ATTR_MAP = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "readonly": "readOnly",
    "maxlength": "maxLength", "minlength": "minLength", "autocomplete": "autoComplete",
    "autofocus": "autoFocus", "inputmode": "inputMode", "enterkeyhint": "enterKeyHint",
    "novalidate": "noValidate", "fetchpriority": "fetchPriority", "crossorigin": "crossOrigin",
    "srcset": "srcSet", "colspan": "colSpan", "rowspan": "rowSpan", "spellcheck": "spellCheck",
    "contenteditable": "contentEditable", "datetime": "dateTime", "allowfullscreen": "allowFullScreen",
    "frameborder": "frameBorder", "playsinline": "playsInline", "autoplay": "autoPlay",
    "referrerpolicy": "referrerPolicy", "hreflang": "hrefLang", "enctype": "encType",
    "accept-charset": "acceptCharset", "http-equiv": "httpEquiv", "itemprop": "itemProp",
    "itemscope": "itemScope", "itemtype": "itemType", "formnovalidate": "formNoValidate",
    "accesskey": "accessKey", "cellpadding": "cellPadding", "cellspacing": "cellSpacing",
    "usemap": "useMap", "charset": "charSet", "popovertarget": "popoverTarget",
    # svg
    "viewbox": "viewBox", "preserveaspectratio": "preserveAspectRatio",
    "gradientunits": "gradientUnits", "gradienttransform": "gradientTransform",
    "patternunits": "patternUnits", "patterntransform": "patternTransform",
    "stddeviation": "stdDeviation", "markerwidth": "markerWidth", "markerheight": "markerHeight",
    "refx": "refX", "refy": "refY", "pathlength": "pathLength", "textlength": "textLength",
    "xlink:href": "xlinkHref", "xml:space": "xmlSpace", "xmlns:xlink": "xmlnsXlink",
    "attributename": "attributeName", "repeatcount": "repeatCount", "keytimes": "keyTimes",
    "keysplines": "keySplines", "calcmode": "calcMode", "maskunits": "maskUnits",
    "clippathunits": "clipPathUnits", "filterunits": "filterUnits", "spreadmethod": "spreadMethod",
    "startoffset": "startOffset", "lengthadjust": "lengthAdjust", "basefrequency": "baseFrequency",
    "numoctaves": "numOctaves", "tablevalues": "tableValues",
}
BOOL_ATTRS = {"hidden", "open", "disabled", "required", "multiple", "autofocus", "novalidate",
              "readonly", "itemscope", "controls", "loop", "muted", "playsinline", "autoplay",
              "allowfullscreen", "formnovalidate", "inert", "reversed", "default", "async", "defer"}

WS = re.compile(r"[ \t\n\r\f]+")


def camel(name):
    parts = name.split("-")
    return parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])


def style_obj(css):
    out = []
    for decl in css.split(";"):
        if ":" not in decl:
            continue
        k, v = decl.split(":", 1)
        k, v = k.strip(), v.strip()
        if not k:
            continue
        key = k if k.startswith("--") else camel(k.lower()) if not k.startswith("-") else camel(k[1:].lower()).replace(k[1:2], k[1:2].upper(), 1)
        out.append(f"{json.dumps(key)}: {json.dumps(v)}")
    return "{{" + ", ".join(out) + "}}"


def jstr(v):
    if re.search(r'["{}<>&\\\n]', v):
        return "{" + json.dumps(v, ensure_ascii=False) + "}"
    return '"' + v + '"'


class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.children = tag, attrs, parent, []


class Builder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", [], None)
        self.cur = self.root
        self.dropped = []

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.children.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.children.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.children.append(data)

    def handle_comment(self, data):
        pass


def conv_attrs(node, warn):
    tag = node.tag
    out = []
    textarea_val = None
    for name, val in node.attrs:
        lname = name.lower()
        if lname.startswith("on"):
            warn.append(f"dropped inline handler {lname} on <{tag}>")
            continue
        if lname == "style":
            out.append(f"style={style_obj(val or '')}")
            continue
        if lname == "checked":
            out.append("defaultChecked")
            continue
        if lname == "selected":
            out.append("defaultSelected={true}")  # handled below for <option>
            continue
        if lname == "value" and tag in ("input", "textarea", "select"):
            if (dict(node.attrs).get("type") or "").lower() in ("checkbox", "radio", "submit", "button", "hidden", "reset"):
                out.append(f"value={jstr(val or '')}" if tag != "input" or True else "")
                # React warns for value without onChange only on text-like inputs
                continue
            out.append(f"defaultValue={jstr(val or '')}")
            continue
        if lname.startswith("data-") or lname.startswith("aria-"):
            key = lname
        elif lname in ATTR_MAP:
            key = ATTR_MAP[lname]
        elif ":" in lname:
            a, b = lname.split(":", 1)
            key = a + b[:1].upper() + b[1:]
        elif "-" in lname:
            key = camel(lname)
        else:
            key = lname
        if val is None:
            if lname in BOOL_ATTRS:
                out.append(key)
            else:
                out.append(f'{key}=""')
            continue
        if lname in BOOL_ATTRS and lname not in ("hidden",) and val in ("", lname):
            out.append(key)
            continue
        if lname == "hidden" and val in ("", "hidden"):
            out.append("hidden")
            continue
        out.append(f"{key}={jstr(val)}")
    # <option selected> -> React wants defaultValue on <select>; keep simple: drop
    out = [a for a in out if a != "defaultSelected={true}"]
    return out


def emit(node, depth, warn, inline_ws=True):
    pad = "  " * depth
    if isinstance(node, str):
        raise AssertionError
    tag = node.tag
    if tag == "script":
        warn.append("dropped <script> " + str(dict(node.attrs).get("src", "inline")))
        return ""
    if tag == "textarea":
        content = "".join(c for c in node.children if isinstance(c, str))
        node.children = []
        if content.strip():
            node.attrs = list(node.attrs) + [("value", content)]
    rtag = SVG_TAGS.get(tag, tag)
    attrs = conv_attrs(node, warn)
    attr_s = (" " + " ".join(attrs)) if attrs else ""
    if tag in VOID or not node.children:
        if tag in VOID or tag not in ("textarea",):
            return f"{pad}<{rtag}{attr_s} />"
    kids = emit_children(node, depth + 1, warn)
    if not kids.strip():
        return f"{pad}<{rtag}{attr_s} />"
    return f"{pad}<{rtag}{attr_s}>\n{kids}\n{pad}</{rtag}>"


def text_jsx(t):
    if re.search(r"[{}<>&]", t) or t != t.strip():
        return "{" + json.dumps(t, ensure_ascii=False) + "}"
    return t


def emit_children(node, depth, warn):
    pad = "  " * depth
    lines = []
    allow_ws = node.tag not in NO_WS_PARENTS
    kids = node.children
    for i, c in enumerate(kids):
        if isinstance(c, str):
            if node.tag in ("pre",):
                lines.append(pad + "{" + json.dumps(c, ensure_ascii=False) + "}")
                continue
            t = WS.sub(" ", c)
            if t == "":
                continue
            if t == " ":
                if not allow_ws:
                    continue
                # drop whitespace at the very start/end of a block's children (browser collapses it)
                if i == 0 or i == len(kids) - 1:
                    continue
                lines.append(pad + '{" "}')
                continue
            lead = t.startswith(" ") and i != 0
            trail = t.endswith(" ") and i != len(kids) - 1
            core = t.strip()
            s = ""
            if lead:
                s += '{" "}'
            s += text_jsx(core)
            if trail:
                s += '{" "}'
            lines.append(pad + s)
        else:
            out = emit(c, depth, warn)
            if out:
                lines.append(out)
    return "\n".join(lines)


def html_to_jsx(fragment, depth=2, warn=None):
    warn = [] if warn is None else warn
    b = Builder()
    b.feed(fragment)
    b.close()
    return emit_children(b.root, depth, warn)


def parse(fragment):
    b = Builder()
    b.feed(fragment)
    b.close()
    return b.root


if __name__ == "__main__":
    import sys
    src = open(sys.argv[1], encoding="utf-8").read()
    w = []
    print(html_to_jsx(src, 0, w))
    for x in w:
        print("//", x, file=sys.stderr)

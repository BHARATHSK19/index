"""Generate navy theme overrides (theme-auto.css) from the site's CSS colour rules."""
import tinycss2, re, sys, colorsys, os
ROOT = sys.argv[1]
ORDER = ['styles.css','responsive.css','typography.css','motion.css','mobile.css','extras.css',
         'products.css','product.css','carousel.css','home.css','cookies.css']
COL = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(white|black)\b')
BTN = re.compile(r'btn|button|nav-cta|__cta|accept|decline|subscribe|submit|--solid|__send|__go|pill\.is-active|result-action-primary|chip--ok|__open', re.I)
MARK = re.compile(r'(^|[\s>+~])(i|span|em)(:[a-z-]+)*(::?(before|after))?$|::?(before|after)$|bar\b|__bar|dot|mark\b|-mark|icon|indicator|progress|menu-toggle', re.I)
TOK = {'navy':'#0F1C2E','navy-light':'#16263B','navy-deep':'#09121E','ink':'#172235','ink-secondary':'#4B5563','muted':'#647185','soft':'#F8F9FA','paper':'#FFFFFF','line':'#E5E8EC','dx-ink':'#0a0a0a','dx-grey':'#666666','dx-soft':'#8e8e93','dx-line':'rgba(10, 10, 10, 0.12)'}
VAR = re.compile(r'var\(\s*--([a-z-]+)\s*(?:,\s*([^()]*?))?\s*\)')

def parse(c):
    c = c.lower().replace(' ', '')
    if c == 'white': return (255,255,255,1.0)
    if c == 'black': return (0,0,0,1.0)
    if c.startswith('#'):
        h = c[1:]
        if len(h) in (3,4): h = ''.join(ch*2 for ch in h)
        r,g,b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
        a = int(h[6:8],16)/255 if len(h)==8 else 1.0
        return (r,g,b,a)
    n = re.findall(r'[\d.]+%?', c)
    if len(n) < 3 or any('%' in x for x in n[:3]): return None
    a = float(n[3].rstrip('%'))/(100 if '%' in n[3] else 1) if len(n) > 3 else 1.0
    return (int(float(n[0])), int(float(n[1])), int(float(n[2])), a)

def lum(r,g,b):
    f = lambda v: (v/255)/12.92 if v/255 <= .03928 else (((v/255)+.055)/1.055)**2.4
    return .2126*f(r)+.7152*f(g)+.0722*f(b)

def sat(r,g,b):
    return colorsys.rgb_to_hls(r/255,g/255,b/255)[2]

def rgba(r,g,b,a): return f'rgba({r}, {g}, {b}, {round(a,3)})'
def hexa(h,a):
    r,g,b = int(h[1:3],16),int(h[3:5],16),int(h[5:7],16)
    return h if a >= .999 else rgba(r,g,b,a)

def neutral(r,g,b):
    # greys and slate/cool greys (slight blue tint) count as neutral
    return sat(r,g,b) < .32 or (max(r,g,b)-min(r,g,b)) < 40

def dark_map(c, kind, btn):
    p = parse(c)
    if not p: return None
    r,g,b,a = p
    L = lum(r,g,b)
    navyish = (r,g,b) in [(15,28,46),(22,38,59),(9,18,30),(23,34,53),(15,28,47)]
    if not neutral(r,g,b) and not navyish:
        # saturated: keep, but lift very dark saturated text so it reads on navy
        if kind == 'color' and L < .12: return '#E8956A'
        if kind == 'bg' and a >= .9 and L > .75: return hexa('#1A2A40', a)   # pale tints (mint, peach) -> soft navy
        return None
    if a < .999:
        if L > .8:   # translucent white
            if kind == 'bg' and a >= .5: return rgba(12,24,41,a)
            return None
        if L < .05:  # translucent ink -> translucent light
            if kind == 'shadow': return rgba(0,0,0,min(.65,a*3))
            return rgba(226,232,240,min(1,a*1.4))
        return None
    if kind == 'bg':
        if btn == 'mark' and L < .2: return '#DCE3EE'
        if btn == 'text' and L < .2: return '#EEF2F8'
        if btn and btn not in ('mark','text') and L < .2: return '#C9662F'
        if btn is True and L > .85: return '#14253C'
        if L > .97: return '#101E32'
        if L > .85: return '#0B1626'
        if L > .55: return '#1B2D47'
        if L > .2:  return '#2A3F5E'
        if L > .02: return '#16263B' if btn is True else '#071020'
        return '#060D18'
    if kind == 'color':
        if L > .97: return None
        if L > .55: return '#5F7190'
        if L > .25: return '#8E9CB2'
        if L > .05: return '#C2CCDA'
        return '#EEF2F8'
    if kind == 'border':
        if L > .55: return 'rgba(148, 170, 200, 0.16)'
        if L > .2:  return 'rgba(148, 170, 200, 0.3)'
        return 'rgba(226, 232, 240, 0.55)'
    if kind == 'shadow':
        if L > .9: return '#101E32'
        return None
    return None

def light_map(c, kind, btn):
    """Light mode: pure black -> brand navy."""
    p = parse(c)
    if not p: return None
    r,g,b,a = p
    if (r,g,b) == (18,18,18) or (r,g,b) == (17,17,17):
        return hexa('#0F1C2E', a) if a >= .999 else rgba(15,28,46,a)
    if (r,g,b) in [(5,5,5),(0,0,0),(10,10,10)] and kind == 'bg' and a >= .999: return '#09121E'
    if (r,g,b) == (51,51,51) and kind == 'bg': return '#1B2E48'   # hover on black buttons
    return None

def kind_of(name):
    if name.startswith('--'): return None
    if name.startswith('background'): return 'bg'
    if name in ('color','-webkit-text-fill-color','fill','stroke','caret-color','text-decoration-color','column-rule-color'): return 'color'
    if 'border' in name or 'outline' in name: return 'border'
    if name in ('box-shadow','text-shadow'): return 'shadow'
    return None

def remap(value, kind, fn, btn):
    changed = [False]
    def rv(m):
        if m.group(1) in TOK: changed[0] = True; return TOK[m.group(1)]
        return m.group(0)
    value = VAR.sub(rv, value)
    if changed[0]:
        hit = [False]
        def rep2(m):
            o = fn(m.group(0), kind, btn)
            if o: hit[0] = True; return o
            return m.group(0)
        r = COL.sub(rep2, value)
        return r
    def rep(m):
        out = fn(m.group(0), kind, btn)
        if out: changed[0] = True; return out
        return m.group(0)
    v = COL.sub(rep, value)
    if changed[0]: return v
    return v if COL.search(value) else None   # identity copy keeps the cascade order intact

def prefix(sel, pre):
    s = sel.strip()
    if re.match(r'^(html|:root)\b', s):
        return re.sub(r'^(html|:root)', pre + ':not(svg)', s, count=1)
    return pre + ' ' + s

def split_sel(sel):
    # split selector list at top-level commas
    out, depth, cur = [], 0, ''
    for ch in sel:
        if ch in '([': depth += 1
        if ch in ')]': depth -= 1
        if ch == ',' and depth == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur)
    return [s.strip() for s in out if s.strip()]

def emit(rules, fn, pre, out, indent=''):
    for r in rules:
        if r.type == 'qualified-rule':
            sel = tinycss2.serialize(r.prelude).strip()
            if sel.startswith('@') or 'keyframes' in sel: continue
            decls = tinycss2.parse_declaration_list(r.content, skip_whitespace=True, skip_comments=True)
            sels = split_sel(sel)
            # group selectors by button-ness
            body = tinycss2.serialize(r.content)
            clip = re.search(r'background-clip\s*:\s*text', body) is not None
            def cls(sl):
                last = sl.split(' ')[-1]
                if clip: return 'text'
                if BTN.search(last): return True
                if MARK.search(sl.strip()) and not re.search(r'browser|phone|hub', sl): return 'mark'
                return False
            for group_btn in (False, True, 'mark', 'text'):
                gs = [s for s in sels if cls(s) == group_btn]
                if not gs: continue
                lines = []
                for d in decls:
                    if d.type != 'declaration': continue
                    k = kind_of(d.name)
                    if not k: continue
                    v = remap(tinycss2.serialize(d.value).strip(), k, fn, group_btn)
                    if v: lines.append(f'{indent}  {d.name}: {v}{" !important" if d.important else ""};')
                if lines:
                    out.append(indent + ',\n'.join(prefix(s, pre) for s in gs) + ' {\n' + '\n'.join(lines) + '\n' + indent + '}')
        elif r.type == 'at-rule' and r.content is not None and r.at_keyword in ('media', 'supports'):
            inner = []
            emit(tinycss2.parse_rule_list(r.content, skip_whitespace=True, skip_comments=True), fn, pre, inner, indent + '  ')
            if inner:
                out.append(f'@{r.at_keyword} {tinycss2.serialize(r.prelude).strip()} {{\n' + '\n'.join(inner) + '\n}')

dark, light = [], []
for f in ORDER:
    src = open(os.path.join(ROOT, f), encoding='utf-8').read()
    rules = tinycss2.parse_stylesheet(src, skip_whitespace=True, skip_comments=True)
    dark.append(f'/* ---- from {f} ---- */'); light.append(f'/* ---- from {f} ---- */')
    emit(rules, dark_map, 'html[data-theme="dark"]', dark)
    emit(rules, light_map, 'html:not([data-theme="dark"])', light)

hdr = '/* OJIX navy theme — GENERATED by tools/gen_theme.py from the site CSS. Do not hand-edit; hand fixes go in theme.css. */\n'
open(os.path.join(ROOT, 'theme-auto.css'), 'w', encoding='utf-8').write(
    hdr + '\n/* ===== LIGHT MODE: black -> brand navy ===== */\n' + '\n'.join(light) +
    '\n\n/* ===== DARK MODE: premium navy ===== */\n' + '\n'.join(dark) + '\n')
print('dark rules', sum(1 for x in dark if '{' in x), 'light rules', sum(1 for x in light if '{' in x))

import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// ============================================================================
// 1. PRISMATIC BURST (OGL WebGL 2.0 Raymarching Shader)
// Adapted for OJIX Brand Theme: Copper Orange (#F97316), White (#FFFFFF), Navy (#1a1a54)
// ============================================================================

const vertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
precision highp int;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;

uniform float uIntensity;
uniform float uSpeed;
uniform int   uAnimType;
uniform vec2  uMouse;
uniform int   uColorCount;
uniform float uDistort;
uniform vec2  uOffset;
uniform sampler2D uGradient;
uniform float uNoiseAmount;
uniform int   uRayCount;
uniform float uLightMode;

float hash21(vec2 p){
    p = floor(p);
    float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
    return fract(f);
}

mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }

float layeredNoise(vec2 fragPx){
    vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
    vec2 q = rot30() * p;
    float n = 0.0;
    n += 0.40 * hash21(q);
    n += 0.25 * hash21(q * 2.0 + 17.0);
    n += 0.20 * hash21(q * 4.0 + 47.0);
    n += 0.10 * hash21(q * 8.0 + 113.0);
    n += 0.05 * hash21(q * 16.0 + 191.0);
    return n;
}

vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
    float focal = res.y * max(dist, 1e-3);
    return normalize(vec3(2.0 * (frag - offset) - res, focal));
}

float edgeFade(vec2 frag, vec2 res, vec2 offset){
    vec2 toC = frag - 0.5 * res - offset;
    float r = length(toC) / (0.5 * max(res.x, res.y));
    float outer = 1.0 - smoothstep(0.85, 1.45, r);
    float inner = smoothstep(0.015, 0.16, r);
    return clamp(inner * outer, 0.0, 1.0);
}

mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }

vec3 sampleGradient(float t){
    t = clamp(t, 0.0, 1.0);
    return texture(uGradient, vec2(t, 0.5)).rgb;
}

vec2 rot2(vec2 v, float a){
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c) * v;
}

float bendAngle(vec3 q, float t){
    float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
            + 0.7 * sin(q.y * 0.50 - t * 0.5)
            + 0.6 * sin(q.z * 0.60 + t * 0.7);
    return a;
}

void main(){
    vec2 frag = gl_FragCoord.xy;
    float t = uTime * uSpeed;
    float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
    vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
    float marchT = 0.0;
    vec3 col = vec3(0.0);
    float n = layeredNoise(frag);
    vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
    mat2 M2 = mat2(c.x, c.y, c.z, c.w);
    float amp = clamp(uDistort, 0.0, 50.0) * 0.15;

    mat3 rot3dMat = mat3(1.0);
    if(uAnimType == 1){
      vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
      rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
    }
    mat3 hoverMat = mat3(1.0);
    if(uAnimType == 2){
      vec2 m = uMouse * 2.0 - 1.0;
      vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
      hoverMat = rotY(ang.y) * rotX(ang.x);
    }

    for (int i = 0; i < 44; ++i) {
        vec3 P = marchT * dir;
        P.z -= 2.0;
        float rad = length(P);
        vec3 Pl = P * (10.0 / max(rad, 1e-6));

        if(uAnimType == 0){
            Pl.xz *= M2;
        } else if(uAnimType == 1){
      Pl = rot3dMat * Pl;
        } else {
      Pl = hoverMat * Pl;
        }

        float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

        float grow = smoothstep(0.35, 3.0, marchT);
        float a1 = amp * grow * bendAngle(Pl * 0.6, t);
        float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
        vec3 Pb = Pl;
        Pb.xz = rot2(Pb.xz, a1);
        Pb.xy = rot2(Pb.xy, a2);

        float rayPattern = smoothstep(
            0.5, 0.7,
            sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
            sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
        );

        if (uRayCount > 0) {
            float ang = atan(Pb.y, Pb.x);
            float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
            comb = pow(comb, 3.0);
            rayPattern *= smoothstep(0.15, 0.95, comb);
        }

        vec3 spectralDefault = 1.0 + vec3(
            cos(marchT * 3.0 + 0.0),
            cos(marchT * 3.0 + 1.0),
            cos(marchT * 3.0 + 2.0)
        );

        float saw = fract(marchT * 0.25);
        float tRay = saw * saw * (3.0 - 2.0 * saw);
        vec3 userGradient = 2.0 * sampleGradient(tRay);
        vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
        vec3 base = (0.05 / (0.4 + stepLen))
                  * smoothstep(5.0, 0.0, rad)
                  * spectral;

        col += base * rayPattern;
        marchT += stepLen;
    }

    col *= edgeFade(frag, uResolution, uOffset);
    col *= uIntensity;

    col = clamp(col, 0.0, 1.0);
    float alpha = clamp(max(col.r, max(col.g, col.b)) * 1.5, 0.0, 1.0);
    if (uLightMode > 0.5) {
        float energy = max(max(col.r, col.g), col.b);
        vec3 hue = col / max(energy, 0.0001);
        float neutral = min(hue.r, min(hue.g, hue.b));
        hue = max(hue - vec3(neutral * 0.68), vec3(0.0));
        hue /= max(max(hue.r, max(hue.g, hue.b)), 0.0001);
        vec3 pigment = mix(hue, hue * hue, 0.24) * 0.72;
        float coverage = smoothstep(0.0005, 0.28, energy);
        coverage = pow(coverage, 0.68) * 0.95;
        col = mix(vec3(1.0), pigment, coverage);
    }
    fragColor = vec4(col, uLightMode > 0.5 ? 1.0 : alpha);
}`;

const hexToRgb01 = hex => {
  let h = hex.trim();
  if (h.startsWith('#')) h = h.slice(1);
  if (h.length === 3) {
    const r = h[0], g = h[1], b = h[2];
    h = r + r + g + g + b + b;
  }
  const intVal = parseInt(h.slice(0, 6), 16);
  if (isNaN(intVal) || (h.length !== 6 && h.length !== 8)) return [1, 1, 1];
  const r = ((intVal >> 16) & 255) / 255;
  const g = ((intVal >> 8) & 255) / 255;
  const b = (intVal & 255) / 255;
  return [r, g, b];
};

const toPx = v => {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  const num = parseFloat(s.replace('px', ''));
  return isNaN(num) ? 0 : num;
};

export function initPrismaticBurst(containerElement, options = {}) {
  const container = typeof containerElement === 'string'
    ? document.querySelector(containerElement)
    : containerElement;

  if (!container) return null;

  const defaults = {
    intensity: 2,
    speed: 0.5,
    animationType: 'hover',
    colors: ['#F97316', '#EA580C', '#0F1C2E', '#C2410C', '#1E293B', '#FB923C'],
    distort: 1.0,
    paused: false,
    offset: { x: 0, y: 0 },
    hoverDampness: 0.25,
    rayCount: 24,
    mixBlendMode: null,
    lightMode: false,
    ...options
  };

  if (options.color0 || options.color1 || options.color2) {
    defaults.colors = [
      options.color0 || '#F97316',
      options.color1 || '#EA580C',
      options.color2 || '#0F1C2E',
      '#C2410C'
    ];
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let renderer;
  try {
    renderer = new Renderer({
      dpr,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false
    });
  } catch (err) {
    console.warn('PrismaticBurst WebGL not supported:', err);
    return null;
  }

  const gl = renderer.gl;
  gl.canvas.style.position = 'absolute';
  gl.canvas.style.inset = '0';
  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  const resolvedBlendMode = defaults.mixBlendMode && defaults.mixBlendMode !== 'none'
    ? defaults.mixBlendMode
    : (defaults.lightMode ? 'normal' : 'screen');
  gl.canvas.style.mixBlendMode = resolvedBlendMode;
  container.appendChild(gl.canvas);

  const white = new Uint8Array([255, 255, 255, 255]);
  const gradientTex = new Texture(gl, {
    image: white,
    width: 1,
    height: 1,
    generateMipmaps: false,
    flipY: false
  });

  gradientTex.minFilter = gl.LINEAR;
  gradientTex.magFilter = gl.LINEAR;
  gradientTex.wrapS = gl.CLAMP_TO_EDGE;
  gradientTex.wrapT = gl.CLAMP_TO_EDGE;

  const animTypeMap = { rotate: 0, rotate3d: 1, hover: 2 };

  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uIntensity: { value: defaults.intensity },
      uSpeed: { value: defaults.speed },
      uAnimType: { value: animTypeMap[defaults.animationType] ?? 2 },
      uMouse: { value: [0.5, 0.5] },
      uColorCount: { value: 0 },
      uDistort: { value: defaults.distort },
      uOffset: { value: [toPx(defaults.offset.x), toPx(defaults.offset.y)] },
      uGradient: { value: gradientTex },
      uNoiseAmount: { value: 0.8 },
      uRayCount: { value: defaults.rayCount },
      uLightMode: { value: defaults.lightMode ? 1 : 0 }
    }
  });

  if (Array.isArray(defaults.colors) && defaults.colors.length > 0) {
    const capped = defaults.colors.slice(0, 64);
    const count = capped.length;
    const data = new Uint8Array(count * 4);
    for (let i = 0; i < count; i++) {
      const [r, g, b] = hexToRgb01(capped[i]);
      data[i * 4 + 0] = Math.round(r * 255);
      data[i * 4 + 1] = Math.round(g * 255);
      data[i * 4 + 2] = Math.round(b * 255);
      data[i * 4 + 3] = 255;
    }
    gradientTex.image = data;
    gradientTex.width = count;
    gradientTex.height = 1;
    gradientTex.format = gl.RGBA;
    gradientTex.type = gl.UNSIGNED_BYTE;
    gradientTex.needsUpdate = true;
    program.uniforms.uColorCount.value = count;
  }

  const triangle = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry: triangle, program });

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
  };

  let ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(resize);
    ro.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  const mouseTarget = [0.5, 0.5];
  const mouseSmooth = [0.5, 0.5];

  const onPointer = e => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const y = (e.clientY - rect.top) / Math.max(rect.height, 1);
    mouseTarget[0] = Math.min(Math.max(x, 0), 1);
    mouseTarget[1] = Math.min(Math.max(y, 0), 1);
  };

  const listenTarget = container.closest('section') || container;
  listenTarget.addEventListener('pointermove', onPointer, { passive: true });

  let isVisible = true;
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      entries => {
        if (entries[0]) isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.01 }
    );
    io.observe(container);
  }

  let raf = 0;
  let last = performance.now();
  let accumTime = 0;
  let destroyed = false;

  const update = now => {
    if (destroyed) return;
    const dt = Math.max(0, now - last) * 0.001;
    last = now;

    const visible = isVisible && !document.hidden;
    if (!defaults.paused) accumTime += dt;

    if (!visible) {
      raf = requestAnimationFrame(update);
      return;
    }

    const tau = 0.02 + Math.max(0, Math.min(1, defaults.hoverDampness)) * 0.5;
    const alpha = 1 - Math.exp(-dt / tau);
    mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * alpha;
    mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * alpha;

    program.uniforms.uMouse.value = mouseSmooth;
    program.uniforms.uTime.value = accumTime;

    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(update);
  };
  raf = requestAnimationFrame(update);

  return {
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      listenTarget.removeEventListener('pointermove', onPointer);
      ro?.disconnect();
      if (!ro) window.removeEventListener('resize', resize);
      io?.disconnect();
      try {
        if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      } catch (e) {}
      try { mesh?.remove?.(); } catch (e) {}
      try { triangle?.remove?.(); } catch (e) {}
      try { program?.remove?.(); } catch (e) {}
      try { if (gradientTex?.texture) gl.deleteTexture(gradientTex.texture); } catch (e) {}
    }
  };
}

// ============================================================================
// 2. BLOB CURSOR (Three.js Metaball SDF Physics Cursor)
// Adapted for OJIX Brand Theme: Chrome finish with vibrant Orange (#F97316)
// ============================================================================

const CORE = 8;
const HEAD_RADIUS = 0.7;
const HEAD_BLEND = 0.6;
const MAX_TRAIL = 16;
const MAX_DROPS = 96;
const MAX_PARTS = 48;
const DROP_LIFE = 30;
const MATERIALS = ['chrome', 'jelly', 'pearl', 'ink'];
const BLENDS = ['normal', 'difference', 'exclusion', 'multiply', 'screen', 'overlay'];
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [data-blob-grow]';

const FIELD = `
#define BLOB_MAX ${MAX_PARTS}
uniform vec4 blobSeg[BLOB_MAX];
uniform vec4 blobInfo[BLOB_MAX];
uniform int blobCount;
uniform int blobHeadEnd;
uniform int blobTubeEnd;
uniform float blobJoin;
uniform float blobLift;
uniform float blobTop;
uniform float blobRef;
uniform vec2 blobDepth;
varying vec2 vBlobSpot;

vec4 blobPart(vec2 p, int i, float z) {
  vec4 seg = blobSeg[i];
  vec2 r = blobInfo[i].xy;
  vec2 axis = seg.zw - seg.xy;
  float len = length(axis);
  if (len <= abs(r.x - r.y) + 0.001) {
    vec2 d = p - (r.x >= r.y ? seg.xy : seg.zw);
    float dist = max(sqrt(dot(d, d) + z * z), 0.0001);
    return vec4(dist - max(r.x, r.y), vec3(d, z) / dist);
  }
  vec2 dir = axis / len;
  vec2 rel = p - seg.xy;
  float u = dot(rel, dir);
  vec2 side = rel - dir * u;
  float w = sqrt(dot(side, side) + z * z);
  float b = (r.x - r.y) / len;
  float a = sqrt(1.0 - b * b);
  float along = a * u - b * w;
  vec3 f = vec3(a * w + b * u - r.x, a, b);
  if (along < 0.0) {
    float d = max(sqrt(w * w + u * u), 0.0001);
    f = vec3(d - r.x, w / d, u / d);
  } else if (along > a * len) {
    float d = max(sqrt(w * w + (u - len) * (u - len)), 0.0001);
    f = vec3(d - r.y, w / d, (u - len) / d);
  }
  return vec4(f.x, vec3(dir * f.z, 0.0) + vec3(side, z) / max(w, 0.0001) * f.y);
}

vec4 blobSmooth(vec4 a, vec4 b, float k) {
  float h = k > 0.0 ? max(k - abs(a.x - b.x), 0.0) / k : 0.0;
  float weight = b.x < a.x ? 1.0 - 0.5 * h * h : 0.5 * h * h;
  return vec4(min(a.x, b.x) - h * h * h * k / 6.0, mix(a.yzw, b.yzw, weight));
}

vec4 blobShape(vec2 p, float z) {
  vec4 body = blobPart(p, 0, z);
  for (int i = 1; i < BLOB_MAX; i++) {
    if (i >= blobHeadEnd) break;
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);
  }
  if (blobTubeEnd > blobHeadEnd) {
    vec4 tube = blobPart(p, blobHeadEnd, z);
    for (int i = blobHeadEnd + 1; i < BLOB_MAX; i++) {
      if (i >= blobTubeEnd) break;
      tube = blobSmooth(tube, blobPart(p, i, z), blobInfo[i].z);
    }
    body = blobSmooth(body, tube, blobJoin);
  }
  for (int i = blobTubeEnd; i < BLOB_MAX; i++) {
    if (i >= blobCount) break;
    body = blobSmooth(body, blobPart(p, i, z), blobInfo[i].z);
  }
  return body;
}
`;

const SURFACE = `
  vec4 blobBase = blobShape(vBlobSpot, 0.0);
  float blobAlpha = clamp(0.5 - blobBase.x / max(fwidth(blobBase.x), 0.0001), 0.0, 1.0);
  if (blobAlpha <= 0.0) discard;
  float blobLow = 0.0;
  float blobHigh = blobTop;
  float blobZ = min(sqrt(max(-blobBase.x, 0.0) * max(2.0 * blobRef + blobBase.x, 0.0)), blobTop);
  for (int k = 0; k < 8; k++) {
    vec4 blobTry = blobShape(vBlobSpot, blobZ);
    if (blobTry.x > 0.0) blobHigh = blobZ;
    else blobLow = blobZ;
    float blobNext = blobZ - blobTry.x / max(blobTry.w, 0.0001);
    blobZ = blobNext > blobLow && blobNext < blobHigh ? blobNext : 0.5 * (blobLow + blobHigh);
  }
  vec4 blobAt = blobShape(vBlobSpot, blobZ);
  vec3 blobNormal = normalize(vec3(blobAt.yz, blobAt.w / blobLift));
  gl_FragDepth = blobDepth.x - blobDepth.y * blobZ * blobLift;
`;

const SURFACE_NORMAL = `
  float faceDirection = 1.0;
  vec3 normal = normalize((viewMatrix * vec4(blobNormal, 0.0)).xyz);
  vec3 nonPerturbedNormal = normal;
`;

const sculpt = (shader, uniforms, body) => {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = shader.vertexShader
    .replace('void main() {', 'varying vec2 vBlobSpot;\nvoid main() {')
    .replace(
      '#include <project_vertex>',
      '#include <project_vertex>\n\tvBlobSpot = (modelMatrix * vec4(transformed, 1.0)).xy;'
    );
  shader.fragmentShader = shader.fragmentShader
    .replace('void main() {', `${FIELD}\nvoid main() {\n${body}`)
    .replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      'vec4 diffuseColor = vec4( diffuse, opacity * blobAlpha );'
    )
    .replace('#include <normal_fragment_begin>', SURFACE_NORMAL);
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (a, b, t) => a + (b - a) * t;
const createBody = () => ({ x: 0, y: 0, vx: 0, vy: 0, size: 0 });

export function initBlobCursor(containerElement, options = {}) {
  const root = typeof containerElement === 'string'
    ? document.querySelector(containerElement)
    : containerElement;

  if (!root) return null;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const isFinePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? true;

  if (!isFinePointer || reducedMotion) {
    return null;
  }

  const settings = {
    material: 'chrome',
    color: '#C9662F',
    size: 32,
    morph: 0,
    morphSpeed: 0.4,
    depth: 1,
    trail: 16,
    lag: 0.35,
    goo: 1,
    stretch: 0.6,
    wobble: 1,
    drip: 0,
    splash: true,
    splashCount: 6,
    splashSpeed: 0.5,
    splashSize: 0.5,
    splashGravity: 0,
    regrow: 0.5,
    shine: 1,
    shadow: false,
    blend: 'normal',
    hideCursor: true,
    ...options
  };

  if (settings.hideCursor && typeof document !== 'undefined') {
    document.documentElement.classList.add('has-blob-cursor');
    document.body?.classList.add('has-blob-cursor');
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });
  } catch (err) {
    console.warn('BlobCursor WebGLRenderer error:', err);
    return null;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.shadowMap.autoUpdate = true;

  const canvas = renderer.domElement;
  canvas.className = 'blob-cursor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  root.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.03);
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentRotation.set(-0.9, 0.35, 0);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 6000);
  camera.position.set(0, 0, 2000);

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 14;
  key.shadow.blurSamples = 20;
  key.shadow.bias = -0.0004;
  scene.add(key, key.target);

  const field = {
    blobSeg: { value: new Float32Array(MAX_PARTS * 4) },
    blobInfo: { value: new Float32Array(MAX_PARTS * 4) },
    blobCount: { value: 0 },
    blobHeadEnd: { value: 0 },
    blobTubeEnd: { value: 0 },
    blobJoin: { value: 0 },
    blobLift: { value: 1 },
    blobTop: { value: 1 },
    blobRef: { value: 1 },
    blobDepth: {
      value: new THREE.Vector2(
        (camera.position.z - camera.near) / (camera.far - camera.near),
        1 / (camera.far - camera.near)
      )
    }
  };

  const coat = shader => sculpt(shader, field, SURFACE);
  const blobPhysical = new THREE.MeshPhysicalMaterial({ transparent: true });
  const blobFlat = new THREE.MeshBasicMaterial({ transparent: true });
  blobPhysical.onBeforeCompile = coat;
  blobFlat.onBeforeCompile = coat;
  const cast = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  cast.onBeforeCompile = shader => sculpt(shader, field, 'if (blobShape(vBlobSpot, 0.0).x > 0.0) discard;');
  const sprayPhysical = new THREE.MeshPhysicalMaterial();
  const sprayFlat = new THREE.MeshBasicMaterial();
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobPhysical);
  blob.castShadow = true;
  blob.frustumCulled = false;
  blob.customDepthMaterial = cast;
  scene.add(blob);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.receiveShadow = true;
  scene.add(ground);

  const sphere = new THREE.SphereGeometry(1, 32, 24);
  const spray = new THREE.InstancedMesh(sphere, sprayPhysical, MAX_DROPS);
  spray.castShadow = true;
  spray.frustumCulled = false;
  spray.count = 0;
  scene.add(spray);

  const placement = new THREE.Matrix4();
  const spin = new THREE.Quaternion();
  const stretchAxis = new THREE.Vector3();
  const xAxis = new THREE.Vector3(1, 0, 0);
  const spot = new THREE.Vector3();
  const extent = new THREE.Vector3();

  const view = { width: 1, height: 1 };
  const pointer = { x: 0, y: 0, inside: false, down: false, hover: false, seen: false };
  const anchor = createBody();
  const core = Array.from({ length: CORE }, (_, i) => ({
    ...createBody(),
    spread: i / (CORE - 1),
    angle: (i / CORE) * Math.PI * 2,
    shape: 0,
    tx: 0,
    ty: 0,
    grow: 1
  }));
  const chain = Array.from({ length: MAX_TRAIL }, createBody);
  const drops = [];
  const swell = { value: 0, velocity: 0 };
  const mass = { value: 1, wait: 0 };
  const seeds = Array.from({ length: 4 }, () => Math.random() * Math.PI * 2);
  let clock = Math.random() * 60;
  let dripping = 0;
  let raf = 0;
  let last = 0;
  let alive = true;
  let calm = 0;

  const resize = () => {
    view.width = Math.max(1, root.clientWidth);
    view.height = Math.max(1, root.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(view.width, view.height, false);
    camera.left = -view.width / 2;
    camera.right = view.width / 2;
    camera.top = view.height / 2;
    camera.bottom = -view.height / 2;
    camera.updateProjectionMatrix();
    const reach = Math.max(view.width, view.height) * 0.75;
    const frustum = key.shadow.camera;
    frustum.left = -reach;
    frustum.right = reach;
    frustum.top = reach;
    frustum.bottom = -reach;
    frustum.near = 1;
    frustum.far = reach * 6;
    frustum.updateProjectionMatrix();
    ground.scale.set(view.width * 1.5, view.height * 1.5, 1);
    start();
  };

  const apply = () => {
    const tint = new THREE.Color();
    try {
      tint.set(settings.color);
    } catch {
      tint.set('#C9662F');
    }
    for (const physical of [blobPhysical, sprayPhysical]) {
      physical.color.copy(tint);
      physical.metalness = 0;
      physical.roughness = 0.2;
      physical.clearcoat = 0;
      physical.clearcoatRoughness = 0;
      physical.iridescence = 0;
      physical.envMapIntensity = 1;
      if (settings.material === 'chrome') {
        physical.metalness = 0.82;
        physical.roughness = mix(0.25, 0.04, settings.shine);
        physical.clearcoat = 0.8;
        physical.clearcoatRoughness = 0.05;
        physical.envMapIntensity = mix(1.0, 1.4, settings.shine);
      } else if (settings.material === 'jelly') {
        physical.roughness = mix(0.5, 0.18, settings.shine);
        physical.clearcoat = 1;
        physical.clearcoatRoughness = mix(0.25, 0.02, settings.shine);
        physical.envMapIntensity = mix(0.5, 0.9, settings.shine);
      } else if (settings.material === 'pearl') {
        physical.metalness = 0.35;
        physical.roughness = mix(0.4, 0.1, settings.shine);
        physical.clearcoat = 1;
        physical.clearcoatRoughness = 0.05;
        physical.iridescence = 1;
        physical.iridescenceIOR = 1.75;
        physical.iridescenceThicknessRange = [240, 820];
        physical.envMapIntensity = 1.15;
      }
      physical.needsUpdate = true;
    }
    blobFlat.color.copy(tint);
    sprayFlat.color.copy(tint);
    const ink = settings.material === 'ink';
    blob.material = ink ? blobFlat : blobPhysical;
    spray.material = ink ? sprayFlat : sprayPhysical;
    ground.material.opacity = 0.22;
    root.style.mixBlendMode = settings.blend;
    start();
  };

  const place = (x, y) => {
    for (const body of [anchor, ...core, ...chain]) {
      body.x = x;
      body.y = y;
      body.vx = 0;
      body.vy = 0;
    }
  };

  const locate = event => {
    const rect = root.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
  };

  const onMove = event => {
    if (event.pointerType === 'touch' && !pointer.down) return;
    const spot = locate(event);
    if (spot.inside && (!pointer.inside || !pointer.seen) && swell.value < 0.05) place(spot.x, spot.y);
    pointer.x = spot.x;
    pointer.y = spot.y;
    pointer.inside = spot.inside;
    pointer.seen = true;
    const target = event.target instanceof Element ? event.target : null;
    pointer.hover = spot.inside && !!target?.closest(INTERACTIVE);
    start();
  };

  const burst = () => {
    const radius = (settings.size / 2) * Math.cbrt(mass.value);
    for (const ball of core) {
      const angle = Math.random() * Math.PI * 2;
      const push = radius * mix(4, 9, Math.random()) * mix(0.6, 1.2, settings.wobble);
      ball.vx += Math.cos(angle) * push;
      ball.vy += Math.sin(angle) * push;
    }
    if (!settings.splash) return;
    const size = mix(0.12, 0.42, settings.splashSize);
    const speed = mix(320, 1600, settings.splashSpeed);
    const offset = Math.random() * Math.PI * 2;
    const fresh = [];
    let lost = 0;
    for (let i = 0; i < settings.splashCount; i++) {
      const angle = offset + (i / settings.splashCount) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / settings.splashCount);
      const grain = Math.random();
      const pace = speed * mix(1.3, 0.75, grain) * mix(0.85, 1.15, Math.random());
      const r = (settings.size / 2) * size * mix(0.65, 1.3, grain);
      const vx = Math.cos(angle) * pace + anchor.vx * 0.4;
      const vy = Math.sin(angle) * pace + anchor.vy * 0.4;
      lost += Math.pow(r / (settings.size / 2), 3);
      fresh.push({
        x: anchor.x + Math.cos(angle) * radius * 0.35,
        y: anchor.y + Math.sin(angle) * radius * 0.35,
        vx,
        vy,
        cx: vx * 0.45,
        cy: vy * 0.45,
        r,
        share: 0,
        age: 0,
        life: DROP_LIFE,
        drag: 0.6,
        free: false,
        sink: -1
      });
    }
    const before = mass.value;
    mass.value = Math.max(0.2, before - clamp(lost * 2.4, 0.25, 0.7));
    mass.wait = 0.28;
    for (const drop of fresh) {
      drop.share = ((before - mass.value) * Math.pow(drop.r / (settings.size / 2), 3)) / lost;
      if (drops.length >= MAX_DROPS) drops.shift();
      drops.push(drop);
    }
  };

  const onDown = event => {
    const spot = locate(event);
    if (!spot.inside) return;
    if (event.pointerType === 'touch' && swell.value < 0.05) place(spot.x, spot.y);
    pointer.x = spot.x;
    pointer.y = spot.y;
    pointer.inside = true;
    pointer.seen = true;
    pointer.down = true;
    swell.velocity -= 2;
    burst();
    start();
  };

  const onUp = event => {
    if (!pointer.down) return;
    pointer.down = false;
    swell.velocity += 1.2;
    if (event.pointerType === 'touch') pointer.inside = false;
    start();
  };

  const onLeave = event => {
    if (event.relatedTarget) return;
    pointer.inside = false;
    pointer.down = false;
    start();
  };

  const onBlur = () => {
    pointer.inside = false;
    pointer.down = false;
    start();
  };

  const integrate = (body, tx, ty, stiffness, damping, h, frameX = 0, frameY = 0) => {
    body.vx += ((tx - body.x) * stiffness - (body.vx - frameX) * damping) * h;
    body.vy += ((ty - body.y) * stiffness - (body.vy - frameY) * damping) * h;
    body.x += body.vx * h;
    body.y += body.vy * h;
  };

  const step = dt => {
    const radius = settings.size / 2;
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    const anchorStiffness = mix(1200, 160, settings.lag);
    const coreStiffness = mix(900, 260, settings.lag);
    const linkStiffness = mix(30000, 1500, settings.stretch);
    const linkDamping = 2 * Math.sqrt(linkStiffness) * mix(0.95, 0.65, settings.wobble);
    const bounce = mix(0.95, 0.4, settings.wobble);
    const visible = pointer.inside && pointer.seen;
    const swellTarget = visible ? (pointer.down ? 0.86 : pointer.hover ? 1.3 : 1) : 0;

    clock += dt * 4 * Math.pow(settings.morphSpeed, 1.5);
    const bend = settings.morph * (0.6 + 0.4 * Math.sin(clock * 0.71 + seeds[0]));
    const bendAngle = clock * 0.23 + seeds[1];
    const fold = settings.morph * 0.8 * (0.5 + 0.5 * Math.sin(clock * 0.53 + seeds[2]));
    const foldAngle = seeds[3] - clock * 0.17;
    let strain = 0;
    for (const ball of core) {
      ball.shape = bend * Math.cos(2 * (ball.angle - bendAngle)) + fold * Math.cos(3 * (ball.angle - foldAngle));
      strain += (ball.shape * ball.shape) / CORE;
    }
    const hold = 1 / (1 + 0.3 * strain);
    for (const ball of core) {
      const out = radius * clamp(0.14 + 0.75 * ball.shape, 0, 0.8) * hold;
      ball.tx = Math.cos(ball.angle) * out;
      ball.ty = Math.sin(ball.angle) * out;
      ball.grow = (1 + 0.35 * ball.shape) * hold;
    }

    for (let i = 0; i < steps; i++) {
      integrate(anchor, pointer.x, pointer.y, anchorStiffness, 2 * Math.sqrt(anchorStiffness) * 0.9, h);
      for (const ball of core) {
        const k = coreStiffness * mix(1.3, 0.7, ball.spread);
        integrate(
          ball,
          anchor.x + ball.tx,
          anchor.y + ball.ty,
          k,
          2 * Math.sqrt(k) * bounce,
          h,
          anchor.vx,
          anchor.vy
        );
      }
      for (let c = 0; c < settings.trail; c++) {
        const leader = c > 0 ? chain[c - 1] : anchor;
        integrate(chain[c], leader.x, leader.y, linkStiffness, linkDamping, h);
      }
      const fall = settings.splashGravity * 2200;
      const inward = 1 - Math.exp(-18 * h);
      for (const drop of drops) {
        drop.age += h;
        if (drop.sink >= 0) {
          const sunk = Math.min(1, drop.sink + h / 0.14);
          mass.value = Math.min(1.35, mass.value + drop.share * (sunk - drop.sink));
          drop.sink = sunk;
          drop.x += (anchor.x - drop.x) * inward;
          drop.y += (anchor.y - drop.y) * inward;
          continue;
        }
        const ease = Math.exp(-drop.drag * h);
        drop.vx = drop.cx + (drop.vx - drop.cx) * ease;
        drop.vy = drop.cy + (drop.vy - drop.cy) * ease + fall * h;
        drop.x += drop.vx * h;
        drop.y += drop.vy * h;
      }
      swell.velocity +=
        ((swellTarget - swell.value) * 300 - swell.velocity * 2 * Math.sqrt(300) * mix(0.8, 0.38, settings.wobble)) * h;
      swell.value += swell.velocity * h;
      if (swell.value < 0) {
        swell.value = 0;
        swell.velocity = Math.max(0, swell.velocity);
      }
    }

    const body = radius * Math.max(swell.value, 0) * Math.cbrt(mass.value);
    const touching = (drop, bodies) =>
      bodies.some(part => part.size > 0 && Math.hypot(drop.x - part.x, drop.y - part.y) < part.size + drop.r * 0.9);
    const tail = settings.trail > 0 ? chain[settings.trail - 1] : core[CORE - 1];
    const rush = Math.hypot(anchor.vx, anchor.vy);
    if (visible) dripping += dt * settings.drip * 26 * clamp((rush - 600) / 1800, 0, 1);
    while (dripping >= 1) {
      dripping -= 1;
      const r = radius * mix(0.07, 0.17, Math.random());
      if (Math.hypot(tail.x - anchor.x, tail.y - anchor.y) < body + r * 2) continue;
      const share = Math.pow(r / radius, 3) * 2.4;
      mass.value = Math.max(0.2, mass.value - share);
      if (drops.length >= MAX_DROPS) drops.shift();
      drops.push({
        x: tail.x + (Math.random() - 0.5) * r,
        y: tail.y + (Math.random() - 0.5) * r,
        vx: tail.vx * 0.2,
        vy: tail.vy * 0.2,
        cx: 0,
        cy: 0,
        r,
        share,
        age: 0,
        life: mix(2.5, 4, Math.random()),
        drag: 9,
        free: true,
        sink: -1
      });
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      if (
        drop.free &&
        drop.sink < 0 &&
        drop.age > 0.3 &&
        swell.value > 0.05 &&
        (touching(drop, core) || touching(drop, chain))
      ) {
        drop.sink = 0;
        const kick = Math.min(0.5, drop.share * 4);
        for (const ball of core) {
          ball.vx += (drop.vx - anchor.vx) * kick;
          ball.vy += (drop.vy - anchor.vy) * kick;
        }
      }
      const margin = drop.r * 3;
      const outside =
        drop.x < -margin || drop.y < -margin || drop.x > view.width + margin || drop.y > view.height + margin;
      if (outside || drop.sink >= 1 || drop.age > drop.life) drops.splice(i, 1);
    }
    if (mass.wait > 0) mass.wait -= dt;
    else mass.value += (1 - mass.value) * (1 - Math.exp(-dt * mix(0.9, 6, settings.regrow)));
  };

  const build = () => {
    const full = (settings.size / 2) * Math.max(swell.value, 0);
    const radius = full * Math.cbrt(mass.value);
    const present = radius >= 0.5;
    const blend = radius * mix(0.3, 0.9, settings.goo);
    const release = radius + blend;
    const lift = mix(0.3, 1, settings.depth);
    const room = MAX_PARTS - CORE - settings.trail;
    const parts = [];
    const merging = [];
    spray.count = 0;
    for (const part of core) part.size = 0;
    for (const part of chain) part.size = 0;

    for (const drop of drops) {
      const gap = Math.hypot(drop.x - anchor.x, drop.y - anchor.y);
      const rise = drop.free || !present ? 1 : clamp((gap - radius * 0.55) / (radius * 0.6), 0, 1);
      const fade = Math.min(rise * rise * (3 - 2 * rise), drop.age / 0.06, (drop.life - drop.age) / 0.9);
      const r = drop.r * fade * (drop.sink < 0 ? 1 : Math.cbrt(1 - drop.sink));
      if (r < 0.6) continue;
      if (present && merging.length < room && (drop.sink >= 0 || (!drop.free && gap < release + r))) {
        const firm = drop.sink >= 0 ? 0 : clamp((gap - radius * 0.6) / (release + r - radius * 0.6), 0, 1);
        merging.push([
          drop.x,
          drop.y,
          drop.x,
          drop.y,
          r,
          r,
          Math.min(blend, r * 1.2) * (1 - firm * firm * (3 - 2 * firm))
        ]);
        continue;
      }
      drop.free = true;
      if (spray.count >= MAX_DROPS) continue;
      const speed = Math.hypot(drop.vx, drop.vy);
      const settle = present ? clamp((gap - release - r) / (r * 2), 0, 1) : 1;
      const pull = 1 + Math.min(speed / 2600, 0.6) * settings.stretch * settle;
      stretchAxis.set(drop.vx, -drop.vy, 0);
      if (speed > 1) spin.setFromUnitVectors(xAxis, stretchAxis.normalize());
      else spin.identity();
      spot.set(drop.x - view.width / 2, view.height / 2 - drop.y, 0);
      extent.set(r * pull, r / Math.sqrt(pull), (r / Math.sqrt(pull)) * lift);
      placement.compose(spot, spin, extent);
      spray.setMatrixAt(spray.count, placement);
      spray.count++;
    }
    spray.instanceMatrix.needsUpdate = true;

    const floor = -(settings.size / 2) * 0.9 * lift;
    ground.position.set(0, 0, floor);
    key.target.position.set(0, 0, floor);
    key.position.set(-0.42, 0.5, 0.76).multiplyScalar(Math.max(view.width, view.height) * 2);
    if (!present) return { blob: false, spray: spray.count > 0 };

    for (const ball of core) {
      const r = radius * HEAD_RADIUS * ball.grow;
      ball.size = r + radius * 0.3;
      parts.push([ball.x, ball.y, ball.x, ball.y, r, r, radius * HEAD_BLEND]);
    }
    const route = [anchor, ...chain.slice(0, settings.trail)];
    const marks = [0];
    for (let c = 1; c < route.length; c++) {
      marks.push(marks[c - 1] + Math.hypot(route[c].x - route[c - 1].x, route[c].y - route[c - 1].y));
    }
    const length = marks[marks.length - 1];
    const grown = clamp(length / radius, 0, 1);
    const start = radius * mix(0.6, 0.95, grown * grown * (3 - 2 * grown));
    const taper = mix(0.75, 1.6, clamp(length / (radius * 6), 0, 1));
    const thickness = u => mix(radius * 0.1, start, Math.pow(1 - u, taper));
    const sample = distance => {
      let c = 1;
      while (c < marks.length - 1 && marks[c] < distance) c++;
      const span = marks[c] - marks[c - 1];
      const t = span > 0 ? clamp((distance - marks[c - 1]) / span, 0, 1) : 0;
      return [mix(route[c - 1].x, route[c].x, t), mix(route[c - 1].y, route[c].y, t)];
    };
    for (let c = 0; c < settings.trail; c++) chain[c].size = thickness(length > 0 ? marks[c + 1] / length : 1);
    let previous = [anchor.x, anchor.y];
    for (let m = 1; m <= settings.trail; m++) {
      const next = sample((length * m) / settings.trail);
      parts.push([
        previous[0],
        previous[1],
        next[0],
        next[1],
        thickness((m - 1) / settings.trail),
        thickness(m / settings.trail),
        radius * 0.06
      ]);
      previous = next;
    }
    parts.push(...merging);

    const seg = field.blobSeg.value;
    const info = field.blobInfo.value;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const join = radius * mix(0.2, 0.6, settings.goo);
    let top = join;
    parts.forEach(([ax, ay, bx, by, r1, r2, k], i) => {
      const x1 = ax - view.width / 2;
      const y1 = view.height / 2 - ay;
      const x2 = bx - view.width / 2;
      const y2 = view.height / 2 - by;
      const reach = Math.max(r1, r2) + k;
      seg.set([x1, y1, x2, y2], i * 4);
      info.set([r1, r2, k, 0], i * 4);
      minX = Math.min(minX, x1 - reach, x2 - reach);
      maxX = Math.max(maxX, x1 + reach, x2 + reach);
      minY = Math.min(minY, y1 - reach, y2 - reach);
      maxY = Math.max(maxY, y1 + reach, y2 + reach);
      top = Math.max(top, reach);
    });
    field.blobCount.value = parts.length;
    field.blobHeadEnd.value = CORE;
    field.blobTubeEnd.value = CORE + settings.trail;
    field.blobJoin.value = join;
    field.blobTop.value = top;
    field.blobRef.value = radius;
    field.blobLift.value = lift;
    blob.position.set((minX + maxX) / 2, (minY + maxY) / 2, 0);
    blob.scale.set(maxX - minX + 4, maxY - minY + 4, 1);
    return { blob: true, spray: spray.count > 0 };
  };

  const tick = now => {
    raf = 0;
    if (!alive) return;
    const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
    last = now;
    step(dt);
    const built = build();
    const shown = built.blob || built.spray;
    blob.visible = built.blob;
    spray.visible = built.spray;
    ground.visible = shown && settings.shadow;
    renderer.render(scene, camera);
    let energy =
      Math.hypot(anchor.vx, anchor.vy) +
      Math.abs(swell.velocity) * 40 +
      drops.length * 100 +
      Math.abs(1 - mass.value) * 400;
    for (const ball of core) energy += Math.hypot(ball.vx, ball.vy);
    for (let c = 0; c < settings.trail; c++) energy += Math.hypot(chain[c].vx, chain[c].vy);
    const breathing =
      pointer.inside && settings.morph > 0 && settings.morphSpeed > 0;
    calm = energy > 1.5 || breathing ? 0 : calm + dt;
    if (!shown && !pointer.inside) return;
    if (calm > 0.4) return;
    raf = requestAnimationFrame(tick);
  };

  function start() {
    if (raf || !alive) return;
    calm = 0;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerenter', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  window.addEventListener('pointercancel', onUp, { passive: true });
  document.addEventListener('pointerout', onLeave);
  window.addEventListener('blur', onBlur);

  resize();
  apply();

  return {
    destroy: () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      if (settings.hideCursor && typeof document !== 'undefined') {
        document.documentElement.classList.remove('has-blob-cursor');
        document.body?.classList.remove('has-blob-cursor');
      }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerenter', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.removeEventListener('pointerout', onLeave);
      window.removeEventListener('blur', onBlur);
      try { blob.geometry.dispose(); } catch (e) {}
      try { blobPhysical.dispose(); } catch (e) {}
      try { blobFlat.dispose(); } catch (e) {}
      try { cast.dispose(); } catch (e) {}
      try { sphere.dispose(); } catch (e) {}
      try { spray.dispose(); } catch (e) {}
      try { sprayPhysical.dispose(); } catch (e) {}
      try { sprayFlat.dispose(); } catch (e) {}
      try { ground.geometry.dispose(); } catch (e) {}
      try { ground.material.dispose(); } catch (e) {}
      try { environment.dispose(); } catch (e) {}
      try { renderer.dispose(); } catch (e) {}
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}

// ============================================================================
// 3. REACT BITS PRO: HERO 3 ROUNDED WEBGL GRADIENT SHADER WITH CURSOR INTERACTION
// Fluid luminous mesh gradient canvas responding dynamically to cursor position
// ============================================================================

const heroVertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const heroFragmentShader = `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform vec3 uColor1; // Orange #C9662F
uniform vec3 uColor2; // Amber #F97316
uniform vec3 uColor3; // Navy #0F1C2E
uniform vec3 uColor4; // Peach-White #FFF8F3
uniform vec3 uColor5; // Slate #1E293B

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = st * 2.0 - 1.0;
    p.x *= aspect;

    vec2 m = uMouse * 2.0 - 1.0;
    m.x *= aspect;

    float mouseDist = length(p - m);
    float mouseEffect = smoothstep(1.3, 0.0, mouseDist);

    float t = uTime * 0.42;

    vec2 waveCoords = p * 1.25;
    waveCoords += vec2(
        sin(p.y * 2.2 + t * 0.85 + mouseEffect * 1.6),
        cos(p.x * 2.0 - t * 0.70 + mouseEffect * 1.6)
    ) * (0.26 + 0.18 * mouseEffect);

    float n1 = snoise(waveCoords + vec2(t * 0.22, -t * 0.16));
    float n2 = snoise(waveCoords * 1.75 - vec2(t * 0.32, t * 0.22) + n1 * 0.7);
    float n3 = snoise(waveCoords * 0.85 + vec2(-t * 0.12, t * 0.14) + n2 * 0.4);

    float factor1 = clamp(0.5 + 0.5 * n1, 0.0, 1.0);
    float factor2 = clamp(0.5 + 0.5 * n2, 0.0, 1.0);
    float factor3 = clamp(0.5 + 0.5 * n3, 0.0, 1.0);

    vec3 col = mix(uColor4, uColor1, factor1);
    col = mix(col, uColor2, factor2 * (0.55 + 0.35 * mouseEffect));
    col = mix(col, uColor3, factor3 * 0.35);
    col = mix(col, uColor5, (1.0 - factor1) * 0.20);

    // Interactive cursor spotlight bloom
    float spotlight = exp(-mouseDist * 2.5) * (0.42 + 0.38 * uHover);
    col += uColor2 * spotlight;

    // Radiant amber warmth
    float glow = exp(-mouseDist * 1.1) * 0.20;
    col += uColor1 * glow;

    // Soft border vignette
    float dCorner = length(max(abs(st - 0.5) - 0.36, 0.0));
    float vignette = smoothstep(0.26, 0.0, dCorner);

    fragColor = vec4(col, clamp(0.92 + 0.08 * vignette, 0.0, 1.0));
}
`;

export function initHeroGradientShader(containerElement, options = {}) {
  const container = typeof containerElement === 'string'
    ? document.querySelector(containerElement)
    : containerElement;

  if (!container) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let renderer;
  try {
    renderer = new Renderer({
      dpr,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
  } catch (err) {
    console.warn('HeroGradientShader WebGL not supported, falling back to CSS:', err);
    container.classList.add('shader-fallback');
    return null;
  }

  const gl = renderer.gl;
  gl.canvas.style.position = 'absolute';
  gl.canvas.style.inset = '0';
  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  gl.canvas.style.borderRadius = 'inherit';
  gl.canvas.style.pointerEvents = 'none';
  container.prepend(gl.canvas);

  const program = new Program(gl, {
    vertex: heroVertexShader,
    fragment: heroFragmentShader,
    uniforms: {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uHover: { value: 0.0 },
      uColor1: { value: [0.788, 0.400, 0.184] }, // #C9662F
      uColor2: { value: [0.976, 0.451, 0.090] }, // #F97316
      uColor3: { value: [0.059, 0.110, 0.180] }, // #0F1C2E
      uColor4: { value: [1.000, 0.973, 0.953] }, // #FFF8F3
      uColor5: { value: [0.118, 0.161, 0.231] }  // #1E293B
    }
  });

  const triangle = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry: triangle, program });

  const resize = () => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
  };

  let ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(resize);
    ro.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  const mouseTarget = [0.5, 0.5];
  const mouseSmooth = [0.5, 0.5];
  let hoverTarget = 0.0;
  let hoverSmooth = 0.0;

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const y = 1.0 - ((e.clientY - rect.top) / Math.max(rect.height, 1)); // GL inverted Y
    mouseTarget[0] = Math.min(Math.max(x, 0), 1);
    mouseTarget[1] = Math.min(Math.max(y, 0), 1);
    hoverTarget = 1.0;

    // Update CSS custom property for specular spotlight
    container.style.setProperty('--card-cursor-x', `${(e.clientX - rect.left).toFixed(1)}px`);
    container.style.setProperty('--card-cursor-y', `${(e.clientY - rect.top).toFixed(1)}px`);
  };

  const onPointerLeave = () => {
    hoverTarget = 0.0;
  };

  const heroSection = container.closest('.hero') || container;
  heroSection.addEventListener('pointermove', onPointerMove, { passive: true });
  heroSection.addEventListener('pointerleave', onPointerLeave, { passive: true });

  let isVisible = true;
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      if (entries[0]) isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    io.observe(container);
  }

  let raf = 0;
  let last = performance.now();
  let accumTime = 0;
  let destroyed = false;

  const update = (now) => {
    if (destroyed) return;
    const dt = Math.max(0, now - last) * 0.001;
    last = now;

    if (!isVisible || document.hidden) {
      raf = requestAnimationFrame(update);
      return;
    }

    accumTime += dt;

    // Smooth cursor follow
    const tau = 0.08;
    const alpha = 1 - Math.exp(-dt / tau);
    mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * alpha;
    mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * alpha;
    hoverSmooth += (hoverTarget - hoverSmooth) * alpha;

    program.uniforms.uMouse.value = mouseSmooth;
    program.uniforms.uHover.value = hoverSmooth;
    program.uniforms.uTime.value = accumTime;

    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(update);
  };

  raf = requestAnimationFrame(update);

  return {
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      heroSection.removeEventListener('pointermove', onPointerMove);
      heroSection.removeEventListener('pointerleave', onPointerLeave);
      ro?.disconnect();
      if (!ro) window.removeEventListener('resize', resize);
      io?.disconnect();
      try {
        if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      } catch (e) {}
    }
  };
}

// ============================================================================
// 4. REACT BITS PRO: HERO 21 - THEME-AWARE GLSL AURORA WITH GLOWING ORB MARK
// https://pro.reactbits.dev/docs/blocks/hero-section/hero-21
// ============================================================================

const auroraVertexShader = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const auroraFragmentShader = `#version 300 es
precision highp float;
precision highp int;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uSpeed;

// Simplex noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = uv;
    p.x *= aspect;

    vec2 mouse = uMouse;
    mouse.x *= aspect;

    float mouseDist = length(p - mouse);
    float mouseWave = smoothstep(1.3, 0.0, mouseDist);

    float t = uTime * 0.38 * uSpeed;

    // Layered Aurora wavy ribbons
    float waveA = snoise(vec2(p.x * 1.6 + t * 0.45, t * 0.25)) * 0.26;
    float waveB = snoise(vec2(p.x * 2.6 - t * 0.50, p.y * 1.4 + t * 0.3)) * 0.16;
    float waveC = sin(p.x * 3.8 + t * 0.85 + mouseWave * 1.8) * 0.12;

    float totalWave = waveA + waveB + waveC;
    float auroraY = (1.0 - uv.y) + totalWave - 0.12;

    // Three layered luminous curtains of aurora
    float c1 = smoothstep(0.04, 0.48, auroraY) * smoothstep(0.92, 0.42, auroraY);
    c1 = pow(c1, 1.7);

    float c2 = smoothstep(0.14, 0.58, auroraY + 0.14) * smoothstep(0.88, 0.38, auroraY + 0.14);
    c2 = pow(c2, 2.0);

    float c3 = smoothstep(0.20, 0.68, auroraY - 0.10) * smoothstep(0.94, 0.52, auroraY - 0.10);
    c3 = pow(c3, 1.9);

    // Color definitions for light-first OJIX luxury palette
    vec3 cBg     = vec3(0.984, 0.980, 0.973); // Ivory Soft White #FAF7F2
    vec3 cCopper = vec3(0.788, 0.400, 0.184); // Orange #C9662F
    vec3 cAmber  = vec3(0.976, 0.451, 0.090); // Vivid Amber #F97316
    vec3 cGold   = vec3(0.992, 0.741, 0.447); // Golden Glow #FDBA74
    vec3 cNavy   = vec3(0.059, 0.110, 0.180); // Executive Navy #0F1C2E

    vec3 aurora = vec3(0.0);
    aurora += cCopper * c1 * 1.25;
    aurora += cAmber  * c2 * 1.05;
    aurora += cGold   * (c1 * c2) * 1.45;
    aurora += cNavy   * c3 * 0.35;

    // Glowing Orb center spotlight emission (emanating from top center)
    vec2 orbCoord = vec2(0.5 * aspect, 0.82);
    float dOrb = length(p - orbCoord);
    float orbAura = exp(-dOrb * 2.5) * 0.55;
    aurora += cAmber * orbAura;

    // Mouse cursor radiance
    float cursorAura = exp(-mouseDist * 2.8) * 0.32;
    aurora += cGold * cursorAura;

    // Blend into canvas background
    vec3 finalColor = mix(cBg, cBg + aurora, clamp(length(aurora), 0.0, 0.92));

    // Vertical gradient falloff toward bottom of hero
    float bottomFade = smoothstep(0.0, 0.35, uv.y);
    finalColor = mix(cBg, finalColor, bottomFade);

    fragColor = vec4(finalColor, 1.0);
}
`;

export function initHeroAuroraShader(containerElement, options = {}) {
  const container = typeof containerElement === 'string'
    ? document.querySelector(containerElement)
    : containerElement;

  if (!container) return null;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let renderer;
  try {
    renderer = new Renderer({
      dpr,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
  } catch (err) {
    console.warn('HeroAuroraShader WebGL not supported, falling back to CSS:', err);
    container.classList.add('aurora-fallback');
    return null;
  }

  const gl = renderer.gl;
  gl.canvas.style.position = 'absolute';
  gl.canvas.style.inset = '0';
  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  gl.canvas.style.pointerEvents = 'none';
  container.prepend(gl.canvas);

  const program = new Program(gl, {
    vertex: auroraVertexShader,
    fragment: auroraFragmentShader,
    uniforms: {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uSpeed: { value: options.speed || 1.0 }
    }
  });

  const triangle = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry: triangle, program });

  const resize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 700;
    renderer.setSize(w, h);
    program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
  };

  let ro = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(resize);
    ro.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  const mouseTarget = [0.5, 0.5];
  const mouseSmooth = [0.5, 0.5];

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const y = 1.0 - ((e.clientY - rect.top) / Math.max(rect.height, 1));
    mouseTarget[0] = Math.min(Math.max(x, 0), 1);
    mouseTarget[1] = Math.min(Math.max(y, 0), 1);

    // Update CSS variables for Glowing Orb parallax
    const heroSection = container.closest('.hero') || container;
    const orb = heroSection.querySelector('.hero-glowing-orb');
    if (orb) {
      const offsetX = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 16;
      const offsetY = ((e.clientY - 200) / 400) * 12;
      orb.style.setProperty('--orb-shift-x', `${offsetX.toFixed(1)}px`);
      orb.style.setProperty('--orb-shift-y', `${offsetY.toFixed(1)}px`);
    }
  };

  const heroSection = container.closest('.hero') || container;
  heroSection.addEventListener('pointermove', onPointerMove, { passive: true });

  let isVisible = true;
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      if (entries[0]) isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    io.observe(container);
  }

  let raf = 0;
  let last = performance.now();
  let accumTime = 0;
  let destroyed = false;

  const update = (now) => {
    if (destroyed) return;
    const dt = Math.max(0, now - last) * 0.001;
    last = now;

    if (!isVisible || document.hidden) {
      raf = requestAnimationFrame(update);
      return;
    }

    accumTime += dt;

    const tau = 0.08;
    const alpha = 1 - Math.exp(-dt / tau);
    mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * alpha;
    mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * alpha;

    program.uniforms.uMouse.value = mouseSmooth;
    program.uniforms.uTime.value = accumTime;

    renderer.render({ scene: mesh });
    raf = requestAnimationFrame(update);
  };

  raf = requestAnimationFrame(update);

  return {
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      heroSection.removeEventListener('pointermove', onPointerMove);
      ro?.disconnect();
      if (!ro) window.removeEventListener('resize', resize);
      io?.disconnect();
      try {
        if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
      } catch (e) {}
    }
  };
}

import { initScrollStack } from './components/scroll-stack.js';
import { initVaporType } from './components/vapor-type.js';
export { initScrollStack, initVaporType };

// ============================================================================
// 5. AUTO INITIALIZATION (Theme Adapted for OJIX)
// ============================================================================

export function autoInitVisuals() {
  const isFinePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? true;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const mobilePerformanceMode = window.matchMedia?.('(max-width: 1023px), (hover: none), (pointer: coarse)').matches ?? false;

  // React Bits Pro: Vapor Type for High-Impact Headings & Key Words
  const vaporTypeElements = document.querySelectorAll('.vapor-type, [data-vapor-words]');
  vaporTypeElements.forEach((el) => {
    if (!mobilePerformanceMode && !reducedMotion) initVaporType(el);
  });

  // React Bits Pro: Scroll Stack for Portfolio Showcase
  const scrollStackContainers = document.querySelectorAll('.scroll-stack-container, #portfolio-scroll-stack');
  scrollStackContainers.forEach((el) => {
    initScrollStack(el);
  });

  // React Bits Pro Hero 21: Theme-Aware GLSL Aurora
  if (!reducedMotion && !mobilePerformanceMode && isFinePointer) {
    const auroraContainers = document.querySelectorAll('.hero-aurora-canvas, #hero-aurora-canvas');
    auroraContainers.forEach((el) => {
      initHeroAuroraShader(el);
    });

    const shaderContainers = document.querySelectorAll('.hero-shader-stage, #hero-shader-stage');
    shaderContainers.forEach((el) => {
      initHeroGradientShader(el);
    });
  } else {
    document.querySelectorAll('.hero-aurora-canvas, #hero-aurora-canvas').forEach((el) => {
      el.classList.add('aurora-fallback');
    });
  }

  if (reducedMotion) return;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitVisuals);
  } else {
    autoInitVisuals();
  }
}


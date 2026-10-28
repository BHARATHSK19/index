/**
 * React Bits Pro - Vapor Type Component
 * "Words that condense out of vapor and drift away"
 * 
 * Adapted for OJIX Engineering & Technology Enterprise Design System.
 * Uses Three.js WebGL particle flow field simulation with interactive pointer breath.
 */

import * as THREE from 'three';

export const VAPOR_PRESETS = {
  mist: {
    vaporColor: '#F97316',
    sweep: 'left',
    spread: 1.2,
    rise: 1.0,
    turbulence: 0.8,
    diffusion: 0.35,
    stagger: 0.8,
    particleSize: 1.2
  },
  steam: {
    vaporColor: '#FFEDD5',
    sweep: 'top',
    spread: 1.7,
    rise: 2.0,
    turbulence: 1.2,
    diffusion: 0.25,
    stagger: 0.6,
    particleSize: 1.1
  },
  bloom: {
    vaporColor: '#C9662F',
    sweep: 'center',
    spread: 1.3,
    rise: 0.8,
    turbulence: 1.0,
    diffusion: 0.45,
    stagger: 0.9,
    particleSize: 1.3
  },
  copper: {
    vaporColor: '#E67E22',
    sweep: 'scatter',
    spread: 1.4,
    rise: 0.6,
    turbulence: 0.9,
    diffusion: 0.4,
    stagger: 0.7,
    particleSize: 1.25
  },
  frost: {
    vaporColor: '#93C5FD',
    sweep: 'right',
    spread: 1.1,
    rise: -0.5,
    turbulence: 0.5,
    diffusion: 0.5,
    stagger: 0.8,
    particleSize: 1.1
  }
};

const SWEEP_TYPES = ['left', 'right', 'center', 'top', 'scatter'];

const quadVertexShader = `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const simulationShader = `
precision highp float;

uniform sampler2D uPrevious;
uniform vec2 uResolution;
uniform vec2 uCanvas;
uniform float uFollow;
uniform float uDrain;
uniform vec2 uFrom;
uniform vec2 uTo;
uniform float uRadius;
uniform float uAmount;
uniform vec2 uWind;

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 e = b - a;
  float t = clamp(dot(p - a, e) / max(dot(e, e), 1e-4), 0.0, 1.0);
  return length(p - a - e * t);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * uCanvas;
  vec4 previous = texture2D(uPrevious, uv);
  float d = segmentDistance(p, uFrom, uTo) / uRadius;
  float paint = exp(-d * d * 2.0) * uAmount;
  float target = max(previous.a - uDrain, paint);
  float strength = previous.r + (target - previous.r) * uFollow;
  vec2 wind = mix(previous.gb, uWind, clamp(paint * 3.0, 0.0, 1.0));
  gl_FragColor = vec4(max(strength, 0.0), wind, max(target, 0.0));
}
`;

const commonGLSL = `
uniform vec2 uCanvas;
uniform vec4 uBounds;
uniform vec2 uOrigin;
uniform float uSweep;
uniform float uStagger;
uniform float uPhase;
uniform float uMode;
uniform float uGrain;
uniform float uDpr;
uniform float uEm;
uniform float uBreath;
uniform sampler2D uField;

const float TRAVEL = 0.75;

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float orderAt(vec2 p) {
  vec2 size = max(uBounds.zw - uBounds.xy, vec2(1.0));
  vec2 q = clamp((p - uBounds.xy) / size, 0.0, 1.0);
  float o;
  if (uSweep < 0.5) {
    o = q.x;
  } else if (uSweep < 1.5) {
    o = 1.0 - q.x;
  } else if (uSweep < 2.5) {
    o = abs(q.x - 0.5) * 2.0;
  } else if (uSweep < 3.5) {
    o = 1.0 - q.y;
  } else if (uSweep < 4.5) {
    o = noise(p / (uEm * 0.5) + 3.7);
  } else {
    o = clamp(length(p - uOrigin) / max(length(size), 1.0) * 1.5, 0.0, 1.0);
  }
  return clamp(mix(o, noise(p / (uEm * 0.35) + 11.0), 0.2), 0.0, 1.0);
}

float frontAt(vec2 p) {
  if (abs(uMode - 1.0) < 0.5) return 0.0;
  float t = clamp(uPhase * (1.0 + uStagger) - orderAt(p) * uStagger, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  return uMode < 0.5 ? 1.0 - t : t;
}

float releaseAt(vec2 p) {
  float g = noise(p / uGrain) * 0.6 + hash12(floor(p * uDpr) + 0.5) * 0.4;
  return 0.02 + 0.98 * clamp((g - 0.5) * 1.4 + 0.5, 0.0, 1.0);
}

vec4 fieldAt(vec2 p) {
  return texture2D(uField, p / uCanvas + 0.5);
}

float blowAt(float strength) {
  return clamp(strength * uBreath - 0.03, 0.0, 0.6);
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}
`;

const textVertexShader = `
varying vec2 vUv;
varying vec2 vWorld;

void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xy;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const textFragmentShader = `
precision highp float;
${commonGLSL}
uniform sampler2D uText;
uniform vec3 uColor;
varying vec2 vUv;
varying vec2 vWorld;

void main() {
  float ink = texture2D(uText, vUv).a;
  if (ink < 0.004) discard;
  float lift = max(frontAt(vWorld), blowAt(fieldAt(vWorld).r));
  if (lift >= releaseAt(vWorld) * (1.0 - TRAVEL)) discard;
  gl_FragColor = vec4(toSrgb(uColor), ink);
}
`;

const particleVertexShader = `
${commonGLSL}
attribute vec4 aSeed;
uniform float uTime;
uniform float uSpread;
uniform float uRise;
uniform float uTurbulence;
uniform float uDiffusion;
uniform float uSize;
varying float vAlpha;
varying float vTint;

vec2 flow(vec2 p, float t) {
  p += 0.45 * sin(p.yx * vec2(1.3, 1.7) + vec2(t * 0.21, -t * 0.17));
  vec2 v = vec2(0.0);
  vec2 k = normalize(vec2(1.0, 0.6));
  v += vec2(k.y, -k.x) * cos(dot(k, p) * 1.1 + t * 0.55 + 1.3);
  k = normalize(vec2(-0.7, 1.1));
  v += vec2(k.y, -k.x) * cos(dot(k, p) * 1.9 - t * 0.47 + 4.1) * 0.55;
  k = normalize(vec2(1.3, -0.4));
  v += vec2(k.y, -k.x) * cos(dot(k, p) * 3.3 + t * 0.71 + 2.2) * 0.3;
  return v;
}

void main() {
  vec2 home = position.xy;
  vec4 field = fieldAt(home);
  float front = frontAt(home);
  float blow = blowAt(field.r);
  float s = clamp((max(front, blow) - releaseAt(home) * (1.0 - TRAVEL)) / TRAVEL, 0.0, 1.0);
  if (s <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vAlpha = 0.0;
    vTint = 0.0;
    return;
  }
  float blown = smoothstep(-0.04, 0.04, blow - front);
  float eased = uMode < 0.5 ? s * s : 1.0 - (1.0 - s) * (1.0 - s);
  eased = mix(eased, s, blown);
  float angle = aSeed.x * 6.2831853;
  vec2 jitter = vec2(cos(angle), sin(angle) * 0.7);
  vec2 drift = mix(vec2(0.0, uRise), field.gb * 2.2 + vec2(0.0, uRise * 0.3), blown);
  float reach = uSpread * eased * (0.3 + 0.7 * sqrt(aSeed.y));
  float stride = reach / 6.0;
  vec2 p = home;
  for (int i = 0; i < 6; i++) {
    vec2 f = flow(p / uEm * 0.9 + aSeed.z * 0.06, uTime);
    vec2 direction = drift + f * uTurbulence + jitter * uDiffusion * (0.2 + s);
    p += direction / max(length(direction), 0.35) * stride;
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  gl_PointSize = max(uSize * uDpr * mix(1.0, 1.25, s), 1.0);
  vAlpha = (1.0 - smoothstep(mix(0.45, 0.7, blown), 1.0, s)) * (0.5 + 0.5 * aSeed.w);
  vTint = smoothstep(0.0, 0.5, s);
}
`;

const particleFragmentShader = `
precision highp float;
uniform vec3 uColor;
uniform vec3 uVaporColor;
varying float vAlpha;
varying float vTint;

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  float d = length(gl_PointCoord - 0.5);
  float soft = 1.0 - smoothstep(0.3, 0.5, d);
  vec3 color = mix(uColor, uVaporColor, vTint);
  gl_FragColor = vec4(toSrgb(color), vAlpha * soft);
}
`;

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function initVaporType(container, userOptions = {}) {
  if (!container || container.dataset.vaporInitialized) return;
  container.dataset.vaporInitialized = 'true';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    container.classList.add('vapor-type-fallback');
    return;
  }

  // Extract words from dataset or inner text
  let rawWords = container.dataset.vaporWords;
  let words = [];
  if (rawWords) {
    try {
      words = JSON.parse(rawWords);
    } catch {
      words = rawWords.split(',').map(w => w.trim()).filter(Boolean);
    }
  } else {
    words = [container.textContent.trim()];
  }

  if (words.length === 0) words = ['OJIX'];

  const presetName = container.dataset.vaporPreset || userOptions.preset || 'bloom';
  const preset = VAPOR_PRESETS[presetName] || VAPOR_PRESETS.bloom;

  const options = {
    words,
    color: container.dataset.vaporColor || userOptions.color || 'currentColor',
    vaporColor: container.dataset.vaporVaporColor || userOptions.vaporColor || preset.vaporColor,
    density: parseFloat(container.dataset.vaporDensity || userOptions.density || 1.1),
    grain: parseFloat(container.dataset.vaporGrain || userOptions.grain || 1),
    sweep: container.dataset.vaporSweep || userOptions.sweep || preset.sweep,
    stagger: parseFloat(container.dataset.vaporStagger || userOptions.stagger || preset.stagger),
    condense: parseFloat(container.dataset.vaporCondense || userOptions.condense || 1.3),
    hold: parseFloat(container.dataset.vaporHold || userOptions.hold || 2.4),
    dissolve: parseFloat(container.dataset.vaporDissolve || userOptions.dissolve || 1.8),
    overlap: parseFloat(container.dataset.vaporOverlap || userOptions.overlap || 0.6),
    loop: container.dataset.vaporLoop !== 'false',
    breath: parseFloat(container.dataset.vaporBreath || userOptions.breath || 1.2),
    breathRadius: parseFloat(container.dataset.vaporBreathRadius || userOptions.breathRadius || 0.8),
    recovery: parseFloat(container.dataset.vaporRecovery || userOptions.recovery || 1.2),
    clickAdvance: true,
    pauseOnHover: true,
    spread: preset.spread,
    rise: preset.rise,
    turbulence: preset.turbulence,
    diffusion: preset.diffusion,
    particleSize: preset.particleSize
  };

  // DOM Structure Preparation
  container.classList.add('vapor-type-container');
  container.style.position = 'relative';
  container.style.display = 'inline-grid';
  container.style.gridTemplateColumns = '1fr';
  container.style.gridTemplateRows = '1fr';
  container.style.verticalAlign = 'baseline';

  // Sizer wrapper holding hidden spans so layout never jumps
  const sizer = document.createElement('span');
  sizer.className = 'vapor-type-sizer';
  sizer.setAttribute('aria-hidden', 'true');
  sizer.style.gridArea = '1 / 1';
  sizer.style.display = 'inline-grid';
  sizer.style.visibility = 'hidden';
  sizer.style.pointerEvents = 'none';

  words.forEach((w) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.gridArea = '1 / 1';
    wordSpan.style.whiteSpace = 'nowrap';
    wordSpan.textContent = w;
    sizer.appendChild(wordSpan);
  });

  // Accessible live text for screen readers
  const srText = document.createElement('span');
  srText.className = 'sr-only vapor-type-sr';
  srText.textContent = words[0];

  // Visual text wrapper (with word spans for measurement)
  const visualWrapper = document.createElement('span');
  visualWrapper.className = 'vapor-type-words';
  visualWrapper.setAttribute('aria-hidden', 'true');
  visualWrapper.style.gridArea = '1 / 1';
  visualWrapper.style.display = 'inline-grid';
  visualWrapper.style.position = 'relative';

  const wordSpans = words.map((w, idx) => {
    const s = document.createElement('span');
    s.dataset.vaporWord = '';
    s.style.gridArea = '1 / 1';
    s.style.whiteSpace = 'nowrap';
    s.style.color = 'transparent';
    s.style.userSelect = 'none';
    s.textContent = w;
    visualWrapper.appendChild(s);
    return s;
  });

  // Canvas Stage for WebGL
  const canvasWrapper = document.createElement('span');
  canvasWrapper.className = 'vapor-type-canvas-wrap';
  canvasWrapper.setAttribute('aria-hidden', 'true');
  canvasWrapper.style.position = 'absolute';
  canvasWrapper.style.inset = '-1.5em';
  canvasWrapper.style.display = 'block';
  canvasWrapper.style.pointerEvents = 'none';
  canvasWrapper.style.overflow = 'visible';

  container.textContent = '';
  container.appendChild(srText);
  container.appendChild(sizer);
  container.appendChild(visualWrapper);
  container.appendChild(canvasWrapper);

  // Three.js Setup
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('[VaporType] WebGL not supported, falling back to static text', err);
    container.classList.add('vapor-type-fallback');
    wordSpans[0].style.color = '';
    return;
  }

  renderer.setPixelRatio(1);
  const canvas = renderer.domElement;
  canvas.style.position = 'absolute';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvasWrapper.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const quadGeometry = new THREE.PlaneGeometry(1, 1);
  const emptyGeometry = new THREE.BufferGeometry();

  // Uniforms
  const commonUniforms = {
    uCanvas: { value: new THREE.Vector2(1, 1) },
    uDpr: { value: 1 },
    uEm: { value: 16 },
    uField: { value: null },
    uColor: { value: new THREE.Color(1, 1, 1) },
    uStagger: { value: options.stagger },
    uGrain: { value: options.grain },
    uBreath: { value: options.breath }
  };

  const particleUniforms = {
    uTime: { value: 0 },
    uSpread: { value: options.spread * 16 },
    uRise: { value: options.rise },
    uTurbulence: { value: options.turbulence },
    uDiffusion: { value: options.diffusion },
    uSize: { value: options.particleSize },
    uVaporColor: { value: new THREE.Color(1, 1, 1) }
  };

  const simUniforms = {
    uPrevious: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uCanvas: commonUniforms.uCanvas,
    uFollow: { value: 1 },
    uDrain: { value: 0 },
    uFrom: { value: new THREE.Vector2() },
    uTo: { value: new THREE.Vector2() },
    uRadius: { value: 40 },
    uAmount: { value: 0 },
    uWind: { value: new THREE.Vector2() }
  };

  const simMaterial = new THREE.ShaderMaterial({
    uniforms: simUniforms,
    vertexShader: quadVertexShader,
    fragmentShader: simulationShader,
    depthTest: false,
    depthWrite: false
  });

  const simScene = new THREE.Scene();
  const simMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial);
  simMesh.frustumCulled = false;
  simScene.add(simMesh);

  // Ping-pong render targets for fluid simulation
  let targets = [];
  let currentTarget = 0;

  function createRenderTarget(w, h) {
    return new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false
    });
  }

  // Create Dual Word Slots (Slot 0 & Slot 1 for seamless cross-dissolve)
  function createSlot() {
    const ownUniforms = {
      uText: { value: null },
      uBounds: { value: new THREE.Vector4() },
      uOrigin: { value: new THREE.Vector2() },
      uSweep: { value: 0 },
      uPhase: { value: 0 },
      uMode: { value: 1 }
    };
    const textMat = new THREE.ShaderMaterial({
      uniforms: { ...commonUniforms, ...ownUniforms },
      vertexShader: textVertexShader,
      fragmentShader: textFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const particleMat = new THREE.ShaderMaterial({
      uniforms: { ...commonUniforms, ...particleUniforms, ...ownUniforms },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    const textMesh = new THREE.Mesh(quadGeometry, textMat);
    textMesh.frustumCulled = false;
    textMesh.visible = false;
    const pointsMesh = new THREE.Points(emptyGeometry, particleMat);
    pointsMesh.frustumCulled = false;
    pointsMesh.renderOrder = 1;
    pointsMesh.visible = false;
    scene.add(textMesh, pointsMesh);

    return {
      own: ownUniforms,
      text: textMesh,
      points: pointsMesh,
      textMaterial: textMat,
      particleMaterial: particleMat,
      word: -1,
      mode: 1, // 0 = condensing, 1 = steady, 2 = dissolving
      elapsed: 0,
      radial: false
    };
  }

  const slots = [createSlot(), createSlot()];

  // Offscreen sampling canvas for color resolution & text rasterization
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 1;
  sampleCanvas.height = 1;
  const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

  function parseCSSColor(cssColor, fallback, targetColor) {
    if (!sampleCtx) return;
    sampleCtx.clearRect(0, 0, 1, 1);
    sampleCtx.fillStyle = fallback;
    sampleCtx.fillStyle = cssColor;
    sampleCtx.fillRect(0, 0, 1, 1);
    const [r, g, b] = sampleCtx.getImageData(0, 0, 1, 1).data;
    targetColor.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
  }

  let colorCacheKey = '';
  function updateColors() {
    const computed = getComputedStyle(container);
    const textColor = options.color === 'currentColor' ? computed.color : options.color;
    const vaporColor = options.vaporColor === 'currentColor' ? textColor : options.vaporColor;
    const key = `${textColor}|${vaporColor}`;
    if (key !== colorCacheKey) {
      colorCacheKey = key;
      parseCSSColor(textColor, '#0F1C2E', commonUniforms.uColor.value);
      parseCSSColor(vaporColor, '#C9662F', particleUniforms.uVaporColor.value);
      return true;
    }
    return false;
  }

  let cachedWordAssets = [];
  let canvasW = 0;
  let canvasH = 0;
  let dpr = 1;
  let emSize = 16;
  let activeSlotIdx = 0;
  let isRunning = false;
  let isVisible = false;
  let animFrameId = 0;
  let lastTime = 0;
  let simTime = 0;
  let lastMovedTime = -Infinity;
  let pendingClickAdvance = null;

  const pointer = {
    x: 0,
    y: 0,
    fromX: 0,
    fromY: 0,
    vx: 0,
    vy: 0,
    at: 0,
    fresh: true,
    moved: false,
    over: false
  };

  function setSlotWord(slot, wordIdx) {
    const asset = cachedWordAssets[wordIdx];
    slot.word = wordIdx;
    if (!asset) {
      slot.text.visible = false;
      slot.points.visible = false;
      return;
    }
    slot.own.uText.value = asset.texture;
    slot.own.uBounds.value.set(...asset.bounds);
    slot.text.position.set(asset.center[0], asset.center[1], 0);
    slot.text.scale.set(asset.size[0], asset.size[1], 1);
    slot.text.visible = true;
    slot.points.geometry = asset.geometry;
    slot.points.visible = true;
  }

  function clearSlot(slot) {
    slot.word = -1;
    slot.text.visible = false;
    slot.points.visible = false;
    slot.points.geometry = emptyGeometry;
    slot.own.uText.value = null;
  }

  function rasterizeWord(word, spanEl, containerRect, fontStr, letterSpacing, direction) {
    const spanRect = spanEl.getBoundingClientRect();
    if (spanRect.width <= 0 || spanRect.height <= 0) return null;

    const pad = 0.3 * emSize;
    const left = spanRect.left - containerRect.left - pad;
    const top = spanRect.top - containerRect.top - pad;
    const right = spanRect.right - containerRect.left + pad;
    const bottom = spanRect.bottom - containerRect.top + pad;

    const boxX = Math.floor(left * dpr) / dpr;
    const boxY = Math.floor(top * dpr) / dpr;
    const texW = Math.max(1, Math.ceil((right - boxX) * dpr));
    const texH = Math.max(1, Math.ceil((bottom - boxY) * dpr));

    const tCanvas = document.createElement('canvas');
    tCanvas.width = texW;
    tCanvas.height = texH;
    const ctx = tCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.setTransform(dpr, 0, 0, dpr, -boxX * dpr, -boxY * dpr);
    ctx.font = fontStr;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.direction = direction;
    ctx.letterSpacing = `${letterSpacing}px`;

    const metrics = ctx.measureText(word);
    const ascent = metrics.fontBoundingBoxAscent || 0.8 * emSize;
    const descent = metrics.fontBoundingBoxDescent || 0.2 * emSize;
    const baselineY = spanRect.top + (spanRect.bottom - spanRect.top) * ascent / (ascent + descent);

    ctx.fillText(word, spanRect.left - containerRect.left, baselineY - containerRect.top);

    const imgData = ctx.getImageData(0, 0, texW, texH).data;
    const step = 1 / Math.sqrt(clamp(options.density, 0.1, 4));

    let seedState = 0x9e3779b1;
    function rand() {
      seedState ^= seedState << 13;
      seedState ^= seedState >>> 17;
      seedState ^= seedState << 5;
      return (seedState >>> 0) / 0x100000000;
    }

    const positions = [];
    const widthCSS = texW / dpr;
    const heightCSS = texH / dpr;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let y = step / 2; y < heightCSS; y += step) {
      for (let x = step / 2; x < widthCSS; x += step) {
        const sampleX = x + (rand() - 0.5) * step;
        const sampleY = y + (rand() - 0.5) * step;
        const px = Math.min(texW - 1, Math.max(0, Math.floor(sampleX * dpr)));
        const py = Math.min(texH - 1, Math.max(0, Math.floor(sampleY * dpr)));

        if (imgData[(py * texW + px) * 4 + 3] < 96) continue;

        const posX = boxX + sampleX - canvasW / 2;
        const posY = canvasH / 2 - (boxY + sampleY);

        positions.push(posX, posY, 0);
        minX = Math.min(minX, posX);
        maxX = Math.max(maxX, posX);
        minY = Math.min(minY, posY);
        maxY = Math.max(maxY, posY);
      }
    }

    const count = positions.length / 3;
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < seeds.length; i++) {
      seeds[i] = rand();
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 4));

    const texture = new THREE.CanvasTexture(tCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    return {
      texture,
      geometry: geom,
      center: [boxX + widthCSS / 2 - canvasW / 2, canvasH / 2 - (boxY + heightCSS / 2)],
      size: [widthCSS, heightCSS],
      bounds: count ? [minX, minY, maxX, maxY] : [0, 0, 1, 1]
    };
  }

  function resize() {
    const rect = canvasWrapper.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;

    const computed = getComputedStyle(container);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    emSize = parseFloat(computed.fontSize) || 16;

    const wPx = Math.max(2, 2 * Math.ceil(rect.width * dpr / 2));
    const hPx = Math.max(2, 2 * Math.ceil(rect.height * dpr / 2));

    canvasW = wPx / dpr;
    canvasH = hPx / dpr;

    renderer.setSize(wPx, hPx, false);
    canvas.style.width = `${canvasW}px`;
    canvas.style.height = `${canvasH}px`;

    camera.left = -canvasW / 2;
    camera.right = canvasW / 2;
    camera.top = canvasH / 2;
    camera.bottom = -canvasH / 2;
    camera.updateProjectionMatrix();

    commonUniforms.uCanvas.value.set(canvasW, canvasH);
    commonUniforms.uDpr.value = dpr;
    commonUniforms.uEm.value = emSize;
    particleUniforms.uSpread.value = options.spread * emSize;

    // Simulation buffer resolution
    const simW = Math.max(8, Math.ceil(canvasW / 6));
    const simH = Math.max(8, Math.ceil(canvasH / 6));

    targets.forEach(t => t.dispose());
    targets = [createRenderTarget(simW, simH), createRenderTarget(simW, simH)];
    simUniforms.uResolution.value.set(simW, simH);

    renderer.setRenderTarget(targets[0]);
    renderer.clear();
    renderer.setRenderTarget(targets[1]);
    renderer.clear();
    renderer.setRenderTarget(null);

    currentTarget = 0;
    commonUniforms.uField.value = targets[0].texture;

    const fontStr = [
      computed.fontStyle,
      computed.fontWeight,
      `${emSize}px`,
      computed.fontFamily
    ].filter(Boolean).join(' ');

    const letterSpacing = parseFloat(computed.letterSpacing) || 0;
    const direction = computed.direction || 'ltr';

    // Clear old assets
    cachedWordAssets.forEach(a => {
      a.texture.dispose();
      a.geometry.dispose();
    });
    cachedWordAssets = [];

    const contRect = canvasWrapper.getBoundingClientRect();
    wordSpans.forEach((spanEl, idx) => {
      const asset = rasterizeWord(words[idx], spanEl, contRect, fontStr, letterSpacing, direction);
      if (asset) cachedWordAssets.push(asset);
    });

    updateColors();

    slots.forEach((s) => {
      if (s.word >= 0 && s.word < cachedWordAssets.length) {
        setSlotWord(s, s.word);
      }
    });

    return true;
  }

  function start() {
    if (isRunning || !isVisible) return;
    isRunning = true;
    activeSlotIdx = 0;
    clearSlot(slots[1]);
    const firstSlot = slots[0];
    setSlotWord(firstSlot, 0);
    firstSlot.mode = 1;
    firstSlot.elapsed = 0;
    firstSlot.radial = false;
    srText.textContent = words[0];
    requestTick();
  }

  function requestTick() {
    if (!isRunning || animFrameId) return;
    animFrameId = requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    animFrameId = 0;
    if (!isRunning || !cachedWordAssets.length) return;

    const deltaSec = lastTime ? Math.max(0, (timestamp - lastTime) / 1000) : 0;
    lastTime = timestamp;
    const dt = Math.min(deltaSec, 0.1);

    const timing = [
      Math.max(options.condense, 0.05),
      Math.max(options.hold, 0.1),
      Math.max(options.dissolve, 0.05)
    ];
    const overlapTime = timing[2] * (1 - clamp(options.overlap, 0, 1));
    const currentSlot = slots[activeSlotIdx];
    const hoverPaused = options.pauseOnHover && pointer.over;

    simTime += dt;

    // Inactive slot cleanup if dissolving finished
    const otherSlot = slots[1 - activeSlotIdx];
    if (otherSlot.word >= 0) {
      otherSlot.elapsed += dt;
      if (otherSlot.elapsed >= timing[2]) {
        clearSlot(otherSlot);
      }
    }

    // State Machine
    if (currentSlot.mode === 1) {
      // Steady hold state
      if (!hoverPaused) {
        currentSlot.elapsed += dt;
      }
      const shouldAdvance = pendingClickAdvance || currentSlot.elapsed >= timing[1];
      if (shouldAdvance) {
        currentSlot.mode = 2; // Begin dissolve
        currentSlot.elapsed = 0;
        currentSlot.radial = !!pendingClickAdvance;
        if (pendingClickAdvance) {
          currentSlot.own.uOrigin.value.set(pendingClickAdvance.x, pendingClickAdvance.y);
          pendingClickAdvance = null;
        }
      }
    } else if (currentSlot.mode === 0) {
      // Condensing state
      currentSlot.elapsed += dt;
      if (currentSlot.elapsed >= timing[0]) {
        currentSlot.mode = 1; // Transition to steady
        currentSlot.elapsed = 0;
        currentSlot.radial = false;
      }
    } else {
      // Dissolving state
      currentSlot.elapsed += dt;
    }

    // Trigger next word condensation when overlap threshold is reached
    if (currentSlot.mode === 2 && currentSlot.elapsed >= overlapTime) {
      const nextWordIdx = (currentSlot.word + 1) % cachedWordAssets.length;
      const nextSlot = slots[1 - activeSlotIdx];
      setSlotWord(nextSlot, nextWordIdx);
      nextSlot.mode = 0;
      nextSlot.elapsed = 0;
      nextSlot.radial = false;
      activeSlotIdx = 1 - activeSlotIdx;
      srText.textContent = words[nextWordIdx];
    }

    // Pointer Wind Simulation
    const recovery = Math.max(options.recovery, 0.05);
    const hasPointerMoved = pointer.moved && options.breath > 0;
    const isSettling = timestamp - lastMovedTime < (recovery + 1) * 1000;

    if ((hasPointerMoved || isSettling) && targets.length === 2) {
      const speed = Math.hypot(pointer.vx, pointer.vy);
      const strength = hasPointerMoved ? clamp(speed / 1600, 0, 1) : 0;
      const decay = speed > 1 ? Math.min(speed / 1200, 1) / speed : 0;

      simUniforms.uPrevious.value = targets[currentTarget].texture;
      simUniforms.uFollow.value = 1 - Math.exp(-dt / 0.14);
      simUniforms.uDrain.value = dt / recovery;
      simUniforms.uFrom.value.set(pointer.fromX, pointer.fromY);
      simUniforms.uTo.value.set(pointer.x, pointer.y);
      simUniforms.uRadius.value = Math.max(options.breathRadius, 0.05) * emSize;
      simUniforms.uAmount.value = strength;
      simUniforms.uWind.value.set(pointer.vx * decay, pointer.vy * decay);

      renderer.setRenderTarget(targets[1 - currentTarget]);
      renderer.render(simScene, camera);
      renderer.setRenderTarget(null);

      currentTarget = 1 - currentTarget;
      commonUniforms.uField.value = targets[currentTarget].texture;

      if (hasPointerMoved && strength > 0.02) {
        lastMovedTime = timestamp;
      }
    }

    pointer.fromX = pointer.x;
    pointer.fromY = pointer.y;
    pointer.moved = false;

    // Uniform updates
    const sweepIndex = Math.max(0, SWEEP_TYPES.indexOf(options.sweep));
    for (const s of slots) {
      s.own.uMode.value = s.mode;
      s.own.uPhase.value = s.mode === 1 ? 0 : Math.min(s.elapsed / timing[s.mode], 1);
      s.own.uSweep.value = s.radial ? 5 : sweepIndex;
    }

    commonUniforms.uStagger.value = clamp(options.stagger, 0, 4);
    commonUniforms.uGrain.value = Math.max(options.grain, 0.05) * emSize * 0.035;
    commonUniforms.uBreath.value = clamp(options.breath, 0, 3);

    particleUniforms.uTime.value = simTime;
    particleUniforms.uSpread.value = Math.max(options.spread, 0) * emSize;
    particleUniforms.uRise.value = clamp(options.rise, -3, 3);
    particleUniforms.uTurbulence.value = clamp(options.turbulence, 0, 4);
    particleUniforms.uDiffusion.value = clamp(options.diffusion, 0, 4);
    particleUniforms.uSize.value = clamp(options.particleSize, 0.25, 8);

    renderer.render(scene, camera);

    if (currentSlot.mode !== 1 || slots[1 - activeSlotIdx].word >= 0 || timestamp - lastMovedTime < (recovery + 1) * 1000) {
      requestTick();
    } else if (currentSlot.mode === 1 && !hoverPaused && isVisible) {
      const waitTime = Math.max(timing[1] - currentSlot.elapsed, 0);
      window.setTimeout(() => {
        requestTick();
      }, waitTime * 1000 + 16);
    }
  }

  // Pointer & Click Interaction
  function getCanvasLocalPoint(e) {
    const rect = canvasWrapper.getBoundingClientRect();
    return {
      x: e.clientX - rect.left - canvasW / 2,
      y: rect.top + canvasH / 2 - e.clientY
    };
  }

  function isOverContainer(e) {
    const r = container.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }

  function handlePointerMove(e) {
    if (e.pointerType === 'touch') return;
    const over = isOverContainer(e);
    if (pointer.over && !over) lastTime = 0;
    pointer.over = over;

    const pt = getCanvasLocalPoint(e);
    const now = e.timeStamp;

    if (pointer.fresh) {
      pointer.fresh = false;
      pointer.x = pt.x;
      pointer.y = pt.y;
      pointer.fromX = pt.x;
      pointer.fromY = pt.y;
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.at = now;
      return;
    }

    const dt = Math.max((now - pointer.at) / 1000, 0.002);
    const alpha = Math.min(1, dt / 0.03);
    pointer.vx += ((pt.x - pointer.x) / dt - pointer.vx) * alpha;
    pointer.vy += ((pt.y - pointer.y) / dt - pointer.vy) * alpha;
    pointer.x = pt.x;
    pointer.y = pt.y;
    pointer.at = now;
    pointer.moved = true;

    requestTick();
  }

  function handlePointerLeave() {
    if (pointer.over) lastTime = 0;
    pointer.fresh = true;
    pointer.over = false;
    pointer.vx = 0;
    pointer.vy = 0;
    requestTick();
  }

  function handlePointerDown(e) {
    if (!options.clickAdvance || e.button > 0) return;
    if (isOverContainer(e)) {
      pendingClickAdvance = getCanvasLocalPoint(e);
      requestTick();
    }
  }

  const targetArea = container.parentElement || container;
  targetArea.addEventListener('pointermove', handlePointerMove, { passive: true });
  targetArea.addEventListener('pointerdown', handlePointerDown, { passive: true });
  targetArea.addEventListener('pointerleave', handlePointerLeave, { passive: true });
  targetArea.addEventListener('pointercancel', handlePointerLeave, { passive: true });

  // Observers
  const resizeObserver = new ResizeObserver(() => {
    if (resize()) {
      requestTick();
    }
  });
  resizeObserver.observe(container);

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) {
      start();
      lastTime = 0;
      requestTick();
    } else if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = 0;
    }
  }, { rootMargin: '80px' });
  intersectionObserver.observe(container);

  // Initial layout
  setTimeout(() => {
    if (resize()) {
      start();
    }
  }, 100);
}

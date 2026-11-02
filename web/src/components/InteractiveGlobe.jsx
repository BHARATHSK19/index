import { useEffect, useRef } from "react";
import Globe from "globe.gl";
import * as THREE from "three";

/**
 * Two primary network hubs:
 * 1. USA (lat: 40.7128, lng: -74.0060)
 * 2. India (lat: 12.9716, lng: 77.5946)
 */
const places = [
  { name: "USA", lat: 40.7128, lng: -74.0060, size: 0.8, color: "#FFFFFF" },
  { name: "INDIA", lat: 12.9716, lng: 77.5946, size: 0.9, color: "#FFFFFF" }
];

/**
 * Single great-circle trajectory arc originating from USA and terminating at India.
 */
const arcs = [
  {
    startLat: 40.7128,
    startLng: -74.0060,
    endLat: 12.9716,
    endLng: 77.5946,
    color: ["#FFFFFF", "#FFFFFF"]
  }
];

/**
 * Interactive 3D Globe with static bilateral view (USA <-> India),
 * lite brand orange continents (#F39C6B), deep navy sphere (#09121E),
 * solid glowing white arc, and custom glassmorphic HTML location pin badges.
 */
export default function InteractiveGlobe() {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const initialWidth = el.clientWidth || 500;
    const initialHeight = el.clientHeight || 500;

    // Initialize Globe instance
    const globe = new Globe(el, { animateIn: false });
    globeInstanceRef.current = globe;

    // Canvas sizing, transparent background
    globe
      .width(initialWidth)
      .height(initialHeight)
      .backgroundColor("rgba(0,0,0,0)")
      .showGlobe(true);

    if (typeof globe.globeColor === "function") {
      globe.globeColor("#09121E");
    }

    // Deep Navy base sphere surface
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color("#09121E"),
      emissive: new THREE.Color("#050B12"),
      emissiveIntensity: 0.2,
      shininess: 0.8,
    });
    globe.globeMaterial(sphereMaterial);

    // Glowing atmosphere in lite brand orange
    globe
      .showAtmosphere(true)
      .atmosphereColor("#F39C6B")
      .atmosphereAltitude(0.18);

    // Continents in Lite Brand Orange (#F39C6B) via GeoJSON polygons
    fetch("/datasets/ne_110m_admin_0_countries.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("Local dataset not found");
        return res.json();
      })
      .catch(() =>
        fetch("https://unpkg.com/three-globe/example/country-polygons/ne_110m_admin_0_countries.geojson")
          .then((res) => res.json())
      )
      .then((countries) => {
        if (!globeInstanceRef.current || !countries?.features) return;
        globeInstanceRef.current
          .polygonsData(countries.features.filter((d) => d.properties?.ISO_A2 !== "AQ"))
          .polygonCapColor(() => "#F39C6B")
          .polygonSideColor(() => "rgba(243, 156, 107, 0.4)")
          .polygonStrokeColor(() => "rgba(243, 156, 107, 0.4)")
          .polygonAltitude(0.01);
      })
      .catch((err) => console.warn("Could not load continent polygons:", err));

    // Glowing White Trajectory Arc Styling (Solid static line from USA to India)
    globe
      .arcsData(arcs)
      .arcStartLat((d) => d.startLat)
      .arcStartLng((d) => d.startLng)
      .arcEndLat((d) => d.endLat)
      .arcEndLng((d) => d.endLng)
      .arcColor(() => ["#FFFFFF", "#FFFFFF"])
      .arcAltitude(0.32)
      .arcStroke(1.8)
      .arcDashLength(1)
      .arcDashGap(0);

    // White City Marker Dots at Surface
    globe
      .pointsData(places)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor(() => "#FFFFFF")
      .pointRadius("size")
      .pointAltitude(0.015);

    // Pulsating White Radar Rings
    globe
      .ringsData(places)
      .ringLat("lat")
      .ringLng("lng")
      .ringColor(() => "#FFFFFF")
      .ringMaxRadius(5)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(1000)
      .ringAltitude(0.012);

    // Custom Glassmorphic HTML Location Pins & Badges
    globe
      .htmlElementsData(places)
      .htmlLat("lat")
      .htmlLng("lng")
      .htmlAltitude(0.02)
      .htmlElement((d) => {
        const markerEl = document.createElement("div");
        markerEl.style.pointerEvents = "none";
        markerEl.style.userSelect = "none";
        markerEl.innerHTML = `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 12px;
            background: rgba(15, 28, 46, 0.9);
            border: 1px solid rgba(243, 156, 107, 0.6);
            box-shadow: 0 0 12px rgba(201, 102, 47, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 9999px;
            transform: translate(-50%, -100%);
            pointer-events: none;
            user-select: none;
            white-space: nowrap;
          ">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#F39C6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; display: block;">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span style="
              color: #FFFFFF;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-weight: 700;
              font-size: 11px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              line-height: 1;
            ">
              ${d.name}
            </span>
          </div>
        `;
        return markerEl;
      });

    // OrbitControls: Disable auto-rotation completely and scroll-zoom trap
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = false;
      controls.enableZoom = false; // Never trap scroll
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
    }

    // Static Viewport & Camera Angle centered between North America and India
    globe.pointOfView({ lat: 38, lng: 8, altitude: 2.1 }, 0);

    // ResizeObserver: dynamically handles orientation changes and screen resizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0 && globeInstanceRef.current) {
        globeInstanceRef.current.width(width);
        globeInstanceRef.current.height(height);
      }
    });
    resizeObserver.observe(el);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      if (globeInstanceRef.current) {
        const inst = globeInstanceRef.current;
        try {
          inst.pauseAnimation?.();
        } catch (_) {}
        try {
          const ctrl = inst.controls?.();
          if (ctrl && typeof ctrl.dispose === "function") {
            ctrl.dispose();
          }
        } catch (_) {}
        try {
          const renderer = inst.renderer?.();
          if (renderer && typeof renderer.dispose === "function") {
            renderer.dispose();
          }
        } catch (_) {}
        try {
          if (typeof inst._destructor === "function") {
            inst._destructor();
          }
        } catch (_) {}
        globeInstanceRef.current = null;
      }
      if (el) {
        el.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      className="ojx-globe-wrapper w-full h-[360px] lg:h-[600px]"
      style={{
        width: "100%",
        position: "relative",
        touchAction: "pan-y",
      }}
    >
      <div
        ref={containerRef}
        className="ojx-globe-container"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          touchAction: "pan-y",
        }}
        aria-label="Interactive 3D Globe showing OJIX global network: USA and India"
      />
      <div className="ojx-globe-badge">
        <span className="ojx-globe-badge-dot" />
        <span>USA · INDIA</span>
      </div>
    </div>
  );
}

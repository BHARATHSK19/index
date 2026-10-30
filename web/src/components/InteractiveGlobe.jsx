import { useEffect, useRef } from "react";
import Globe from "globe.gl";
import * as THREE from "three";

/**
 * Two primary network hubs:
 * 1. Bengaluru, India (Core Engineering HQ)
 * 2. San Francisco, USA (North America Gateway)
 */
const places = [
  { name: "Bengaluru, India", lat: 12.9716, lng: 77.5946, size: 1.0, color: "#FFFFFF", hub: "Core Engineering HQ" },
  { name: "San Francisco, USA", lat: 37.7749, lng: -122.4194, size: 0.9, color: "#FFFFFF", hub: "North America Hub" },
];

const usaPlace = [places[1]];

/**
 * 3D Billboard Labels for USA and Bengaluru.
 */
const labels = [
  { name: "San Francisco, USA", lat: 37.7749, lng: -122.4194 },
  { name: "Bengaluru, India", lat: 12.9716, lng: 77.5946 },
];

/**
 * Single great-circle trajectory arc connecting USA to Bengaluru.
 */
const arcs = [
  {
    startLat: 37.7749,
    startLng: -122.4194,
    endLat: 12.9716,
    endLng: 77.5946,
    color: ["#FFFFFF", "#FFFFFF"],
  },
];

const arcUSAToBlr = arcs[0];

/**
 * Compute device-aware camera altitude based on viewport width:
 * - Desktop (>= 1024px): 1.55 (large, immersive scale)
 * - Tablet (768px - 1023px): 1.85
 * - Mobile (< 768px): 2.15 (zoomed out to fit screen cleanly without overflow)
 */
const getDeviceAltitude = () => {
  if (typeof window === "undefined") return 1.55;
  const w = window.innerWidth;
  if (w < 768) return 2.15;
  if (w < 1024) return 1.85;
  return 1.55;
};

/**
 * Interactive 3D Globe with exclusive USA -> Bengaluru trajectory,
 * glowing white arcs, touch-safe mobile controls, and responsive camera altitude.
 */
export default function InteractiveGlobe() {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const initialWidth = el.clientWidth || 500;
    const initialHeight = el.clientHeight || 500;
    let currentAlt = getDeviceAltitude();

    // Track all choreography timers for safe lifecycle cleanup
    const timers = [];

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

    // Glowing atmosphere in OJIX brand color
    globe
      .showAtmosphere(true)
      .atmosphereColor("#C9662F")
      .atmosphereAltitude(0.22);

    // Continents in OJIX Brand Orange (#C9662F) via GeoJSON polygons
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
          .polygonCapColor(() => "#C9662F")
          .polygonSideColor(() => "rgba(201, 102, 47, 0.25)")
          .polygonStrokeColor(() => "rgba(201, 102, 47, 0.4)")
          .polygonAltitude(0.01);
      })
      .catch((err) => console.warn("Could not load continent polygons:", err));

    // Glowing White Trajectory Arc Styling
    globe
      .arcStartLat((d) => d.startLat)
      .arcStartLng((d) => d.startLng)
      .arcEndLat((d) => d.endLat)
      .arcEndLng((d) => d.endLng)
      .arcColor(() => ["#FFFFFF", "#FFFFFF"])
      .arcAltitude(0.28)
      .arcStroke(1.8);

    // White City Marker Dots
    globe
      .pointsData(places)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor(() => "#FFFFFF")
      .pointRadius("size")
      .pointAltitude(0.015)
      .pointLabel(
        (d) => `
        <div style="background: rgba(9, 18, 30, 0.95); border: 1px solid rgba(255, 255, 255, 0.35); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 8px 12px; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.4; color: #FFFFFF; box-shadow: 0 8px 24px rgba(0,0,0,0.7); pointer-events: none;">
          <div style="font-weight: 700; font-size: 13px; color: #FFFFFF; display: flex; align-items: center; gap: 6px;">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#FFFFFF;box-shadow:0 0 8px #FFFFFF;"></span>
            ${d.name}
          </div>
          <div style="color: #94A3B8; font-size: 11px; margin-top: 2px;">${d.hub}</div>
          <div style="color: #64748B; font-size: 10px; font-family: monospace;">${d.lat.toFixed(4)}°, ${d.lng.toFixed(4)}°</div>
        </div>
      `
      );

    // Clean 3D Billboard Labels for USA & Bengaluru
    globe
      .labelsData(labels)
      .labelLat("lat")
      .labelLng("lng")
      .labelText("name")
      .labelSize(1.35)
      .labelDotRadius(0.5)
      .labelColor(() => "#FFFFFF")
      .labelAltitude(0.02)
      .labelResolution(2);

    // Pulsating White Radar Rings
    globe
      .ringLat("lat")
      .ringLng("lng")
      .ringColor(() => "#FFFFFF")
      .ringMaxRadius(5)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(1000)
      .ringAltitude(0.012);

    // OrbitControls: Disable scroll-zoom trap so mobile page scroll is touch-safe
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = false;
      controls.enableZoom = false; // Never trap scroll
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
    }

    // =========================================================================
    // Phase 1: Initial USA View (0s - 1.2s)
    // Instantly centered on USA with device-aware altitude
    // =========================================================================
    globe.pointOfView({ lat: 37.7749, lng: -122.4194, altitude: currentAlt }, 0);
    globe.ringsData(usaPlace);
    globe.arcsData([]);

    // =========================================================================
    // Phase 2: Flight & Synchronized Rotation (1.2s - 4.2s)
    // White arc shoots across to Bengaluru; camera rotates to Bengaluru over 3000ms.
    // =========================================================================
    timers.push(
      setTimeout(() => {
        if (!globeInstanceRef.current) return;
        globe
          .arcsData([arcUSAToBlr])
          .arcDashLength(0.5)
          .arcDashGap(2)
          .arcDashAnimateTime(3000);

        globe.pointOfView({ lat: 12.9716, lng: 77.5946, altitude: getDeviceAltitude() }, 3000);
      }, 1200)
    );

    // =========================================================================
    // Phase 3: Arrival at Bengaluru (4.2s onwards)
    // Camera settles on Bengaluru; activates pulsating radar rings.
    // =========================================================================
    timers.push(
      setTimeout(() => {
        if (!globeInstanceRef.current) return;
        globe.ringsData(places);
      }, 4200)
    );

    // =========================================================================
    // Phase 4: Static Locked State (5.2s onwards)
    // Freeze arc into solid permanent glowing white line; gentle subtle rotation.
    // =========================================================================
    timers.push(
      setTimeout(() => {
        if (!globeInstanceRef.current) return;
        globe
          .arcDashLength(1)
          .arcDashGap(0)
          .arcDashAnimateTime(0);

        const activeControls = globe.controls();
        if (activeControls) {
          activeControls.autoRotate = true;
          activeControls.autoRotateSpeed = 0.2;
        }
      }, 5200)
    );

    // ResizeObserver: dynamically handles orientation changes and screen resizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries.length) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0 && globeInstanceRef.current) {
        globeInstanceRef.current.width(width);
        globeInstanceRef.current.height(height);

        // Adjust camera altitude if screen size category changed
        const newAlt = getDeviceAltitude();
        if (Math.abs(newAlt - currentAlt) > 0.1) {
          currentAlt = newAlt;
          const currentPov = globeInstanceRef.current.pointOfView();
          globeInstanceRef.current.pointOfView(
            { lat: currentPov.lat, lng: currentPov.lng, altitude: newAlt },
            400
          );
        }
      }
    });
    resizeObserver.observe(el);

    // Cleanup on unmount
    return () => {
      timers.forEach(clearTimeout);
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
        aria-label="Interactive 3D Globe showing OJIX global network: USA and Bengaluru"
      />
      <div className="ojx-globe-badge">
        <span className="ojx-globe-badge-dot" />
        <span>USA · BENGALURU</span>
      </div>
    </div>
  );
}

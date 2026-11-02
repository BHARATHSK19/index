import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const DOCK_ITEMS = [
  {
    id: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/ojix.si?utm_source=qr&exln=MTRxNDFoN3htdDJxeA==",
    renderIcon: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "22%",
          background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(214, 36, 159, 0.4)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="62%"
          height="62%"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </div>
    ),
  },
  {
    id: "youtube",
    label: "YouTube",
    url: "https://www.youtube.com/channel/UCV1koMgZUM9Svcf64Kg2N4A",
    renderIcon: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "22%",
          background: "#FF0000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(255, 0, 0, 0.45)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="55%"
          height="55%"
          fill="#FFFFFF"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    ),
  },
  {
    id: "location",
    label: "Location - Bengaluru",
    url: "https://share.google/Xql7Oy4juC31by2hq",
    renderIcon: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "22%",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(234, 67, 53, 0.35)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="65%"
          height="65%"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="#EA4335"
          />
          <circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
        </svg>
      </div>
    ),
  },
];

function DockItem({ mouseX, item }) {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-120, 0, 120], [40, 56, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <motion.a
      ref={ref}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={item.label}
      title={item.label}
      style={{ width, height: width }}
      className="social-dock__icon"
    >
      {item.renderIcon()}
    </motion.a>
  );
}

const DockIcon = DockItem;

export default function SocialDock() {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      className="w-full flex justify-center mt-5 social-dock-wrap"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginTop: "20px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <motion.nav
        className="social-dock flex items-center justify-around w-full max-w-[380px] sm:max-w-[440px] px-8 py-3 rounded-full bg-[#09121E]/80 border border-slate-700/60 backdrop-blur-xl shadow-2xl"
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        aria-label="Social media & location links"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          width: "100%",
          maxWidth: "440px",
          padding: "12px 32px",
          borderRadius: "9999px",
          background: "rgba(9, 18, 30, 0.8)",
          border: "1px solid rgba(51, 65, 85, 0.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
          boxSizing: "border-box",
        }}
      >
        {DOCK_ITEMS.map((item) => (
          <DockItem key={item.id} mouseX={mouseX} item={item} />
        ))}
      </motion.nav>
    </div>
  );
}

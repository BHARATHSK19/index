export default function ProductDevicePreview({
  desktopImg,
  desktopSrc,
  desktopAlt = "Desktop Dashboard Preview",
  mobileImg,
  mobileSrc,
  mobileAlt = "Mobile Application Preview",
  alt,
  url = "app.ojix.in",
  badgeText = "● LIVE",
  variant = "light",
  desktopContent,
  mobileContent,
  children,
}) {
  const dImg = desktopSrc || desktopImg;
  const mImg = mobileSrc || mobileImg;
  const dAlt = alt || desktopAlt;
  const mAlt = alt || mobileAlt;
  const isDark =
    variant === "dark" ||
    Boolean(desktopContent || children) ||
    Boolean(dImg && dImg.includes(".svg"));

  return (
    <div className={`ojx-device-preview ${isDark ? "ojx-device-preview--dark" : ""}`}>
      {/* Desktop website/dashboard preview */}
      <div className="ojx-device-preview__desktop">
        {/* Browser header */}
        <div className="ojx-device-preview__browser-bar">
          <div className="ojx-device-preview__browser-dots">
            <span className="dot dot--red" />
            <span className="dot dot--yellow" />
            <span className="dot dot--green" />
          </div>

          <div className="ojx-device-preview__browser-url">
            {url}
          </div>

          <span className="ojx-device-preview__browser-live">
            {badgeText}
          </span>
        </div>

        {/* Desktop dashboard content */}
        {desktopContent || (dImg ? (
          <img
            src={dImg}
            alt={dAlt}
            className="ojx-device-preview__desktop-img"
            loading="lazy"
            decoding="async"
          />
        ) : children)}
      </div>

      {/* Floating mobile preview (Desktop only; hidden <= 768px via .pd-mobile-device-preview) */}
      {(mobileContent || mImg) && (
        <div className="ojx-device-preview__mobile pd-mobile-device-preview">
          <div className="ojx-device-preview__mobile-inner">
            {/* Mobile status bar */}
            <div className="ojx-device-preview__mobile-status">
              <span>9:41</span>
              <span>● ◔ ▰</span>
            </div>

            {/* Mobile dashboard */}
            {mobileContent || (mImg && (
              <img
                src={mImg}
                alt={mAlt}
                className="ojx-device-preview__mobile-img"
                loading="lazy"
                decoding="async"
              />
            ))}

            {/* Home indicator */}
            <div className="ojx-device-preview__mobile-home">
              <span className="ojx-device-preview__mobile-home-bar" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDevicePreview({
  desktopImg,
  desktopAlt = "Desktop Dashboard Preview",
  mobileImg,
  mobileAlt = "Mobile Application Preview",
  url = "app.ojix.in",
}) {
  return (
    <div className="ojx-device-preview">
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
            ● LIVE
          </span>
        </div>

        {/* Desktop dashboard image */}
        <img
          src={desktopImg}
          alt={desktopAlt}
          className="ojx-device-preview__desktop-img"
        />
      </div>

      {/* Floating mobile preview (Desktop only; hidden <= 768px via .pd-mobile-device-preview) */}
      <div className="ojx-device-preview__mobile pd-mobile-device-preview">
        <div className="ojx-device-preview__mobile-inner">
          {/* Mobile status bar */}
          <div className="ojx-device-preview__mobile-status">
            <span>9:41</span>
            <span>● ◔ ▰</span>
          </div>

          {/* Mobile dashboard */}
          <img
            src={mobileImg}
            alt={mobileAlt}
            className="ojx-device-preview__mobile-img"
          />

          {/* Home indicator */}
          <div className="ojx-device-preview__mobile-home">
            <span className="ojx-device-preview__mobile-home-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}


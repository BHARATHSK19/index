import { PRODUCTS } from "../data/products.jsx";

/** Site header with the Products and Services mega-menus.
 * Markup matches the original site so the existing CSS and menu behaviour (legacy/app.js) apply.
 * `active` = "home" | "products" | "services" | null highlights the current top link. */
export default function Header({ active }) {
  const dark = typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") !== "light";
  const logo = dark ? "/assets/ojix-navbar-logo-dark.svg" : "/assets/ojix-navbar-logo.svg";
  return (
    <header className="site-header eleks-header">
      <div className="nav-wrap shell">
        <a href="/" className="brand" aria-label="OJIX home">
          <img src={logo} alt="OJIX" width="110" height="53" />
        </a>
        {" "}
        <button className="menu-toggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="main-nav">
          <span />
          <span />
        </button>
        {" "}
        <nav className="main-nav eleks-nav" id="main-nav" aria-label="Main navigation">
          <a href="/" className={"nav-top-link" + (active === "home" ? " is-active" : "")}>
            <span className="nav-link-text">
              Home
            </span>
            <span className="nav-dot-indicator" aria-hidden="true" />
          </a>
          {" "}
          {" "}
          <div className="nav-item-has-mega" data-mega="platforms">
            <a href="/products" data-page-link="" className={"nav-top-link" + (active === "products" ? " is-active" : "")} aria-haspopup="true" aria-expanded="false" aria-controls="products-mobile-submenu">
              <span className="nav-link-text">
                Products
              </span>
              {" "}
              <span className="nav-dot-indicator" aria-hidden="true" />
            </a>
            {" "}
            <div className="eleks-mega-dropdown" id="products-mobile-submenu" role="region" aria-label="Products subtabs">
              <div className="eleks-mega-inner">
                <div className="eleks-mega-left" role="tablist" aria-label="Select product">
                  {PRODUCTS.map((p, i) => (
                    <a key={p.slug} href={"/" + p.slug} className={"eleks-subtab" + (i === 0 ? " is-active" : "")} role="tab" aria-selected={i === 0 ? "true" : "false"} data-preview-title={p.name} data-preview-desc={p.megaDesc} data-preview-badge={p.megaBadge} data-preview-img={p.megaImg}>
                      <span className="eleks-subtab-icon" aria-hidden="true">
                        {p.icon}
                      </span>
                      <span className="eleks-subtab-label">
                        {p.name}
                      </span>
                      {p.isNew ? <span className="eleks-subtab-new">New</span> : null}
                    </a>
                  ))}
                </div>
                {" "}
                <div className="eleks-mega-right" aria-live="polite">
                  <div className="eleks-mega-preview-head">
                    <span className="eleks-preview-kicker">
                      {PRODUCTS[0].megaBadge}
                    </span>
                    {" "}
                    <h3 className="eleks-preview-title">
                      {PRODUCTS[0].name}
                    </h3>
                    {" "}
                    <p className="eleks-preview-desc">
                      {PRODUCTS[0].megaDesc}
                    </p>
                    {" "}
                    <a href={"/" + PRODUCTS[0].slug} className="eleks-preview-cta">
                      <span>
                        Explore Platform
                      </span>
                      {" "}
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                  {" "}
                  <a href={"/" + PRODUCTS[0].slug} className="eleks-mega-preview-media" aria-label={"Explore " + PRODUCTS[0].name}>
                    <img src={PRODUCTS[0].megaImg} alt={PRODUCTS[0].name + " dashboard preview"} className="eleks-preview-img" loading="lazy" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          {" "}
          {" "}
          <div className="nav-item-has-mega" data-mega="capabilities">
            <a href="/services" data-page-link="" className={"nav-top-link" + (active === "services" ? " is-active" : "")} aria-haspopup="true" aria-expanded="false" aria-controls="services-mobile-submenu">
              <span className="nav-link-text">
                Services
              </span>
              {" "}
              <span className="nav-dot-indicator" aria-hidden="true" />
            </a>
            {" "}
            <div className="eleks-mega-dropdown services-catalog-dropdown" id="services-mobile-submenu" role="region" aria-label="Services catalog">
              <div className="eleks-mega-inner services-mega-inner">
                <div className="eleks-mega-left services-mega-sidebar" role="tablist" aria-label="Our Services" aria-orientation="vertical">
                  <div className="services-sidebar-header">
                    Our Services
                  </div>
                  {" "}
                  <div className="services-category-nav" role="none" />
                </div>
                {" "}
                <div className="eleks-mega-right services-mega-right" id="services-panel" role="tabpanel" aria-live="polite" />
              </div>
            </div>
          </div>
          {" "}
          <a href="/process" className="nav-top-link">
            <span className="nav-link-text">
              How we work
            </span>
            <span className="nav-dot-indicator" aria-hidden="true" />
          </a>
          {" "}
          <a href="/security" className="nav-top-link">
            <span className="nav-link-text">
              Security
            </span>
            <span className="nav-dot-indicator" aria-hidden="true" />
          </a>
          {" "}
          <a href="/about" className="nav-top-link">
            <span className="nav-link-text">
              About OJIX
            </span>
            <span className="nav-dot-indicator" aria-hidden="true" />
          </a>
          {" "}
          <a href="https://wa.me/919008877883" className="ojix-wa-nav-btn" target="_blank" rel="noopener noreferrer" aria-label="Chat with OJIX on WhatsApp" title="Chat on WhatsApp">
            <span className="ojix-wa-pulse" aria-hidden="true" />
            {" "}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.461 3.484 1.336 5.008L2 22l5.156-1.352a9.932 9.932 0 0 0 4.875 1.289h.004c5.516 0 9.965-4.453 9.965-9.969 0-2.664-1.039-5.168-2.922-7.051C17.199 3.039 14.695 2 12.031 2zm5.824 14.27c-.242.684-1.414 1.309-1.957 1.387-.504.074-1.141.105-1.844-.117-.426-.137-.973-.316-1.676-.621-2.953-1.273-4.883-4.25-5.031-4.449-.148-.195-1.203-1.602-1.203-3.055 0-1.453.762-2.168 1.031-2.465.27-.293.59-.367.785-.367.195 0 .395.004.566.012.184.008.426-.07.668.508.246.59.836 2.039.91 2.188.074.148.121.32.023.516-.098.199-.148.32-.293.492-.148.172-.312.383-.445.516-.148.148-.301.309-.129.605.172.293.766 1.262 1.645 2.047 1.129 1.008 2.082 1.32 2.379 1.469.293.148.465.125.641-.074.172-.199.738-.863.934-1.156.195-.297.395-.246.664-.148.27.098 1.723.813 2.016.961.297.148.492.223.566.344.074.125.074.715-.168 1.398z" />
            </svg>
          </a>
          {" "}
          <button className="theme-toggle-btn" id="theme-toggle" aria-label="Toggle color theme" type="button" title="Toggle color theme">
            <svg className="sun-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              {" "}
              <line x1="12" y1="1" x2="12" y2="3" />
              {" "}
              <line x1="12" y1="21" x2="12" y2="23" />
              {" "}
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              {" "}
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              {" "}
              <line x1="1" y1="12" x2="3" y2="12" />
              {" "}
              <line x1="21" y1="12" x2="23" y2="12" />
              {" "}
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              {" "}
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            {" "}
            <svg className="moon-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          {" "}
          <a className="nav-cta eleks-nav-cta" href="/contact">
            Discuss a project{" "}
            <span aria-hidden="true">
              ↗
            </span>
          </a>
        </nav>
      </div>
      {" "}
      <div className="eleks-header-backdrop" id="eleks-header-backdrop" aria-hidden="true" />
    </header>
  );
}

import { useState, useRef } from "react";

const SECURITY_PILLARS = [
  {
    id: "data-residency",
    title: "Sovereign Indian Data Residency",
    desc: "All enterprise operational data, transactional backups, and audit logs are hosted strictly in MeitY-empanelled Tier-IV data centers located within the Republic of India. No unauthorized cross-border mirroring.",
    badge: "MeitY Cloud Aligned",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="8" x="2" y="2" rx="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" />
        <line x1="6" x2="6.01" y1="6" y2="6" />
        <line x1="6" x2="6.01" y1="18" y2="18" />
        <path d="M12 2v20" />
      </svg>
    ),
  },
  {
    id: "dpdp-compliance",
    title: "DPDP Act 2023 & 2025 Rules Built-in",
    titleLink: "/dpdp-compliance",
    desc: "Native consent management architecture, granular purpose limitation, automated data principal grievance workflows, and strict breach reporting mechanisms conforming to India’s Digital Personal Data Protection laws.",
    badge: "Statutory Compliance",
    linkText: "DPDP Architecture Guide",
    linkUrl: "/dpdp-compliance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
      </svg>
    ),
  },
  {
    id: "zero-trust",
    title: "Zero-Trust Cryptographic Standard",
    desc: "Military-grade AES-256 encryption at rest with tenant-isolated key rotation and TLS 1.3 encryption in transit with strict HSTS, mutual TLS for microservices, and tamper-evident audit logging for forensic traceability.",
    badge: "AES-256 · TLS 1.3 · HMAC",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
  {
    id: "ip-ownership",
    title: "Strict IP Ownership & Single Tenancy",
    desc: "Clients retain 100% proprietary ownership of their domain databases and operational IP. OJIX offers dedicated single-tenant VPC deployments, zero multi-tenant data bleed, and zero third-party monetization.",
    badge: "Tenant Isolation · Dedicated VPC",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

/**
 * Mobile-exclusive swipe deck for the 4 security guarantees.
 * Active strictly on < 768px viewports with touch snap and pagination dots.
 */
export default function SecuritySwipeDeck() {
  const [activeDot, setActiveDot] = useState(0);
  const trackRef = useRef(null);

  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;
    const fraction = scrollLeft / maxScroll;
    const index = Math.min(Math.max(Math.round(fraction * (SECURITY_PILLARS.length - 1)), 0), SECURITY_PILLARS.length - 1);
    setActiveDot(index);
  };

  const scrollToCard = (index) => {
    if (!trackRef.current) return;
    const cards = trackRef.current.children;
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setActiveDot(index);
    }
  };

  return (
    <div className="w-full">
      {/* Horizontal Swipe Track */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="ojx-security-track flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 no-scrollbar"
        role="region"
        aria-label="Security Guarantees Swipe Deck"
      >
        {SECURITY_PILLARS.map((pillar) => (
          <div
            key={pillar.id}
            className="ojx-security-card snap-center shrink-0 w-[84vw] max-w-[320px] rounded-2xl bg-[#0F1C2E] border border-slate-800 p-5"
          >
            <div>
              {/* Icon Container */}
              <div className="ojx-security-icon-box">
                {pillar.icon}
              </div>

              {/* Title */}
              <h3 className="ojx-security-card-title">
                {pillar.titleLink ? (
                  <a href={pillar.titleLink} className="hover:text-[#F39C6B] transition-colors">
                    {pillar.title}
                  </a>
                ) : (
                  pillar.title
                )}
              </h3>

              {/* Description */}
              <p className="ojx-security-card-desc">
                {pillar.desc}
              </p>
            </div>

            {/* Footer / Badge & Link */}
            <div className="ojx-security-card-foot">
              <span className="ojx-security-badge">
                {pillar.badge}
              </span>
              {pillar.linkText && pillar.linkUrl && (
                <a href={pillar.linkUrl} className="ojx-security-card-link">
                  <span>{pillar.linkText}</span>
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4 Pagination Dots */}
      <div
        className="ojx-security-dots flex justify-center items-center gap-1.5 mt-3"
        role="tablist"
        aria-label="Security cards pagination"
      >
        {SECURITY_PILLARS.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={activeDot === idx}
            aria-label={`Go to security guarantee ${idx + 1}: ${p.title}`}
            className="ojx-security-dot-btn p-2"
            onClick={() => scrollToCard(idx)}
          >
            <span
              className={`ojx-security-dot ${
                activeDot === idx ? "is-active" : "is-inactive"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}


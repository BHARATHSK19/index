import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, pad2 } from "../data/products.jsx";

/**
 * Mobile-exclusive interactive accordion directory for the 11 platforms.
 * Active strictly on < 768px viewports with Framer Motion animated expansions.
 */
export default function PlatformsAccordion() {
  // Default state: First item (01) expanded; clicking toggles state smoothly.
  const [expandedIndex, setExpandedIndex] = useState(0);

  const toggleItem = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="ojx-accordion-list" role="region" aria-label="Platforms Directory">
      {PRODUCTS.map((p, i) => {
        const isOpen = expandedIndex === i;
        const num = pad2(i + 1);
        const headerId = `platform-acc-header-${p.slug}`;
        const panelId = `platform-acc-panel-${p.slug}`;

        return (
          <div
            key={p.slug}
            className={`ojx-accordion-item ${isOpen ? "is-open" : ""}`}
          >
            <button
              type="button"
              id={headerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="ojx-accordion-trigger"
              onClick={() => toggleItem(i)}
            >
              <span className="ojx-accordion-title-wrap">
                <span className="ojx-accordion-num">{num}</span>
                <span className="ojx-accordion-name">{p.name}</span>
              </span>
              <motion.span
                className="ojx-accordion-chevron"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="ojx-accordion-body">
                    <h3 className="ojx-accordion-headline">{p.line}</h3>
                    <p className="ojx-accordion-subtitle">{p.who}</p>
                    <p className="ojx-accordion-desc">{p.rowDesc}</p>

                    <ul className="ojx-accordion-tags" aria-label="Platform capabilities">
                      {p.rowTags.map((t) => (
                        <li key={t} className="ojx-accordion-tag">
                          {t}
                        </li>
                      ))}
                    </ul>

                    <a className="ojx-accordion-link" href={"/" + p.slug}>
                      <span>Explore {p.name}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

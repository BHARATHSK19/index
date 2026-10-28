import SERVICES from "../generated/servicePages.json";
import CATALOG from "../data/servicesCatalog.json";

export const SERVICE_SLUGS = new Set(SERVICES.map((s) => s.slug));
const ORDER = CATALOG.flatMap((c) => c.services.map((s) => s.slug));
const BY_SLUG = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));

const styleOf = (css) =>
  Object.fromEntries(
    css
      .split(";")
      .map((d) => d.split(":").map((x) => x.trim()))
      .filter(([k, v]) => k && v)
  );

/** /services/:slug — one template for all 81 service pages (data in generated/servicePages.json). */
export default function ServicePage({ slug }) {
  const s = BY_SLUG[slug];
  const i = ORDER.indexOf(slug);
  const next = BY_SLUG[ORDER[(i + 1) % ORDER.length]];
  const pv = s.pv;
  return (
    <main id="main" className="pd-page">
      <section className="pd-hero" aria-label={s.title}>
        <img className="pd-hero__img" src={s.heroImg} alt={s.title + " banner"} fetchPriority="high" />
        <div className="pd-hero__top shell">
          <p className="pd-hero__k">{s.heroKicker}</p>
        </div>
        <h1 className="pd-hero__name">{s.title}</h1>
        <a className="pd-hero__scroll" href="#overview">
          Overview <span>↓</span>
        </a>
      </section>

      <section className="pd-intro" id="overview" aria-labelledby="pd-s1">
        <div className="shell pd-intro__grid">
          <div>
            <p className="dx-kicker"><b>01</b> {s.category}</p>
            <h2 className="pd-h2 pd-intro__title" id="pd-s1">
              {s.introTitle} <span>{s.introTitleSpan}</span>
            </h2>
            <p className="pd-lede">{s.lede}</p>
            <div className="pd-actions">
              <a className="ojx-hero__cta" href="#contact" data-discuss="" data-topic={s.title} data-mode="consult">
                Discuss This Service
              </a>
              <a className="ojx-hero__link" href="#specs">
                Explore Capabilities <span aria-hidden="true">›</span>
              </a>
            </div>
          </div>

          <div className="pd-intro__visual dx-reveal">
            <div className="pv" aria-label={s.title + " system preview"} role="img">
              <div className="pv-win">
                <div className="pv-top">
                  <span className="pv-dots"><i></i><i></i><i></i></span>
                  <span className="pv-url">{pv.url}</span>
                  <span className="pv-live">{pv.live}</span>
                </div>
                <div className="pv-head">
                  <span className="pv-mark">{pv.mark}</span>
                  <strong>{s.title}</strong>
                  <span className="pv-badge">{pv.badge}</span>
                </div>
                <div className="pv-kpis">
                  {pv.kpis.map(([v, l], k) => (
                    <div className="pv-kpi" style={{ "--i": String(k) }} key={k}>
                      <b>{v}</b>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
                <div className="pv-panel">
                  <p className="pv-panel__t">{pv.panelTitle}</p>
                  <div className="pv-bars">
                    {pv.bars.map(([css, day], k) => (
                      <div className="pv-bar" style={styleOf(css)} key={k}>
                        <i></i>
                        <span>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pv-phone">
                <div className="pv-phone__screen">
                  <div className="pv-status">
                    <span>9:41</span>
                    <span className="pv-status__icons"><i></i><i></i><i></i></span>
                  </div>
                  <div className="pv-papp">
                    <span className="pv-mark pv-mark--sm">{pv.mark}</span>
                    <b>{pv.app}</b>
                  </div>
                  <div className="pv-note">
                    <span className="pv-note__dot"></span>
                    <div>
                      <strong>{pv.noteTitle}</strong>
                      <small>{pv.noteText}</small>
                    </div>
                  </div>
                  {pv.pkpis.map(([l, v], k) => (
                    <div className="pv-pkpi" key={k}>
                      <span>{l}</span>
                      <b>{v}</b>
                    </div>
                  ))}
                  <span className="pv-home"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pd-stats" aria-label={s.title + " in numbers"}>
        <div className="shell">
          <div className="pd-stats__grid">
            {s.stats.map(([num, label, desc], k) => (
              <div className="pd-stat" key={k}>
                <p className="pd-stat__num">{num}</p>
                <p className="pd-stat__label">{label}</p>
                <p className="pd-stat__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pd-cmp" aria-labelledby="pd-s2">
        <div className="shell">
          <div className="pd-head dx-reveal">
            <p className="dx-kicker dx-kicker--light"><b>02</b> {s.cmpKicker}</p>
            <h2 className="pd-h2" id="pd-s2">
              {s.cmpTitle} <span>{s.cmpTitleSpan}</span>
            </h2>
          </div>
          <div className="pd-cmp__grid dx-reveal">
            {s.cmp.map((col, k) => (
              <div className={"pd-cmp__col" + (k === 1 ? " is-good" : "")} key={k}>
                <p className="pd-cmp__badge">{col.badge}</p>
                <h3 className="pd-cmp__title">{col.title}</h3>
                <ul>
                  {col.items.map(([b, t], j) => (
                    <li key={j}>
                      <span className="pd-cmp__mark" aria-hidden="true"></span>
                      <span>
                        <b>{b}</b> {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pd-trust" id="specs" aria-labelledby="pd-s4">
        <div className="shell">
          <div className="pd-head dx-reveal">
            <p className="dx-kicker"><b>03</b> Enterprise assurance</p>
            <h2 className="pd-h2" id="pd-s4">
              {s.trustTitle} <span>{s.trustTitleSpan}</span>
            </h2>
          </div>
          <div className="pd-trust__grid dx-reveal">
            {s.trust.map(([k2, t, d], k) => (
              <div className="pd-trust__cell" key={k}>
                <p className="pd-trust__k">{k2}</p>
                <h3 className="pd-trust__t">{t}</h3>
                <p className="pd-trust__d">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pd-faq" id="faq" aria-labelledby="pd-s5">
        <div className="shell pd-faq__grid">
          <div className="pd-head dx-reveal">
            <p className="dx-kicker"><b>04</b> Service FAQs</p>
            <h2 className="pd-h2" id="pd-s5">
              Everything you need to know <span>about {s.title}.</span>
            </h2>
            <p className="pd-lede">Direct answers on architecture, engagement models, data privacy, and production deployment.</p>
            <a className="pd-mail" href="mailto:info@ojix.in">
              info@ojix.in <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="pd-faq__list dx-reveal">
            {s.faqs.map(([q, a], k) => (
              <details className="pd-faq__item" open={k === 0} key={k}>
                <summary>
                  <span>{q}</span>
                  <i aria-hidden="true"></i>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ojx-cta" id="contact" aria-labelledby="ojx-cta-title">
        <div className="shell ojx-cta__grid">
          <div className="dx-reveal">
            <p className="dx-kicker dx-kicker--light"><b>—</b> Discuss your requirements · {s.title}</p>
            <h2 className="ojx-cta__title" id="ojx-cta-title">
              {s.ctaTitle} <span>{s.ctaTitleSpan}</span>
            </h2>
            <p className="ojx-cta__text">{s.ctaText}</p>
          </div>
          <div className="ojx-cta__actions dx-reveal">
            <button type="button" className="ojx-cta__btn" data-discuss="" data-topic={s.title} data-mode="consult">
              Discuss this service <span aria-hidden="true">→</span>
            </button>
            <a className="ojx-cta__mail" href="mailto:info@ojix.in">or write to info@ojix.in</a>
            <p className="ojx-cta__note">We reply within one working day.</p>
          </div>
        </div>
      </section>

      <section className="pd-next" aria-label="Next service">
        <a className="pd-next__link" href={"/services/" + next.slug} data-name={next.title}>
          <img src={next.heroImg} alt="" loading="lazy" decoding="async" />
          <span className="pd-next__k">Next service</span>
          <span className="pd-next__name">
            {next.title} <span aria-hidden="true">→</span>
          </span>
        </a>
      </section>
    </main>
  );
}

// Make each service page's <title>/description available to the page shell.
const metaCache = (window.__ojixServiceMeta = window.__ojixServiceMeta || {});
SERVICES.forEach((s) => {
  metaCache[s.slug] = s.meta;
});

import { PRODUCTS, productIndex } from "../data/products.jsx";
import { ProductCounter, NextProduct } from "../components/ProductBits.jsx";

/** Product detail page built from data (used by the products added in Build 04).
 * Same sections and classes as the original product pages, so it shares their CSS and behaviour. */
export default function ProductTemplate({ data }) {
  const p = PRODUCTS[productIndex(data.slug)];
  const d = data;
  return (
    <main id="main" className="pd-page" data-product={p.name}>
      <section className="pd-hero" aria-label={p.name}>
        <img className="pd-hero__img" src={p.heroImg} alt={p.name + " interface"} width="1600" height="1000" fetchPriority="high" decoding="async" />
        <div className="pd-hero__top shell">
          <ProductCounter slug={p.slug} />
          <p className="pd-hero__k">{p.who}</p>
        </div>
        <h1 className="pd-hero__name">{p.name}</h1>
        <a className="pd-hero__scroll" href="#pd-overview">
          Scroll <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="pd-intro" id="pd-overview" aria-labelledby="pd-s1">
        <div className="shell pd-intro__grid">
          <div className="pd-intro__copy dx-reveal">
            <p className="dx-kicker"><b>01</b> Overview</p>
            <h2 className="pd-h2 pd-intro__title" id="pd-s1">
              {d.intro.title} <span>{d.intro.span}</span>
            </h2>
            <p className="pd-lede">{d.intro.lede}</p>
            <div className="pd-actions">
              <a className="ojx-hero__cta" href="#contact" data-discuss="" data-topic={p.name} data-mode="demo">
                {d.intro.cta}
              </a>
              <a className="ojx-hero__link" href="#modules">
                Explore Core Engines <span aria-hidden="true">›</span>
              </a>
            </div>
          </div>
          <div className="pd-intro__visual dx-reveal">
            <div className="pv" aria-label={p.name + " preview (illustrative)"} role="img">
              <div className="pv-win">
                <div className="pv-top">
                  <span className="pv-dots"><i></i><i></i><i></i></span>
                  <span className="pv-url">{d.pv.url}</span>
                  <span className="pv-live">Live</span>
                </div>
                <div className="pv-head">
                  <span className="pv-mark">{d.pv.mark}</span>
                  <strong>{p.name}</strong>
                  <span className="pv-badge">{d.pv.badge}</span>
                </div>
                <div className="pv-kpis">
                  {d.pv.kpis.map(([v, l], k) => (
                    <div className="pv-kpi" style={{ "--i": String(k) }} key={k}>
                      <b>{v}</b>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
                <div className="pv-panel">
                  <p className="pv-panel__t">{d.pv.panel}</p>
                  <div className="pv-bars">
                    {d.pv.bars.map(([h, label], k) => (
                      <div className="pv-bar" style={{ "--h": h + "%", "--i": String(k) }} key={k}>
                        <i></i>
                        <span>{label}</span>
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
                    <span className="pv-mark pv-mark--sm">{d.pv.mark}</span>
                    <b>{d.pv.app}</b>
                  </div>
                  <div className="pv-note">
                    <span className="pv-note__dot"></span>
                    <div>
                      <strong>{d.pv.note[0]}</strong>
                      <small>{d.pv.note[1]}</small>
                    </div>
                  </div>
                  {d.pv.kpis.slice(0, 2).map(([v, l], k) => (
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

      <section className="pd-stats" aria-label={p.name + " in numbers"}>
        <div className="shell">
          <div className="pd-stats__grid">
            {d.stats.map(([num, label, desc], k) => (
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
            <p className="dx-kicker dx-kicker--light"><b>02</b> {d.cmp.kicker}</p>
            <h2 className="pd-h2" id="pd-s2">
              {d.cmp.title} <span>{d.cmp.span}</span>
            </h2>
          </div>
          <div className="pd-cmp__grid dx-reveal">
            {[d.cmp.old, d.cmp.next].map((col, k) => (
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

      <section className="pd-rows" id="modules" aria-labelledby="pd-s3">
        <div className="shell">
          <div className="pd-head dx-reveal">
            <p className="dx-kicker"><b>03</b> Core capabilities</p>
            <h2 className="pd-h2" id="pd-s3">
              {d.rows.title} <span>{d.rows.span}</span>
            </h2>
          </div>
          {d.rows.items.map((r, k) => (
            <article className="pd-row dx-reveal" key={k}>
              <div className="pd-row__left">
                <p className="pd-row__kicker">
                  <b>{String(k + 1).padStart(2, "0")}</b> {r.kicker}
                </p>
                <h3 className="pd-row__title">{r.title}</h3>
              </div>
              <span className="pd-row__dot" aria-hidden="true"></span>
              <div className="pd-row__right">
                <p className="pd-row__desc">{r.desc}</p>
                <ul className="pd-row__tags">
                  {r.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pd-trust" id="specs" aria-labelledby="pd-s4">
        <div className="shell">
          <div className="pd-head dx-reveal">
            <p className="dx-kicker"><b>04</b> Enterprise assurance</p>
            <h2 className="pd-h2" id="pd-s4">
              {d.trust.title} <span>{d.trust.span}</span>
            </h2>
          </div>
          <div className="pd-trust__grid dx-reveal">
            {d.trust.items.map(([t, desc], k) => (
              <div className="pd-trust__cell" key={k}>
                <p className="pd-trust__k"></p>
                <h3 className="pd-trust__t">{t}</h3>
                <p className="pd-trust__d">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pd-faq" id="faq" aria-labelledby="pd-s5">
        <div className="shell pd-faq__grid">
          <div className="pd-head dx-reveal">
            <p className="dx-kicker"><b>05</b> {d.faq.kicker}</p>
            <h2 className="pd-h2" id="pd-s5">
              Everything you need to know <span>about {p.name}.</span>
            </h2>
            <p className="pd-lede">{d.faq.lede}</p>
            <a className="pd-mail" href="mailto:info@ojix.in">
              info@ojix.in <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="pd-faq__list dx-reveal">
            {d.faq.items.map(([q, a], k) => (
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
            <p className="dx-kicker dx-kicker--light"><b>—</b> Book a demo · {p.name}</p>
            <h2 className="ojx-cta__title" id="ojx-cta-title">
              {d.cta.title} <span>{d.cta.span}</span>
            </h2>
            <p className="ojx-cta__text">{d.cta.text}</p>
          </div>
          <div className="ojx-cta__actions dx-reveal">
            <button type="button" className="ojx-cta__btn" data-discuss="" data-topic={p.name} data-mode="demo">
              Book a {p.name} demo <span aria-hidden="true">→</span>
            </button>
            <a className="ojx-cta__mail" href="mailto:info@ojix.in">or write to info@ojix.in</a>
            <p className="ojx-cta__note">We reply within one working day.</p>
          </div>
        </div>
      </section>

      <NextProduct slug={p.slug} />
    </main>
  );
}

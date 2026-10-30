import { PRODUCTS, pad2 } from "../data/products.jsx";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/** /products — scroll-driven gallery + index list (behaviour in legacy/products.js). */
export default function ProductsPage() {
  return (
    <main id="main" className="px-page">
      <section className="shell px-head">
        <div className="px-head__row">
          <div>
            <h1 className="px-title">Products</h1>
          </div>
        </div>
        <p className="px-lede">
          {WORDS[PRODUCTS.length] || PRODUCTS.length} connected systems, built for how Indian teams actually work. Scroll
          to browse, or open one to see it in detail.
        </p>
      </section>

      <section className="px-gallery" id="px-gallery" style={{ "--n": String(PRODUCTS.length) }} aria-label="Product gallery">
        <div className="px-sticky">
          <div className="px-track">
            {PRODUCTS.map((p, i) => (
              <a key={p.slug} className={"px-card" + (i === 0 ? " is-active" : "")} href={"/" + p.slug} data-name={p.name}>
                <span className="px-card__media">
                  <img
                    className="px-card__img"
                    src={p.heroImg}
                    alt={p.name + " interface"}
                    width="1600"
                    height="1000"
                    {...(i === 0 ? { fetchPriority: "high" } : { loading: "lazy" })}
                    decoding="async"
                  />
                  <span className="px-card__reveal" aria-hidden="true">
                    <img
                      className="px-card__reveal-img"
                      src={p.hoverImg || p.heroImg}
                      alt=""
                      width="1600"
                      height="1000"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="px-card__open">Open</span>
                </span>
                <span className="px-card__meta">
                  <span className="px-card__num">{pad2(i + 1)}</span>
                  <span className="px-card__name">{p.name}</span>
                  <span className="px-card__who">{p.who}</span>
                </span>
              </a>
            ))}
          </div>
          <span className="px-hint" aria-hidden="true">Scroll</span>
          <span className="px-bar" aria-hidden="true"><i></i></span>
        </div>
      </section>

      <section className="shell px-index" aria-labelledby="px-index-title">
        <div className="px-index__head">
          <p className="dx-kicker"><b>02</b> Index</p>
          <h2 id="px-index-title">All products</h2>
        </div>
        <ul className="px-list" role="list">
          {PRODUCTS.map((p, i) => (
            <li key={p.slug}>
              <a className="px-line" href={"/" + p.slug} data-name={p.name}>
                <span className="px-line__num">{pad2(i + 1)}</span>
                <span className="px-line__name">{p.name}</span>
                <span className="px-line__desc">{p.line}</span>
                <span className="px-line__who">{p.who}</span>
                <img src={p.heroImg} alt="" hidden />
              </a>
            </li>
          ))}
        </ul>
        <div className="px-float" aria-hidden="true"><img alt="" /></div>
      </section>
    </main>
  );
}

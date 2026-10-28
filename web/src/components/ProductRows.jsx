import { PRODUCTS, pad2 } from "../data/products.jsx";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/** Home page "Our platforms" section, generated from the product list. */
export default function ProductRows() {
  return (
    <section className="dx-products" id="platforms" aria-labelledby="dx-products-title">
      <div className="shell">
        <div className="dx-products__head dx-reveal">
          <p className="dx-kicker dx-kicker--light"> Our platforms</p>
          <h2 className="dx-products__title" id="dx-products-title">
            {WORDS[PRODUCTS.length] || PRODUCTS.length} systems. <span>One foundation.</span>
          </h2>
        </div>
        {PRODUCTS.map((p, i) => (
          <article className="dx-row dx-reveal" key={p.slug}>
            <div className="dx-row__left">
              <p className="dx-kicker">
                <b>{pad2(i + 1)}</b> {p.name}
              </p>
              <h3 className="dx-row__title">{p.line}</h3>
            </div>
            <span className="dx-row__dot" aria-hidden="true"></span>
            <div className="dx-row__right">
              <p className="dx-row__who">{p.who}</p>
              <p className="dx-row__desc">{p.rowDesc}</p>
              <ul className="dx-row__tags">
                {p.rowTags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <a className="dx-row__link" href={"/" + p.slug}>
                Explore {p.name} <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

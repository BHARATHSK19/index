import { PRODUCTS, pad2, productIndex, nextProduct } from "../data/products.jsx";

/** "Product 04 / 11" label in a product hero. */
export function ProductCounter({ slug }) {
  const i = productIndex(slug);
  return (
    <p className="pd-hero__k">
      Product {pad2(i + 1)} / {pad2(PRODUCTS.length)}
    </p>
  );
}

/** Full-width "Next product" link at the bottom of a product page. */
export function NextProduct({ slug }) {
  const next = nextProduct(slug);
  return (
    <section className="pd-next" aria-label="Next product">
      <a className="pd-next__link" href={"/" + next.slug} data-name={next.name}>
        <img src={next.heroImg} alt="" loading="lazy" decoding="async" />
        <span className="pd-next__k">Next product</span>
        <span className="pd-next__name">
          {next.name} <span aria-hidden="true">→</span>
        </span>
      </a>
    </section>
  );
}

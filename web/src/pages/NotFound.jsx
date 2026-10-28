/** Shown for any URL that is not a page on the site (the server also returns HTTP 404). */
export default function NotFound() {
  return (
    <main id="main" className="ck-page">
      <section className="shell ck-head">
        <p className="dx-kicker"><b>404</b> Page not found</p>
        <h1 className="ck-title">
          This page <span>does not exist.</span>
        </h1>
        <p className="ck-meta">The link may be old or mistyped. Try one of these instead:</p>
        <p className="ojx-notfound__links">
          <a href="/">Home</a> · <a href="/products">Products</a> · <a href="/services">Services</a> · <a href="/contact">Contact</a>
        </p>
      </section>
    </main>
  );
}

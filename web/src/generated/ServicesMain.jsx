/* Auto-generated from the legacy HTML by tools/react-port/extract.py. */
import CATALOG from "../data/servicesCatalog.json";

export default function ServicesMain() {
  return (
    <>
      <main id="main" className="px-page px-page--services">
        <section className="shell px-head">
          <div className="px-head__row">
            <div>
              <h1 className="px-title">
                Services
              </h1>
            </div>
          </div>
          {" "}
          <p className="px-lede">
            Eighty-one connected enterprise services across ten specialized disciplines, built for how Indian teams actually work.
          </p>
        </section>
        {" "}
        {" "}
        <section className="px-gallery" id="px-gallery" style={{"--n": "10"}} aria-label="Service categories showcase">
          <div className="px-sticky">
            <div className="px-track">
              {CATALOG.map((cat, idx) => (
                <a
                  key={cat.id}
                  id={cat.id}
                  className={`px-card ${idx === 0 ? "is-active" : ""}`}
                  href="#contact"
                  data-name={cat.title}
                  data-cat-id={cat.id}
                  data-discuss=""
                  data-topic={cat.title}
                  data-mode="consult"
                >
                  <span className="px-card__media">
                    <img src={cat.bannerImg} alt={`${cat.title} interface`} width="1600" height="1000" loading="lazy" decoding="async" />
                    <span className="px-card__open">
                      Open
                    </span>
                  </span>
                  {" "}
                  <span className="px-card__meta">
                    <span className="px-card__num">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="px-card__name">
                      {cat.title}
                    </span>
                    <span className="px-card__who">
                      {cat.services.length} Specialized Services
                    </span>
                  </span>
                </a>
              ))}
            </div>
            {" "}
            <span className="px-hint" aria-hidden="true">
              Scroll
            </span>
            {" "}
            <span className="px-bar" aria-hidden="true">
              <i />
            </span>
          </div>
        </section>
      </main>
    </>
  );
}

/* Auto-generated from the legacy HTML by tools/react-port/extract.py. */
function Year() { return new Date().getFullYear(); }

export function Newsletter() {
  return (
    <>
      <section className="ojx-news" aria-labelledby="ojx-news-title">
        <div className="shell ojx-news__grid">
          <div>
            <p className="ojx-news__kicker">
              <b>
                —
              </b>
              {" "}Newsletter
            </p>
            {" "}
            <h2 className="ojx-news__title" id="ojx-news-title">
              Notes from{" "}
              <span>
                OJIX.
              </span>
            </h2>
            {" "}
            <p className="ojx-news__text">
              One short email when we ship something worth reading—product updates, build notes and lessons from Indian businesses. No spam. Unsubscribe anytime.
            </p>
          </div>
          {" "}
          <form className="ojx-news__form" id="ojx-news-form" noValidate>
            <label className="ojx-news__label" htmlFor="ojx-news-email">
              Your email
            </label>
            {" "}
            <div className="ojx-news__row">
              <input type="email" id="ojx-news-email" name="email" required autoComplete="email" inputMode="email" placeholder="you@company.com" />
              {" "}
              <button type="submit">
                Subscribe{" "}
                <span aria-hidden="true">
                  →
                </span>
              </button>
            </div>
            {" "}
            <input type="text" name="_hp_check" className="ojx-news__hp" tabIndex="-1" autoComplete="off" aria-hidden="true" />
            {" "}
            <p className="ojx-news__note">
              By subscribing you agree to receive emails from OJIX. Read our{" "}
              <a href="/cookies">
                {"cookie & privacy policy"}
              </a>
              .
            </p>
            {" "}
            <p className="ojx-news__status" role="status" aria-live="polite" />
          </form>
        </div>
      </section>
    </>
  );
}

export function Footer() {
  return (
    <>
      <footer className="site-footer">
        <div className="shell footer-main">
          <div className="footer-brand">
            <a href="#top" aria-label="Back to top">
              <img src="/assets/ojix-primary-transparent-ondark.svg" alt="OJIX" width="130" height="63" />
            </a>
            {" "}
            <p>
              Systems for work that matters.
            </p>
            {" "}
            <p className="footer-brand-descriptor">
              Custom Software · AI · Engineering
            </p>
          </div>
          {" "}
          <div className="footer-col">
            <span className="footer-label">
              Explore
            </span>
            {" "}
            <a href="/products">
              Products
            </a>
            {" "}
            <a href="/#capabilities">
              Capabilities
            </a>
            {" "}
            <a href="/process">
              How we work
            </a>
            {" "}
            <a href="/security">
              {"Security & Sovereignty"}
            </a>
            {" "}
            <a href="/about">
              About OJIX
            </a>
          </div>
          {" "}
          <div className="footer-col">
            <span className="footer-label">
              {"Legal & Privacy"}
            </span>
            {" "}
            <a href="/dpdp-compliance" data-open-modal="privacy-modal">
              Privacy Policy (DPDP 2025)
            </a>
            {" "}
            <a href="/cookies">
              Cookie Policy
            </a>
            {" "}
            <button type="button" className="footer-link-btn" data-open-modal="cookie-modal">
              {"Consent & Preferences"}
            </button>
            {" "}
            <a href="mailto:info@ojix.in">
              Grievance Redressal (48h SLA){" "}
              <span aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
          {" "}
          <div className="footer-col">
            <span className="footer-label">
              Resources
            </span>
            {" "}
            <a href="/#faq">
              Enterprise FAQ
            </a>
          </div>
          {" "}
          <div className="footer-address">
            <span className="footer-label">
              Let's Talk
            </span>
            {" "}
            <p className="footer-address-lead">
              Have a business challenge to solve?
            </p>
            {" "}
            <a href="mailto:info@ojix.in">
              info@ojix.in{" "}
              <span aria-hidden="true">
                ↗
              </span>
            </a>
            {" "}
            <p>
              50/1, 5th Cross, Kalidasa Layout,
              <br />
              Srinagar, Bengaluru — 560050
            </p>
            {" "}
            <a href="/contact">
              Get in touch{" "}
              <span aria-hidden="true">
                →
              </span>
            </a>
            {" "}
            <small>
              GSTIN: 29AAKF03656Q1ZB
            </small>
          </div>
        </div>
        {" "}
        <div className="shell footer-bottom">
          <span className="footer-bottom-copy">
            ©{" "}
            <span id="year">
              <Year />
            </span>
            {" "}{"OJIX Engineering & Technology LLP"}
          </span>
          {" "}
          <span className="footer-bottom-built">
            Built for work that matters.
          </span>
          {" "}
          <a href="#top" className="back-to-top">
            Back to top{" "}
            <span aria-hidden="true">
              ↑
            </span>
          </a>
        </div>
      </footer>
    </>
  );
}

export function Modals() {
  return (
    <>
      <div id="cookie-modal" className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title" hidden>
        <div className="modal-window">
          <div className="modal-head">
            <div>
              <span className="modal-kicker">
                DPDP Rules 2025 · Rule 4 consent management
              </span>
              {" "}
              <h2 id="cookie-modal-title">
                {"Cookie & Tracking Preferences"}
              </h2>
            </div>
            {" "}
            <button type="button" className="modal-close" data-close-modal="cookie-modal" aria-label="Close preferences">
              ✕
            </button>
          </div>
          {" "}
          <div className="modal-body">
            <p className="modal-intro">
              In compliance with Section 6 of the DPDP Act, 2023 and Rule 4 of the DPDP Rules, 2025, consent must be specific, granular, unbundled, and as easy to withdraw as it is to give. You may also exercise consent management via registered Consent Managers interoperable with the Data Protection Board of India.
            </p>
            {" "}
            <div className="cookie-category">
              <div className="category-info">
                <strong>
                  Strictly Necessary Cookies
                </strong>
                {" "}
                <span className="category-badge">
                  Always Active
                </span>
                {" "}
                <p>
                  Required for secure routing, load balancing, cyber defense, and preference storage. Cannot be disabled pursuant to Section 4 legitimate operational grounds.
                </p>
              </div>
            </div>
            {" "}
            <div className="cookie-category">
              <div className="category-info">
                <strong>
                  {"Performance & Diagnostics Cookies"}
                </strong>
                {" "}
                <p>
                  Aggregated, anonymized telemetry to gauge system responsiveness and uptime without collecting direct personal identifiers or user profiles.
                </p>
              </div>
              {" "}
              <label className="toggle-switch" htmlFor="toggle-analytics">
                <span className="sr-only">
                  {"Performance & Diagnostics Cookies"}
                </span>
                {" "}
                <input type="checkbox" id="toggle-analytics" aria-label={"Performance & Diagnostics Cookies"} />
                {" "}
                <span className="toggle-slider" aria-hidden="true" />
              </label>
            </div>
          </div>
          {" "}
          <div className="modal-foot">
            <button type="button" className="btn btn-outline" data-close-modal="cookie-modal">
              Cancel
            </button>
            {" "}
            <button type="button" className="btn btn-primary" id="save-cookie-preferences">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
      {" "}
      <div id="privacy-modal" className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title" hidden>
        <div className="modal-window modal-window-large">
          <div className="modal-head">
            <div>
              <span className="modal-kicker">
                {"Statutory notice · DPDP Act (2023) & DPDP Rules (2025) compliant"}
              </span>
              {" "}
              <h2 id="privacy-modal-title">
                {"Digital Personal Data Protection Notice & Policy"}
              </h2>
            </div>
            {" "}
            <button type="button" className="modal-close" data-close-modal="privacy-modal" aria-label="Close privacy policy">
              ✕
            </button>
          </div>
          {" "}
          <div className="modal-body legal-document">
            <div className="legal-effective">
              {"Effective Date: March 2025 | Version 3.0 (Aligned with DPDP Act, 2023 & MeitY DPDP Rules, 2025)"}
            </div>
            {" "}
            <div className="legal-lang-notice">
              <span className="legal-lang-badge">
                Multilingual notice · Rule 3(2)
              </span>
              {" "}
              <span>
                This notice is published in English. In accordance with Rule 3(2) of the DPDP Rules 2025, Data Principals may request this notice in any of the{" "}
                <strong>
                  22 languages specified in the Eighth Schedule to the Constitution of India
                </strong>
                {" "}(including Hindi, Kannada, Tamil, Telugu, Bengali, Marathi, etc.) by contacting our Grievance Officer at{" "}
                <a href="mailto:info@ojix.in">
                  info@ojix.in
                </a>
                .
              </span>
            </div>
            {" "}
            <h3>
              1. Data Fiduciary Identification
            </h3>
            {" "}
            <p>
              This statutory notice is issued by{" "}
              <strong>
                {"OJIX Engineering & Technology LLP"}
              </strong>
              {" "}("OJIX", "we", "us", or "our"), an Indian Limited Liability Partnership having its principal place of business at 50/1, 5th Cross, Kalidasa Layout, Srinagar, Bangalore South, Bengaluru, Karnataka 560050, India. OJIX acts as the{" "}
              <strong>
                Data Fiduciary
              </strong>
              {" "}under Section 2(i) of the Digital Personal Data Protection Act, 2023 ("DPDP Act") and relevant provisions of the DPDP Rules, 2025.
            </p>
            {" "}
            <h3>
              {"2. Itemized Notice of Data Collection & Specific Purposes (Rule 3)"}
            </h3>
            {" "}
            <p>
              Pursuant to Rule 3(1)(a) and 3(1)(b) of the DPDP Rules 2025, personal data is collected solely under strict data minimization principles for defined, lawful purposes:
            </p>
            {" "}
            <table className="legal-table">
              <thead>
                <tr>
                  <th>
                    Personal Data Category
                  </th>
                  <th>
                    Specific Processing Purpose
                  </th>
                  <th>
                    Lawful Ground
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>
                      {"Full Name & Company Designation"}
                    </strong>
                  </td>
                  <td>
                    To identify the sender, establish business context, and personalize technical and commercial correspondence.
                  </td>
                  <td>
                    Explicit Consent (Sec. 6(1))
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>
                      Work Email Address
                    </strong>
                  </td>
                  <td>
                    To transmit requested software architecture blueprints, proposals, and discovery schedules.
                  </td>
                  <td>
                    Explicit Consent (Sec. 6(1))
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>
                      {"Operational Challenge & Project Scope"}
                    </strong>
                  </td>
                  <td>
                    To evaluate engineering feasibility, assess system integrations, and prepare customized enterprise platform demos.
                  </td>
                  <td>
                    Explicit Consent (Sec. 6(1))
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>
                      {"Technical Logs & IP Addresses"}
                    </strong>
                  </td>
                  <td>
                    To ensure cyber security, prevent distributed denial-of-service (DDoS) threats, and preserve audit logging required under Rule 7.
                  </td>
                  <td>
                    {"Legitimate Uses (Sec. 4(1)(b)) & Security Mandate"}
                  </td>
                </tr>
              </tbody>
            </table>
            {" "}
            <h3>
              {"3. Consent Architecture & Consent Manager Framework (Rule 4)"}
            </h3>
            {" "}
            <p>
              In accordance with Section 6 of the DPDP Act and Rule 4 of the DPDP Rules 2025:
            </p>
            {" "}
            <ul>
              <li>
                Consent is obtained through a clear, affirmative, and unbundled action. It is never pre-conditioned upon agreement to unrelated marketing or third-party disclosures.
              </li>
              {" "}
              <li>
                <strong>
                  Registered Consent Managers:
                </strong>
                {" "}You may give, manage, review, or withdraw consent directly through our website or through any{" "}
                <em>
                  Consent Manager
                </em>
                {" "}registered with the{" "}
                <strong>
                  Data Protection Board of India (DPBI)
                </strong>
                .
              </li>
            </ul>
            {" "}
            <h3>
              {"4. Unconditional Right to Withdraw Consent & Consequences (Section 6(4))"}
            </h3>
            {" "}
            <p>
              You possess the statutory right to withdraw consent at any time with the same ease as giving it. You may withdraw consent via the{" "}
              <button type="button" className="legal-inline-btn" data-open-modal="cookie-modal">
                {"Consent & Preferences Panel"}
              </button>
              {" "}or by sending an email to{" "}
              <a href="mailto:info@ojix.in">
                info@ojix.in
              </a>
              .
            </p>
            {" "}
            <p>
              <strong>
                Consequences of Withdrawal:
              </strong>
              {" "}Upon receipt of consent withdrawal, OJIX will cease processing your inquiry data and cryptographically erase it from our active communications pipeline within seven (7) business days. Withdrawal does not affect the lawfulness of processing undertaken prior to the withdrawal.
            </p>
            {" "}
            <h3>
              {"5. Statutory Rights of the Data Principal (Sections 11–14 & Rule 5)"}
            </h3>
            {" "}
            <p>
              Under Chapter III of the DPDP Act 2023 and Rule 5 of the DPDP Rules 2025, Data Principals enjoy comprehensive, enforceable digital rights:
            </p>
            {" "}
            <div className="legal-rights-grid">
              <div className="legal-right-item">
                <strong>
                  <span>
                    01
                  </span>
                  {" "}Right to Access
                </strong>
                {" "}
                <p>
                  Obtain a summary of personal data being processed, a description of processing activities, and identities of any data processors or third parties with whom data was shared.
                </p>
              </div>
              {" "}
              <div className="legal-right-item">
                <strong>
                  <span>
                    02
                  </span>
                  {" "}{"Right to Correction & Completion"}
                </strong>
                {" "}
                <p>
                  Request correction of inaccurate information, completion of incomplete records, or updating of your business contact information.
                </p>
              </div>
              {" "}
              <div className="legal-right-item">
                <strong>
                  <span>
                    03
                  </span>
                  {" "}Right to Erasure
                </strong>
                {" "}
                <p>
                  Mandate permanent deletion of personal data once the inquiry purpose is fulfilled or consent is withdrawn, unless statutory retention is required by Indian law.
                </p>
              </div>
              {" "}
              <div className="legal-right-item">
                <strong>
                  <span>
                    04
                  </span>
                  {" "}Right of Grievance Redressal
                </strong>
                {" "}
                <p>
                  Access our designated Grievance Officer with guaranteed acknowledgment within 48 hours and final substantive resolution within thirty (30) days.
                </p>
              </div>
              {" "}
              <div className="legal-right-item">
                <strong>
                  <span>
                    05
                  </span>
                  {" "}Right to Nominate (Rule 6)
                </strong>
                {" "}
                <p>
                  Nominate another individual through an electronic nomination facility who shall, in the event of death or incapacity, exercise your data rights.
                </p>
              </div>
              {" "}
              <div className="legal-right-item">
                <strong>
                  <span>
                    06
                  </span>
                  {" "}No Discriminatory Treatment
                </strong>
                {" "}
                <p>
                  OJIX will never deny services, alter quality of service, or charge discriminatory fees to any Data Principal exercising statutory DPDP rights.
                </p>
              </div>
            </div>
            {" "}
            <h3>
              {"6. Protection of Children & Vulnerable Persons (Section 9 & Rule 8)"}
            </h3>
            {" "}
            <p>
              OJIX delivers B2B enterprise software and operating platforms. We do not provide services directed to children (individuals under 18 years of age) and strictly prohibit the collection, behavioral monitoring, or targeted advertising of minors. In the event child data is inadvertently received, verifiable parental consent is mandated pursuant to Rule 8, failing which data is immediately purged.
            </p>
            {" "}
            <h3>
              {"7. Reasonable Security Practices & Breach Protocol (Section 8(6) & Rule 7)"}
            </h3>
            {" "}
            <p>
              We maintain state-of-the-art technical and organizational safeguards:
            </p>
            {" "}
            <ul>
              <li>
                <strong>
                  {"Storage & Encryption:"}
                </strong>
                {" "}All digital personal data resides in Indian sovereign cloud data centers encrypted with AES-256 at rest and TLS 1.3 in transit.
              </li>
              {" "}
              <li>
                <strong>
                  Zero Cross-Border Sale:
                </strong>
                {" "}OJIX never sells, rents, monetizes, or transfers personal data to unauthorized offshore entities.
              </li>
              {" "}
              <li>
                <strong>
                  Mandatory Breach Notification (Rule 7):
                </strong>
                {" "}In the unlikely event of any personal data breach affecting system integrity, OJIX will notify the{" "}
                <strong>
                  Data Protection Board of India (DPBI)
                </strong>
                {" "}and each affected Data Principal promptly without delay, detailing the nature of the event, affected data scope, and remedial actions deployed.
              </li>
            </ul>
            {" "}
            <h3>
              {"8. Data Retention & Erasure Schedule (Rule 9)"}
            </h3>
            {" "}
            <p>
              In accordance with Rule 9 of the DPDP Rules 2025, personal data is retained strictly for the duration necessary to satisfy the specified purpose:
            </p>
            {" "}
            <ul>
              <li>
                <strong>
                  Inquiry Records:
                </strong>
                {" "}Retained for a maximum of 180 days for ongoing technical evaluation or commercial dialogue. If no engagement proceeds, records are automatically subjected to cryptographic erasure.
              </li>
              {" "}
              <li>
                <strong>
                  Client System Data:
                </strong>
                {" "}Governed by dedicated Data Processing Addendums (DPAs) with contractual erasure protocols upon contract completion.
              </li>
            </ul>
            {" "}
            <h3>
              {"9. Designated Grievance Officer & Redressal SLA"}
            </h3>
            {" "}
            <p>
              Under Section 8(9) and Rule 10 of the DPDP Rules 2025, you may submit queries, complaints, or consent revocation requests to our appointed Grievance Officer:
            </p>
            {" "}
            <div className="legal-contact-card">
              <strong>
                {"Data Protection & Grievance Redressal Officer"}
              </strong>
              <br />
              {" "}{"OJIX Engineering & Technology LLP"}
              <br />
              {" "}50/1, 5th Cross, Kalidasa Layout, Srinagar, Bengaluru, Karnataka — 560050, India
              <br />
              {" "}Email:{" "}
              <a href="mailto:info@ojix.in">
                info@ojix.in
              </a>
              {" "}/ Alternate:{" "}
              <a href="mailto:info@ojix.in">
                info@ojix.in
              </a>
              <br />
              {" "}
              <strong>
                Statutory Timelines:
              </strong>
              {" "}Formal acknowledgment within forty-eight (48) hours · Substantive resolution within thirty (30) days.
            </div>
            {" "}
            <div className="dpbi-card">
              <strong>
                Escalation to Data Protection Board of India (DPBI)
              </strong>
              {" "}If you are unsatisfied with our Grievance Officer's resolution or have not received a response within the statutory timeline, you possess the right under Section 13(3) and Section 18 of the DPDP Act 2023 to appeal directly to the{" "}
              <strong>
                Data Protection Board of India (DPBI)
              </strong>
              {" "}via its electronic portal at{" "}
              <a href="https://dpbi.gov.in" target="_blank" rel="noopener">
                dpbi.gov.in{" "}
                <span aria-hidden="true">
                  ↗
                </span>
              </a>
              .
            </div>
          </div>
          {" "}
          <div className="modal-foot">
            <button type="button" className="btn btn-primary" data-close-modal="privacy-modal">
              {"Understood & Close"}
            </button>
          </div>
        </div>
      </div>
      {" "}
      <div id="cookie-policy-modal" className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cookie-policy-modal-title" hidden>
        <div className="modal-window">
          <div className="modal-head">
            <div>
              <span className="modal-kicker">
                {"Transparency · DPDP Act 2023 & DPDP Rules 2025"}
              </span>
              {" "}
              <h2 id="cookie-policy-modal-title">
                {"Cookie & Local Storage Policy"}
              </h2>
            </div>
            {" "}
            <button type="button" className="modal-close" data-close-modal="cookie-policy-modal" aria-label="Close cookie policy">
              ✕
            </button>
          </div>
          {" "}
          <div className="modal-body legal-document">
            <p>
              This Cookie Policy outlines the operational deployment of cookies and local storage on{" "}
              <a href="https://ojix.in">
                ojix.in
              </a>
              {" "}{"by OJIX Engineering & Technology LLP in compliance with India's"}{" "}
              <strong>
                DPDP Act, 2023
              </strong>
              {" "}and{" "}
              <strong>
                DPDP Rules, 2025
              </strong>
              .
            </p>
            {" "}
            <h3>
              {"What are cookies & browser storage?"}
            </h3>
            {" "}
            <p>
              Cookies and client-side storage technologies are small cryptographic or text strings placed on your device to maintain secure session integrity, remember your consent states, and facilitate efficient digital platform operation.
            </p>
            {" "}
            <h3>
              Classification of cookies deployed
            </h3>
            {" "}
            <ul>
              <li>
                <strong>
                  Strictly Necessary (Legitimate Operational Need):
                </strong>
                {" "}Session security tokens, anti-CSRF protections, and your explicit cookie consent state stored in{" "}
                <code>
                  localStorage
                </code>
                {" "}(
                <code>
                  ojix_dpdp_cookie_consent
                </code>
                ). These cookies cannot be turned off as they are critical to fundamental web service delivery.
              </li>
              {" "}
              <li>
                <strong>
                  {"Performance & Diagnostics (Affirmative Consent Required):"}
                </strong>
                {" "}Anonymized metrics measuring page load times, device viewport categories, and asset delivery performance. These are never shared with third-party advertising brokers or cross-site tracking graphs.
              </li>
            </ul>
            {" "}
            <h3>
              {"Granular Management & Consent Manager Support"}
            </h3>
            {" "}
            <p>
              In adherence to Rule 4 of the DPDP Rules 2025, you can review, toggle, or withdraw your cookie consent at any moment using our{" "}
              <button type="button" className="legal-inline-btn" id="open-preferences-from-policy">
                Cookie Preferences Panel
              </button>
              {" "}or through any registered Consent Manager registered with the DPBI.
            </p>
          </div>
          {" "}
          <div className="modal-foot">
            <button type="button" className="btn btn-primary" data-close-modal="cookie-policy-modal">
              Close
            </button>
          </div>
        </div>
      </div>
      {" "}
      <div id="portfolio-lightbox-modal" className="portfolio-lightbox-backdrop" role="dialog" aria-modal="true" aria-labelledby="portfolio-lightbox-title" hidden>
        <div className="portfolio-lightbox-window">
          <div className="portfolio-lightbox-header">
            <div className="portfolio-lightbox-meta">
              <span id="portfolio-lightbox-badge" className="portfolio-lightbox-badge">
                Core ERP
              </span>
              {" "}
              <h2 id="portfolio-lightbox-title" className="portfolio-lightbox-title">
                Platform Preview
              </h2>
            </div>
            {" "}
            <button type="button" className="portfolio-lightbox-close" data-close-portfolio-lightbox="" aria-label="Close portfolio preview modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
              </svg>
            </button>
          </div>
          {" "}
          <div className="portfolio-lightbox-body">
            <img id="portfolio-lightbox-img" src="" alt="OJIX Portfolio System Full Resolution Screen" />
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileServicesModal() {
  return (
    <>
      <div id="ojix-mobile-services-modal" className="ojix-mobile-services-modal" role="dialog" aria-modal="true" aria-label="Services Catalog" hidden>
        <div className="mobile-services-backdrop" data-close-mobile-services="" />
        {" "}
        <div className="mobile-services-sheet">
          {" "}
          <header className="mobile-services-header">
            <a href="#top" className="mobile-services-brand" aria-label="OJIX home">
              <img src="/assets/ojix-navbar-logo.svg" alt="OJIX" width="96" height="46" />
            </a>
            {" "}
            <button type="button" className="mobile-services-close-btn" data-close-mobile-services="" aria-label="Close services panel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                {" "}
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>
          {" "}
          {" "}
          <div className="mobile-services-nav-bar">
            <div className="mobile-services-nav-top">
              <span className="mobile-services-eyebrow">
                OUR SERVICES
              </span>
              {" "}
              <span className="mobile-services-counter" aria-live="polite">
                <span className="mobile-counter-current">
                  01
                </span>
                <span className="mobile-counter-sep">
                  /
                </span>
                <span className="mobile-counter-total">
                  10
                </span>
              </span>
            </div>
            {" "}
            <div className="mobile-services-tabs-scroll" role="tablist" aria-label="Service Categories" tabIndex="0" />
          </div>
          {" "}
          {" "}
          <div className="mobile-services-carousel-wrap">
            <div className="mobile-services-carousel" id="mobile-services-carousel" tabIndex="0" role="region" aria-label="Service category carousel" />
          </div>
        </div>
      </div>
    </>
  );
}


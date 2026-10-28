/* Single source of truth for the product line-up.
 * Used by the header mega-menu, the Products page, the home page rows,
 * the "Product 01 / 11" counters and the "Next product" links.
 * Order here = order everywhere. */

const svg = (children) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    {children}
  </svg>
);

export const PRODUCTS = [
  {
    slug: "company-management-system",
    name: "Company Management System",
    who: "Office, HR & accounting",
    line: "Run the whole company from one screen.",
    megaBadge: "ALL-IN-ONE OFFICE & ERP",
    megaDesc: "Run your daily office work in one place—staff attendance, monthly salaries, accounting, GST billing, and team approvals.",
    megaImg: "/assets/generated/ui-company-system.jpg",
    heroImg: "/assets/images/products/companyos-hero.webp",
    rowDesc: "Track attendance, process monthly salaries, manage accounts and GST bills, and approve team expenses without messy spreadsheets.",
    rowTags: ["Staff & payroll", "Accounts & GST billing", "Expense approvals", "Multi-branch"],
    icon: svg(<><path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" /><path d="M12 12L20 7.5M12 12V21M12 12L4 7.5" /></>),
  },
  {
    slug: "legalos",
    name: "Nyaya Sethu",
    who: "Law firms & legal teams",
    line: "Never miss a hearing again.",
    megaBadge: "LAW FIRMS & ADVOCATES",
    megaDesc: "Help your law firm track court hearing dates, case files, client updates, and legal billing without missing a single deadline.",
    megaImg: "/assets/generated/ui-legal-system.jpg",
    heroImg: "/assets/images/products/legalos-hero.webp",
    rowDesc: "Every case, hearing date, client file and fee invoice in one place. Daily cause lists update automatically and reminders go out on time.",
    rowTags: ["Court date alerts", "Case & task tracking", "Document vault", "Client billing"],
    icon: svg(<><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></>),
  },
  {
    slug: "procureos",
    name: "ProcureOS",
    who: "Purchasing & warehouse stock",
    line: "Every rupee of buying, under control.",
    megaBadge: "PURCHASING & WAREHOUSE",
    megaDesc: "Manage supplier quotes, purchase orders, warehouse stock, and incoming GST bills so you only pay for what was actually delivered.",
    megaImg: "/assets/generated/ui-purchase-system.jpg",
    heroImg: "/assets/images/products/procureos-hero.webp",
    rowDesc: "Compare supplier quotes, send purchase orders, check goods at the gate and match vendor GST bills before you pay.",
    rowTags: ["Quotes & POs", "Live stock levels", "Gate check", "GST bill matching"],
    icon: svg(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>),
  },
  {
    slug: "school-erp",
    name: "School ERP",
    who: "Schools & K-12 institutions",
    line: "Admission to report card, in one place.",
    megaBadge: "SCHOOLS & K-12",
    megaDesc: "Manage student admissions, daily attendance, fee payments, timetables, and exam report cards in one easy dashboard.",
    megaImg: "/assets/generated/ui-campus-system.jpg",
    heroImg: "/assets/images/products/campusos-hero.webp",
    rowDesc: "Daily attendance, online fees with instant receipts, exams and report cards—and parents kept up to date.",
    rowTags: ["Admissions & ID cards", "Attendance", "Online fees", "Exams & reports"],
    icon: svg(<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></>),
  },
  {
    slug: "university-management-system",
    name: "University Management System",
    who: "Universities & multi-campus colleges",
    line: "Every campus, department and student, connected.",
    megaBadge: "UNIVERSITIES & MULTI-CAMPUS",
    megaDesc: "Run admissions, academics, examinations, accreditation data and finance across every campus and department from one university-wide system.",
    megaImg: "/assets/images/products/university-ui.webp",
    heroImg: "/assets/images/products/university-hero.webp",
    rowDesc: "Admissions to convocation across colleges and campuses, with outcome-based exams, NAAC and NIRF data, and fee accounting in one place.",
    rowTags: ["Multi-campus admissions", "OBE & examinations", "NAAC / NIRF data", "Fees & finance"],
    icon: svg(<><path d="M3 21h18" /><path d="M5 21V10M9.5 21V10M14.5 21V10M19 21V10" /><path d="M2 10 12 4l10 6" /></>),
    isNew: true,
  },
  {
    slug: "ai-proctoring",
    name: "AI Proctoring",
    who: "Online exams & assessments",
    line: "Fair online exams, watched by AI.",
    megaBadge: "ONLINE EXAMS & ASSESSMENTS",
    megaDesc: "Run secure online exams with identity checks, live webcam monitoring, browser lockdown and AI flags your invigilators can review in seconds.",
    megaImg: "/assets/images/products/proctoring-ui.webp",
    heroImg: "/assets/images/products/proctoring-hero.webp",
    rowDesc: "Face and ID checks before the exam, live AI monitoring during it, and a flagged-moments report your examiners can review after.",
    rowTags: ["Identity check", "Live AI monitoring", "Browser lockdown", "Review reports"],
    icon: svg(<><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="10" r="3" /><path d="M7 18c1.2-2 2.9-3 5-3s3.8 1 5 3" /></>),
    isNew: true,
  },
  {
    slug: "construction-hub",
    name: "Construction Hub",
    who: "Builders, real estate & contractors",
    line: "Every site and every bag of cement, in view.",
    megaBadge: "BUILDERS & CONTRACTORS",
    megaDesc: "Track daily work at construction sites, monitor cement and steel usage, verify contractor bills, and keep project budgets on track.",
    megaImg: "/assets/generated/ui-construction-system.jpg",
    heroImg: "/assets/images/products/buildos-hero.webp",
    rowDesc: "Real-time progress across sites, material usage, contractor bills verified from mobile photos and budgets kept on track.",
    rowTags: ["Daily site progress", "Material log", "Contractor billing", "RERA accounts"],
    icon: svg(<><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" /></>),
  },
  {
    slug: "property-intelligence",
    name: "Property Intelligence",
    who: "Developers, landlords & brokers",
    line: "Every property, unit and lease, measured.",
    megaBadge: "REAL ESTATE & PROPERTY",
    megaDesc: "See every property, unit, lease and rupee of rent in one place—with price insights, occupancy trends and maintenance tracking.",
    megaImg: "/assets/images/products/property-ui.webp",
    heroImg: "/assets/images/products/property-hero.webp",
    rowDesc: "A live map of your portfolio with unit inventory, leases and rent collection, plus price and demand insights for every micro-market you sell in.",
    rowTags: ["Portfolio map", "Leases & rent", "Price insights", "Maintenance"],
    icon: svg(<><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="m8.5 16 2.5-2.5 2 2 3-3" /></>),
    isNew: true,
  },
  {
    slug: "travelos",
    name: "TravelOS",
    who: "Travel agencies & tour operators",
    line: "From enquiry to trip voucher, automated.",
    megaBadge: "TRAVEL AGENCIES & TOURS",
    megaDesc: "Handle customer trip enquiries, tour packages, hotel and flight bookings, and driver schedules from one clean screen.",
    megaImg: "/assets/generated/ui-travel-system.jpg",
    heroImg: "/assets/images/products/travelos-hero.webp",
    rowDesc: "Tour packages, hotel, flight and cab bookings in one place, with instant vouchers and WhatsApp updates for travellers.",
    rowTags: ["Package builder", "Hotel & cab bookings", "WhatsApp alerts", "GST invoicing"],
    icon: svg(<><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>),
  },
  {
    slug: "fitos",
    name: "FitOS",
    who: "Gyms, fitness & wellness",
    line: "Run one gym or a whole chain.",
    megaBadge: "GYMS & FITNESS STUDIOS",
    megaDesc: "Manage member check-ins, biometric entry gates, trainer schedules, and automatic membership renewal reminders effortlessly.",
    megaImg: "/assets/generated/ui-gym-system.jpg",
    heroImg: "/assets/images/products/fitos-hero.webp",
    rowDesc: "Face-scan entry, memberships, trainer schedules and automatic UPI renewal links across every branch.",
    rowTags: ["Biometric entry", "UPI auto-renewals", "Trainer schedules", "Multi-branch"],
    icon: svg(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />),
  },
  {
    slug: "dpdp-compliance",
    name: "DPDP Privacy Vault",
    who: "Secure documents & privacy",
    line: "Your files. Locked, logged and lawful.",
    megaBadge: "SECURE FILE & PRIVACY VAULT",
    megaDesc: "Store important company and customer files safely with clear access permissions and built-in Indian data privacy compliance.",
    megaImg: "/assets/generated/ui-privacy-vault.jpg",
    heroImg: "/assets/images/products/dpdp-hero.webp",
    rowDesc: "Confidential files and customer data with folder permissions, a record of every view and download, and DPDP-ready consent logs.",
    rowTags: ["Encrypted storage", "Access control", "Consent log", "DPDP ready"],
    icon: svg(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>),
  },
];

export const pad2 = (n) => String(n).padStart(2, "0");

export function productIndex(slug) {
  return PRODUCTS.findIndex((p) => p.slug === slug);
}

export function nextProduct(slug) {
  const i = productIndex(slug);
  return PRODUCTS[(i + 1) % PRODUCTS.length];
}

/** Old URLs that now redirect to the renamed products. */
export const PRODUCT_REDIRECTS = {
  "/companyos": "/company-management-system",
  "/campusos": "/school-erp",
  "/buildos": "/construction-hub",
  "/dpdp": "/dpdp-compliance",
};

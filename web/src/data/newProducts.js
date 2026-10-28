/* Page content for the products added in Build 04.
 * Rendered by pages/ProductTemplate.jsx. Edit text here; layout stays the same. */

export const UNIVERSITY = {
  slug: "university-management-system",
  meta: {
    title: "University Management System — Multi-Campus Higher-Ed ERP | OJIX",
    description:
      "University Management System by OJIX: admissions, academics, outcome-based examinations, NAAC/NIRF data, fees and finance across every campus and department. DPDP-aligned, hosted in India.",
  },
  intro: {
    title: "One university.",
    span: "Every campus, college and department in sync.",
    lede: "A single system for the registrar, the controller of examinations, deans, finance and students. Admissions, academics, exams, accreditation data and fees stay connected across every campus—so leadership sees the whole university, not a pile of spreadsheets.",
    cta: "Schedule University Demo",
  },
  pv: {
    url: "app.ojix.in/university",
    mark: "U",
    badge: "Odd semester · 2026",
    kpis: [["18,420", "Students enrolled"], ["94.1%", "Attendance today"], ["₹12.6Cr", "Fees collected"]],
    panel: "Exam results published by school",
    bars: [[96, "Engg"], [88, "Mgmt"], [92, "Sci"], [79, "Law"], [85, "Arts"], [90, "Comm"]],
    app: "University",
    note: ["Results published", "B.Tech Sem 5 · 1,240 students"],
  },
  stats: [
    ["Multi-campus", "One Source of Truth", "Every college, campus and department on one data model with campus-level permissions."],
    ["OBE-ready", "Outcome-Based Exams", "CO–PO mapping, attainment reports and question-paper blueprints built into examinations."],
    ["NAAC / NIRF", "Accreditation Data", "Criterion-wise evidence and NIRF parameters compiled from live academic records."],
    ["Zero queues", "Self-Service Students", "Registrations, fee payments, hall tickets and certificates from the student app."],
  ],
  cmp: {
    kicker: "The reality of Indian universities",
    title: "Why disconnected campus software",
    span: "slows growing universities down.",
    old: {
      badge: "Separate tools per campus",
      title: "Siloed, Manual & Audit-Heavy",
      items: [
        ["Campus Silos", "Each college runs its own admissions sheet, fee tool and exam register, so the university never has one accurate student count."],
        ["Accreditation Scramble", "NAAC and NIRF data is rebuilt by hand every cycle from emails, folders and departmental spreadsheets."],
        ["Exam Bottlenecks", "Seating plans, hall tickets, evaluation and result processing depend on manual handoffs and late-night reconciliation."],
        ["Fee Leakage", "Scholarships, concessions and instalments tracked outside the ledger lead to unreconciled dues and disputes."],
      ],
    },
    next: {
      badge: "University Management System",
      title: "Connected, Accountable & Real-Time",
      items: [
        ["One Student Record", "From application to alumni, every student has one record shared by admissions, academics, exams and finance across campuses."],
        ["Accreditation on Tap", "Criterion-wise NAAC evidence, NIRF parameters and AISHE returns generated from live data with an audit trail."],
        ["End-to-End Examinations", "Blueprints, seating, hall tickets, digital evaluation, moderation and result publishing in one controlled flow."],
        ["Reconciled Finance", "Fee plans, scholarships, refunds and instalments post to the ledger automatically with UPI and bank reconciliation."],
      ],
    },
  },
  rows: {
    title: "Six connected engines",
    span: "for the whole university.",
    items: [
      { kicker: "Admissions", title: "Multi-Campus Admissions & Enrolment", desc: "Online applications, entrance and merit lists, counselling rounds, document verification and seat allotment across programmes and campuses—with live seat-matrix visibility for leadership.", tags: ["Merit & counselling", "Seat matrix", "Document checks"] },
      { kicker: "Academics", title: "Programmes, Curriculum & Timetables", desc: "Programme structures, credit frameworks under NEP 2020, electives, faculty workload and conflict-free timetables for every school, department and section.", tags: ["NEP credit framework", "Electives", "Faculty workload"] },
      { kicker: "Examinations", title: "Outcome-Based Examinations", desc: "Question-paper blueprints with CO–PO mapping, seating plans, hall tickets, digital evaluation, moderation, revaluation and secure result publishing with attainment reports.", tags: ["CO–PO attainment", "Digital evaluation", "Result publishing"] },
      { kicker: "Accreditation", title: "NAAC, NIRF & Statutory Returns", desc: "Evidence collected as work happens, mapped to NAAC criteria and NIRF parameters, with AISHE and UGC returns compiled from the same records instead of rebuilt every cycle.", tags: ["NAAC criteria", "NIRF parameters", "AISHE returns"] },
      { kicker: "Finance", title: "Fees, Scholarships & Accounts", desc: "Programme-wise fee plans, instalments, scholarships and concessions, UPI and bank collections, refunds and campus-wise accounts that reconcile with the general ledger.", tags: ["Fee plans", "Scholarships", "Bank reconciliation"] },
      { kicker: "Students & alumni", title: "Student App, Placements & Alumni", desc: "A student app for attendance, timetables, results and certificates; placement drives and offers; and an alumni network that stays connected to the university after convocation.", tags: ["Student app", "Placements", "Alumni network"] },
    ],
  },
  trust: {
    title: "Built for university governance",
    span: "and statutory scrutiny.",
    items: [
      ["DPDP Act 2023 & Rules 2025 Aligned", "Consent registers for students and parents, purpose-limited access, and data hosted on Indian sovereign cloud regions."],
      ["Campus-Level RBAC & 2FA", "Registrar, CoE, dean, HoD, faculty and finance roles scoped by campus and department, with two-factor sign-in."],
      ["Tamper-Evident Exam Records", "Every mark change, moderation and result publication is logged with user, time and reason for audit."],
      ["99.9% Availability at Peak", "Engineered for admission days and result nights, with load-tested infrastructure and daily encrypted backups."],
    ],
  },
  faq: {
    kicker: "University operations FAQs",
    lede: "Clear answers on multi-campus rollout, examinations, accreditation data and migration.",
    items: [
      ["Can it run several campuses and affiliated colleges under one university?", "Yes. Each campus or college gets its own programmes, staff and finances, while the university sees consolidated admissions, results and collections. Permissions keep each campus to its own data."],
      ["Does it support NEP 2020 credit frameworks and outcome-based education?", "Yes. Programme structures support NEP credit frameworks, multiple entry and exit, and electives. Examinations map questions to course outcomes and calculate CO–PO attainment automatically."],
      ["How does it help with NAAC and NIRF submissions?", "Evidence is captured from day-to-day records—admissions, results, research, placements and finance—and mapped to NAAC criteria and NIRF parameters, so submissions are compiled rather than rebuilt."],
      ["Can we migrate data from our current ERP and spreadsheets?", "Yes. We migrate student records, fee ledgers and historical results in phases, validate them with your teams, and run the old and new systems side by side until you sign off."],
      ["Where is our data hosted?", "On Indian sovereign cloud regions with encryption at rest and in transit, or on your own infrastructure if your university policy requires on-premise hosting."],
    ],
  },
  cta: {
    title: "Bring every campus",
    span: "onto one system.",
    text: "Schedule a confidential walkthrough tailored to your campuses, schools, programmes and examination calendar.",
  },
};

export const PROCTORING = {
  slug: "ai-proctoring",
  meta: {
    title: "AI Proctoring — Secure Online Exams & Remote Invigilation | OJIX",
    description:
      "AI Proctoring by OJIX: identity verification, live webcam and screen monitoring, browser lockdown and AI-flagged review reports for fair online exams. DPDP-aligned, hosted in India.",
  },
  intro: {
    title: "Online exams you can trust,",
    span: "without an invigilator in every room.",
    lede: "AI Proctoring checks who is taking the exam, watches for malpractice while it runs, and hands your examiners a short list of flagged moments to review. Fair for students, defensible for institutions, and simple to run at scale.",
    cta: "Schedule Proctoring Demo",
  },
  pv: {
    url: "app.ojix.in/proctor",
    mark: "P",
    badge: "Mid-term · Live",
    kpis: [["2,348", "Candidates live"], ["99.2%", "ID verified"], ["17", "Flags to review"]],
    panel: "AI flags by type this session",
    bars: [[38, "Face"], [64, "Voice"], [22, "Phone"], [81, "Tab"], [30, "Away"], [12, "Multi"]],
    app: "Proctor",
    note: ["Flag raised · Tab switch", "Roll 21CS104 · 00:42:18"],
  },
  stats: [
    ["3-step", "Identity Check", "Face match against the enrolled photo, ID card scan and a room scan before the exam starts."],
    ["Real-time", "AI Monitoring", "Faces, voices, phones, tab switches and looking away detected live during the exam."],
    ["10x", "Faster Review", "Examiners review short flagged clips instead of watching hours of recordings."],
    ["Scale", "Thousands Concurrent", "Run large exams across cities with low-bandwidth support and auto-resume."],
  ],
  cmp: {
    kicker: "The problem with online exams",
    title: "Why video calls and honour codes",
    span: "can’t protect exam integrity.",
    old: {
      badge: "Video-call invigilation",
      title: "Manual, Inconsistent & Hard to Defend",
      items: [
        ["Impersonation Risk", "No reliable way to confirm that the person writing the exam is the registered candidate."],
        ["Invigilator Fatigue", "One invigilator watching a grid of 30 video tiles misses most suspicious behaviour."],
        ["Open Browsers", "Candidates can switch tabs, search answers or use chat apps without anyone noticing."],
        ["Weak Evidence", "When malpractice is suspected there is no timestamped record to support a fair decision."],
      ],
    },
    next: {
      badge: "OJIX AI Proctoring",
      title: "Verified, Monitored & Auditable",
      items: [
        ["Verified Candidates", "Face match, ID scan and liveness checks confirm identity before the paper opens and at random intervals."],
        ["AI That Never Blinks", "Computer vision and audio models flag phones, extra faces, voices and gaze patterns in real time."],
        ["Locked-Down Browser", "Secure browser mode blocks new tabs, copy-paste, screen sharing and virtual machines."],
        ["Evidence-Based Decisions", "Every flag comes with a timestamped clip, screenshot and severity score for examiner review."],
      ],
    },
  },
  rows: {
    title: "Six engines",
    span: "for fair online assessment.",
    items: [
      { kicker: "Identity", title: "Candidate Verification", desc: "Face match against the enrolment photo, government or college ID scan, liveness detection and a 360° room scan before the exam begins—with random re-verification during the paper.", tags: ["Face match", "ID scan", "Liveness check"] },
      { kicker: "Live monitoring", title: "AI Webcam & Audio Monitoring", desc: "On-device and cloud models watch for multiple faces, no face, mobile phones, books, voices and repeated looking away, raising graded flags in real time.", tags: ["Object detection", "Voice detection", "Gaze tracking"] },
      { kicker: "Lockdown", title: "Secure Exam Browser", desc: "Full-screen lockdown that blocks new tabs, copy-paste, printing, screen sharing, remote-desktop tools and virtual machines, with tab-switch and focus-loss logging.", tags: ["Tab lock", "Copy-paste block", "VM detection"] },
      { kicker: "Invigilation", title: "Live Invigilator Console", desc: "Invigilators see a prioritised wall of candidates, sorted by risk, and can message, warn, pause or terminate a session in one click—one person can oversee hundreds.", tags: ["Risk-sorted grid", "Chat & warnings", "Pause or end"] },
      { kicker: "Review", title: "Flag Review & Credibility Reports", desc: "After the exam, examiners review short flagged clips with severity scores and add decisions. Each candidate gets a credibility score and a downloadable evidence report.", tags: ["Flagged clips", "Credibility score", "Evidence PDF"] },
      { kicker: "Integration", title: "LMS, ERP & Exam Platform Integration", desc: "Works with your existing exam platform or ours. Connects to Moodle, University Management System, School ERP and other LMS tools through LTI and REST APIs.", tags: ["LTI & REST", "Moodle", "OJIX ERPs"] },
    ],
  },
  trust: {
    title: "Privacy-first proctoring",
    span: "students and regulators can accept.",
    items: [
      ["DPDP Act 2023 & Rules 2025 Aligned", "Clear notices and consent before each exam, purpose-limited recordings, and automatic deletion after your retention period."],
      ["Indian Data Residency", "Video, audio and identity data processed and stored on Indian sovereign cloud regions, never sold or used to train public models."],
      ["Human Decision, AI Assistance", "AI only raises flags; every malpractice decision is made and recorded by an authorised examiner."],
      ["Low-Bandwidth Resilience", "Adaptive video quality, offline buffering and auto-resume keep exams running on patchy connections."],
    ],
  },
  faq: {
    kicker: "Online exam FAQs",
    lede: "Straight answers on accuracy, privacy, bandwidth and how decisions are made.",
    items: [
      ["Does the AI decide whether a student cheated?", "No. The AI only flags moments that look unusual and scores how serious they are. An authorised examiner reviews the evidence and makes the decision, which is logged for audit."],
      ["What do candidates need to take a proctored exam?", "A laptop or desktop with a webcam and microphone, a recent Chrome or Edge browser, and a stable internet connection. The system checks the device before the exam and works on modest bandwidth."],
      ["How is student privacy protected?", "Candidates see a clear notice and give consent before each exam. Recordings are used only for that exam, stored in India, access-controlled, and deleted automatically after the retention period you set."],
      ["Can we use it with our existing exam software or LMS?", "Yes. AI Proctoring runs alongside your current exam platform or Moodle through LTI and APIs, or you can use the built-in OJIX exam engine."],
      ["How many candidates can take an exam at the same time?", "The platform is load-tested for thousands of concurrent candidates. For very large exams we plan capacity with you in advance and monitor the session live."],
    ],
  },
  cta: {
    title: "Run your next exam",
    span: "with confidence.",
    text: "Schedule a demo with your own sample paper and see identity checks, live monitoring and the review report end to end.",
  },
};

export const PROPERTY = {
  slug: "property-intelligence",
  meta: {
    title: "Property Intelligence — Real Estate Portfolio, Leasing & Market Insights | OJIX",
    description:
      "Property Intelligence by OJIX: one live view of every property, unit, lease and rent payment, with price and demand insights, occupancy trends and maintenance tracking for Indian real estate.",
  },
  intro: {
    title: "Know every property you own,",
    span: "and what it should earn.",
    lede: "Property Intelligence brings your projects, units, tenants, leases and rent collections into one live portfolio—then adds price, demand and occupancy insights so you can price, sell and lease with evidence instead of guesswork.",
    cta: "Schedule Portfolio Demo",
  },
  pv: {
    url: "app.ojix.in/property",
    mark: "P",
    badge: "Portfolio · Q3 2026",
    kpis: [["1,286", "Units tracked"], ["92.4%", "Occupancy"], ["₹3.8Cr", "Rent this month"]],
    panel: "Occupancy by micro-market",
    bars: [[94, "WFD"], [88, "HSR"], [97, "ORR"], [72, "NBR"], [85, "JPN"], [91, "EC"]],
    app: "Property",
    note: ["Rent received", "Tower B · Unit 1204 · ₹48,000"],
  },
  stats: [
    ["One map", "Whole Portfolio", "Every project, tower and unit on a live map with status, pricing and occupancy."],
    ["On time", "Rent & Renewals", "Automatic rent reminders, UPI collection links and lease-renewal alerts."],
    ["Data-led", "Pricing Insights", "Micro-market price trends and demand signals to set the right price per sq ft."],
    ["Fewer gaps", "Vacancy & Upkeep", "Vacancy days, maintenance tickets and vendor costs tracked per unit."],
  ],
  cmp: {
    kicker: "The reality of Indian real estate",
    title: "Why spreadsheets and broker calls",
    span: "leave money on the table.",
    old: {
      badge: "Spreadsheets & WhatsApp",
      title: "Scattered, Delayed & Gut-Driven",
      items: [
        ["Scattered Records", "Unit inventory, buyer bookings, leases and rent rolls live in different spreadsheets and phones."],
        ["Missed Rent & Renewals", "Late payments and expiring leases are noticed only after the money is already overdue."],
        ["Guesswork Pricing", "Prices are set from broker opinion rather than actual transactions and demand in the micro-market."],
        ["Invisible Upkeep Costs", "Maintenance requests and vendor bills are not tied to units, so true profitability is unknown."],
      ],
    },
    next: {
      badge: "OJIX Property Intelligence",
      title: "Connected, Timely & Evidence-Based",
      items: [
        ["Live Portfolio", "Every property, tower and unit with its status, buyer or tenant, documents and history in one place."],
        ["Automated Collections", "Rent schedules, UPI links, reminders and receipts generated automatically, with renewal alerts ahead of time."],
        ["Market Intelligence", "Price per sq ft trends, absorption and enquiry demand by micro-market to guide pricing and launches."],
        ["Unit-Level Profitability", "Income, vacancy days, maintenance and vendor costs rolled up per unit, property and portfolio."],
      ],
    },
  },
  rows: {
    title: "Six engines",
    span: "for smarter property decisions.",
    items: [
      { kicker: "Portfolio", title: "Live Portfolio Map & Unit Inventory", desc: "Every project, tower, floor and unit on an interactive map and stacking plan, with availability, booking status, pricing and documents attached to each unit.", tags: ["Interactive map", "Stacking plan", "Unit documents"] },
      { kicker: "Leasing", title: "Leases, Tenants & Renewals", desc: "Digital lease records with escalation clauses, deposits and lock-in periods, tenant KYC, and automatic alerts before renewals and expiries.", tags: ["Lease register", "Tenant KYC", "Renewal alerts"] },
      { kicker: "Collections", title: "Rent, CAM & Payment Collection", desc: "Monthly rent and maintenance (CAM) invoices with GST, UPI and bank payment links, automatic reminders, receipts and a live receivables dashboard.", tags: ["GST invoices", "UPI links", "Receivables"] },
      { kicker: "Insights", title: "Price, Demand & Occupancy Analytics", desc: "Micro-market price per sq ft trends, enquiry and site-visit demand, absorption rates and occupancy forecasts to price launches and resales with evidence.", tags: ["Price trends", "Demand signals", "Occupancy forecast"] },
      { kicker: "Facilities", title: "Maintenance & Vendor Management", desc: "Tenant service requests, preventive maintenance schedules, vendor assignment and cost tracking, all linked to the unit so upkeep costs are never invisible.", tags: ["Service requests", "Preventive plans", "Vendor costs"] },
      { kicker: "Sales", title: "Bookings, Brokers & Buyer Journey", desc: "Lead capture from portals and site visits, broker and channel-partner tracking, booking forms, payment-plan schedules and RERA-ready buyer statements.", tags: ["Lead tracking", "Channel partners", "RERA statements"] },
    ],
  },
  trust: {
    title: "Built for developers, landlords",
    span: "and their auditors.",
    items: [
      ["DPDP Act 2023 & Rules 2025 Aligned", "Buyer and tenant data handled with consent, purpose limits and access logs, hosted on Indian sovereign cloud regions."],
      ["RERA & GST Ready", "RERA project accounts, buyer statements and GST-compliant rent and CAM invoices generated from the same records."],
      ["Role-Based Access", "Owners, asset managers, leasing teams, brokers and facility vendors see only the properties and data they need."],
      ["Works with Construction Hub", "Units flow straight from Construction Hub when a project completes, so inventory and handovers stay in sync."],
    ],
  },
  faq: {
    kicker: "Property operations FAQs",
    lede: "Answers on data sources, rent collection, integrations and getting started.",
    items: [
      ["Where do the price and demand insights come from?", "From your own transactions, enquiries and site visits, combined with registered-transaction and listing data for your micro-markets. You see the sources behind every trend."],
      ["Can tenants pay rent online?", "Yes. Each invoice includes a UPI and bank payment link. Payments are matched automatically, receipts go out instantly, and overdue reminders are sent on your schedule."],
      ["Is it only for large developers?", "No. It works for a single landlord with a few units, for family offices with mixed portfolios, and for developers managing thousands of units across cities."],
      ["Does it connect with our accounting and construction systems?", "Yes. It integrates with Tally and other accounting tools, and with OJIX Construction Hub so completed units move into the portfolio without re-entry."],
      ["How do we get started?", "We import your unit inventory, leases and tenant list from spreadsheets, set up rent schedules and payment links, and train your team—usually within a few weeks."],
    ],
  },
  cta: {
    title: "See your whole portfolio",
    span: "in one place.",
    text: "Schedule a walkthrough using a sample of your own properties, leases and rent roll.",
  },
};

export const NEW_PRODUCT_PAGES = {
  [UNIVERSITY.slug]: UNIVERSITY,
  [PROCTORING.slug]: PROCTORING,
  [PROPERTY.slug]: PROPERTY,
};

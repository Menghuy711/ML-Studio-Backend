import pptxgen from 'pptxgenjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const pptx = new pptxgen();

// ── Theme (matching lecturer's sample — blue) ──────────────────────────
const COLORS = {
  dark: '1F497D',
  accent: '4F81BD',
  accentDark: '2E5C8A',
  red: 'C0504D',
  green: '9BBB59',
  purple: '8064A2',
  orange: 'F79646',
  light: 'EEECE1',
  gray: '7F7F7F',
  white: 'FFFFFF',
  softGray: 'D9E4F2',
};

const FONTS = { heading: 'Calibri', body: 'Calibri' };

pptx.layout = 'LAYOUT_WIDE';
pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
pptx.layout = 'WIDE';

const W = 13.33;
const H = 7.5;

function addBackground(slide, color = COLORS.white) {
  slide.background = { color };
}

// ── Shared builders ────────────────────────────────────────────────────
function header(slide, num, title) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: W, h: 1.15, fill: { color: COLORS.dark },
  });
  slide.addText(title, {
    x: 0.55, y: 0.15, w: 10.5, h: 0.85, fontFace: FONTS.heading, fontSize: 28,
    bold: true, color: COLORS.white, valign: 'middle',
  });
  if (num) {
    slide.addText(num, {
      x: 12.1, y: 0.15, w: 0.9, h: 0.85, fontFace: FONTS.body, fontSize: 14,
      color: COLORS.softGray, valign: 'middle', align: 'right',
    });
  }
}

function footer(slide, pageNum) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: H - 0.35, w: W, h: 0.35, fill: { color: COLORS.dark },
  });
  slide.addText('ML Studio — E-Commerce Bag Store', {
    x: 0.55, y: H - 0.35, w: 6, h: 0.35, fontFace: FONTS.body, fontSize: 9, color: COLORS.white, valign: 'middle',
  });
  slide.addText(String(pageNum), {
    x: 12.3, y: H - 0.35, w: 0.6, h: 0.35, fontFace: FONTS.body, fontSize: 9, color: COLORS.white, align: 'right', valign: 'middle',
  });
}

function bulletList(slide, items, opts = {}) {
  const { x = 0.7, y = 1.5, w = 11.9, fontSize = 15, gap = 8, color = COLORS.dark } = opts;
  const texts = items.map((it) => {
    const isHeader = typeof it === 'object' && it.header;
    const txt = isHeader ? it.header : (typeof it === 'object' ? it.text : it);
    const level = isHeader || (typeof it === 'object' && it.level) ? (it.level || 0) : 0;
    return {
      text: txt,
      options: {
        bullet: level === 0
          ? { code: '2022', indent: 16 }
          : { code: '25AA', indent: 16, margin: 16 },
        indentLevel: level,
        bold: isHeader,
        color: isHeader ? COLORS.accent : color,
        fontSize: isHeader ? fontSize : fontSize - (level ? 2 : 0),
        fontFace: FONTS.body,
        paraSpaceAfter: gap,
      },
    };
  });
  slide.addText(texts, { x, y, w, h: 5.2, valign: 'top' });
}

function subtitle(slide, text) {
  slide.addText(text, {
    x: 0.55, y: 1.25, w: 12.23, h: 0.5, fontFace: FONTS.body, fontSize: 14, italic: true, color: COLORS.gray,
  });
}

// ══════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ══════════════════════════════════════════════════════════════════════
const s1 = pptx.addSlide();
addBackground(s1, COLORS.dark);
s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.2, fill: { color: COLORS.accent } });
s1.addShape(pptx.ShapeType.rect, { x: 0, y: H - 0.2, w: W, h: 0.2, fill: { color: COLORS.accent } });
s1.addText('Design and Development of a\nWeb-Based E-Commerce Store\nfor ML Studio', {
  x: 0.8, y: 1.4, w: 11.73, h: 2.8, fontFace: FONTS.heading, fontSize: 38, bold: true,
  color: COLORS.white, align: 'center', lineSpacing: 44,
});
s1.addShape(pptx.ShapeType.line, { x: 4.5, y: 4.45, w: 4.33, h: 0, line: { color: COLORS.accent, width: 2 } });
s1.addText('WCT — Web Content Technology', {
  x: 0.8, y: 4.7, w: 11.73, h: 0.5, fontFace: FONTS.body, fontSize: 16, color: COLORS.softGray, align: 'center',
});
s1.addText('Present by: Lor Menghuy', {
  x: 0.8, y: 5.5, w: 11.73, h: 0.5, fontFace: FONTS.body, fontSize: 15, color: COLORS.accent, align: 'center',
});

// ══════════════════════════════════════════════════════════════════════
// SLIDE 2 — Content
// ══════════════════════════════════════════════════════════════════════
const s2 = pptx.addSlide();
addBackground(s2);
header(s2, '2', 'Content');
const agenda = [
  '1.  Introduction',
  '2.  Literature Review',
  '3.  Methodology',
  '4.  Result',
  '5.  Discussion',
  '6.  Conclusion',
  '7.  Future Work',
];
const agendaItems = agenda.map((a, i) => ({
  text: a,
  options: {
    bullet: { code: '25B6', indent: 20 },
    fontSize: 20,
    fontFace: FONTS.body,
    color: COLORS.dark,
    paraSpaceAfter: 14,
    bold: false,
  },
}));
s2.addText(agendaItems, { x: 1.5, y: 1.55, w: 10, h: 5.3, valign: 'top' });
footer(s2, 2);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 3 — Introduction (Background)
// ══════════════════════════════════════════════════════════════════════
const s3 = pptx.addSlide();
addBackground(s3);
header(s3, '3', 'Introduction');
subtitle(s3, '1. Background and Motivation');
bulletList(s3, [
  'Online shopping is growing rapidly; small retail businesses need an affordable web presence.',
  'Existing e-commerce platforms (Shopify, WooCommerce) are often expensive and inflexible.',
  'Many bag stores in Cambodia lack a proper online storefront for browsing and ordering.',
  'A custom-built, lightweight solution can serve a small business at near-zero hosting cost.',
  'Therefore, this project develops a free, web-based e-commerce store for ML Studio.',
], { y: 2.0 });
footer(s3, 3);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 4 — Introduction (Problem Statement)
// ══════════════════════════════════════════════════════════════════════
const s4 = pptx.addSlide();
addBackground(s4);
header(s4, '4', 'Introduction');
subtitle(s4, '2. Problem Statement');
bulletList(s4, [
  'Small bag retailers rely on social media (Facebook pages) with no proper cart or order system.',
  'Customers cannot browse a full catalogue, compare products, or track their orders.',
  'Manual order processing via chat messages is slow, error-prone, and hard to scale.',
  'Existing platforms charge monthly fees that are not viable for a single small shop.',
  'There is a need for a simple, free, self-hosted e-commerce solution tailored to a local business.',
], { y: 2.0 });
footer(s4, 4);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 5 — Introduction (Objectives)
// ══════════════════════════════════════════════════════════════════════
const s5 = pptx.addSlide();
addBackground(s5);
header(s5, '5', 'Introduction');
subtitle(s5, '3. Aim and Objectives');
bulletList(s5, [
  { header: 'Aim:', level: 0 },
  '  To design and develop a web-based e-commerce bag store for ML Studio.',
  '',
  { header: 'Objectives:', level: 0 },
  '  To provide a product catalogue with category filtering and detail pages.',
  '  To implement a shopping cart with guest and logged-in user support.',
  '  To build a checkout flow with order persistence and history.',
  '  To support user authentication with admin role management.',
  '  To deploy the store on GitHub Pages with CI/CD automation.',
], { y: 2.0, fontSize: 14, gap: 7 });
footer(s5, 5);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 6 — Introduction (Scope & Limitations)
// ══════════════════════════════════════════════════════════════════════
const s6 = pptx.addSlide();
addBackground(s6);
header(s6, '6', 'Introduction');
subtitle(s6, '4. Limitations and Scope');
bulletList(s6, [
  { header: 'Scope:', level: 0 },
  '  Product browsing with colour variants and related items.',
  '  Guest and authenticated user shopping cart.',
  '  Checkout with shipping form and order history.',
  '  Admin dashboard for products, orders and contact messages.',
  '  Contact form with Supabase storage.',
  '',
  { header: 'Limitations:', level: 0 },
  '  Web platform only (no mobile application).',
  '  No real payment gateway integration (orders marked as "pending").',
  '  No product search, reviews, or stock tracking.',
], { y: 2.0, fontSize: 14, gap: 7 });
footer(s6, 6);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 7 — Literature Review (Platform Comparison)
// ══════════════════════════════════════════════════════════════════════
const s7 = pptx.addSlide();
addBackground(s7);
header(s7, '7', 'Literature Review');
subtitle(s7, 'Platform Comparison');

// Table
const tableRows = [
  [
    { text: 'Platform', options: { bold: true, color: COLORS.white, fill: { color: COLORS.accent }, fontSize: 12 } },
    { text: 'Description', options: { bold: true, color: COLORS.white, fill: { color: COLORS.accent }, fontSize: 12 } },
    { text: 'Key Weakness', options: { bold: true, color: COLORS.white, fill: { color: COLORS.accent }, fontSize: 12 } },
  ],
  [
    { text: 'Shopify', options: { fontSize: 11, bold: true } },
    { text: 'Full-featured SaaS e-commerce with hosting, payments, and themes.', options: { fontSize: 11 } },
    { text: 'Monthly fees; less customisation for small single-store projects.', options: { fontSize: 11 } },
  ],
  [
    { text: 'WooCommerce', options: { fontSize: 11, bold: true } },
    { text: 'WordPress plugin; large plugin ecosystem, self-hosted.', options: { fontSize: 11 } },
    { text: 'Requires WordPress; heavier stack; plugin dependency.', options: { fontSize: 11 } },
  ],
  [
    { text: 'Firebase + React', options: { fontSize: 11, bold: true } },
    { text: 'BaaS with Firestore, Auth, and Hosting.', options: { fontSize: 11 } },
    { text: 'NoSQL limits relational queries; vendor lock-in.', options: { fontSize: 11 } },
  ],
  [
    { text: 'This project', options: { fontSize: 11, bold: true, color: COLORS.accent } },
    { text: 'React 19 + Supabase (PostgreSQL + RLS), deployed on GitHub Pages.', options: { fontSize: 11, color: COLORS.accent } },
    { text: 'Free hosting; relational DB; full RLS security; no monthly cost.', options: { fontSize: 11, color: COLORS.green } },
  ],
];
s7.addTable(tableRows, {
  x: 0.7, y: 1.85, w: 11.93, colW: [2.0, 5.5, 4.43],
  border: { type: 'solid', pt: 0.75, color: COLORS.softGray },
  rowH: [0.45, 0.55, 0.55, 0.55, 0.55],
  fontFace: FONTS.body, color: COLORS.dark,
});
footer(s7, 7);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 8 — Literature Review (Tech comparison)
// ══════════════════════════════════════════════════════════════════════
const s8 = pptx.addSlide();
addBackground(s8);
header(s8, '8', 'Literature Review');
subtitle(s8, 'Technology Choices');
bulletList(s8, [
  { header: 'Frontend Framework', level: 0 },
  '  React — component-based, virtual DOM, large ecosystem, Context API for state.',
  '  Chosen over Angular (heavier) and Vue (smaller ecosystem for this scope).',
  { header: 'Backend / BaaS', level: 0 },
  '  Supabase — open-source Firebase alternative with PostgreSQL + Auth + RLS.',
  '  Relational SQL, native row-level security, free tier sufficient for a school project.',
  { header: 'UI Framework', level: 0 },
  '  Bootstrap 5 — fast, consistent responsive layout; no additional config needed.',
], { y: 2.0, fontSize: 14, gap: 7 });
footer(s8, 8);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 9 — Methodology (Tech Stack)
// ══════════════════════════════════════════════════════════════════════
const s9 = pptx.addSlide();
addBackground(s9);
header(s9, '9', 'Methodology');
subtitle(s9, 'Technology Stack');

// Tech stack table
const techRows = [
  [
    { text: 'Layer', options: { bold: true, color: COLORS.white, fill: { color: COLORS.accent }, fontSize: 12 } },
    { text: 'Technology', options: { bold: true, color: COLORS.white, fill: { color: COLORS.accent }, fontSize: 12 } },
  ],
  [{ text: 'Frontend', options: { fontSize: 12, bold: true } }, { text: 'React 19, React Router v6, Bootstrap 5, Font Awesome', options: { fontSize: 12 } }],
  [{ text: 'Build Tool', options: { fontSize: 12, bold: true } }, { text: 'Vite 8', options: { fontSize: 12 } }],
  [{ text: 'Backend / DB', options: { fontSize: 12, bold: true } }, { text: 'Supabase (PostgreSQL + Auth + RLS)', options: { fontSize: 12 } }],
  [{ text: 'Hosting', options: { fontSize: 12, bold: true } }, { text: 'GitHub Pages (static SPA with 404 fallback)', options: { fontSize: 12 } }],
  [{ text: 'CI/CD', options: { fontSize: 12, bold: true } }, { text: 'GitHub Actions (build → deploy on push)', options: { fontSize: 12 } }],
  [{ text: 'Linting', options: { fontSize: 12, bold: true } }, { text: 'Oxlint', options: { fontSize: 12 } }],
];
s9.addTable(techRows, {
  x: 1.5, y: 2.1, w: 10.33, colW: [2.5, 7.83],
  border: { type: 'solid', pt: 0.75, color: COLORS.softGray },
  rowH: [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
  fontFace: FONTS.body, color: COLORS.dark,
});
footer(s9, 9);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 10 — Methodology (System Architecture)
// ══════════════════════════════════════════════════════════════════════
const s10 = pptx.addSlide();
addBackground(s10);
header(s10, '10', 'Methodology');
subtitle(s10, 'System Architecture');

const boxStyle = { fontFace: FONTS.body, fontSize: 12, align: 'center', valign: 'middle', color: COLORS.white };

// Frontend box
s10.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 2.0, w: 4.0, h: 3.6, fill: { color: COLORS.softGray }, line: { color: COLORS.accent, width: 1.5 }, radius: 0.1 });
s10.addText('FRONTEND', { x: 0.8, y: 2.1, w: 4.0, h: 0.45, fontFace: FONTS.body, fontSize: 14, bold: true, align: 'center', color: COLORS.accent });
s10.addText('React 19 SPA\nPages: Home, Products,\nProduct Details, Checkout,\nOrders, Contact, About\n\nContext API:\n• AuthContext\n• CartContext', {
  x: 1.0, y: 2.6, w: 3.6, h: 2.8, fontFace: FONTS.body, fontSize: 11, color: COLORS.dark, valign: 'top', lineSpacing: 13,
});

// API box
s10.addShape(pptx.ShapeType.roundRect, { x: 5.5, y: 2.8, w: 2.33, h: 1.8, fill: { color: COLORS.accent }, line: { color: COLORS.accentDark, width: 1 }, radius: 0.1 });
s10.addText('Supabase\nREST API\n+ Auth', { ...boxStyle, x: 5.5, y: 2.8, w: 2.33, h: 1.8, fontSize: 13 });

// Backend box
s10.addShape(pptx.ShapeType.roundRect, { x: 8.53, y: 2.0, w: 4.0, h: 3.6, fill: { color: COLORS.softGray }, line: { color: COLORS.accent, width: 1.5 }, radius: 0.1 });
s10.addText('BACKEND', { x: 8.53, y: 2.1, w: 4.0, h: 0.45, fontFace: FONTS.body, fontSize: 14, bold: true, align: 'center', color: COLORS.accent });
s10.addText('Supabase Cloud\n\n• PostgreSQL Database\n• Auth (email/password)\n• Row Level Security\n\nTables:\nproducts, orders,\ncontact_messages,\nuser_carts, profiles', {
  x: 8.73, y: 2.6, w: 3.6, h: 2.8, fontFace: FONTS.body, fontSize: 11, color: COLORS.dark, valign: 'top', lineSpacing: 13,
});

// Arrows
s10.addShape(pptx.ShapeType.line, { x: 4.85, y: 3.7, w: 0.6, h: 0, line: { color: COLORS.accent, width: 2.5 } });
s10.addShape(pptx.ShapeType.line, { x: 7.88, y: 3.7, w: 0.6, h: 0, line: { color: COLORS.accent, width: 2.5 } });

s10.addText('Frontend communicates directly with Supabase — no custom server required.', {
  x: 1.2, y: 6.2, w: 10.93, h: 0.5, fontFace: FONTS.body, fontSize: 13, italic: true, color: COLORS.gray, align: 'center',
});
footer(s10, 10);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 11 — Methodology (Database Diagram)
// ══════════════════════════════════════════════════════════════════════
const s11 = pptx.addSlide();
addBackground(s11);
header(s11, '11', 'Methodology');
subtitle(s11, 'Database Diagram');
bulletList(s11, [
  { header: 'Tables:', level: 0 },
  '  profiles — user_id, username, is_admin (auto-created on sign-up via trigger)',
  '  products — id (TEXT PK), name, price, category, image, features, colours',
  '  orders — id (UUID), user_id FK, items (JSONB), total, status, shipping_info',
  '  contact_messages — id, name, email, message, created_at',
  '  user_carts — user_id (PK FK), items (JSONB), updated_at',
  '',
  { header: 'Row Level Security (RLS):', level: 0 },
  '  Users can only SELECT/UPDATE their own orders and carts.',
  '  Guests can INSERT orders (user_id IS NULL) and contact messages.',
  '  Only admins (is_admin = TRUE) can view contact messages.',
  '  Trigger: handle_new_user() auto-inserts a profile row on registration.',
], { y: 2.0, fontSize: 13, gap: 6 });
footer(s11, 11);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 12 — Methodology (Development Process)
// ══════════════════════════════════════════════════════════════════════
const s12 = pptx.addSlide();
addBackground(s12);
header(s12, '12', 'Methodology');
subtitle(s12, 'Development Process');
bulletList(s12, [
  { header: 'Incremental development (7 stages):', level: 0 },
  '  1. Static UI prototype (HTML + CSS + Bootstrap)',
  '  2. Convert to React SPA with React Router',
  '  3. Integrate Supabase auth (profiles + admin roles)',
  '  4. Orders & checkout persistence to Supabase',
  '  5. Cart sync for logged-in users (Supabase + localStorage)',
  '  6. Admin dashboard (products CRUD, orders, messages)',
  '  7. CI/CD pipeline — GitHub Actions → GitHub Pages',
  '',
  { header: 'Version control:', level: 0 },
  '  Git + GitHub; feature branches merged to main.',
], { y: 2.0, fontSize: 14, gap: 7 });
footer(s12, 12);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 13 — Result (Feature Overview)
// ══════════════════════════════════════════════════════════════════════
const s13 = pptx.addSlide();
addBackground(s13);
header(s13, '13', 'Result');
subtitle(s13, 'Key Features Delivered');

const feats = [
  ['Product Catalog', '22 products, 7 categories, colour variants, badges, related items.'],
  ['Smart Cart', 'Guest cart (localStorage) + logged-in sync (Supabase).'],
  ['Checkout & Orders', 'Shipping form → database order → order history for users.'],
  ['Auth & Security', 'Email/password auth, password reset, admin roles, RLS.'],
  ['Admin Dashboard', 'CRUD products, manage orders, read contact messages.'],
  ['CI/CD Deploy', 'GitHub Actions auto-builds and deploys to GitHub Pages.'],
];
const fw = 5.8, fh = 1.55, fx = 0.7, fy = 2.05;
feats.forEach((f, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = fx + col * (fw + 0.23);
  const y = fy + row * (fh + 0.18);
  s13.addShape(pptx.ShapeType.roundRect, { x, y, w: fw, h: fh, fill: { color: COLORS.softGray }, line: { color: COLORS.accent, width: 0.75 }, radius: 0.08 });
  s13.addText(f[0], { x: x + 0.2, y: y + 0.15, w: fw - 0.4, h: 0.45, fontFace: FONTS.body, fontSize: 14, bold: true, color: COLORS.accent });
  s13.addText(f[1], { x: x + 0.2, y: y + 0.6, w: fw - 0.4, h: 0.85, fontFace: FONTS.body, fontSize: 11, color: COLORS.dark, valign: 'top', lineSpacing: 13 });
});
footer(s13, 13);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 14 — Result (Demo)
// ══════════════════════════════════════════════════════════════════════
const s14 = pptx.addSlide();
addBackground(s14);
header(s14, '14', 'Demo');
s14.addShape(pptx.ShapeType.rect, { x: 2.5, y: 2.0, w: 8.33, h: 4.5, fill: { color: COLORS.softGray }, line: { color: COLORS.accent, width: 1.5 }, radius: 0.1 });
s14.addText('Demo Video', {
  x: 2.5, y: 3.2, w: 8.33, h: 0.8, fontFace: FONTS.heading, fontSize: 32, bold: true, color: COLORS.accent, align: 'center',
});
s14.addText('Record your demo video here and insert it into this slide.\n\nSuggested flow:\nBrowse products → Add to cart → Checkout →\nView order history → Admin dashboard', {
  x: 3.0, y: 4.0, w: 7.33, h: 2.0, fontFace: FONTS.body, fontSize: 14, color: COLORS.dark, align: 'center', lineSpacing: 20,
});
footer(s14, 14);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 15 — Discussion
// ══════════════════════════════════════════════════════════════════════
const s15 = pptx.addSlide();
addBackground(s15);
header(s15, '15', 'Discussion');
subtitle(s15, 'Key Findings');
bulletList(s15, [
  { header: 'Key Findings:', level: 0 },
  '  The platform successfully provides a complete online storefront for ML Studio.',
  '  Users can browse, cart, checkout, and track orders without leaving the site.',
  '  Supabase greatly simplified backend development (DB + Auth + RLS in one).',
  '  GitHub Actions CI/CD eliminated manual deployment steps.',
  '',
  { header: 'Challenges:', level: 0 },
  '  RLS policy design required careful thought (guest access vs. user protection).',
  '  Cart sync between localStorage and Supabase required clear precedence rules.',
  '  SPA routing on GitHub Pages needed a 404 → index.html fallback.',
  '',
  { header: 'Limitations:', level: 0 },
  '  No real payment gateway — orders recorded as "pending" (school project scope).',
  '  No product search, reviews, or stock tracking yet.',
], { y: 2.0, fontSize: 13, gap: 6 });
footer(s15, 15);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 16 — Conclusion
// ══════════════════════════════════════════════════════════════════════
const s16 = pptx.addSlide();
addBackground(s16);
header(s16, '16', 'Conclusion');
bulletList(s16, [
  'This project successfully developed a web-based e-commerce store for ML Studio.',
  'The system provides product browsing, cart, checkout, user auth and an admin dashboard.',
  'Security is enforced through Supabase Row Level Security (RLS).',
  'The platform is fully responsive and deployed on GitHub Pages at zero hosting cost.',
  'The project demonstrates end-to-end full-stack development: UI → Database → Production.',
], { y: 1.8, fontSize: 15, gap: 10 });
footer(s16, 16);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 17 — Future Work
// ══════════════════════════════════════════════════════════════════════
const s17 = pptx.addSlide();
addBackground(s17);
header(s17, '17', 'Future Work');
bulletList(s17, [
  'Integrate a real payment gateway (Stripe, Wing, or ABA Pay).',
  'Add product search, stock tracking, and inventory management.',
  'Build a mobile-responsive PWA for an app-like experience.',
  'Add product reviews, ratings, and wishlists.',
  'Implement order status notifications (email / SMS).',
  'Multi-language support (English / Khmer).',
], { y: 1.8, fontSize: 15, gap: 10 });
footer(s17, 17);

// ══════════════════════════════════════════════════════════════════════
// SLIDE 18 — Thank You
// ══════════════════════════════════════════════════════════════════════
const s18 = pptx.addSlide();
addBackground(s18, COLORS.dark);
s18.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.2, fill: { color: COLORS.accent } });
s18.addShape(pptx.ShapeType.rect, { x: 0, y: H - 0.2, w: W, h: 0.2, fill: { color: COLORS.accent } });
s18.addText('Thank You', {
  x: 1, y: 2.5, w: 11.33, h: 1.2, fontFace: FONTS.heading, fontSize: 56, bold: true, color: COLORS.white, align: 'center',
});
s18.addText('For Your Attention', {
  x: 1, y: 3.8, w: 11.33, h: 0.6, fontFace: FONTS.body, fontSize: 22, color: COLORS.accent, align: 'center',
});
s18.addText('Questions & Discussion', {
  x: 1, y: 4.5, w: 11.33, h: 0.5, fontFace: FONTS.body, fontSize: 16, color: COLORS.softGray, align: 'center',
});

await pptx.writeFile({ fileName: 'ML-Studio-Presentation.pptx' });
console.log('Presentation generated: ML-Studio-Presentation.pptx');

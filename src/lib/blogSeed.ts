/**
 * Built-in blog posts.
 *
 * This is a plain module — no "use client" — because the server routes import
 * it for metadata, the sitemap and 404 handling. Values exported from a client
 * module arrive on the server as proxies, not real data.
 */

/** A blog post. Managed from Admin > Blogs. */
export type BlogPost = {
  id: string;
  /** URL segment: /blogs/<slug> */
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown-ish body; blank lines separate paragraphs, "## " makes a heading. */
  content: string;
  coverImage?: string;
  author: string;
  category: string;
  tags: string[];
  /** ISO date string. */
  publishedAt: string;
  readMinutes: number;
  seoTitle?: string;
  seoDescription?: string;
  order: number;
  status: "active" | "draft";
  updatedAt: string;
};

const today = () => new Date().toISOString().slice(0, 10);

export const initialBlogPosts: BlogPost[] = [
  {
    id: "hrestrosewa-restaurant-management-nepal",
    slug: "hrestrosewa-restaurant-management-nepal",
    title: "HRestroSewa: Restaurant Management Software Built for Nepal",
    excerpt:
      "Why we built a QR-ordering and restaurant management system for Nepali restaurants, and what it changes day to day.",
    coverImage: "",
    author: "Leafclutch Team",
    category: "Product",
    tags: ["HRestroSewa", "Restaurant Software", "Nepal", "SaaS"],
    publishedAt: "2026-01-20",
    readMinutes: 4,
    seoTitle: "HRestroSewa — Restaurant Management Software in Nepal",
    seoDescription:
      "HRestroSewa is restaurant management software built in Nepal: QR ordering, kitchen display, menu and table management, and live sales reporting for restaurants in Bhairahawa, Butwal and across the country.",
    order: 0,
    status: "active",
    updatedAt: today(),
    content: `Most restaurants in Nepal still run on paper. Orders are written on a pad, walked to the kitchen, and totalled by hand at the end of the night. It works — until it doesn't. A ticket goes missing, a table waits, and nobody can say at closing which dish actually made money.

We built HRestroSewa to fix that without asking anyone to change how they already work.

## Guests order by scanning a QR code

Every table gets a QR code. A guest scans it, sees the current menu with photos and prices, and places the order themselves. No app to install, no waiting for a server to be free.

The order lands in the kitchen the moment it is placed. Nothing is walked across the floor, and nothing is lost on the way.

## The kitchen sees one clear screen

Instead of a spike of paper tickets, the kitchen gets a live display: what is pending, what is cooking, what is ready. Items are marked off as they go out, so the floor staff know exactly what is coming.

## Owners see real numbers

At the end of the day you get the numbers that actually matter:

- Which items sold, and which did not
- Revenue by day, week and month
- Table turnover and busy hours
- Staff performance across shifts

Because everything is captured as it happens, none of it depends on someone remembering to write it down.

## Built for more than one outlet

If you run several branches, they sit under one account. Menus, prices and reports roll up together, so you can compare outlets instead of reconciling separate notebooks.

## Why it is built here

Software written abroad assumes card payments, fast internet and staff who have used a POS before. HRestroSewa is built in Bhairahawa for restaurants in Nepal — it works on the connections and devices people actually have, and our support team is in the same time zone.

If you run a restaurant and want to see it with your own menu loaded, get in touch and we will set up a demo.`,
  },
  {
    id: "bhet-one-account-every-shop",
    slug: "bhet-one-account-every-shop",
    title: "Bhet: One Customer Account That Works at Every Shop",
    excerpt:
      "Loyalty cards get lost and punch cards get forgotten. Bhet gives customers one account that works at every participating business.",
    coverImage: "",
    author: "Leafclutch Team",
    category: "Product",
    tags: ["Bhet", "Loyalty", "Nepal", "SaaS"],
    publishedAt: "2026-02-14",
    readMinutes: 4,
    seoTitle: "Bhet — Shared Customer Loyalty Platform for Nepali Businesses",
    seoDescription:
      "Bhet is a shared loyalty and customer platform from Leafclutch Technologies: one account across every participating shop, restaurant and service in Nepal.",
    order: 1,
    status: "active",
    updatedAt: today(),
    content: `Every shop wants repeat customers. So every shop prints a loyalty card — and every customer ends up with a wallet full of cards they never remember to carry.

Bhet takes the opposite approach. One account for the customer, shared across every business that joins.

## One account, every participating business

A customer signs up once. From then on, the same account works at the restaurant, the pharmacy, the salon and the shop down the road. Nothing to carry, nothing to lose.

For the business, that means a customer who already has an account is one tap away from being your repeat customer too.

## A QR code for your wall, not a terminal

Joining does not mean buying hardware. You put up a QR code. Customers scan it when they pay, and the visit is recorded.

No card reader, no new device to learn, no monthly hardware cost.

## A counter screen, not a point-of-sale

Bhet is not trying to replace your till. The counter screen does one job: confirm who the customer is and record the visit. Staff can learn it in a minute because there is almost nothing to learn.

## You find out who is actually coming back

Most small businesses have a feeling about their regulars. Bhet turns that into something you can look at:

- How many customers came back this month
- How long between visits
- Which offers brought people in
- Which customers have stopped coming

That last one matters most. Knowing someone has drifted away is the only way to win them back.

## Built for how business works here

Bhet is built in Nepal for Nepali businesses — shops in Bhairahawa, Butwal and beyond that want to keep customers without running a marketing department.

If you want your shop on it, talk to us.`,
  },
];

/** Slugs that ship with the app, for routes that must 404 unknown posts. */
export const INITIAL_BLOG_SLUGS = initialBlogPosts.map((p) => p.slug);

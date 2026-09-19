"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { normalizeMemberLinks, type MemberLink } from "@/lib/memberLinks";
import { initialBlogPosts, type BlogPost } from "@/lib/blogSeed";
export { initialBlogPosts, INITIAL_BLOG_SLUGS } from "@/lib/blogSeed";
export type { BlogPost } from "@/lib/blogSeed";

export type { MemberLink, MemberLinkPlatform } from "@/lib/memberLinks";

export type ServiceImage = { id: string; label: string; url: string };

/** One pricing tier on a product or service page. */
export type PricingTier = {
  id: string;
  name: string;
  /** Free text so "15,000", "Custom" and "Free" all work. */
  price: string;
  /** Billing period shown after the price, e.g. "month". Blank for one-off. */
  period?: string;
  description: string;
  features: string[];
  /** Greyed-out lines, to show what a tier leaves out. */
  notIncluded?: string[];
  /** Highlights the tier as the recommended one. */
  featured?: boolean;
  ctaLabel?: string;
};

export const DEFAULT_PRICING: PricingTier[] = [
  {
    id: "starter", name: "Starter", price: "15,000", period: "month",
    description: "For teams getting started",
    features: ["Core features", "Basic reporting", "1 workspace", "Email support"],
    notIncluded: ["Advanced analytics", "Custom integrations"],
    ctaLabel: "Get Started",
  },
  {
    id: "professional", name: "Professional", price: "35,000", period: "month",
    description: "For growing organizations",
    features: ["All Starter features", "Advanced reporting", "Multiple users", "Priority support"],
    featured: true,
    ctaLabel: "Get Started",
  },
  {
    id: "enterprise", name: "Enterprise", price: "65,000+", period: "month",
    description: "For complex operations",
    features: ["All Professional features", "Custom integrations", "Dedicated manager", "24/7 support"],
    ctaLabel: "Contact Sales",
  },
];

/** Rows may arrive as loose JSON; keep only what we can render. */
/** Sort by admin position, keeping declaration order when unset. */
export const byDisplayOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);

export const normalizePricing = (raw: unknown): PricingTier[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t) => t && typeof t === "object")
    .map((t: any, index: number) => ({
      id: String(t.id ?? `tier-${index}`),
      name: String(t.name ?? "Plan"),
      price: String(t.price ?? ""),
      period: t.period ? String(t.period) : "",
      description: String(t.description ?? t.desc ?? ""),
      features: Array.isArray(t.features) ? t.features.map(String) : [],
      notIncluded: Array.isArray(t.notIncluded) ? t.notIncluded.map(String) : [],
      featured: Boolean(t.featured),
      ctaLabel: t.ctaLabel ? String(t.ctaLabel) : "Get Started",
    }));
};
export type ServiceFeature = {
  id: string;
  icon: string;
  image?: string;
  title: string;
  description: string;
};

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  service: string;
  photo?: string;
  /**
   * Instagram post permalink shown instead of `photo`. Uploads are stored as
   * base64 in the row, so an embed keeps the testimonials table small.
   */
  embedUrl?: string;
  certificateImage?: string;
  overview?: string;
  publishedAt?: string;
  status: "published" | "draft";
};

export type AdminService = {
  id: string;
  icon: string;
  iconImage?: string;
  title: string;
  label: string;
  heading: string;
  description: string;
  heroImage: string;
  /** Live product URL, shown in the browser mock on the home page. */
  productUrl?: string;
  /** Pricing tiers shown on the product page. Empty falls back to defaults. */
  pricing?: PricingTier[];
  /** Display position. Lower shows first, everywhere the product is listed. */
  order?: number;
  images: ServiceImage[];
  features: ServiceFeature[];
  status: "active" | "coming_soon";
  updatedAt: string;
};

/** Which pages a stat appears on. */
export type StatContext = "home" | "about" | "both" | "nepal";

/**
 * One company metric, shown on the home hero, the "Our Journey" cards and the
 * About Us page. Single source of truth — edit once in Admin > Statistics.
 */
export type Stat = {
  id: string;
  /** The number itself, e.g. "100+" or "99.9%". */
  value: string;
  /** Optional word after the number on the Journey cards, e.g. "Years". */
  unit?: string;
  /** Short label, e.g. "Happy Clients". */
  label: string;
  /** Longer line under the Journey cards, e.g. "Trust Our Solutions". */
  caption?: string;
  /** Key into the shared icon set (see components/ui/StatIcon). */
  icon: string;
  context: StatContext;
  order: number;
  status: "active" | "draft";
  updatedAt: string;
};

export type NewStat = Omit<Stat, "id" | "updatedAt" | "order">;

export type WebsiteImage = {
  id: string;
  name: string;
  usedIn: string;
  url: string;
  updatedAt: string;
};

export type MemberType = "founder" | "team" | "intern";
export type Member = {
  id: string;
  name: string;
  role: string;
  photo: string;
  /** Legacy single LinkedIn URL. Kept in sync with the `links` entry below. */
  linkedin?: string;
  /** Contact/social buttons, each with its own show-on-website toggle. */
  links?: MemberLink[];
  type: MemberType;
  order: number;
  updatedAt: string;
};

export type CompanyServiceWorkflow = {
  step: number;
  title: string;
  description: string;
};

export type CompanyService = {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  iconImage?: string;
  coverImage?: string;
  features: string[];
  benefits: string[];
  technologies: string[];
  workflow?: CompanyServiceWorkflow[];
  /** Pricing tiers shown on the service page. Empty falls back to defaults. */
  pricing?: PricingTier[];
  status: "active" | "draft";
  order: number;
  updatedAt: string;
};

type NewTestimonial = Omit<Testimonial, "id">;
export type NewAdminService = Omit<AdminService, "id" | "updatedAt">;
export type NewWebsiteImage = Omit<WebsiteImage, "id" | "updatedAt">;
export type NewMember = Omit<Member, "id" | "updatedAt" | "order">;
export type NewCompanyService = Omit<
  CompanyService,
  "id" | "updatedAt" | "order"
>;

let idCounter = 0;
export function genId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

const today = () => new Date().toISOString().slice(0, 10);

type AdminContextValue = {
  testimonials: Testimonial[];
  services: AdminService[];
  companyServices: CompanyService[];
  websiteImages: WebsiteImage[];
  members: Member[];
  stats: Stat[];
  /** Free-text site copy, keyed by setting name. */
  settings: Record<string, string>;
  updateSetting: (key: string, value: string) => void;
  clients: Client[];
  addClient: (client: NewClient) => void;
  projects: Project[];
  addProject: (project: NewProject) => void;
  faqs: Faq[];
  addFaq: (item: NewFaq) => void;
  blogPosts: BlogPost[];
  addBlogPost: (post: NewBlogPost) => void;
  updateBlogPost: (id: string, changes: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  reorderBlogPost: (id: string, direction: "up" | "down") => void;
  updateFaq: (id: string, changes: Partial<Faq>) => void;
  deleteFaq: (id: string) => void;
  reorderFaq: (id: string, direction: "up" | "down") => void;
  updateProject: (id: string, changes: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProject: (id: string, direction: "up" | "down") => void;
  updateClient: (id: string, changes: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  reorderClient: (id: string, direction: "up" | "down") => void;
  addStat: (stat: NewStat) => void;
  updateStat: (id: string, changes: Partial<Stat>) => void;
  deleteStat: (id: string) => void;
  reorderStat: (id: string, direction: "up" | "down") => void;
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  addTestimonial: (testimonial: NewTestimonial) => void;
  updateTestimonial: (id: number, changes: Partial<Testimonial>) => void;
  deleteTestimonial: (id: number) => void;
  updateService: (id: string, changes: Partial<AdminService>) => void;
  addService: (service: NewAdminService) => string;
  deleteService: (id: string) => void;
  addServiceImage: (serviceId: string, image: Omit<ServiceImage, "id">) => void;
  updateServiceImage: (
    serviceId: string,
    imageId: string,
    changes: Partial<ServiceImage>,
  ) => void;
  deleteServiceImage: (serviceId: string, imageId: string) => void;
  addFeature: (serviceId: string, feature: Omit<ServiceFeature, "id">) => void;
  updateFeature: (
    serviceId: string,
    featureId: string,
    changes: Partial<ServiceFeature>,
  ) => void;
  deleteFeature: (serviceId: string, featureId: string) => void;
  reorderFeature: (
    serviceId: string,
    featureId: string,
    direction: "up" | "down",
  ) => void;
  addCompanyService: (service: NewCompanyService) => string;
  updateCompanyService: (id: string, changes: Partial<CompanyService>) => void;
  deleteCompanyService: (id: string) => void;
  reorderCompanyService: (id: string, direction: "up" | "down") => void;
  addWebsiteImage: (image: NewWebsiteImage) => void;
  updateWebsiteImage: (id: string, changes: Partial<WebsiteImage>) => void;
  deleteWebsiteImage: (id: string) => void;
  addMember: (member: NewMember) => void;
  updateMember: (id: string, changes: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  reorderMember: (id: string, direction: "up" | "down") => void;
  setServicePosition: (id: string, position: number) => void;
  syncContent: () => Promise<boolean>;
  resetContent: () => void;
};

function features(list: Array<[string, string, string]>): ServiceFeature[] {
  return list.map(([icon, title, description]) => ({
    id: genId("feature"),
    icon,
    title,
    description,
  }));
}

const initialServices: AdminService[] = [
  {
    id: "restaurant-management",
    icon: "🍽️",
    title: "Restaurant Management",
    label: "RESTAURANT MANAGEMENT SYSTEM",
    heading: "Run Your Restaurant Smarter",
    description:
      "An all-in-one suite that handles everything from the first order to the final report of the day.",
    heroImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85",
    images: [
      {
        id: genId("img"),
        label: "Platform Image",
        url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85",
      },
      {
        id: genId("img"),
        label: "Product Screenshot",
        url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80",
      },
    ],
    features: features([
      [
        "🧾",
        "POS & Billing",
        "Bill tables in seconds with split billing, multiple payment modes, and a live closing report at the end of every shift.",
      ],
      [
        "🪑",
        "Table Management",
        "See your whole floor plan live — table status, QR ordering, and reservations updated in real time.",
      ],
      [
        "🛒",
        "Order Management",
        "Digital KOTs move straight from table to kitchen, with instant modifications and full order tracking.",
      ],
      [
        "📦",
        "Inventory Management",
        "Track stock down to the ingredient level, control wastage, and get auto purchase alerts before you run out.",
      ],
      [
        "📋",
        "Menu Management",
        "Build dynamic menus with categories, variants, combos, and seasonal pricing rules — updated instantly across every terminal.",
      ],
      [
        "🍳",
        "Kitchen Management",
        "A Kitchen Display System with order priorities, prep timers, and chef assignments so nothing sits too long.",
      ],
      [
        "👥",
        "Staff Management",
        "Shifts, attendance, role-based access, and tip management, all handled in one place.",
      ],
      [
        "📊",
        "Sales & Reports",
        "Daily sales, item-wise analysis, peak-hour trends, and profit margin reports without waiting on a spreadsheet.",
      ],
    ]),
    status: "active",
    updatedAt: today(),
  },
  {
    id: "pharmacy-management",
    icon: "💊",
    title: "Pharmacy Management",
    label: "PHARMACY MANAGEMENT SYSTEM",
    heading: "Pharmacy Operations, Simplified",
    description:
      "A complete pharmacy ERP ensuring compliance, eliminating errors, and keeping your business profitable.",
    heroImage:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=85",
    images: [
      {
        id: genId("img"),
        label: "Platform Image",
        url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85",
      },
      {
        id: genId("img"),
        label: "Product Screenshot",
        url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
      },
    ],
    features: features([
      [
        "💊",
        "Medicine Inventory",
        "Manage all your medicines with ease. Add generic or brand names, categories, real-time stock levels, and barcode scanning for faster inventory control.",
      ],
      [
        "📅",
        "Batch & Expiry Management",
        "Track every batch with FIFO logic, get expiry alerts 30/60/90 days ahead, and let expired stock auto de-list itself from sale.",
      ],
      [
        "🧾",
        "POS & Billing",
        "Bill customers in seconds with GST/VAT built in, flexible discounts, multiple payment modes, and instant digital receipts.",
      ],
      [
        "🧺",
        "Purchase Management",
        "Raise purchase orders automatically, process GRNs on arrival, and reconcile supplier invoices without spreadsheets.",
      ],
      [
        "🚚",
        "Supplier Management",
        "Keep every supplier profile, purchase history, credit term, and outstanding balance organized in one place.",
      ],
      [
        "⚠️",
        "Low Stock Alerts",
        "Set intelligent reorder points per medicine and get automatic purchase recommendations before you run out.",
      ],
      [
        "📝",
        "Prescription Management",
        "Store digital prescriptions, map them to doctors, and keep controlled substance logs fully auditable.",
      ],
      [
        "📈",
        "Sales & Profit Reports",
        "See daily and monthly P&L, item-wise margins, and financial dashboards without waiting on a spreadsheet.",
      ],
    ]),
    status: "active",
    updatedAt: today(),
  },
  {
    id: "school-management",
    icon: "🏫",
    title: "School Management",
    label: "SCHOOL MANAGEMENT SYSTEM",
    heading: "Empower Education with Smart ERP",
    description:
      "Connects students, teachers, parents and administrators — one ecosystem for modern institutions.",
    heroImage:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=85",
    images: [
      {
        id: genId("img"),
        label: "Platform Image",
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85",
      },
      {
        id: genId("img"),
        label: "Product Screenshot",
        url: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=300&q=80",
      },
    ],
    features: features([
      [
        "🎓",
        "Student Management",
        "Every student gets a complete digital profile — enrollment details, guardian contacts, documents, and full academic history.",
      ],
      [
        "👩‍🏫",
        "Teacher & Staff",
        "Keep every staff profile, qualification, payroll record, and performance evaluation organized in one place.",
      ],
      [
        "🗓️",
        "Attendance",
        "Biometric-ready attendance captures who is present the moment they walk in, with instant SMS alerts for parents.",
      ],
      [
        "🏫",
        "Class & Section",
        "Build flexible class structures, assign subjects to the right teachers, and generate conflict-free timetables automatically.",
      ],
      [
        "📝",
        "Exam & Results",
        "Enter marks once and the system handles grade calculation, transcript generation, and result publishing.",
      ],
      [
        "💳",
        "Fee Management",
        "Set up fee structures and scholarships, send invoices automatically, and track overdue payments.",
      ],
      [
        "👨‍👩‍👧",
        "Parent Portal",
        "Parents get real-time access to attendance, results, fees, and notices from their phone.",
      ],
      [
        "📢",
        "Notices",
        "Broadcast a notice once and it reaches every parent by SMS and in-app alert instantly, with delivery tracking.",
      ],
      [
        "⬆️",
        "Promotion",
        "Run end-of-year promotions automatically based on rules you set, moving students to their next class and section.",
      ],
      [
        "📊",
        "Reports",
        "Generate academic, financial, and attendance analytics on demand and export them in the format your board needs.",
      ],
    ]),
    status: "active",
    updatedAt: today(),
  },
  {
    id: "it-training",
    icon: "💻",
    title: "IT Training",
    label: "IT TRAINING",
    heading: "Learn. Build. Grow.",
    description:
      "Leafclutch is your all-in-one learning platform to gain industry-ready skills with both online and offline classes.",
    heroImage:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=85",
    images: [
      {
        id: genId("img"),
        label: "Platform Image",
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85",
      },
      {
        id: genId("img"),
        label: "Product Screenshot",
        url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80",
      },
    ],
    features: [],
    status: "active",
    updatedAt: today(),
  },
  {
    id: "digital-technology",
    icon: "🚀",
    title: "Digital & Technology Solutions",
    label: "DIGITAL & TECHNOLOGY SOLUTIONS",
    heading: "Your Digital Transformation Partner",
    description:
      "Web, mobile, cloud, AI and cybersecurity — every dimension of modern digital infrastructure.",
    heroImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85",
    images: [
      {
        id: genId("img"),
        label: "Platform Image",
        url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85",
      },
      {
        id: genId("img"),
        label: "Product Screenshot",
        url: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80",
      },
    ],
    features: features([
      [
        "🌐",
        "Web Development",
        "We design and build custom websites, web applications, and client portals using modern frameworks like React, Next.js, and Django.",
      ],
      [
        "📱",
        "Mobile App Development",
        "We build native-feeling iOS and Android apps with Flutter and React Native from a single codebase.",
      ],
      [
        "☁️",
        "DevOps & Cloud",
        "We set up CI/CD pipelines, containerize services with Docker and Kubernetes, and manage infrastructure as code on AWS.",
      ],
      [
        "🛡️",
        "Cybersecurity",
        "We run full security audits, simulated penetration tests, and compliance reviews, then set up continuous threat monitoring.",
      ],
      [
        "📣",
        "Digital Marketing",
        "We plan and run SEO, social media, and Google Ads campaigns backed by real analytics.",
      ],
      [
        "🤖",
        "AI & Data Solutions",
        "We design machine learning models, build data pipelines, and add NLP-powered automation to your product.",
      ],
      [
        "🔌",
        "API Development",
        "We build RESTful and GraphQL APIs, break monoliths into microservices, and connect third-party integrations cleanly.",
      ],
      [
        "🧩",
        "Software Development",
        "We build custom enterprise software, ERP systems, and business automation tools tailored to how your team works.",
      ],
    ]),
    status: "active",
    updatedAt: today(),
  },
  {
    id: "lms",
    icon: "📚",
    title: "Learning Management System",
    label: "LEARNING MANAGEMENT SYSTEM",
    heading: "LMS is Coming",
    description:
      "The future of learning is coming. A powerful, flexible platform designed to make education accessible, engaging, and effective for everyone.",
    heroImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=85",
    images: [],
    features: features([
      [
        "📚",
        "Online Courses",
        "Structured learning paths with video lessons, quizzes, and interactive content.",
      ],
      [
        "📈",
        "Progress Tracking",
        "Real-time dashboards for students and instructors to monitor learning progress.",
      ],
      [
        "🎥",
        "Live Classes",
        "Integrated video conferencing for interactive live sessions and webinars.",
      ],
      [
        "🏆",
        "Certifications",
        "Auto-generated certificates upon course completion with blockchain verification.",
      ],
      [
        "📝",
        "Assignments & Quizzes",
        "Rich assessment tools with auto-grading and detailed feedback systems.",
      ],
      [
        "💬",
        "Discussion Forums",
        "Community-driven learning with Q&A boards and peer collaboration.",
      ],
      [
        "📱",
        "Mobile Learning",
        "Full-featured mobile app for iOS and Android — learn on the go.",
      ],
      [
        "📊",
        "Analytics",
        "In-depth learning analytics for instructors and platform administrators.",
      ],
    ]),
    status: "coming_soon",
    updatedAt: today(),
  },
];

const initialTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "Aarav Sharma",
    role: "Director",
    company: "Himalayan Bistro",
    content:
      "Leafclutch helped us bring our restaurant operations into one clear, reliable system.",
    rating: 5,
    service: "Restaurant Management",
    photo:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80",
    status: "published",
  },
  {
    id: 2,
    name: "Maya Thapa",
    role: "Principal",
    company: "Bright Future Academy",
    content:
      "The school management platform has made everyday coordination much easier for our team.",
    rating: 5,
    service: "School Management",
    photo:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
    status: "published",
  },
  {
    id: 3,
    name: "Rohan KC",
    role: "Founder",
    company: "Kantipur Digital",
    content:
      "A thoughtful technology partner that understands the details behind business growth.",
    rating: 5,
    service: "General",
    photo:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=400&q=80",
    status: "published",
  },
];

const initialWebsiteImages: WebsiteImage[] = [
  {
    id: genId("site-img"),
    name: "Black Service Teaser",
    usedIn: "Homepage — services row",
    url: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?auto=format&fit=crop&w=500&q=80",
    updatedAt: today(),
  },
  {
    id: genId("site-img"),
    name: "ABC Service Teaser",
    usedIn: "Homepage — services row",
    url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=500&q=80",
    updatedAt: today(),
  },
];

/**
 * Free-text site copy, stored as key/value rows in `site_settings`.
 * Anything an admin should be able to reword without a deploy lives here.
 */
/**
 * §16 Trusted clients / partners — the "Proud to partner with" marquee.
 * Managed from Admin > Testimonials.
 */
export type Client = {
  id: string;
  name: string;
  /** Uploaded logo. Falls back to the initial letter when empty. */
  logo?: string;
  websiteUrl?: string;
  order: number;
  status: "active" | "draft";
  updatedAt: string;
};

export type NewClient = Omit<Client, "id" | "updatedAt" | "order">;

export const initialClients: Client[] = [
  { id: "himalayan-bistro", name: "Himalayan Bistro",   order: 0, status: "active", updatedAt: today() },
  { id: "bright-future",    name: "Bright Future",      order: 1, status: "active", updatedAt: today() },
  { id: "everest-pharmacy", name: "Everest Pharmacy",   order: 2, status: "active", updatedAt: today() },
  { id: "kathmandu-crafts", name: "Kathmandu Crafts",   order: 3, status: "active", updatedAt: today() },
  { id: "lumbini-academy",  name: "Lumbini Academy",    order: 4, status: "active", updatedAt: today() },
];

/**
 * §12 Our Work — portfolio projects shown on /portfolio.
 * Managed from Admin > Our Work.
 */
export type Project = {
  id: string;
  /** Company / client the work was for. */
  company: string;
  /** Live site to link the "Visit Site" button at. */
  url?: string;
  /** Uploaded image or a pasted image URL. */
  image?: string;
  category?: string;
  description?: string;
  /** What the client said about the work. */
  testimonial?: string;
  testimonialAuthor?: string;
  order: number;
  status: "active" | "draft";
  updatedAt: string;
};

export type NewProject = Omit<Project, "id" | "updatedAt" | "order">;

export const initialProjects: Project[] = [
  {
    id: "hrestrosewa-platform",
    company: "HRestroSewa",
    url: "https://hrestrosewa.leafclutch.com.np/",
    image: "",
    category: "SaaS Product",
    description:
      "QR ordering, kitchen display and live sales reporting for multi-outlet restaurants.",
    testimonial:
      "Orders reach the kitchen instantly and we finally see real numbers at the end of the day.",
    testimonialAuthor: "Restaurant Owner, Butwal",
    order: 0,
    status: "active",
    updatedAt: today(),
  },
];

/** §13 FAQ categories, in the order they appear as filter chips. */
export const FAQ_CATEGORIES = [
  "General",
  "Services",
  "Products",
  "Training",
  "Internship",
  "Pricing",
  "Support",
] as const;

export type Faq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: "active" | "draft";
  updatedAt: string;
};

export type NewFaq = Omit<Faq, "id" | "updatedAt" | "order">;

const faq = (
  id: string,
  category: string,
  question: string,
  answer: string,
  order: number,
): Faq => ({ id, category, question, answer, order, status: "active", updatedAt: today() });

export const initialFaqs: Faq[] = [
  faq("what-we-do", "General", "What does Leafclutch Technologies do?",
    "We build custom software and websites, run digital marketing and SEO, handle graphic design and video production, deliver professional IT training, and operate our own SaaS products such as HRestroSewa and PragyaOS.", 0),
  faq("where-based", "General", "Where are you based?",
    "Our office is in Siddharthanagar, Rupandehi, Nepal. We work with clients across the country and remotely.", 1),
  faq("who-we-work-with", "General", "What size of business do you work with?",
    "Everything from a single restaurant to multi-branch schools and established companies. The approach scales — small projects get the same engineering standards as large ones.", 2),

  faq("project-timeline", "Services", "How long does a project take?",
    "It depends on scope. A brochure website is usually 2–4 weeks, a custom platform 2–6 months. You get a firm timeline in writing after the discovery call, before any work starts.", 3),
  faq("process", "Services", "How does the process work?",
    "Four stages: Discovery (understanding your needs), Planning (a detailed roadmap), Development (built in agile sprints with regular check-ins), and Delivery (testing, deployment and ongoing support).", 4),
  faq("own-the-code", "Services", "Do we own the code you write?",
    "Yes. You get full ownership of the source code and intellectual property for custom work. Nothing is locked to us.", 5),
  faq("existing-project", "Services", "Can you take over a project someone else started?",
    "Often yes. We will audit the existing code first and tell you honestly whether it is better to continue it or rebuild.", 6),

  faq("try-products", "Products", "Can I try your SaaS products before buying?",
    "Yes. Contact us and we will set up a live demo of HRestroSewa or PragyaOS loaded with sample data so you can test it properly.", 7),
  faq("customise-product", "Products", "Can your products be customised for my business?",
    "Yes. Our platforms are configurable out of the box, and we build custom modules where your workflow needs something different.", 8),
  faq("data-safe", "Products", "Where is our data stored and is it safe?",
    "Data is stored on managed cloud infrastructure with encrypted connections, automated daily backups and role-based access. You can export your data at any time.", 9),

  faq("training-certificate", "Training", "Do I get a certificate after training?",
    "Yes. Everyone who completes a program receives a certificate, and anyone can confirm it is genuine on our Verify Certificate page.", 10),
  faq("training-format", "Training", "Are classes online or in person?",
    "Both. We run physical classes at our Siddharthanagar office and live online sessions, so you can pick whichever fits your schedule.", 11),
  faq("training-beginner", "Training", "Do I need experience to join a course?",
    "No. Our courses start from fundamentals and build up. What matters is showing up consistently and doing the project work.", 12),

  faq("internship-apply", "Internship", "How do I apply for an internship?",
    "Open internship positions are listed on our Careers page. Apply there with your CV — we review every application.", 13),
  faq("internship-paid", "Internship", "Are internships paid?",
    "It varies by role and duration. The details are stated on each listing, and top performers are considered for full-time positions.", 14),

  faq("cost", "Pricing", "How much does a project cost?",
    "It depends on scope and complexity. Tell us what you need and we will send a written quote with a clear breakdown — no hidden charges.", 15),
  faq("payment-terms", "Pricing", "What are your payment terms?",
    "Typically staged: a deposit to begin, then payments tied to agreed milestones. We confirm the schedule in writing before work starts.", 16),
  faq("saas-pricing", "Pricing", "How is SaaS pricing structured?",
    "Our products are subscription based, priced by the size of your operation. There are no setup fees for standard configurations.", 17),

  faq("post-launch", "Support", "Do you provide support after launch?",
    "Yes. Every project includes a support period after delivery, and we offer ongoing maintenance plans covering updates, monitoring and fixes.", 18),
  faq("response-time", "Support", "How quickly do you respond to issues?",
    "During business hours we aim to acknowledge within a few hours. Critical issues on live systems are treated as a priority.", 19),
  faq("training-staff", "Support", "Will you train our staff to use the system?",
    "Yes. Handover includes training sessions for your team plus written documentation they can refer back to.", 20),
];

export type NewBlogPost = Omit<BlogPost, "id" | "updatedAt" | "order">;

export const BLOG_CATEGORIES = [
  "Product",
  "Technology",
  "Business",
  "Digital Marketing",
  "Design",
  "Company News",
] as const;

/** Rough reading time, used when the admin leaves the field alone. */
export const estimateReadMinutes = (text: string) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 200));


export const initialSettings: Record<string, string> = {};

export const initialStats: Stat[] = [
  { id: "clients",    value: "100+",  unit: "Clients",  label: "Happy Clients",        caption: "Trust Our Solutions",      icon: "users",   context: "both",  order: 0, status: "active", updatedAt: today() },
  { id: "projects",   value: "50+",   unit: "Projects", label: "Projects Delivered",   caption: "Successfully Delivered",   icon: "layers",  context: "both",  order: 1, status: "active", updatedAt: today() },
  { id: "experience", value: "5+",    unit: "Years",    label: "Years Experience Team", caption: "Industry Experience Team", icon: "clock",   context: "both",  order: 2, status: "active", updatedAt: today() },
  { id: "uptime",     value: "99.9%", unit: "",         label: "Service Uptime",       caption: "Service Uptime",           icon: "shield",  context: "home",  order: 3, status: "active", updatedAt: today() },
  { id: "team",       value: "10+",   unit: "Members",  label: "Team Members",         caption: "Across Our Teams",         icon: "team",    context: "about", order: 4, status: "active", updatedAt: today() },
  { id: "countries",  value: "2",     unit: "Countries", label: "Countries Served",    caption: "And Growing",              icon: "globe",   context: "about", order: 5, status: "active", updatedAt: today() },
  // Nepal reach band. Only the province count is specific to it — the other two
  // slots reuse the shared stats above so the numbers always agree with the hero.
  { id: "provinces", value: "2", unit: "Provinces", label: "Provinces Served", caption: "Bagmati & Lumbini", icon: "globe", context: "nepal", order: 6, status: "active", updatedAt: today() },
];

const initialMembers: Member[] = [
  {
    id: genId("member"),
    name: "Er. Siddhartha Pathak",
    role: "Founder | Director | CTO",
    photo: "",
    type: "founder",
    order: 0,
    updatedAt: today(),
  },
  {
    id: genId("member"),
    name: "Shubham Kumar Deo",
    role: "Co-Founder | CEO",
    photo: "",
    type: "founder",
    order: 1,
    updatedAt: today(),
  },
  {
    id: genId("member"),
    name: "Bijay Koirala",
    role: "Operation and Marketing Head",
    photo: "",
    type: "team",
    order: 0,
    updatedAt: today(),
  },
  {
    id: genId("member"),
    name: "Shibika Nepal",
    role: "HR Manager",
    photo: "",
    type: "team",
    order: 1,
    updatedAt: today(),
  },
  {
    id: genId("member"),
    name: "Saurya Chaudhary",
    role: "Cyber Security Head",
    photo: "",
    type: "team",
    order: 2,
    updatedAt: today(),
  },
  {
    id: genId("member"),
    name: "Sandesh Thapa",
    role: "Technical Head | Full Stack Developer",
    photo: "",
    linkedin: "",
    type: "team",
    order: 3,
    updatedAt: today(),
  },
  {
    id: genId("member"),
    name: "Sanjib Pandey",
    role: "Full-Stack Developer",
    photo: "",
    linkedin: "",
    type: "team",
    order: 4,
    updatedAt: today(),
  },
  {
    id: genId("member"),
    name: "Simon Shrestha",
    role: "UI/UX Intern",
    photo: "",
    linkedin: "",
    type: "intern",
    order: 0,
    updatedAt: today(),
  },
  {
    id: genId("member"),
    name: "Yushika Guragain",
    role: "UI/UX Intern",
    photo: "",
    linkedin: "",
    type: "intern",
    order: 1,
    updatedAt: today(),
  },
];

export const initialCompanyServices: CompanyService[] = [
  {
    id: "software-development",
    title: "Software Development",
    icon: "💻",
    shortDescription:
      "Custom enterprise software, cloud applications, and automated workflow systems built to scale.",
    fullDescription:
      "We engineer robust, bespoke software systems tailored to your specific business workflows. From multi-tenant architectures to automated enterprise tools, we turn complex business challenges into reliable digital infrastructure.",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85",
    features: [
      "Custom Enterprise Architecture",
      "API Design & Systems Integration",
      "Database Design & High-Performance Optimization",
      "Legacy System Modernization & Migration",
      "Continuous Maintenance & 24/7 Support",
    ],
    benefits: [
      "Automate repetitive business workflows and slash overhead costs",
      "Eliminate error-prone manual spreadsheets and disjointed tools",
      "Scale operations smoothly as company and client volume expands",
      "Full source-code ownership, intellectual property & transparency",
    ],
    technologies: [
      "Python",
      "Node.js",
      "Go",
      "PostgreSQL",
      "Docker",
      "Kubernetes",
      "AWS",
    ],
    workflow: [
      {
        step: 1,
        title: "Discovery & Analysis",
        description:
          "Deep dive into business requirements, architecture roadmap, and tech stack selection.",
      },
      {
        step: 2,
        title: "System Architecture & Design",
        description:
          "Database modeling, API contracts, security planning, and prototyping.",
      },
      {
        step: 3,
        title: "Agile Development",
        description:
          "Iterative sprints with regular demos, automated testing, and milestone deliverables.",
      },
      {
        step: 4,
        title: "Testing & Deployment",
        description:
          "Automated test suites, staging validation, CI/CD, and zero-downtime release.",
      },
    ],
    status: "active",
    order: 0,
    updatedAt: today(),
  },
  {
    id: "website-development",
    title: "Website Development",
    icon: "🌐",
    shortDescription:
      "High-performance, modern, and SEO-optimized corporate websites and web applications.",
    fullDescription:
      "We design and build fast, responsive, and secure web applications using cutting-edge frameworks like React, Next.js, and TypeScript. Whether building a corporate showcase or an interactive client portal, we focus on conversion, speed, and clean code.",
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    features: [
      "Responsive Mobile-First Design & Architecture",
      "Server-Side Rendering & Lightning Performance",
      "CMS & Dynamic Content Management Integration",
      "Accessible & SEO-Friendly Semantic Markup",
      "SSL, Rate Limiting & Enterprise Security",
    ],
    benefits: [
      "Instant loading times with superior Core Web Vitals",
      "Higher search engine ranking and organic discovery on Google",
      "Seamless brand experience across mobile, tablet, and desktop",
      "Easy content updates via intuitive, developer-free admin tools",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "Supabase",
      "Vercel",
    ],
    workflow: [
      {
        step: 1,
        title: "Concept & Wireframing",
        description:
          "Visual sitemaps, user flows, and page layout architecture.",
      },
      {
        step: 2,
        title: "UI/UX & Prototyping",
        description:
          "Modern, branded interface styling and interactive stakeholder review.",
      },
      {
        step: 3,
        title: "Modern Web Engineering",
        description:
          "Component-driven development with responsive styling and animations.",
      },
      {
        step: 4,
        title: "Optimization & Launch",
        description:
          "Speed optimization, SEO validation, and production hosting deployment.",
      },
    ],
    status: "active",
    order: 1,
    updatedAt: today(),
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    icon: "📣",
    shortDescription:
      "Data-driven marketing campaigns, social media management, and performance advertising.",
    fullDescription:
      "Grow your reach, acquire loyal customers, and drive measurable revenue. We build targeted performance marketing campaigns across Meta, Google, TikTok, and LinkedIn, backed by real analytics and continuous conversion rate optimization.",
    coverImage:
      "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=85",
    features: [
      "Meta & Google Ads Campaign Management",
      "Social Media Growth & Audience Engagement",
      "Conversion Rate Optimization (CRO)",
      "Brand Positioning & Persuasive Copywriting",
      "Real-Time Performance Analytics & ROI Dashboards",
    ],
    benefits: [
      "Target high-intent buyers who actively search for your solutions",
      "Lower Customer Acquisition Cost (CAC) through ongoing A/B testing",
      "Consistent brand voice across all social and digital channels",
      "Transparent weekly and monthly reporting with actionable insights",
    ],
    technologies: [
      "Meta Ads Manager",
      "Google Ads",
      "Google Analytics 4",
      "SEMrush",
      "HubSpot",
      "Looker Studio",
    ],
    workflow: [
      {
        step: 1,
        title: "Audience & Market Research",
        description:
          "Buyer personas, competitor analysis, and channel mapping.",
      },
      {
        step: 2,
        title: "Campaign Strategy",
        description:
          "Ad creatives, high-converting copy, and landing page funnels.",
      },
      {
        step: 3,
        title: "Execution & Monitoring",
        description:
          "A/B testing ad variations, bid management, and retargeting.",
      },
      {
        step: 4,
        title: "Scale & Optimize",
        description:
          "Allocating budget to winning ad sets and maximizing customer ROI.",
      },
    ],
    status: "active",
    order: 2,
    updatedAt: today(),
  },
  {
    id: "professional-training",
    title: "Professional Training Programs",
    icon: "🎓",
    shortDescription:
      "Practical, industry-led IT and technology courses designed to build real-world job-ready skills.",
    fullDescription:
      "Empower your career or upskill your team with intensive, project-based training programs. Taught by senior software engineers and industry veterans, our courses bridge the gap between academic theory and high-demand workplace skills.",
    coverImage:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=85",
    features: [
      "Physical & Online Interactive Live Classes",
      "100% Project-Based Practical Curriculum",
      "Direct Mentorship from Senior Industry Engineers",
      "Internship & Job Placement Support for Top Performers",
      "Verified Certificate of Completion with Online Verification",
    ],
    benefits: [
      "Graduate with a portfolio of real, deployed production applications",
      "Learn industry best practices: Git workflows, code reviews, and clean code",
      "Networking opportunities with tech professionals and founders across Nepal",
      "Flexible morning, evening, and weekend batches for working students",
    ],
    technologies: [
      "MERN Stack",
      "Python & Django",
      "Figma",
      "DevOps & Cloud",
      "Data Analytics",
      "Networking (CCNA)",
    ],
    workflow: [
      {
        step: 1,
        title: "Foundations & Fundamentals",
        description:
          "Mastering core principles with daily hands-on coding exercises.",
      },
      {
        step: 2,
        title: "Intermediate Projects",
        description:
          "Collaborative building of real-world modules and API integrations.",
      },
      {
        step: 3,
        title: "Capstone Portfolio Build",
        description:
          "End-to-end development of an independent production application.",
      },
      {
        step: 4,
        title: "Review & Certification",
        description:
          "Code review, interview coaching, and certificate issuance.",
      },
    ],
    status: "active",
    order: 3,
    updatedAt: today(),
  },
  {
    id: "graphic-design",
    title: "Graphic Design",
    icon: "🎨",
    shortDescription:
      "Distinctive branding, visual identity, logos, print media, and digital creative assets.",
    fullDescription:
      "We craft visually striking brand identities that capture attention and build trust. From comprehensive logo guidelines and stationery to eye-catching social media creatives, we give your brand a professional and memorable presence.",
    coverImage:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=85",
    features: [
      "Logo & Complete Brand Identity Systems",
      "Marketing Collateral, Brochures & Print Media",
      "Social Media Graphics & Banner Suites",
      "Product Packaging & Merchandising Design",
      "Comprehensive Brand Guidelines (Typography & Colors)",
    ],
    benefits: [
      "Establish instant trust and credibility in your industry",
      "Stand out distinctly from local and global competitors",
      "Consistent visual identity across all physical and digital touchpoints",
      "High-resolution vector assets ready for print, signage, and web",
    ],
    technologies: [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "InDesign",
      "Figma",
      "Canva",
    ],
    workflow: [
      {
        step: 1,
        title: "Brand Discovery",
        description:
          "Understanding your brand personality, values, and target demographic.",
      },
      {
        step: 2,
        title: "Moodboards & Concepts",
        description:
          "Exploring typography, color palettes, and diverse visual directions.",
      },
      {
        step: 3,
        title: "Refinement & Polishing",
        description:
          "Perfecting chosen concepts based on iterative stakeholder feedback.",
      },
      {
        step: 4,
        title: "Asset Delivery",
        description:
          "Packaging print-ready and web-ready vectors, icons, and guidelines.",
      },
    ],
    status: "active",
    order: 4,
    updatedAt: today(),
  },
  {
    id: "video-editing",
    title: "Video Editing",
    icon: "🎬",
    shortDescription:
      "High-impact commercial video production, social media reels, motion graphics, and post-production.",
    fullDescription:
      "Video is the most powerful medium to tell your company story. We provide end-to-end video editing and post-production services including cinematic color grading, custom motion graphics, sound design, and viral short-form social content.",
    coverImage:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=85",
    features: [
      "Corporate & Commercial Video Post-Production",
      "High-Engagement TikTok, Reels & YouTube Shorts",
      "Motion Graphics & 2D Animated Explainers",
      "Cinematic Color Grading & Audio Mastering",
      "Thumbnail & First-3-Seconds Hook Optimization",
    ],
    benefits: [
      "Dramatically boost engagement and viewer retention on social media",
      "Showcase your SaaS products through clean walkthroughs and promos",
      "Increase conversions on social media and video advertising campaigns",
      "Fast turnaround times with professional studio-grade finishing",
    ],
    technologies: [
      "Adobe Premiere Pro",
      "After Effects",
      "DaVinci Resolve",
      "CapCut Pro",
      "Audition",
    ],
    workflow: [
      {
        step: 1,
        title: "Footage Ingestion & Script",
        description:
          "Reviewing raw footage, selecting sound bites, and narrative pacing.",
      },
      {
        step: 2,
        title: "Rough Cut & Storyline",
        description:
          "Assembling sequence and story rhythm to maintain viewer interest.",
      },
      {
        step: 3,
        title: "Motion Graphics & Sound",
        description:
          "Adding dynamic titles, lower-thirds, sound effects, and music.",
      },
      {
        step: 4,
        title: "Color Grade & Multi-Format Export",
        description:
          "Color correction, multi-format 4K exports for web, TV, and mobile.",
      },
    ],
    status: "active",
    order: 5,
    updatedAt: today(),
  },
  {
    id: "seo",
    title: "Search Engine Optimization (SEO)",
    icon: "📈",
    shortDescription:
      "Technical SEO, high-intent keyword ranking, on-page optimization, and organic traffic growth.",
    fullDescription:
      "Dominate Google search results for the keywords that matter to your business. Our SEO specialists combine in-depth technical audits, content strategy, local SEO optimization, and ethical link-building to drive consistent, free organic traffic to your website.",
    coverImage:
      "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=1200&q=85",
    features: [
      "Comprehensive Technical Site Audits & Fixes",
      "High-Intent Keyword & Competitor Analysis",
      "On-Page Content, Heading & Meta Optimization",
      "Local SEO & Google Business Profile Management",
      "Authoritative Link Building & Digital PR Outreach",
    ],
    benefits: [
      "Long-term recurring organic traffic without paying per click",
      "Rank higher on Google when customers search for your solutions",
      "Better crawlability and indexation by search engines",
      "Transparent keyword ranking and organic traffic dashboards",
    ],
    technologies: [
      "Google Search Console",
      "Google Analytics 4",
      "Ahrefs",
      "SEMrush",
      "Screaming Frog",
      "Yoast",
    ],
    workflow: [
      {
        step: 1,
        title: "Full Technical Audit",
        description:
          "Identifying crawl errors, speed bottlenecks, and indexing issues.",
      },
      {
        step: 2,
        title: "Keyword & Intent Mapping",
        description: "Finding the queries your prospective buyers search for.",
      },
      {
        step: 3,
        title: "On-Page & Architecture Fixes",
        description:
          "Optimizing title tags, schema markup, and content structure.",
      },
      {
        step: 4,
        title: "Authority & Monitoring",
        description:
          "Building digital PR, monitoring rankings, and continuous optimization.",
      },
    ],
    status: "active",
    order: 6,
    updatedAt: today(),
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    icon: "✣",
    shortDescription:
      "Human-centered user research, wireframing, high-fidelity UI prototypes, and scalable design systems.",
    fullDescription:
      "Great software starts with exceptional design. We design interfaces that are not just visually captivating, but deeply intuitive and easy to navigate. From user research and information architecture to complete Figma design systems ready for engineering handoff.",
    coverImage:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=85",
    features: [
      "User Research, Personas & User Journey Mapping",
      "Interactive Wireframes & High-Fidelity Prototypes in Figma",
      "Atomic Design Systems & Reusable Component Libraries",
      "Mobile App (iOS & Android) & Web UI Design",
      "Usability Testing & Developer Handoff Specifications",
    ],
    benefits: [
      "Reduce development rework through pre-tested clickable prototypes",
      "Higher user satisfaction, retention, and conversion rates",
      "Consistent design components that speed up frontend engineering",
      "Pixel-perfect handoff files with precise tokens, typography, and states",
    ],
    technologies: ["Figma", "FigJam", "Adobe XD", "Miro", "Zeplin", "Notion"],
    workflow: [
      {
        step: 1,
        title: "User Research & Analysis",
        description:
          "Understanding user mental models, friction points, and workflows.",
      },
      {
        step: 2,
        title: "Information Architecture",
        description:
          "Wireframing user journeys, page flows, and screen hierarchies.",
      },
      {
        step: 3,
        title: "High-Fidelity Visual Design",
        description:
          "Crafting beautiful, accessible screens with design tokens.",
      },
      {
        step: 4,
        title: "Interactive Prototype & Handoff",
        description:
          "Clickable prototypes for testing, followed by developer handoff.",
      },
    ],
    status: "active",
    order: 7,
    updatedAt: today(),
  },
];

const DEFAULT_PASSWORD = "leafclutch2024";
const CONTENT_KEY = "leafclutch-admin-content";
/**
 * Snapshot of the last content read, so a repeat visit can paint immediately
 * instead of waiting on thirteen round trips. Versioned because the shape is
 * tied to the mappers in this build.
 */
const CONTENT_CACHE_KEY = "leafclutch-content-cache-v1";
/**
 * How long a cached snapshot is served without re-querying. Every page load
 * otherwise costs thirteen queries, which is what made a single visit look
 * like dozens of requests. The admin panel always refetches, so edits are
 * never hidden behind this.
 */
const CONTENT_CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const PASSWORD_KEY = "leafclutch-admin-password";
const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key",
);

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

const mapSupabaseService = (row: any): AdminService => ({
  id: row.id ?? row.slug ?? genId("service"),
  icon: row.icon ?? "✨",
  iconImage: row.icon_image ?? row.iconImage ?? "",
  title: row.title ?? "Untitled Service",
  label: row.label ?? (row.title ?? "SERVICE").toUpperCase(),
  heading: row.heading ?? row.title ?? "Untitled Service",
  description: row.description ?? "",
  heroImage: row.hero_image ?? row.heroImage ?? "",
  productUrl: row.product_url ?? row.productUrl ?? "",
  pricing: normalizePricing(row.pricing),
  order: Number(row.sort_order ?? 0),
  images: Array.isArray(row.service_images)
    ? row.service_images.map((image: any) => ({
        id: image.id ?? genId("img"),
        label: image.label ?? "Image",
        url: image.url ?? "",
      }))
    : Array.isArray(row.images)
      ? row.images
      : [],
  features: Array.isArray(row.service_features)
    ? row.service_features.map((feature: any) => ({
        id: feature.id ?? genId("feature"),
        icon: feature.icon ?? "✨",
        image: feature.image ?? undefined,
        title: feature.title ?? "Feature",
        description: feature.description ?? "",
      }))
    : Array.isArray(row.features)
      ? row.features
      : [],
  status: row.status === "coming_soon" ? "coming_soon" : "active",
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

const mapSupabaseTestimonial = (row: any): Testimonial => ({
  id: typeof row.id === "number" ? row.id : Number(row.id ?? Date.now()),
  name: row.name ?? "Anonymous",
  role: row.role ?? "",
  company: row.company ?? "",
  content: row.content ?? "",
  rating: Number(row.rating ?? 5),
  service: row.service ?? "General",
  photo: row.photo ?? undefined,
  embedUrl: row.embed_url ?? undefined,
  certificateImage: row.certificate_image ?? undefined,
  overview: row.overview ?? undefined,
  publishedAt: row.published_at ?? row.publishedAt ?? undefined,
  status: row.status === "draft" ? "draft" : "published",
});

const mapSupabaseWebsiteImage = (row: any): WebsiteImage => ({
  id: row.id ?? genId("site-img"),
  name: row.name ?? "Website Image",
  usedIn: row.used_in ?? row.usedIn ?? "",
  url: row.url ?? "",
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

/** 'general' / 'General' / 'GENERAL' all resolve to the canonical name. */
const toFaqCategory = (raw: unknown): string => {
  const value = String(raw ?? "").trim().toLowerCase();
  return FAQ_CATEGORIES.find((c) => c.toLowerCase() === value) ?? "General";
};

const mapSupabaseBlog = (row: any): BlogPost => ({
  id: row.id ?? genId("blog"),
  slug: row.slug ?? row.id ?? genId("blog"),
  title: row.title ?? "Untitled",
  excerpt: row.excerpt ?? "",
  content: row.content ?? "",
  coverImage: row.featured_image ?? row.coverImage ?? "",
  author: row.author ?? row.author_id ?? "Leafclutch Team",
  category: row.category ?? row.category_id ?? "Company News",
  tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
  publishedAt: (row.published_at ?? row.publishedAt ?? today()).slice(0, 10),
  readMinutes: Number(row.read_minutes ?? row.readMinutes ?? 3),
  seoTitle: row.seo_title ?? row.seoTitle ?? "",
  seoDescription: row.seo_description ?? row.seoDescription ?? "",
  order: Number(row.sort_order ?? row.order ?? 0),
  status: row.status === "published" || row.status === "active" ? "active" : "draft",
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

const mapSupabaseFaq = (row: any): Faq => ({
  id: row.id ?? genId("faq"),
  question: row.question ?? "",
  answer: row.answer ?? "",
  category: toFaqCategory(row.category ?? row.category_id),
  order: Number(row.sort_order ?? row.order ?? 0),
  status: row.status === "draft" ? "draft" : "active",
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

const mapSupabaseProject = (row: any): Project => ({
  id: row.id ?? genId("project"),
  company: row.client_name ?? row.name ?? row.company ?? "Project",
  url: row.project_url ?? row.url ?? "",
  image: row.cover_image ?? row.image ?? "",
  category: row.category ?? "",
  description: row.short_description ?? row.description ?? "",
  testimonial: row.testimonial ?? "",
  testimonialAuthor: row.testimonial_author ?? row.testimonialAuthor ?? "",
  order: Number(row.sort_order ?? row.order ?? 0),
  status: row.status === "draft" ? "draft" : "active",
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

const mapSupabaseClient = (row: any): Client => ({
  id: row.id ?? genId("client"),
  name: row.name ?? "Client",
  logo: row.logo ?? "",
  websiteUrl: row.website_url ?? row.websiteUrl ?? "",
  order: Number(row.sort_order ?? row.order ?? 0),
  status: row.status === "draft" ? "draft" : "active",
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

const mapSupabaseStat = (row: any): Stat => {
  // Older rows store the number and its "+"/"%" in separate columns. Fold the
  // suffix into the value so it reads as one number, not "50 + Projects".
  const rawValue = String(row.value ?? "0");
  const suffix = row.suffix ? String(row.suffix) : "";
  const value =
    suffix && !rawValue.endsWith(suffix) ? `${rawValue}${suffix}` : rawValue;

  return {
    id: row.id ?? genId("stat"),
    value,
    unit: row.unit ?? "",
    label: row.label ?? "Statistic",
    caption: row.caption ?? "",
    icon: row.icon ?? "layers",
    context:
      row.context === "home" || row.context === "about" || row.context === "nepal"
        ? row.context
        : "both",
    order: Number(row.sort_order ?? row.order ?? 0),
    status: row.status === "draft" ? "draft" : "active",
    updatedAt: row.updated_at ?? row.updatedAt ?? today(),
  };
};

const mapSupabaseMember = (row: any): Member => ({
  id: row.id ?? genId("member"),
  name: row.name ?? "Team Member",
  role: row.role ?? "",
  photo: row.photo ?? "",
  linkedin: row.linkedin ?? undefined,
  links: normalizeMemberLinks(row.links, row),
  type: row.type === "founder" || row.type === "intern" ? row.type : "team",
  order: Number(row.sort_order ?? row.order ?? 0),
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

const mapSupabaseCompanyService = (row: any): CompanyService => ({
  id: row.id ?? genId("service"),
  title: row.title ?? "Untitled Service",
  shortDescription: row.short_description ?? row.shortDescription ?? "",
  fullDescription: row.full_description ?? row.fullDescription ?? "",
  icon: row.icon ?? "💼",
  iconImage: row.icon_image ?? row.iconImage ?? undefined,
  coverImage: row.cover_image ?? row.coverImage ?? undefined,
  features: Array.isArray(row.features) ? row.features : [],
  benefits: Array.isArray(row.benefits) ? row.benefits : [],
  technologies: Array.isArray(row.technologies) ? row.technologies : [],
  workflow: Array.isArray(row.workflow) ? row.workflow : [],
  pricing: normalizePricing(row.pricing),
  status: row.status === "draft" ? "draft" : "active",
  order: Number(row.sort_order ?? row.order ?? 0),
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

/**
 * Database rows win, but any context the database has no rows for falls back to
 * the built-in defaults. Without this, a section added after the database was
 * seeded (the Nepal reach band) would render empty until someone hand-created
 * its rows in the admin panel.
 */
const mergeStats = (remote: Stat[]): Stat[] => {
  if (remote.length === 0) return initialStats;
  const covered = new Set(remote.map((stat) => stat.context));
  const seen = new Set(remote.map((stat) => stat.id));
  // Skip on id as well as context: the database and the seed share ids like
  // "team", which would otherwise render the same stat twice.
  const missing = initialStats.filter(
    (stat) => !covered.has(stat.context) && !seen.has(stat.id),
  );
  return [...remote, ...missing];
};

const readSupabaseContent = async () => {
  if (!isSupabaseConfigured) return null;

  const [
    { data: servicesData, error: servicesError },
    { data: serviceImagesData, error: serviceImagesError },
    { data: serviceFeaturesData, error: serviceFeaturesError },
    { data: testimonialsData, error: testimonialsError },
    { data: websiteImagesData, error: websiteImagesError },
    { data: membersData, error: membersError },
    { data: companyServicesData, error: companyServicesError },
    { data: statsData, error: statsError },
    { data: settingsData, error: settingsError },
    { data: clientsData, error: clientsError },
    { data: projectsData, error: projectsError },
    { data: faqsData, error: faqsError },
    { data: blogsData, error: blogsError },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("service_images").select("*"),
    supabase
      .from("service_features")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("testimonials").select("*"),
    supabase.from("website_images").select("*"),
    supabase
      .from("members")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("company_services")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("stats").select("*").order("sort_order", { ascending: true }),
    supabase.from("site_settings").select("*"),
    supabase.from("clients").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("portfolio_projects")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase.from("faqs").select("*").order("sort_order", { ascending: true }),
    supabase.from("blogs").select("*").order("sort_order", { ascending: true }),
  ]);

  const imagesByService = new Map<string, any[]>();
  if (!serviceImagesError && Array.isArray(serviceImagesData)) {
    serviceImagesData.forEach((image) => {
      const images = imagesByService.get(image.service_id) ?? [];
      images.push(image);
      imagesByService.set(image.service_id, images);
    });
  }

  const featuresByService = new Map<string, any[]>();
  if (!serviceFeaturesError && Array.isArray(serviceFeaturesData)) {
    serviceFeaturesData.forEach((feature) => {
      const features = featuresByService.get(feature.service_id) ?? [];
      features.push(feature);
      featuresByService.set(feature.service_id, features);
    });
  }

  const mappedServices =
    !servicesError && Array.isArray(servicesData)
      ? servicesData.map((service) =>
          mapSupabaseService({
            ...service,
            service_images: imagesByService.get(service.id) ?? [],
            service_features: featuresByService.get(service.id) ?? [],
          }),
        )
      : initialServices;

  return {
    testimonials:
      !testimonialsError && Array.isArray(testimonialsData)
        ? testimonialsData.map(mapSupabaseTestimonial)
        : initialTestimonials,
    services: mappedServices.length > 0 ? mappedServices : initialServices,
    companyServices:
      !companyServicesError &&
      Array.isArray(companyServicesData) &&
      companyServicesData.length > 0
        ? companyServicesData.map(mapSupabaseCompanyService)
        : initialCompanyServices,
    websiteImages:
      !websiteImagesError && Array.isArray(websiteImagesData)
        ? websiteImagesData.map(mapSupabaseWebsiteImage)
        : initialWebsiteImages,
    members:
      !membersError && Array.isArray(membersData)
        ? membersData.map(mapSupabaseMember)
        : initialMembers,
    stats: mergeStats(
      !statsError && Array.isArray(statsData) ? statsData.map(mapSupabaseStat) : [],
    ),
    blogPosts:
      !blogsError && Array.isArray(blogsData) && blogsData.length > 0
        ? blogsData.map(mapSupabaseBlog)
        : initialBlogPosts,
    faqs:
      !faqsError && Array.isArray(faqsData) && faqsData.length > 0
        ? faqsData.map(mapSupabaseFaq)
        : initialFaqs,
    projects:
      !projectsError && Array.isArray(projectsData) && projectsData.length > 0
        ? projectsData.map(mapSupabaseProject)
        : initialProjects,
    clients:
      !clientsError && Array.isArray(clientsData) && clientsData.length > 0
        ? clientsData.map(mapSupabaseClient)
        : initialClients,
    settings: {
      ...initialSettings,
      ...(!settingsError && Array.isArray(settingsData)
        ? Object.fromEntries(
            settingsData.map((row: any) => [row.key, row.value ?? ""]),
          )
        : {}),
    },
    /**
     * False when any table failed to load. Every field above falls back to the
     * built-in demo content on error, and the save path mirrors state back to
     * the database and prunes whatever is missing from it — so writing after a
     * failed read replaces real content with the demo data. Callers must not
     * save unless this is true.
     */
    ok: ![
      servicesError,
      serviceImagesError,
      serviceFeaturesError,
      testimonialsError,
      websiteImagesError,
      membersError,
      companyServicesError,
      statsError,
      settingsError,
      clientsError,
      projectsError,
      faqsError,
      blogsError,
    ].some(Boolean),
  };
};

const syncSupabaseContent = async ({
  testimonials,
  services,
  companyServices,
  websiteImages,
  members,
  stats,
  settings,
  clients,
  projects,
  faqs,
  blogPosts,
}: {
  testimonials: Testimonial[];
  services: AdminService[];
  companyServices: CompanyService[];
  websiteImages: WebsiteImage[];
  members: Member[];
  stats: Stat[];
  settings: Record<string, string>;
  clients: Client[];
  projects: Project[];
  faqs: Faq[];
  blogPosts: BlogPost[];
}) => {
  if (!isSupabaseConfigured) return false;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return false;

    const serviceRows = services.map((service, index) => ({
      id: service.id,
      icon: service.icon,
      icon_image: service.iconImage || null,
      title: service.title,
      label: service.label,
      heading: service.heading,
      description: service.description,
      hero_image: service.heroImage,
      product_url: service.productUrl || null,
      pricing: service.pricing ?? [],
      sort_order: service.order ?? index,
      status: service.status,
      updated_at: new Date(service.updatedAt || Date.now()).toISOString(),
    }));

    const testimonialRows = testimonials.map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      company: item.company,
      content: item.content,
      rating: item.rating,
      service: item.service,
      photo: item.photo ?? null,
      embed_url: item.embedUrl ?? null,
      certificate_image: item.certificateImage ?? null,
      overview: item.overview ?? null,
      published_at: item.publishedAt ?? new Date().toISOString(),
      status: item.status,
    }));

    const websiteImageRows = websiteImages.map((image) => ({
      id: image.id,
      name: image.name,
      used_in: image.usedIn,
      url: image.url,
      updated_at: new Date(image.updatedAt || Date.now()).toISOString(),
    }));

    const memberRows = members.map((member) => {
      const links = member.links ?? [];
      // The standalone `linkedin` column predates the links editor. Mirror the
      // LinkedIn entry into it so anything still reading that column matches.
      const linkedinLink = links.find((link) => link.platform === "linkedin");
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        photo: member.photo || null,
        linkedin: linkedinLink?.url || member.linkedin || null,
        links,
        type: member.type,
        sort_order: member.order,
        updated_at: new Date(member.updatedAt || Date.now()).toISOString(),
      };
    });

    const statRows = stats.map((stat) => ({
      id: stat.id,
      value: stat.value,
      unit: stat.unit || null,
      label: stat.label,
      caption: stat.caption || null,
      icon: stat.icon,
      context: stat.context,
      sort_order: stat.order,
      status: stat.status,
      updated_at: new Date(stat.updatedAt || Date.now()).toISOString(),
    }));

    // Upsert only ever inserts/updates the rows we send — rows removed locally (e.g. a
    // deleted service) are never included in the payload, so they'd otherwise stay in
    // the table forever. Diff against what's currently in Supabase and delete the rest.
    const pruneRemoved = async (
      table: string,
      currentIds: Array<string | number>,
    ) => {
      const existing = await supabase.from(table).select("id");
      if (existing.error)
        throw new Error(`${table} read: ${existing.error.message}`);
      const currentIdSet = new Set(currentIds.map(String));
      const removedIds = (existing.data ?? [])
        .map((row: any) => row.id)
        .filter((id: string | number) => !currentIdSet.has(String(id)));
      if (removedIds.length) {
        const pruneResult = await supabase
          .from(table)
          .delete()
          .in("id", removedIds);
        if (pruneResult.error)
          throw new Error(`${table} prune: ${pruneResult.error.message}`);
      }
    };

    await pruneRemoved(
      "services",
      services.map((s) => s.id),
    );
    await pruneRemoved(
      "testimonials",
      testimonials.map((t) => t.id),
    );
    await pruneRemoved(
      "website_images",
      websiteImages.map((w) => w.id),
    );
    await pruneRemoved(
      "members",
      members.map((m) => m.id),
    );
    try {
      await pruneRemoved(
        "stats",
        stats.map((st) => st.id),
      );
    } catch (statPruneErr) {
      console.warn("stats prune skipped:", statPruneErr);
    }

    try {
      await pruneRemoved(
        "company_services",
        companyServices.map((cs) => cs.id),
      );
      const companyServiceRows = companyServices.map((cs) => ({
        id: cs.id,
        title: cs.title,
        short_description: cs.shortDescription,
        full_description: cs.fullDescription,
        icon: cs.icon,
        icon_image: cs.iconImage || null,
        cover_image: cs.coverImage || null,
        features: cs.features,
        benefits: cs.benefits,
        technologies: cs.technologies,
        workflow: cs.workflow || [],
        pricing: cs.pricing ?? [],
        status: cs.status,
        sort_order: cs.order,
        updated_at: new Date(cs.updatedAt || Date.now()).toISOString(),
      }));
      if (companyServiceRows.length) {
        await supabase
          .from("company_services")
          .upsert(companyServiceRows, { onConflict: "id" });
      }
    } catch (csErr) {
      console.warn("company_services sync skipped:", csErr);
    }

    const serviceResult = await supabase
      .from("services")
      .upsert(serviceRows, { onConflict: "id" });
    if (serviceResult.error)
      throw new Error(`services: ${serviceResult.error.message}`);

    const testimonialResult = await supabase
      .from("testimonials")
      .upsert(testimonialRows, { onConflict: "id" });
    if (testimonialResult.error)
      throw new Error(`testimonials: ${testimonialResult.error.message}`);

    const websiteImageResult = await supabase
      .from("website_images")
      .upsert(websiteImageRows, { onConflict: "id" });
    if (websiteImageResult.error)
      throw new Error(`website_images: ${websiteImageResult.error.message}`);

    const memberResult = await supabase
      .from("members")
      .upsert(memberRows, { onConflict: "id" });
    if (memberResult.error)
      throw new Error(`members: ${memberResult.error.message}`);

    // Stats are newer than the original schema, so a missing table/column must
    // not abort the whole save — warn and carry on, like company_services.
    try {
      if (statRows.length) {
        const statResult = await supabase
          .from("stats")
          .upsert(statRows, { onConflict: "id" });
        if (statResult.error) throw new Error(statResult.error.message);
      }
    } catch (statErr) {
      console.warn("stats sync skipped:", statErr);
    }

    try {
      const settingRows = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));
      if (settingRows.length) {
        const result = await supabase
          .from("site_settings")
          .upsert(settingRows, { onConflict: "key" });
        if (result.error) throw new Error(result.error.message);
      }
    } catch (settingErr) {
      console.warn("site_settings sync skipped:", settingErr);
    }

    try {
      await pruneRemoved("clients", clients.map((c) => c.id));
      const clientRows = clients.map((client) => ({
        id: client.id,
        name: client.name,
        logo: client.logo || null,
        website_url: client.websiteUrl || null,
        sort_order: client.order,
        status: client.status,
        updated_at: new Date(client.updatedAt || Date.now()).toISOString(),
      }));
      if (clientRows.length) {
        const result = await supabase
          .from("clients")
          .upsert(clientRows, { onConflict: "id" });
        if (result.error) throw new Error(result.error.message);
      }
    } catch (clientErr) {
      console.warn("clients sync skipped:", clientErr);
    }

    try {
      await pruneRemoved("portfolio_projects", projects.map((p) => p.id));
      const projectRows = projects.map((project) => ({
        id: project.id,
        slug: project.id,
        name: project.company,
        client_name: project.company,
        category: project.category || null,
        short_description: project.description || "",
        cover_image: project.image || null,
        project_url: project.url || null,
        testimonial: project.testimonial || null,
        testimonial_author: project.testimonialAuthor || null,
        sort_order: project.order,
        status: project.status === "draft" ? "draft" : "published",
        updated_at: new Date(project.updatedAt || Date.now()).toISOString(),
      }));
      if (projectRows.length) {
        const result = await supabase
          .from("portfolio_projects")
          .upsert(projectRows, { onConflict: "id" });
        if (result.error) throw new Error(result.error.message);
      }
    } catch (projectErr) {
      console.warn("portfolio_projects sync skipped:", projectErr);
    }

    try {
      await pruneRemoved("faqs", faqs.map((f) => f.id));
      const faqRows = faqs.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        category_id: item.category.toLowerCase(),
        sort_order: item.order,
        status: item.status,
        updated_at: new Date(item.updatedAt || Date.now()).toISOString(),
      }));
      if (faqRows.length) {
        const result = await supabase
          .from("faqs")
          .upsert(faqRows, { onConflict: "id" });
        if (result.error) throw new Error(result.error.message);
      }
    } catch (faqErr) {
      console.warn("faqs sync skipped:", faqErr);
    }

    try {
      await pruneRemoved("blogs", blogPosts.map((b) => b.id));
      const blogRows = blogPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.coverImage || null,
        author: post.author,
        category: post.category,
        tags: post.tags,
        read_minutes: post.readMinutes,
        published_at: new Date(post.publishedAt).toISOString(),
        seo_title: post.seoTitle || null,
        seo_description: post.seoDescription || null,
        sort_order: post.order,
        status: post.status === "active" ? "published" : "draft",
        updated_at: new Date(post.updatedAt || Date.now()).toISOString(),
      }));
      if (blogRows.length) {
        const result = await supabase
          .from("blogs")
          .upsert(blogRows, { onConflict: "id" });
        if (result.error) throw new Error(result.error.message);
      }
    } catch (blogErr) {
      console.warn("blogs sync skipped:", blogErr);
    }

    for (const service of services) {
      const existingFeatureIds = await supabase
        .from("service_features")
        .select("id")
        .eq("service_id", service.id);
      if (existingFeatureIds.error)
        throw new Error(
          `service_features read: ${existingFeatureIds.error.message}`,
        );
      if (existingFeatureIds.data?.length) {
        const deleteFeatures = await supabase
          .from("service_features")
          .delete()
          .eq("service_id", service.id);
        if (deleteFeatures.error)
          throw new Error(
            `service_features delete: ${deleteFeatures.error.message}`,
          );
      }

      const featureRows = service.features.map((feature, index) => ({
        id: feature.id,
        service_id: service.id,
        icon: feature.icon,
        image: feature.image ?? null,
        title: feature.title,
        description: feature.description,
        sort_order: index,
      }));

      if (featureRows.length) {
        const featureResult = await supabase
          .from("service_features")
          .upsert(featureRows, { onConflict: "id" });
        if (featureResult.error)
          throw new Error(
            `service_features write: ${featureResult.error.message}`,
          );
      }

      const existingImageIds = await supabase
        .from("service_images")
        .select("id")
        .eq("service_id", service.id);
      if (existingImageIds.error)
        throw new Error(
          `service_images read: ${existingImageIds.error.message}`,
        );
      if (existingImageIds.data?.length) {
        const deleteImages = await supabase
          .from("service_images")
          .delete()
          .eq("service_id", service.id);
        if (deleteImages.error)
          throw new Error(
            `service_images delete: ${deleteImages.error.message}`,
          );
      }

      const imageRows = service.images.map((image) => ({
        id: image.id,
        service_id: service.id,
        label: image.label,
        url: image.url,
      }));

      if (imageRows.length) {
        const imageResult = await supabase
          .from("service_images")
          .upsert(imageRows, { onConflict: "id" });
        if (imageResult.error)
          throw new Error(`service_images write: ${imageResult.error.message}`);
      }
    }
    return true;
  } catch (error) {
    console.warn("Supabase sync skipped:", error);
    return false;
  }
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [services, setServices] = useState(initialServices);
  const [companyServices, setCompanyServices] = useState<CompanyService[]>(
    initialCompanyServices,
  );
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [settings, setSettings] =
    useState<Record<string, string>>(initialSettings);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [websiteImages, setWebsiteImages] = useState(initialWebsiteImages);
  const [members, setMembers] = useState(initialMembers);
  const [adminPassword, setAdminPasswordState] = useState(DEFAULT_PASSWORD);
  const [hydrated, setHydrated] = useState(false);

  /**
   * Writing is only safe once we know the database was read successfully.
   * Starts false so a failed or unfinished read can never be mirrored back.
   */
  const remoteReadOk = useRef(false);
  /** The state updates made by hydration are an echo of the read, not an edit. */
  const skipNextSave = useRef(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        // Paint from the previous visit's snapshot first. This is display
        // only: `remoteReadOk` stays false, so a cached copy can never be
        // written back to the database.
        let cacheIsFresh = false;
        if (isSupabaseConfigured) {
          try {
            const cached = window.localStorage.getItem(CONTENT_CACHE_KEY);
            if (cached) {
              const content = JSON.parse(cached) as Record<string, any>;
              const age = Date.now() - Number(content.savedAt ?? 0);
              cacheIsFresh =
                age >= 0 &&
                age < CONTENT_CACHE_MAX_AGE_MS &&
                !window.location.pathname.startsWith("/admin");
              if (content.testimonials) setTestimonials(content.testimonials);
              if (content.services) setServices(content.services);
              if (content.companyServices)
                setCompanyServices(content.companyServices);
              if (content.websiteImages) setWebsiteImages(content.websiteImages);
              if (content.members) setMembers(content.members);
              if (content.stats) setStats(content.stats);
              if (content.settings) setSettings(content.settings);
              if (content.clients) setClients(content.clients);
              if (content.projects) setProjects(content.projects);
              if (content.faqs) setFaqs(content.faqs);
              if (content.blogPosts) setBlogPosts(content.blogPosts);
            }
          } catch {
            window.localStorage.removeItem(CONTENT_CACHE_KEY);
          }
        }

        // A snapshot this recent is good enough for a visitor; skipping the
        // read here is what removes the repeat-visit query burst.
        if (isSupabaseConfigured && !cacheIsFresh) {
          const remote = await readSupabaseContent();
          if (remote) {
            remoteReadOk.current = remote.ok;
            setTestimonials(remote.testimonials);
            setServices(remote.services);
            if (remote.companyServices)
              setCompanyServices(remote.companyServices);
            setWebsiteImages(remote.websiteImages);
            setMembers(remote.members);
            if (remote.stats) setStats(remote.stats);
            if (remote.settings) setSettings(remote.settings);
            if (remote.clients) setClients(remote.clients);
            if (remote.projects) setProjects(remote.projects);
            if (remote.faqs) setFaqs(remote.faqs);
            if (remote.blogPosts) setBlogPosts(remote.blogPosts);
          }
        }

        if (!isSupabaseConfigured) {
          const saved = window.localStorage.getItem(CONTENT_KEY);
          if (saved) {
            const content = JSON.parse(saved) as {
              testimonials?: Testimonial[];
              services?: AdminService[];
              companyServices?: CompanyService[];
              websiteImages?: WebsiteImage[];
              members?: Member[];
              stats?: Stat[];
              settings?: Record<string, string>;
              clients?: Client[];
              projects?: Project[];
              faqs?: Faq[];
              blogPosts?: BlogPost[];
            };
            if (content.testimonials) setTestimonials(content.testimonials);
            if (content.services) setServices(content.services);
            if (content.companyServices)
              setCompanyServices(content.companyServices);
            if (content.websiteImages) setWebsiteImages(content.websiteImages);
            if (content.members) setMembers(content.members);
            if (content.stats) setStats(content.stats);
            if (content.settings) setSettings(content.settings);
            if (content.clients) setClients(content.clients);
            if (content.projects) setProjects(content.projects);
            if (content.faqs) setFaqs(content.faqs);
            if (content.blogPosts) setBlogPosts(content.blogPosts);
          }
        }
        const savedPassword = window.localStorage.getItem(PASSWORD_KEY);
        if (savedPassword) setAdminPasswordState(savedPassword);
      } catch {
        window.localStorage.removeItem(CONTENT_KEY);
      } finally {
        setHydrated(true);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const payload = {
      testimonials,
      services,
      companyServices,
      websiteImages,
      members,
      stats,
      settings,
      clients,
      projects,
      faqs,
      blogPosts,
    };

    // Refresh the snapshot on every change, including the hydration echo, so
    // the next visit has the newest content to paint from. Quota failures are
    // not worth breaking a page render over.
    if (isSupabaseConfigured) {
      try {
        window.localStorage.setItem(
          CONTENT_CACHE_KEY,
          JSON.stringify({ ...payload, savedAt: Date.now() }),
        );
      } catch {
        /* storage full or blocked — the page still works, just not offline */
      }
    }

    // The first run only mirrors back what hydration just read.
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (isSupabaseConfigured) {
      // A failed read leaves the demo defaults in state. Saving them would
      // overwrite the real content and prune every row that is missing.
      if (!remoteReadOk.current) return;
      void syncSupabaseContent(payload);
      return;
    }

    window.localStorage.setItem(
      CONTENT_KEY,
      JSON.stringify({
        testimonials,
        services,
        companyServices,
        websiteImages,
        members,
        stats,
        settings,
        clients,
        projects,
        faqs,
        blogPosts,
      }),
    );
  }, [testimonials, services, companyServices, websiteImages, members, stats, settings, clients, projects, faqs, blogPosts]);

  const setAdminPassword = (password: string) => {
    setAdminPasswordState(password);
    window.localStorage.setItem(PASSWORD_KEY, password);
  };

  const addTestimonial = (testimonial: NewTestimonial) => {
    setTestimonials((current) => [
      ...current,
      { ...testimonial, id: Date.now() },
    ]);
  };

  const updateTestimonial = (id: number, changes: Partial<Testimonial>) => {
    setTestimonials((current) =>
      current.map((testimonial) =>
        testimonial.id === id ? { ...testimonial, ...changes } : testimonial,
      ),
    );
  };

  const deleteTestimonial = (id: number) => {
    setTestimonials((current) =>
      current.filter((testimonial) => testimonial.id !== id),
    );
  };

  const touch = (service: AdminService): AdminService => ({
    ...service,
    updatedAt: today(),
  });

  const updateService = (id: string, changes: Partial<AdminService>) => {
    setServices((current) =>
      current.map((service) =>
        service.id === id ? touch({ ...service, ...changes }) : service,
      ),
    );
  };

  const addService = (service: NewAdminService) => {
    const baseId =
      service.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `service-${Date.now()}`;
    const id = services.some((existing) => existing.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId;
    setServices((current) => [
      ...current,
      touch({ ...service, id, updatedAt: today() }),
    ]);
    return id;
  };

  const deleteService = (id: string) => {
    setServices((current) => current.filter((service) => service.id !== id));
  };

  const addServiceImage = (
    serviceId: string,
    image: Omit<ServiceImage, "id">,
  ) => {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? touch({
              ...service,
              images: [...service.images, { ...image, id: genId("img") }],
            })
          : service,
      ),
    );
  };

  const updateServiceImage = (
    serviceId: string,
    imageId: string,
    changes: Partial<ServiceImage>,
  ) => {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? touch({
              ...service,
              images: service.images.map((image) =>
                image.id === imageId ? { ...image, ...changes } : image,
              ),
            })
          : service,
      ),
    );
  };

  const deleteServiceImage = (serviceId: string, imageId: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? touch({
              ...service,
              images: service.images.filter((image) => image.id !== imageId),
            })
          : service,
      ),
    );
  };

  const addFeature = (
    serviceId: string,
    feature: Omit<ServiceFeature, "id">,
  ) => {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? touch({
              ...service,
              features: [
                ...service.features,
                { ...feature, id: genId("feature") },
              ],
            })
          : service,
      ),
    );
  };

  const updateFeature = (
    serviceId: string,
    featureId: string,
    changes: Partial<ServiceFeature>,
  ) => {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? touch({
              ...service,
              features: service.features.map((feature) =>
                feature.id === featureId ? { ...feature, ...changes } : feature,
              ),
            })
          : service,
      ),
    );
  };

  const deleteFeature = (serviceId: string, featureId: string) => {
    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? touch({
              ...service,
              features: service.features.filter(
                (feature) => feature.id !== featureId,
              ),
            })
          : service,
      ),
    );
  };

  const reorderFeature = (
    serviceId: string,
    featureId: string,
    direction: "up" | "down",
  ) => {
    setServices((current) =>
      current.map((service) => {
        if (service.id !== serviceId) return service;
        const index = service.features.findIndex(
          (feature) => feature.id === featureId,
        );
        const swapWith = direction === "up" ? index - 1 : index + 1;
        if (index === -1 || swapWith < 0 || swapWith >= service.features.length)
          return service;
        const nextFeatures = [...service.features];
        [nextFeatures[index], nextFeatures[swapWith]] = [
          nextFeatures[swapWith],
          nextFeatures[index],
        ];
        return touch({ ...service, features: nextFeatures });
      }),
    );
  };

  const touchCompanyService = (service: CompanyService): CompanyService => ({
    ...service,
    updatedAt: today(),
  });

  const addCompanyService = (service: NewCompanyService) => {
    const baseId =
      service.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `service-${Date.now()}`;
    const id = companyServices.some((existing) => existing.id === baseId)
      ? `${baseId}-${Date.now()}`
      : baseId;
    const maxOrder = companyServices.length
      ? Math.max(...companyServices.map((s) => s.order)) + 1
      : 0;
    const newService: CompanyService = {
      ...service,
      id,
      order: maxOrder,
      updatedAt: today(),
    };
    setCompanyServices((current) => [...current, newService]);
    return id;
  };

  const updateCompanyService = (
    id: string,
    changes: Partial<CompanyService>,
  ) => {
    setCompanyServices((current) =>
      current.map((service) =>
        service.id === id
          ? touchCompanyService({ ...service, ...changes })
          : service,
      ),
    );
  };

  const deleteCompanyService = (id: string) => {
    setCompanyServices((current) =>
      current.filter((service) => service.id !== id),
    );
  };

  const reorderCompanyService = (id: string, direction: "up" | "down") => {
    setCompanyServices((current) => {
      const sorted = [...current].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((s) => s.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || swapWith < 0 || swapWith >= sorted.length)
        return current;
      const a = sorted[index];
      const b = sorted[swapWith];
      return current.map((s) => {
        if (s.id === a.id) return { ...s, order: b.order, updatedAt: today() };
        if (s.id === b.id) return { ...s, order: a.order, updatedAt: today() };
        return s;
      });
    });
  };

  const addWebsiteImage = (image: NewWebsiteImage) => {
    setWebsiteImages((current) => [
      ...current,
      { ...image, id: genId("site-img"), updatedAt: today() },
    ]);
  };

  const updateWebsiteImage = (id: string, changes: Partial<WebsiteImage>) => {
    setWebsiteImages((current) =>
      current.map((image) =>
        image.id === id ? { ...image, ...changes, updatedAt: today() } : image,
      ),
    );
  };

  const deleteWebsiteImage = (id: string) => {
    setWebsiteImages((current) => current.filter((image) => image.id !== id));
  };

  const addMember = (member: NewMember) => {
    setMembers((current) => {
      const siblingOrders = current
        .filter((m) => m.type === member.type)
        .map((m) => m.order);
      const nextOrder = siblingOrders.length
        ? Math.max(...siblingOrders) + 1
        : 0;
      return [
        ...current,
        {
          ...member,
          id: genId("member"),
          order: nextOrder,
          updatedAt: today(),
        },
      ];
    });
  };

  const updateMember = (id: string, changes: Partial<Member>) => {
    setMembers((current) =>
      current.map((member) =>
        member.id === id
          ? { ...member, ...changes, updatedAt: today() }
          : member,
      ),
    );
  };

  const deleteMember = (id: string) => {
    setMembers((current) => current.filter((member) => member.id !== id));
  };

  const addBlogPost = (post: NewBlogPost) => {
    setBlogPosts((current) => [
      ...current,
      {
        ...post,
        id: genId("blog"),
        order: current.length ? Math.max(...current.map((b) => b.order)) + 1 : 0,
        updatedAt: today(),
      },
    ]);
  };

  const updateBlogPost = (id: string, changes: Partial<BlogPost>) => {
    setBlogPosts((current) =>
      current.map((b) => (b.id === id ? { ...b, ...changes, updatedAt: today() } : b)),
    );
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts((current) => current.filter((b) => b.id !== id));
  };

  const reorderBlogPost = (id: string, direction: "up" | "down") => {
    setBlogPosts((current) => {
      const sorted = [...current].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((b) => b.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= sorted.length) return current;
      const a = sorted[index];
      const b = sorted[swapWith];
      return current.map((x) => {
        if (x.id === a.id) return { ...x, order: b.order, updatedAt: today() };
        if (x.id === b.id) return { ...x, order: a.order, updatedAt: today() };
        return x;
      });
    });
  };

  const addFaq = (item: NewFaq) => {
    setFaqs((current) => [
      ...current,
      {
        ...item,
        id: genId("faq"),
        order: current.length ? Math.max(...current.map((f) => f.order)) + 1 : 0,
        updatedAt: today(),
      },
    ]);
  };

  const updateFaq = (id: string, changes: Partial<Faq>) => {
    setFaqs((current) =>
      current.map((f) => (f.id === id ? { ...f, ...changes, updatedAt: today() } : f)),
    );
  };

  const deleteFaq = (id: string) => {
    setFaqs((current) => current.filter((f) => f.id !== id));
  };

  const reorderFaq = (id: string, direction: "up" | "down") => {
    setFaqs((current) => {
      const sorted = [...current].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((f) => f.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= sorted.length) return current;
      const a = sorted[index];
      const b = sorted[swapWith];
      return current.map((f) => {
        if (f.id === a.id) return { ...f, order: b.order, updatedAt: today() };
        if (f.id === b.id) return { ...f, order: a.order, updatedAt: today() };
        return f;
      });
    });
  };

  const addProject = (project: NewProject) => {
    setProjects((current) => [
      ...current,
      {
        ...project,
        id: genId("project"),
        order: current.length ? Math.max(...current.map((p) => p.order)) + 1 : 0,
        updatedAt: today(),
      },
    ]);
  };

  const updateProject = (id: string, changes: Partial<Project>) => {
    setProjects((current) =>
      current.map((p) => (p.id === id ? { ...p, ...changes, updatedAt: today() } : p)),
    );
  };

  const deleteProject = (id: string) => {
    setProjects((current) => current.filter((p) => p.id !== id));
  };

  const reorderProject = (id: string, direction: "up" | "down") => {
    setProjects((current) => {
      const sorted = [...current].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((p) => p.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= sorted.length) return current;
      const a = sorted[index];
      const b = sorted[swapWith];
      return current.map((p) => {
        if (p.id === a.id) return { ...p, order: b.order, updatedAt: today() };
        if (p.id === b.id) return { ...p, order: a.order, updatedAt: today() };
        return p;
      });
    });
  };

  const addClient = (client: NewClient) => {
    setClients((current) => [
      ...current,
      {
        ...client,
        id: genId("client"),
        order: current.length ? Math.max(...current.map((c) => c.order)) + 1 : 0,
        updatedAt: today(),
      },
    ]);
  };

  const updateClient = (id: string, changes: Partial<Client>) => {
    setClients((current) =>
      current.map((client) =>
        client.id === id ? { ...client, ...changes, updatedAt: today() } : client,
      ),
    );
  };

  const deleteClient = (id: string) => {
    setClients((current) => current.filter((client) => client.id !== id));
  };

  const reorderClient = (id: string, direction: "up" | "down") => {
    setClients((current) => {
      const sorted = [...current].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((c) => c.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= sorted.length) return current;
      const a = sorted[index];
      const b = sorted[swapWith];
      return current.map((c) => {
        if (c.id === a.id) return { ...c, order: b.order, updatedAt: today() };
        if (c.id === b.id) return { ...c, order: a.order, updatedAt: today() };
        return c;
      });
    });
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const addStat = (stat: NewStat) => {
    setStats((current) => [
      ...current,
      {
        ...stat,
        id: genId("stat"),
        order: current.length ? Math.max(...current.map((s) => s.order)) + 1 : 0,
        updatedAt: today(),
      },
    ]);
  };

  const updateStat = (id: string, changes: Partial<Stat>) => {
    setStats((current) =>
      current.map((stat) =>
        stat.id === id ? { ...stat, ...changes, updatedAt: today() } : stat,
      ),
    );
  };

  const deleteStat = (id: string) => {
    setStats((current) => current.filter((stat) => stat.id !== id));
  };

  const reorderStat = (id: string, direction: "up" | "down") => {
    setStats((current) => {
      const sorted = [...current].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((stat) => stat.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= sorted.length) return current;
      const a = sorted[index];
      const b = sorted[swapWith];
      return current.map((stat) => {
        if (stat.id === a.id) return { ...stat, order: b.order, updatedAt: today() };
        if (stat.id === b.id) return { ...stat, order: a.order, updatedAt: today() };
        return stat;
      });
    });
  };

  /** Move a product to an explicit 1-based position. */
  const setServicePosition = (id: string, position: number) => {
    setServices((current) => {
      const sorted = [...current].sort(byDisplayOrder);
      const from = sorted.findIndex((s) => s.id === id);
      if (from < 0) return current;
      const to = Math.max(0, Math.min(sorted.length - 1, position - 1));
      if (from === to) return current;
      const [moved] = sorted.splice(from, 1);
      sorted.splice(to, 0, moved);
      // Renumber densely so positions stay 1..n with no gaps.
      const orders = new Map(sorted.map((s, index) => [s.id, index]));
      return current.map((s) => ({
        ...s,
        order: orders.get(s.id) ?? s.order,
        updatedAt: today(),
      }));
    });
  };

  const reorderMember = (id: string, direction: "up" | "down") => {
    setMembers((current) => {
      const target = current.find((member) => member.id === id);
      if (!target) return current;
      const siblings = current
        .filter((member) => member.type === target.type)
        .sort((a, b) => a.order - b.order);
      const index = siblings.findIndex((member) => member.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= siblings.length) return current;
      const a = siblings[index];
      const b = siblings[swapWith];
      return current.map((member) => {
        if (member.id === a.id)
          return { ...member, order: b.order, updatedAt: today() };
        if (member.id === b.id)
          return { ...member, order: a.order, updatedAt: today() };
        return member;
      });
    });
  };

  const resetContent = () => {
    setTestimonials(initialTestimonials);
    setServices(initialServices);
    setCompanyServices(initialCompanyServices);
    setWebsiteImages(initialWebsiteImages);
    setMembers(initialMembers);
    setStats(initialStats);
    setSettings(initialSettings);
    setClients(initialClients);
    setProjects(initialProjects);
    setFaqs(initialFaqs);
    setBlogPosts(initialBlogPosts);
  };

  const syncContent = () =>
    syncSupabaseContent({
      testimonials,
      services,
      companyServices,
      websiteImages,
      members,
      stats,
      settings,
      clients,
      projects,
      faqs,
      blogPosts,
    });

  return (
    <AdminContext.Provider
      value={{
        testimonials,
        services,
        companyServices,
        websiteImages,
        members,
        adminPassword,
        setAdminPassword,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        updateService,
        addService,
        deleteService,
        addServiceImage,
        updateServiceImage,
        deleteServiceImage,
        addFeature,
        updateFeature,
        deleteFeature,
        reorderFeature,
        addCompanyService,
        updateCompanyService,
        deleteCompanyService,
        reorderCompanyService,
        addWebsiteImage,
        updateWebsiteImage,
        deleteWebsiteImage,
        stats,
        settings,
        updateSetting,
        clients,
        addClient,
        projects,
        addProject,
        faqs,
        addFaq,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        reorderBlogPost,
        updateFaq,
        deleteFaq,
        reorderFaq,
        updateProject,
        deleteProject,
        reorderProject,
        updateClient,
        deleteClient,
        reorderClient,
        addStat,
        updateStat,
        deleteStat,
        reorderStat,
        addMember,
        updateMember,
        deleteMember,
        reorderMember,
        setServicePosition,
        syncContent,
        resetContent,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin must be used within an AdminProvider");
  return context;
}

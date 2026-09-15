'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type ServiceImage = { id: string; label: string; url: string };
export type ServiceFeature = { id: string; icon: string; image?: string; title: string; description: string };

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  service: string;
  photo?: string;
  certificateImage?: string;
  overview?: string;
  publishedAt?: string;
  status: 'published' | 'draft';
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
  images: ServiceImage[];
  features: ServiceFeature[];
  status: 'active' | 'coming_soon';
  updatedAt: string;
};

export type WebsiteImage = { id: string; name: string; usedIn: string; url: string; updatedAt: string };

type NewTestimonial = Omit<Testimonial, 'id'>;
export type NewAdminService = Omit<AdminService, 'id' | 'updatedAt'>;
export type NewWebsiteImage = Omit<WebsiteImage, 'id' | 'updatedAt'>;

let idCounter = 0;
export function genId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

const today = () => new Date().toISOString().slice(0, 10);

type AdminContextValue = {
  testimonials: Testimonial[];
  services: AdminService[];
  websiteImages: WebsiteImage[];
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  addTestimonial: (testimonial: NewTestimonial) => void;
  updateTestimonial: (id: number, changes: Partial<Testimonial>) => void;
  deleteTestimonial: (id: number) => void;
  updateService: (id: string, changes: Partial<AdminService>) => void;
  addService: (service: NewAdminService) => string;
  deleteService: (id: string) => void;
  addServiceImage: (serviceId: string, image: Omit<ServiceImage, 'id'>) => void;
  updateServiceImage: (serviceId: string, imageId: string, changes: Partial<ServiceImage>) => void;
  deleteServiceImage: (serviceId: string, imageId: string) => void;
  addFeature: (serviceId: string, feature: Omit<ServiceFeature, 'id'>) => void;
  updateFeature: (serviceId: string, featureId: string, changes: Partial<ServiceFeature>) => void;
  deleteFeature: (serviceId: string, featureId: string) => void;
  reorderFeature: (serviceId: string, featureId: string, direction: 'up' | 'down') => void;
  addWebsiteImage: (image: NewWebsiteImage) => void;
  updateWebsiteImage: (id: string, changes: Partial<WebsiteImage>) => void;
  deleteWebsiteImage: (id: string) => void;
  syncContent: () => Promise<boolean>;
  resetContent: () => void;
};

function features(list: Array<[string, string, string]>): ServiceFeature[] {
  return list.map(([icon, title, description]) => ({ id: genId('feature'), icon, title, description }));
}

const initialServices: AdminService[] = [
  {
    id: 'restaurant-management',
    icon: '🍽️',
    title: 'Restaurant Management',
    label: 'RESTAURANT MANAGEMENT SYSTEM',
    heading: 'Run Your Restaurant Smarter',
    description: 'An all-in-one suite that handles everything from the first order to the final report of the day.',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85',
    images: [
      { id: genId('img'), label: 'Platform Image', url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85' },
      { id: genId('img'), label: 'Product Screenshot', url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80' },
    ],
    features: features([
      ['🧾', 'POS & Billing', 'Bill tables in seconds with split billing, multiple payment modes, and a live closing report at the end of every shift.'],
      ['🪑', 'Table Management', 'See your whole floor plan live — table status, QR ordering, and reservations updated in real time.'],
      ['🛒', 'Order Management', 'Digital KOTs move straight from table to kitchen, with instant modifications and full order tracking.'],
      ['📦', 'Inventory Management', 'Track stock down to the ingredient level, control wastage, and get auto purchase alerts before you run out.'],
      ['📋', 'Menu Management', 'Build dynamic menus with categories, variants, combos, and seasonal pricing rules — updated instantly across every terminal.'],
      ['🍳', 'Kitchen Management', 'A Kitchen Display System with order priorities, prep timers, and chef assignments so nothing sits too long.'],
      ['👥', 'Staff Management', 'Shifts, attendance, role-based access, and tip management, all handled in one place.'],
      ['📊', 'Sales & Reports', 'Daily sales, item-wise analysis, peak-hour trends, and profit margin reports without waiting on a spreadsheet.'],
    ]),
    status: 'active',
    updatedAt: today(),
  },
  {
    id: 'pharmacy-management',
    icon: '💊',
    title: 'Pharmacy Management',
    label: 'PHARMACY MANAGEMENT SYSTEM',
    heading: 'Pharmacy Operations, Simplified',
    description: 'A complete pharmacy ERP ensuring compliance, eliminating errors, and keeping your business profitable.',
    heroImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=85',
    images: [
      { id: genId('img'), label: 'Platform Image', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85' },
      { id: genId('img'), label: 'Product Screenshot', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80' },
    ],
    features: features([
      ['💊', 'Medicine Inventory', 'Manage all your medicines with ease. Add generic or brand names, categories, real-time stock levels, and barcode scanning for faster inventory control.'],
      ['📅', 'Batch & Expiry Management', 'Track every batch with FIFO logic, get expiry alerts 30/60/90 days ahead, and let expired stock auto de-list itself from sale.'],
      ['🧾', 'POS & Billing', 'Bill customers in seconds with GST/VAT built in, flexible discounts, multiple payment modes, and instant digital receipts.'],
      ['🧺', 'Purchase Management', 'Raise purchase orders automatically, process GRNs on arrival, and reconcile supplier invoices without spreadsheets.'],
      ['🚚', 'Supplier Management', 'Keep every supplier profile, purchase history, credit term, and outstanding balance organized in one place.'],
      ['⚠️', 'Low Stock Alerts', 'Set intelligent reorder points per medicine and get automatic purchase recommendations before you run out.'],
      ['📝', 'Prescription Management', 'Store digital prescriptions, map them to doctors, and keep controlled substance logs fully auditable.'],
      ['📈', 'Sales & Profit Reports', 'See daily and monthly P&L, item-wise margins, and financial dashboards without waiting on a spreadsheet.'],
    ]),
    status: 'active',
    updatedAt: today(),
  },
  {
    id: 'school-management',
    icon: '🏫',
    title: 'School Management',
    label: 'SCHOOL MANAGEMENT SYSTEM',
    heading: 'Empower Education with Smart ERP',
    description: 'Connects students, teachers, parents and administrators — one ecosystem for modern institutions.',
    heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=85',
    images: [
      { id: genId('img'), label: 'Platform Image', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85' },
      { id: genId('img'), label: 'Product Screenshot', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=300&q=80' },
    ],
    features: features([
      ['🎓', 'Student Management', 'Every student gets a complete digital profile — enrollment details, guardian contacts, documents, and full academic history.'],
      ['👩‍🏫', 'Teacher & Staff', 'Keep every staff profile, qualification, payroll record, and performance evaluation organized in one place.'],
      ['🗓️', 'Attendance', 'Biometric-ready attendance captures who is present the moment they walk in, with instant SMS alerts for parents.'],
      ['🏫', 'Class & Section', 'Build flexible class structures, assign subjects to the right teachers, and generate conflict-free timetables automatically.'],
      ['📝', 'Exam & Results', 'Enter marks once and the system handles grade calculation, transcript generation, and result publishing.'],
      ['💳', 'Fee Management', 'Set up fee structures and scholarships, send invoices automatically, and track overdue payments.'],
      ['👨‍👩‍👧', 'Parent Portal', 'Parents get real-time access to attendance, results, fees, and notices from their phone.'],
      ['📢', 'Notices', 'Broadcast a notice once and it reaches every parent by SMS and in-app alert instantly, with delivery tracking.'],
      ['⬆️', 'Promotion', 'Run end-of-year promotions automatically based on rules you set, moving students to their next class and section.'],
      ['📊', 'Reports', 'Generate academic, financial, and attendance analytics on demand and export them in the format your board needs.'],
    ]),
    status: 'active',
    updatedAt: today(),
  },
  {
    id: 'it-training',
    icon: '💻',
    title: 'IT Training',
    label: 'IT TRAINING',
    heading: 'Learn. Build. Grow.',
    description: 'Leafclutch is your all-in-one learning platform to gain industry-ready skills with both online and offline classes.',
    heroImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=85',
    images: [
      { id: genId('img'), label: 'Platform Image', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85' },
      { id: genId('img'), label: 'Product Screenshot', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80' },
    ],
    features: [],
    status: 'active',
    updatedAt: today(),
  },
  {
    id: 'digital-technology',
    icon: '🚀',
    title: 'Digital & Technology Solutions',
    label: 'DIGITAL & TECHNOLOGY SOLUTIONS',
    heading: 'Your Digital Transformation Partner',
    description: 'Web, mobile, cloud, AI and cybersecurity — every dimension of modern digital infrastructure.',
    heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=85',
    images: [
      { id: genId('img'), label: 'Platform Image', url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85' },
      { id: genId('img'), label: 'Product Screenshot', url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80' },
    ],
    features: features([
      ['🌐', 'Web Development', 'We design and build custom websites, web applications, and client portals using modern frameworks like React, Next.js, and Django.'],
      ['📱', 'Mobile App Development', 'We build native-feeling iOS and Android apps with Flutter and React Native from a single codebase.'],
      ['☁️', 'DevOps & Cloud', 'We set up CI/CD pipelines, containerize services with Docker and Kubernetes, and manage infrastructure as code on AWS.'],
      ['🛡️', 'Cybersecurity', 'We run full security audits, simulated penetration tests, and compliance reviews, then set up continuous threat monitoring.'],
      ['📣', 'Digital Marketing', 'We plan and run SEO, social media, and Google Ads campaigns backed by real analytics.'],
      ['🤖', 'AI & Data Solutions', 'We design machine learning models, build data pipelines, and add NLP-powered automation to your product.'],
      ['🔌', 'API Development', 'We build RESTful and GraphQL APIs, break monoliths into microservices, and connect third-party integrations cleanly.'],
      ['🧩', 'Software Development', 'We build custom enterprise software, ERP systems, and business automation tools tailored to how your team works.'],
    ]),
    status: 'active',
    updatedAt: today(),
  },
  {
    id: 'lms',
    icon: '📚',
    title: 'Learning Management System',
    label: 'LEARNING MANAGEMENT SYSTEM',
    heading: 'LMS is Coming',
    description: 'The future of learning is coming. A powerful, flexible platform designed to make education accessible, engaging, and effective for everyone.',
    heroImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=85',
    images: [],
    features: features([
      ['📚', 'Online Courses', 'Structured learning paths with video lessons, quizzes, and interactive content.'],
      ['📈', 'Progress Tracking', 'Real-time dashboards for students and instructors to monitor learning progress.'],
      ['🎥', 'Live Classes', 'Integrated video conferencing for interactive live sessions and webinars.'],
      ['🏆', 'Certifications', 'Auto-generated certificates upon course completion with blockchain verification.'],
      ['📝', 'Assignments & Quizzes', 'Rich assessment tools with auto-grading and detailed feedback systems.'],
      ['💬', 'Discussion Forums', 'Community-driven learning with Q&A boards and peer collaboration.'],
      ['📱', 'Mobile Learning', 'Full-featured mobile app for iOS and Android — learn on the go.'],
      ['📊', 'Analytics', 'In-depth learning analytics for instructors and platform administrators.'],
    ]),
    status: 'coming_soon',
    updatedAt: today(),
  },
];

const initialTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    role: 'Director',
    company: 'Himalayan Bistro',
    content: 'Leafclutch helped us bring our restaurant operations into one clear, reliable system.',
    rating: 5,
    service: 'Restaurant Management',
    photo: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80',
    status: 'published',
  },
  {
    id: 2,
    name: 'Maya Thapa',
    role: 'Principal',
    company: 'Bright Future Academy',
    content: 'The school management platform has made everyday coordination much easier for our team.',
    rating: 5,
    service: 'School Management',
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
    status: 'published',
  },
  {
    id: 3,
    name: 'Rohan KC',
    role: 'Founder',
    company: 'Kantipur Digital',
    content: 'A thoughtful technology partner that understands the details behind business growth.',
    rating: 5,
    service: 'General',
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=400&q=80',
    status: 'published',
  },
];

const initialWebsiteImages: WebsiteImage[] = [
  { id: genId('site-img'), name: 'Black Service Teaser', usedIn: 'Homepage — services row', url: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?auto=format&fit=crop&w=500&q=80', updatedAt: today() },
  { id: genId('site-img'), name: 'ABC Service Teaser', usedIn: 'Homepage — services row', url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=500&q=80', updatedAt: today() },
];

const DEFAULT_PASSWORD = 'leafclutch2024';
const CONTENT_KEY = 'leafclutch-admin-content';
const PASSWORD_KEY = 'leafclutch-admin-password';
const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'
);

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

const mapSupabaseService = (row: any): AdminService => ({
  id: row.id ?? row.slug ?? genId('service'),
  icon: row.icon ?? '✨',
  iconImage: row.icon_image ?? row.iconImage ?? '',
  title: row.title ?? 'Untitled Service',
  label: row.label ?? (row.title ?? 'SERVICE').toUpperCase(),
  heading: row.heading ?? row.title ?? 'Untitled Service',
  description: row.description ?? '',
  heroImage: row.hero_image ?? row.heroImage ?? '',
  images: Array.isArray(row.service_images) ? row.service_images.map((image: any) => ({
    id: image.id ?? genId('img'),
    label: image.label ?? 'Image',
    url: image.url ?? '',
  })) : (Array.isArray(row.images) ? row.images : []),
  features: Array.isArray(row.service_features) ? row.service_features.map((feature: any) => ({
    id: feature.id ?? genId('feature'),
    icon: feature.icon ?? '✨',
    image: feature.image ?? undefined,
    title: feature.title ?? 'Feature',
    description: feature.description ?? '',
  })) : (Array.isArray(row.features) ? row.features : []),
  status: row.status === 'coming_soon' ? 'coming_soon' : 'active',
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

const mapSupabaseTestimonial = (row: any): Testimonial => ({
  id: typeof row.id === 'number' ? row.id : Number(row.id ?? Date.now()),
  name: row.name ?? 'Anonymous',
  role: row.role ?? '',
  company: row.company ?? '',
  content: row.content ?? '',
  rating: Number(row.rating ?? 5),
  service: row.service ?? 'General',
  photo: row.photo ?? undefined,
  certificateImage: row.certificate_image ?? undefined,
  overview: row.overview ?? undefined,
  publishedAt: row.published_at ?? row.publishedAt ?? undefined,
  status: row.status === 'draft' ? 'draft' : 'published',
});

const mapSupabaseWebsiteImage = (row: any): WebsiteImage => ({
  id: row.id ?? genId('site-img'),
  name: row.name ?? 'Website Image',
  usedIn: row.used_in ?? row.usedIn ?? '',
  url: row.url ?? '',
  updatedAt: row.updated_at ?? row.updatedAt ?? today(),
});

const readSupabaseContent = async () => {
  if (!isSupabaseConfigured) return null;

  const [
    { data: servicesData, error: servicesError },
    { data: serviceImagesData, error: serviceImagesError },
    { data: serviceFeaturesData, error: serviceFeaturesError },
    { data: testimonialsData, error: testimonialsError },
    { data: websiteImagesData, error: websiteImagesError },
  ] = await Promise.all([
    supabase.from('services').select('*'),
    supabase.from('service_images').select('*'),
    supabase.from('service_features').select('*').order('sort_order', { ascending: true }),
    supabase.from('testimonials').select('*'),
    supabase.from('website_images').select('*'),
  ]);

  const imagesByService = new Map<string, any[]>();
  if (!serviceImagesError && Array.isArray(serviceImagesData)) {
    serviceImagesData.forEach(image => {
      const images = imagesByService.get(image.service_id) ?? [];
      images.push(image);
      imagesByService.set(image.service_id, images);
    });
  }

  const featuresByService = new Map<string, any[]>();
  if (!serviceFeaturesError && Array.isArray(serviceFeaturesData)) {
    serviceFeaturesData.forEach(feature => {
      const features = featuresByService.get(feature.service_id) ?? [];
      features.push(feature);
      featuresByService.set(feature.service_id, features);
    });
  }

  const mappedServices = !servicesError && Array.isArray(servicesData)
    ? servicesData.map(service => mapSupabaseService({
      ...service,
      service_images: imagesByService.get(service.id) ?? [],
      service_features: featuresByService.get(service.id) ?? [],
    }))
    : initialServices;

  return {
    testimonials: !testimonialsError && Array.isArray(testimonialsData) ? testimonialsData.map(mapSupabaseTestimonial) : initialTestimonials,
    services: mappedServices.length > 0 ? mappedServices : initialServices,
    websiteImages: !websiteImagesError && Array.isArray(websiteImagesData) ? websiteImagesData.map(mapSupabaseWebsiteImage) : initialWebsiteImages,
  };
};

const syncSupabaseContent = async ({ testimonials, services, websiteImages }: { testimonials: Testimonial[]; services: AdminService[]; websiteImages: WebsiteImage[] }) => {
  if (!isSupabaseConfigured) return false;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return false;

    const serviceRows = services.map(service => ({
      id: service.id,
      icon: service.icon,
      icon_image: service.iconImage || null,
      title: service.title,
      label: service.label,
      heading: service.heading,
      description: service.description,
      hero_image: service.heroImage,
      status: service.status,
      updated_at: new Date(service.updatedAt || Date.now()).toISOString(),
    }));

    const testimonialRows = testimonials.map(item => ({
      id: item.id,
      name: item.name,
      role: item.role,
      company: item.company,
      content: item.content,
      rating: item.rating,
      service: item.service,
      photo: item.photo ?? null,
      certificate_image: item.certificateImage ?? null,
      overview: item.overview ?? null,
      published_at: item.publishedAt ?? new Date().toISOString(),
      status: item.status,
    }));

    const websiteImageRows = websiteImages.map(image => ({
      id: image.id,
      name: image.name,
      used_in: image.usedIn,
      url: image.url,
      updated_at: new Date(image.updatedAt || Date.now()).toISOString(),
    }));

    // Upsert only ever inserts/updates the rows we send — rows removed locally (e.g. a
    // deleted service) are never included in the payload, so they'd otherwise stay in
    // the table forever. Diff against what's currently in Supabase and delete the rest.
    const pruneRemoved = async (table: string, currentIds: Array<string | number>) => {
      const existing = await supabase.from(table).select('id');
      if (existing.error) throw new Error(`${table} read: ${existing.error.message}`);
      const currentIdSet = new Set(currentIds.map(String));
      const removedIds = (existing.data ?? [])
        .map((row: any) => row.id)
        .filter((id: string | number) => !currentIdSet.has(String(id)));
      if (removedIds.length) {
        const pruneResult = await supabase.from(table).delete().in('id', removedIds);
        if (pruneResult.error) throw new Error(`${table} prune: ${pruneResult.error.message}`);
      }
    };

    await pruneRemoved('services', services.map(s => s.id));
    await pruneRemoved('testimonials', testimonials.map(t => t.id));
    await pruneRemoved('website_images', websiteImages.map(w => w.id));

    const serviceResult = await supabase.from('services').upsert(serviceRows, { onConflict: 'id' });
    if (serviceResult.error) throw new Error(`services: ${serviceResult.error.message}`);

    const testimonialResult = await supabase.from('testimonials').upsert(testimonialRows, { onConflict: 'id' });
    if (testimonialResult.error) throw new Error(`testimonials: ${testimonialResult.error.message}`);

    const websiteImageResult = await supabase.from('website_images').upsert(websiteImageRows, { onConflict: 'id' });
    if (websiteImageResult.error) throw new Error(`website_images: ${websiteImageResult.error.message}`);

    for (const service of services) {
      const existingFeatureIds = await supabase.from('service_features').select('id').eq('service_id', service.id);
      if (existingFeatureIds.error) throw new Error(`service_features read: ${existingFeatureIds.error.message}`);
      if (existingFeatureIds.data?.length) {
        const deleteFeatures = await supabase.from('service_features').delete().eq('service_id', service.id);
        if (deleteFeatures.error) throw new Error(`service_features delete: ${deleteFeatures.error.message}`);
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
        const featureResult = await supabase.from('service_features').upsert(featureRows, { onConflict: 'id' });
        if (featureResult.error) throw new Error(`service_features write: ${featureResult.error.message}`);
      }

      const existingImageIds = await supabase.from('service_images').select('id').eq('service_id', service.id);
      if (existingImageIds.error) throw new Error(`service_images read: ${existingImageIds.error.message}`);
      if (existingImageIds.data?.length) {
        const deleteImages = await supabase.from('service_images').delete().eq('service_id', service.id);
        if (deleteImages.error) throw new Error(`service_images delete: ${deleteImages.error.message}`);
      }

      const imageRows = service.images.map(image => ({
        id: image.id,
        service_id: service.id,
        label: image.label,
        url: image.url,
      }));

      if (imageRows.length) {
        const imageResult = await supabase.from('service_images').upsert(imageRows, { onConflict: 'id' });
        if (imageResult.error) throw new Error(`service_images write: ${imageResult.error.message}`);
      }
    }
    return true;
  } catch (error) {
    console.warn('Supabase sync skipped:', error);
    return false;
  }
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [services, setServices] = useState(initialServices);
  const [websiteImages, setWebsiteImages] = useState(initialWebsiteImages);
  const [adminPassword, setAdminPasswordState] = useState(DEFAULT_PASSWORD);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        if (isSupabaseConfigured) {
          const remote = await readSupabaseContent();
          if (remote) {
            setTestimonials(remote.testimonials);
            setServices(remote.services);
            setWebsiteImages(remote.websiteImages);
          }
        }

        if (!isSupabaseConfigured) {
          const saved = window.localStorage.getItem(CONTENT_KEY);
          if (saved) {
            const content = JSON.parse(saved) as { testimonials?: Testimonial[]; services?: AdminService[]; websiteImages?: WebsiteImage[] };
            if (content.testimonials) setTestimonials(content.testimonials);
            if (content.services) setServices(content.services);
            if (content.websiteImages) setWebsiteImages(content.websiteImages);
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

    if (isSupabaseConfigured) {
      void syncSupabaseContent({ testimonials, services, websiteImages });
      return;
    }

    window.localStorage.setItem(CONTENT_KEY, JSON.stringify({ testimonials, services, websiteImages }));
  }, [testimonials, services, websiteImages]);

  const setAdminPassword = (password: string) => {
    setAdminPasswordState(password);
    window.localStorage.setItem(PASSWORD_KEY, password);
  };

  const addTestimonial = (testimonial: NewTestimonial) => {
    setTestimonials(current => [...current, { ...testimonial, id: Date.now() }]);
  };

  const updateTestimonial = (id: number, changes: Partial<Testimonial>) => {
    setTestimonials(current => current.map(testimonial => testimonial.id === id ? { ...testimonial, ...changes } : testimonial));
  };

  const deleteTestimonial = (id: number) => {
    setTestimonials(current => current.filter(testimonial => testimonial.id !== id));
  };

  const touch = (service: AdminService): AdminService => ({ ...service, updatedAt: today() });

  const updateService = (id: string, changes: Partial<AdminService>) => {
    setServices(current => current.map(service => service.id === id ? touch({ ...service, ...changes }) : service));
  };

  const addService = (service: NewAdminService) => {
    const baseId = service.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `service-${Date.now()}`;
    const id = services.some(existing => existing.id === baseId) ? `${baseId}-${Date.now()}` : baseId;
    setServices(current => [...current, touch({ ...service, id, updatedAt: today() })]);
    return id;
  };

  const deleteService = (id: string) => {
    setServices(current => current.filter(service => service.id !== id));
  };

  const addServiceImage = (serviceId: string, image: Omit<ServiceImage, 'id'>) => {
    setServices(current => current.map(service => service.id === serviceId ? touch({ ...service, images: [...service.images, { ...image, id: genId('img') }] }) : service));
  };

  const updateServiceImage = (serviceId: string, imageId: string, changes: Partial<ServiceImage>) => {
    setServices(current => current.map(service => service.id === serviceId ? touch({ ...service, images: service.images.map(image => image.id === imageId ? { ...image, ...changes } : image) }) : service));
  };

  const deleteServiceImage = (serviceId: string, imageId: string) => {
    setServices(current => current.map(service => service.id === serviceId ? touch({ ...service, images: service.images.filter(image => image.id !== imageId) }) : service));
  };

  const addFeature = (serviceId: string, feature: Omit<ServiceFeature, 'id'>) => {
    setServices(current => current.map(service => service.id === serviceId ? touch({ ...service, features: [...service.features, { ...feature, id: genId('feature') }] }) : service));
  };

  const updateFeature = (serviceId: string, featureId: string, changes: Partial<ServiceFeature>) => {
    setServices(current => current.map(service => service.id === serviceId ? touch({ ...service, features: service.features.map(feature => feature.id === featureId ? { ...feature, ...changes } : feature) }) : service));
  };

  const deleteFeature = (serviceId: string, featureId: string) => {
    setServices(current => current.map(service => service.id === serviceId ? touch({ ...service, features: service.features.filter(feature => feature.id !== featureId) }) : service));
  };

  const reorderFeature = (serviceId: string, featureId: string, direction: 'up' | 'down') => {
    setServices(current => current.map(service => {
      if (service.id !== serviceId) return service;
      const index = service.features.findIndex(feature => feature.id === featureId);
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (index === -1 || swapWith < 0 || swapWith >= service.features.length) return service;
      const nextFeatures = [...service.features];
      [nextFeatures[index], nextFeatures[swapWith]] = [nextFeatures[swapWith], nextFeatures[index]];
      return touch({ ...service, features: nextFeatures });
    }));
  };

  const addWebsiteImage = (image: NewWebsiteImage) => {
    setWebsiteImages(current => [...current, { ...image, id: genId('site-img'), updatedAt: today() }]);
  };

  const updateWebsiteImage = (id: string, changes: Partial<WebsiteImage>) => {
    setWebsiteImages(current => current.map(image => image.id === id ? { ...image, ...changes, updatedAt: today() } : image));
  };

  const deleteWebsiteImage = (id: string) => {
    setWebsiteImages(current => current.filter(image => image.id !== id));
  };

  const resetContent = () => {
    setTestimonials(initialTestimonials);
    setServices(initialServices);
    setWebsiteImages(initialWebsiteImages);
  };

  const syncContent = () => syncSupabaseContent({ testimonials, services, websiteImages });

  return (
    <AdminContext.Provider value={{
      testimonials, services, websiteImages, adminPassword, setAdminPassword,
      addTestimonial, updateTestimonial, deleteTestimonial,
      updateService, addService, deleteService,
      addServiceImage, updateServiceImage, deleteServiceImage,
      addFeature, updateFeature, deleteFeature, reorderFeature,
      addWebsiteImage, updateWebsiteImage, deleteWebsiteImage,
      syncContent,
      resetContent,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
}

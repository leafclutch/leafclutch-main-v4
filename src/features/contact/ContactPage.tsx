'use client';

import { useMemo, useState } from 'react';
import { useAdmin } from '@/app/context/AdminContext';
import { useRevealAll } from '@/app/hooks/useReveal';

const EMAIL = 'info@leafclutchtech.com.np';
const PHONE_DISPLAY = '+977 9766715768';
const PHONE_TEL = '+9779766715768';
const WHATSAPP = '9779766715768';
const ADDRESS = 'Siddharthanagar, Rupandehi, Nepal';
const HOURS = 'Sunday – Friday, 9:00 AM – 6:00 PM';

const MAP_EMBED =
  'https://www.google.com/maps?q=Siddharthanagar,+Rupandehi,+Nepal&output=embed';
const MAP_LINK =
  'https://www.google.com/maps/search/?api=1&query=Siddharthanagar%2C+Rupandehi%2C+Nepal';

const ENQUIRY_TYPES = [
  'General enquiry',
  'Request a quote',
  'Book a consultation',
  'Support',
  'Partnership',
];

type Form = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  interest: string;
  message: string;
};

const EMPTY: Form = { name: '', email: '', phone: '', subject: '', interest: '', message: '' };

function Icon({ path, className = 'h-5 w-5' }: { path: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {path}
    </svg>
  );
}

const ICONS = {
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  mail: <><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" /><path d="m3.5 7 7.4 5.3a2 2 0 0 0 2.2 0L20.5 7" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z" />,
  chat: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.7-.8L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
};

export default function ContactPage() {
  useRevealAll();
  const { services: products, companyServices } = useAdmin();
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isValid = form.name.trim() !== '' && emailLooksValid && form.message.trim() !== '';

  /** One plain-text body, reused by both the email and WhatsApp handoffs. */
  const body = useMemo(() => {
    const lines = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone.trim() && `Phone: ${form.phone}`,
      form.interest.trim() && `Interested in: ${form.interest}`,
      form.subject.trim() && `Subject: ${form.subject}`,
      '',
      form.message,
    ].filter(Boolean);
    return lines.join('\n');
  }, [form]);

  const subjectLine = form.subject.trim() || `Website enquiry from ${form.name || 'a visitor'}`;

  const sendByEmail = () => {
    setTouched(true);
    if (!isValid) return;
    window.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
  };

  const sendByWhatsApp = () => {
    setTouched(true);
    if (!isValid) return;
    const text = `*${subjectLine}*\n\n${body}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const invalid = (field: keyof Form) => {
    if (!touched) return false;
    if (field === 'email') return !emailLooksValid;
    return form[field].trim() === '';
  };

  const details = [
    { icon: ICONS.pin, label: 'Office', value: ADDRESS, href: MAP_LINK, external: true },
    { icon: ICONS.mail, label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
    { icon: ICONS.phone, label: 'Phone', value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
    { icon: ICONS.chat, label: 'WhatsApp', value: PHONE_DISPLAY, href: `https://wa.me/${WHATSAPP}`, external: true },
    { icon: ICONS.clock, label: 'Business Hours', value: HOURS },
  ];

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="bg-linear-to-b from-[#F5F9FF] to-white pt-32 pb-14 lg:pt-40 lg:pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <span className="section-badge">Contact Us</span>
          <h1 className="mt-5 text-4xl lg:text-5xl font-extrabold text-[#0F1729] leading-tight text-balance">
            Let&rsquo;s talk about your project
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#676F7E] text-balance">
            Tell us what you are trying to build. We will get back to you with a clear
            plan, timeline and price — no obligation.
          </p>
        </div>
      </section>

      {/* ── FORM + DETAILS ── */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="reveal lg:col-span-3 rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-[#0F1729]">Send us a message</h2>
            <p className="mt-1.5 text-sm text-[#676F7E]">
              Fill this in once, then choose how you&rsquo;d like to send it.
            </p>

            <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); sendByEmail(); }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="contact-label">Full Name *</span>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className={`contact-input${invalid('name') ? ' is-invalid' : ''}`}
                    placeholder="e.g. Ram Sharma"
                    autoComplete="name"
                  />
                  {invalid('name') && <span className="contact-error">Please enter your name.</span>}
                </label>

                <label className="block">
                  <span className="contact-label">Email *</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className={`contact-input${invalid('email') ? ' is-invalid' : ''}`}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                  {invalid('email') && <span className="contact-error">Please enter a valid email.</span>}
                </label>

                <label className="block">
                  <span className="contact-label">Phone</span>
                  <input
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className="contact-input"
                    placeholder="+977 98…"
                    autoComplete="tel"
                  />
                </label>

                <label className="block">
                  <span className="contact-label">Service / Product</span>
                  <select
                    value={form.interest}
                    onChange={e => set('interest', e.target.value)}
                    className="contact-input"
                  >
                    <option value="">Select one…</option>
                    <optgroup label="Services">
                      {companyServices
                        .filter(s => s.status === 'active')
                        .map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                    </optgroup>
                    <optgroup label="Products">
                      {products.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                    </optgroup>
                    <optgroup label="Other">
                      {ENQUIRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </optgroup>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="contact-label">Subject</span>
                <input
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  className="contact-input"
                  placeholder="What is this about?"
                />
              </label>

              <label className="block">
                <span className="contact-label">Message *</span>
                <textarea
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  rows={5}
                  className={`contact-input resize-y${invalid('message') ? ' is-invalid' : ''}`}
                  placeholder="Tell us about your project, timeline and budget…"
                />
                {invalid('message') && <span className="contact-error">Please add a short message.</span>}
              </label>

              {/* Two ways to send the same message. */}
              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                <button type="submit" className="contact-send contact-send-mail">
                  <Icon path={ICONS.mail} className="h-4.5 w-4.5" />
                  Send via Email
                </button>
                <button type="button" onClick={sendByWhatsApp} className="contact-send contact-send-wa">
                  <Icon path={ICONS.chat} className="h-4.5 w-4.5" />
                  Send via WhatsApp
                </button>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Email opens your mail app with the message ready to send. WhatsApp opens a
                chat with our team — both carry everything you typed above.
              </p>
            </form>
          </div>

          {/* Details */}
          <div className="reveal lg:col-span-2 space-y-3">
            {details.map(item => {
              const inner = (
                <>
                  <span className="contact-card-icon">
                    <Icon path={item.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-[#0F1729] break-words">
                      {item.value}
                    </span>
                  </span>
                </>
              );
              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  className="contact-card"
                >
                  {inner}
                </a>
              ) : (
                <div key={item.label} className="contact-card is-static">{inner}</div>
              );
            })}

            <div className="rounded-2xl bg-[#072069] p-6 text-white">
              <h3 className="font-bold">Prefer to talk now?</h3>
              <p className="mt-1.5 text-sm text-white/75">
                Call us during business hours and speak to the team directly.
              </p>
              <a href={`tel:${PHONE_TEL}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#072069] transition-transform hover:-translate-y-0.5">
                <Icon path={ICONS.phone} className="h-4.5 w-4.5" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP ── */}
      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal overflow-hidden rounded-2xl border border-border shadow-sm">
            <iframe
              src={MAP_EMBED}
              title="Leafclutch Technologies office location in Siddharthanagar, Rupandehi"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-95 w-full border-0 lg:h-110"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAdmin, type Member } from '@/app/context/AdminContext';
import { useRevealAll } from '@/app/hooks/useReveal';

const heroImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=80';

const stats = [
  { value: '5+', label: 'Years Experience' },
  { value: '5+', label: 'Projects Delivered' },
  { value: '10+', label: 'Team Members' },
  { value: '2', label: 'Countries Served' },
];

const values = [
  { label: 'Innovation', icon: <path d="M9 18h6M10 22h4M12 2a6 6 0 00-4 10.5c.6.55 1 1.32 1 2.5h6c0-1.18.4-1.95 1-2.5A6 6 0 0012 2z" /> },
  { label: 'Trust & Transparency', icon: <path d="M11 21l-6.5-3.7a2 2 0 01-1-1.74V6.4a2 2 0 011-1.73L11 1l6.5 3.67a2 2 0 011 1.73v9.16a2 2 0 01-1 1.74L11 21z M8 11l2.2 2.2L15 8.5" /> },
  { label: 'Quality & Excellence', icon: <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8z" /> },
  { label: 'Collaboration', icon: <><circle cx="8" cy="8" r="3.2" /><circle cx="16.5" cy="9" r="2.6" /><path d="M2.5 20c0-3.3 2.5-5.8 5.5-5.8S13.5 16.7 13.5 20" /><path d="M13.8 14.6c2.3.3 4.2 2.3 4.2 5.4" /></> },
];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M6 9v9M6 6.5v.01M10 18v-5a3 3 0 016 0v5M10 9v9" />
      <path d="M10 12a3 3 0 016 0v6" />
    </svg>
  );
}

function MemberPhoto({ member, className = '' }: { member: Member; className?: string }) {
  return member.photo ? (
    <img src={member.photo} alt={member.name} className={`h-full w-full object-cover ${className}`} />
  ) : (
    <div className={`h-full w-full flex items-center justify-center bg-linear-to-br from-[#0EA5E9]/15 to-[#072069]/15 text-[#072069] text-4xl font-extrabold ${className}`}>
      {member.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function FounderCard({ member }: { member: Member }) {
  return (
    <div className="reveal">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-secondary shadow-sm">
        <MemberPhoto member={member} />
      </div>
      <h3 className="mt-5 text-xl font-extrabold text-[#0F1729]">{member.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
    </div>
  );
}

function TeamCard({ member }: { member: Member }) {
  return (
    <div className="reveal text-center">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-secondary shadow-sm">
        <MemberPhoto member={member} />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#072069]">{member.name}</h3>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mt-1">{member.role}</p>
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-[#072069] transition-colors">
          <LinkedInIcon /> LinkedIn
        </a>
      )}
    </div>
  );
}

function InternCard({ member }: { member: Member }) {
  return (
    <div className="reveal bg-white rounded-2xl border border-border p-4 text-center shadow-sm">
      <div className="aspect-square w-32 mx-auto rounded-xl overflow-hidden bg-secondary">
        <MemberPhoto member={member} />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#072069]">{member.name}</h3>
      <p className="text-xs font-semibold text-accent mt-0.5">{member.role}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mt-1">Internship Program</p>
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-[#072069] transition-colors">
          <LinkedInIcon /> LinkedIn Profile
        </a>
      )}
    </div>
  );
}

export default function AboutPage() {
  useRevealAll();
  const { members } = useAdmin();
  const founders = members.filter(m => m.type === 'founder').sort((a, b) => a.order - b.order);
  const teamMembers = members.filter(m => m.type === 'team').sort((a, b) => a.order - b.order);
  const interns = members.filter(m => m.type === 'intern').sort((a, b) => a.order - b.order);
  const [internsOpen, setInternsOpen] = useState(false);

  const toggleInterns = () => {
    if (internsOpen) {
      setInternsOpen(false);
      return;
    }
    setInternsOpen(true);
    requestAnimationFrame(() => {
      document.getElementById('intern-team')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: '46vh' }}>
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-b from-[#050b1c]/85 via-[#0b1c3f]/80 to-[#050b1c]/90" />
        <div className="relative z-10 px-6 pt-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">Leafclutch Technologies Pvt. Ltd.</h1>
          <p className="mt-4 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-white/80">About Us</p>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="pt-16 pb-10 lg:pt-20 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="reveal-left">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#3BE3A0]">Who We Are</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#072069] mt-3 leading-tight">A Team of Passionate<br />Technologists</h2>
            <p className="text-[#676F7E] mt-5 leading-relaxed">
              Founded with a vision to bridge the gap between cutting-edge technology and practical business needs, Leafclutch Technologies Pvt. Ltd. has grown into a trusted partner for organizations worldwide.
            </p>
            <p className="text-[#676F7E] mt-4 leading-relaxed">
              Our diverse team brings together expertise in software engineering, artificial intelligence, data science, and cloud infrastructure. We combine technical excellence with deep industry knowledge to deliver solutions that create real value.
            </p>
            <p className="text-[#676F7E] mt-4 leading-relaxed">
              From startups seeking their first product to enterprises modernizing legacy systems, we&apos;ve helped organizations of all sizes achieve their digital transformation goals.
            </p>
          </div>
          <div className="reveal-right bg-[#F1F5FB] rounded-3xl p-8 sm:p-10">
            <div className="grid grid-cols-2 gap-8">
              {stats.map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#072069]">{stat.value}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── IDENTITY / VISION & VALUES ── */}
      <section className="about-identity pb-16 lg:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl lg:text-4xl font-extrabold text-[#072069] reveal">Our Identity,<br />Vision and Values</h2>

          <div className="about-identity-banner reveal">
            {values.map(value => (
              <div key={value.label} className="about-identity-value">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{value.icon}</svg>
                <span>{value.label}</span>
              </div>
            ))}
          </div>

          <div className="about-identity-card reveal">
            <div>
              <span className="about-identity-card-kicker">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                </svg>
                Vision
              </span>
              <p>To be the global leader in ethical AI and software solutions, recognized for our commitment to innovation, quality, and positive societal impact.</p>
            </div>
            <div className="about-identity-card-divider" />
            <div>
              <span className="about-identity-card-kicker">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                </svg>
                Mission
              </span>
              <p>To empower businesses with intelligent, scalable, and responsible technology solutions that drive measurable growth and competitive advantage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDERS ── */}
      {founders.length > 0 && (
        <section className="pb-16 lg:pb-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
            <div className="text-center max-w-xl mx-auto reveal">
              <span className="section-badge">Founders</span>
              <p className="text-[#676F7E] mt-4">A dedicated group of AI engineers, developers, and automation specialists committed to transforming how businesses operate.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 sm:gap-10 max-w-2xl mx-auto mt-12">
              {founders.map(member => <FounderCard key={member.id} member={member} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TEAM MEMBERS ── */}
      {teamMembers.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl lg:text-4xl font-extrabold text-[#072069] reveal">Our Team Members</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mt-12">
              {teamMembers.map(member => <TeamCard key={member.id} member={member} />)}
            </div>
            {interns.length > 0 && (
              <div className="text-center mt-12 reveal">
                <button type="button" onClick={toggleInterns} className="btn-navy px-7 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
                  Our Intern Team <b>{internsOpen ? '↑' : '→'}</b>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── INTERN TEAM ── */}
      {interns.length > 0 && internsOpen && (
        <section id="intern-team" className="pb-20 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center reveal">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#072069]">Our Intern Team</h2>
              <p className="text-[#676F7E] mt-3">The talented individuals shaping the future of Leafclutch.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-3xl mx-auto mt-10">
              {interns.map(member => <InternCard key={member.id} member={member} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

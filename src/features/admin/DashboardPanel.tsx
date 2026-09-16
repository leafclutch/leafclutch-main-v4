'use client';

import { useAdmin } from '@/app/context/AdminContext';
import { relativeTime } from './shared';
import { IconProducts, IconCheckCircle, IconTestimonials, IconMembers } from './icons';

export default function DashboardPanel({ onNavigate }: { onNavigate: (tab: 'services' | 'testimonials' | 'members') => void }) {
  const { services, testimonials, members } = useAdmin();

  const publishedServices = services.filter(s => s.status === 'active').length;

  const cards = [
    { label: 'Total Products', value: services.length, icon: <IconProducts />, tone: 'from-cyan-400 to-[#072069]', onClick: () => onNavigate('services') },
    { label: 'Published Products', value: publishedServices, icon: <IconCheckCircle />, tone: 'from-[#3BE3A0] to-[#0EA5E9]', onClick: () => onNavigate('services') },
    { label: 'Total Testimonials', value: testimonials.length, icon: <IconTestimonials />, tone: 'from-[#3B82F6] to-[#072069]', onClick: () => onNavigate('testimonials') },
    { label: 'Total Members', value: members.length, icon: <IconMembers />, tone: 'from-[#0EA5E9] to-[#11A4D4]', onClick: () => onNavigate('members') },
  ];

  const recentServices = [...services].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Overview</p>
        <h2 className="text-2xl font-bold text-foreground mt-1">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">A quick snapshot of your website content.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <button key={card.label} type="button" onClick={card.onClick} className="text-left bg-white rounded-2xl p-5 border border-border hover:shadow-md hover:border-accent/40 transition-all">
            <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${card.tone} flex items-center justify-center text-white mb-3`}>
              {card.icon}
            </div>
            <p className="text-3xl font-extrabold text-foreground">{card.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{card.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="font-bold text-foreground mb-4">Recent Updates</h3>
        {recentServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing updated yet.</p>
        ) : (
          <div className="space-y-1">
            {recentServices.map(service => (
              <div key={service.id} className="flex items-center gap-3 py-2.5 border-b border-[#F3F4F7] last:border-0">
                <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm shrink-0 overflow-hidden">
                  {service.iconImage ? <img src={service.iconImage} alt="" className="h-full w-full object-cover" /> : service.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{service.title}</p>
                  <p className="text-xs text-muted-foreground">Product content updated</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{relativeTime(service.updatedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useAdmin } from '@/app/context/AdminContext';
import { StatusPill, relativeTime } from './shared';

export default function ServicesPanel({ onEdit, onAddNew }: { onEdit: (id: string) => void; onAddNew: () => void }) {
  const { services } = useAdmin();

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Content Studio</p>
          <h2 className="text-2xl font-bold text-foreground mt-1">Product pages</h2>
          <p className="text-sm text-muted-foreground mt-1">Edit the content, images and features that power each product page.</p>
        </div>
        <button type="button" onClick={onAddNew} className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl">+ Add New Product</button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border bg-[#F8FAFC]">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last Updated</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="border-b border-[#F3F4F7] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {service.heroImage ? (
                        <img src={service.heroImage} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 bg-secondary" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
                      ) : service.iconImage ? (
                        <img src={service.iconImage} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0 bg-secondary" />
                      ) : (
                        <div className="w-11 h-11 rounded-lg shrink-0 bg-secondary flex items-center justify-center text-lg">{service.icon}</div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{service.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-72">{service.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusPill active={service.status === 'active'} /></td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{relativeTime(service.updatedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => onEdit(service.id)} className="text-accent hover:text-[#072069] text-xs font-semibold border border-accent/30 hover:border-accent rounded-lg px-3 py-1.5 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

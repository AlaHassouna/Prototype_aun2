import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, rsvpApi } from '../../services/api';

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-navy-800 border border-gold/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-gold/50 text-sm uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-4xl font-serif text-gold">{value ?? '—'}</p>
      {sub && <p className="text-gold/40 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { data: stats } = useQuery({ queryKey: ['analytics'], queryFn: () => analyticsApi.summary().then(r => r.data) });
  const { data: rsvp  } = useQuery({ queryKey: ['rsvp-stats'], queryFn: () => rsvpApi.stats().then(r => r.data) });

  return (
    <div>
      <h1 className="font-serif text-3xl text-gold mb-8">Tableau de bord</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="✉️" label="Inscriptions RSVP" value={rsvp?.total} sub={`Aujourd'hui: ${rsvp?.today ?? 0}`} />
        <StatCard icon="👥" label="Total invités"    value={rsvp?.totalGuests} />
        <StatCard icon="👁️" label="Vues de page"     value={stats?.pageviews} />
        <StatCard icon="📅" label="RSVP aujourd'hui" value={rsvp?.today} />
      </div>

      {/* Recent RSVP activity */}
      {rsvp?.byDay?.length > 0 && (
        <div className="bg-navy-800 border border-gold/20 rounded-xl p-6">
          <h2 className="text-gold/70 text-sm uppercase tracking-widest mb-4">RSVP par jour (14 derniers jours)</h2>
          <div className="flex items-end gap-2 h-24">
            {rsvp.byDay.slice(0, 14).reverse().map(d => (
              <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div className="w-full bg-gold rounded-t" style={{ height: `${Math.min(d.count * 10, 80)}px` }} />
                <span className="text-gold/30 text-xs truncate w-full text-center">{d.date?.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

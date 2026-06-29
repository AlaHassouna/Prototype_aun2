import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rsvpApi } from '../../services/api';
import toast from 'react-hot-toast';

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function RSVP() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const { data } = useQuery({
    queryKey: ['rsvp-list', search, page],
    queryFn: () => rsvpApi.getAll({ search, page, limit: 20 }).then(r => r.data),
  });
  const { data: stats } = useQuery({ queryKey: ['rsvp-stats'], queryFn: () => rsvpApi.stats().then(r => r.data) });

  const remove = useMutation({
    mutationFn: rsvpApi.remove,
    onSuccess: () => { toast.success('Supprimé'); qc.invalidateQueries(['rsvp-list']); qc.invalidateQueries(['rsvp-stats']); },
  });

  const exportExcel = async () => {
    try { const r = await rsvpApi.exportExcel(); download(r.data, 'rsvp.xlsx'); }
    catch { toast.error('Erreur export'); }
  };
  const exportCsv = async () => {
    try { const r = await rsvpApi.exportPdf(); download(r.data, 'rsvp.csv'); }
    catch { toast.error('Erreur export'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-gold">Inscriptions RSVP</h1>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="px-4 py-2 border border-gold/30 text-gold/70 text-sm rounded-lg hover:border-gold hover:text-gold transition-colors">Excel</button>
          <button onClick={exportCsv}   className="px-4 py-2 border border-gold/30 text-gold/70 text-sm rounded-lg hover:border-gold hover:text-gold transition-colors">CSV</button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: stats?.total },
          { label: 'Invités',  value: stats?.totalGuests },
          { label: "Aujourd'hui", value: stats?.today },
        ].map(s => (
          <div key={s.label} className="bg-navy-800 border border-gold/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-serif text-gold">{s.value ?? '—'}</p>
            <p className="text-xs text-gold/40 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        placeholder="Rechercher par nom ou email..."
        className="w-full bg-navy-800 border border-gold/20 rounded-lg px-4 py-2 text-gold text-sm mb-4 focus:outline-none focus:border-gold/50" />

      {/* Table */}
      <div className="bg-navy-800 border border-gold/20 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10">
              {['Nom','Email','Invités','Message','Date','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gold/40 text-xs uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.data || []).map(r => (
              <tr key={r.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-4 py-3 text-gold">{r.name}</td>
                <td className="px-4 py-3 text-gold/60">{r.email}</td>
                <td className="px-4 py-3 text-gold text-center">{r.guests}</td>
                <td className="px-4 py-3 text-gold/50 max-w-[180px] truncate">{r.message}</td>
                <td className="px-4 py-3 text-gold/40 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove.mutate(r.id)} className="text-red-400/50 hover:text-red-400 text-xs transition-colors">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data?.data?.length) && <p className="text-center py-10 text-gold/30">Aucune inscription</p>}
      </div>

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-gold text-navy' : 'border border-gold/20 text-gold/50 hover:border-gold/50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

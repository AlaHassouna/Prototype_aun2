import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { settingsApi, authApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { data, refetch } = useQuery({ queryKey: ['settings-admin'], queryFn: () => settingsApi.getAll().then(r => r.data) });
  const [vals, setVals] = useState({});
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });

  useEffect(() => {
    if (data) {
      const flat = {};
      Object.values(data).flat().forEach(s => { flat[s.key] = s.value || ''; });
      setVals(flat);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => settingsApi.updateAll(vals),
    onSuccess: () => { toast.success('Paramètres sauvegardés'); refetch(); },
    onError:   () => toast.error('Erreur'),
  });

  const changePwd = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.newPwd }),
    onSuccess: () => { toast.success('Mot de passe modifié'); setPwd({ current: '', newPwd: '', confirm: '' }); },
    onError: e => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const handlePwd = e => {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }
    changePwd.mutate();
  };

  if (!data) return <div className="text-gold/50">Chargement...</div>;

  const groups = {};
  Object.values(data).flat().forEach(s => { (groups[s.group] = groups[s.group] || []).push(s); });
  const GROUP_LABELS = { general: 'Général', event: 'Événement', theme: 'Thème', media: 'Médias' };

  return (
    <div>
      <h1 className="font-serif text-3xl text-gold mb-8">Paramètres</h1>
      <div className="space-y-6 max-w-2xl">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="bg-navy-800 border border-gold/20 rounded-xl p-6">
            <h2 className="text-gold/60 text-xs uppercase tracking-widest mb-4">{GROUP_LABELS[group] || group}</h2>
            <div className="space-y-4">
              {items.map(s => (
                <div key={s.key}>
                  <label className="block text-gold/50 text-xs mb-1">{s.label}</label>
                  <input value={vals[s.key] ?? ''} onChange={e => setVals(v => ({ ...v, [s.key]: e.target.value }))}
                    className="w-full bg-navy border border-gold/20 rounded-lg px-4 py-2 text-gold text-sm focus:outline-none focus:border-gold/50" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={() => save.mutate()} disabled={save.isPending}
          className="px-10 py-3 bg-gold text-navy font-semibold text-sm uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50">
          {save.isPending ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </button>

        {/* Change password */}
        <div className="bg-navy-800 border border-gold/20 rounded-xl p-6">
          <h2 className="text-gold/60 text-xs uppercase tracking-widest mb-4">Changer le mot de passe</h2>
          <form onSubmit={handlePwd} className="space-y-4">
            {[['current','Mot de passe actuel'],['newPwd','Nouveau mot de passe'],['confirm','Confirmer']].map(([k,l]) => (
              <div key={k}>
                <label className="block text-gold/50 text-xs mb-1">{l}</label>
                <input type="password" required value={pwd[k]} onChange={e => setPwd(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-navy border border-gold/20 rounded-lg px-4 py-2 text-gold text-sm focus:outline-none focus:border-gold/50" />
              </div>
            ))}
            <button type="submit" disabled={changePwd.isPending}
              className="px-8 py-2 bg-navy border border-gold/30 text-gold/70 text-sm rounded-lg hover:border-gold hover:text-gold transition-colors disabled:opacity-50">
              {changePwd.isPending ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

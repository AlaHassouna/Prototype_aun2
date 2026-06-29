import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const emptyForm = { name: '', email: '', password: '', role: 'editor' };

export default function Users() {
  const { user: me } = useAuthStore();
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [show, setShow] = useState(false);

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) });

  const create = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { toast.success('Utilisateur créé'); qc.invalidateQueries(['users']); setShow(false); setForm(emptyForm); },
    onError: e => toast.error(e.response?.data?.error || 'Erreur'),
  });
  const remove = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => qc.invalidateQueries(['users']),
    onError: () => toast.error('Erreur suppression'),
  });

  const ROLE_BADGE = { superadmin: 'bg-gold/20 text-gold', admin: 'bg-blue-900/50 text-blue-300', editor: 'bg-navy-700 text-gold/50' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-gold">Utilisateurs</h1>
        {me?.role === 'superadmin' && (
          <button onClick={() => setShow(s => !s)}
            className="px-6 py-2 bg-gold text-navy text-sm font-semibold uppercase tracking-widest hover:bg-gold-light transition-colors">
            + Nouveau
          </button>
        )}
      </div>

      {show && (
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }}
          className="bg-navy-800 border border-gold/20 rounded-xl p-6 mb-6 grid md:grid-cols-2 gap-4">
          {[['name','Nom'],['email','Email'],['password','Mot de passe']].map(([k,l]) => (
            <div key={k}>
              <label className="block text-gold/50 text-xs mb-1">{l}</label>
              <input type={k === 'password' ? 'password' : 'text'} required value={form[k]}
                onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full bg-navy border border-gold/20 rounded-lg px-3 py-2 text-gold text-sm focus:outline-none focus:border-gold/50" />
            </div>
          ))}
          <div>
            <label className="block text-gold/50 text-xs mb-1">Rôle</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-navy border border-gold/20 rounded-lg px-3 py-2 text-gold text-sm focus:outline-none focus:border-gold/50">
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" disabled={create.isPending}
              className="px-8 py-2 bg-gold text-navy text-sm font-semibold uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50">
              Créer
            </button>
            <button type="button" onClick={() => setShow(false)}
              className="px-4 py-2 border border-gold/20 text-gold/50 text-sm rounded-lg">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="bg-navy-800 border border-gold/20 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10">
              {['Nom','Email','Rôle','Date','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gold/40 text-xs uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gold/5 hover:bg-gold/5">
                <td className="px-4 py-3 text-gold">{u.name}</td>
                <td className="px-4 py-3 text-gold/60">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-gold/40">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  {me?.role === 'superadmin' && u.id !== me?.id && (
                    <button onClick={() => remove.mutate(u.id)} className="text-red-400/50 hover:text-red-400 text-xs">Supprimer</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

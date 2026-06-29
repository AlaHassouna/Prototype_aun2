import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Identifiants incorrects');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-gold">Administration</h1>
          <p className="text-gold/50 mt-2 text-sm">Connexion au panneau de gestion</p>
        </div>
        <form onSubmit={submit} className="bg-navy-800 border border-gold/20 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-gold/60 text-xs uppercase tracking-widest mb-2">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-navy border border-gold/20 rounded-lg px-4 py-3 text-gold focus:outline-none focus:border-gold/60" />
          </div>
          <div>
            <label className="block text-gold/60 text-xs uppercase tracking-widest mb-2">Mot de passe</label>
            <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-navy border border-gold/20 rounded-lg px-4 py-3 text-gold focus:outline-none focus:border-gold/60" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gold text-navy font-semibold uppercase tracking-widest hover:bg-gold-light transition-colors disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

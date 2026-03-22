import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — in production, call apiLogin
    login({ id: '1', email, name: email.split('@')[0], treeId: 'tree1', isPremium: false });
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg)' }}>
      <div className="card card-elevated animate-slide" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="avatar avatar-lg" style={{ margin: '0 auto 16px' }}>C</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>Bon retour !</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Connectez-vous à votre famille</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label><Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
          </div>
          <div className="input-group">
            <label><Lock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>Se connecter</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Pas encore de compte ? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: Date.now().toString(), email, name, treeId: 'tree_' + Date.now(), isPremium: false });
    navigate('/onboarding');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg)' }}>
      <div className="card card-elevated animate-slide" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="avatar avatar-lg" style={{ margin: '0 auto 16px' }}>C</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>Créer votre famille</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Rejoignez Confamily gratuitement</p>
        </div>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label><User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Nom complet</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" required />
          </div>
          <div className="input-group">
            <label><Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
          </div>
          <div className="input-group">
            <label><Lock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mot de passe</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 caractères" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>Créer mon compte</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

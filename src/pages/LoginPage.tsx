import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import * as API from '../api/googleAPI';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { loginWithCredentials, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { clearError(); }, [clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginWithCredentials(email, password);
    if (success) navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg)' }}>
      <div className="card card-elevated animate-slide" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/Confamily/logo.png" alt="Confamily Logo" style={{ display: 'block', width: 80, height: 80, borderRadius: 16, objectFit: 'cover', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>Bon retour !</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Connectez-vous à votre famille</p>
        </div>

        {error && <div style={{ background: '#fce8e8', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label><Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required disabled={isLoading} />
          </div>
          <div className="input-group">
            <label><Lock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required disabled={isLoading} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
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
  const [inviteData, setInviteData] = useState<{ code: string; name?: string } | null>(null);
  const [resolvingInvite, setResolvingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const { registerWithCredentials, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { clearError(); }, [clearError]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('invite');
    if (code) {
      setResolvingInvite(true);
      API.resolveInvite(code).then(res => {
        if (res.success) {
          const prefillName = [res.prefill?.firstName, res.prefill?.lastName].filter(Boolean).join(' ');
          setInviteData({ code, name: prefillName });
          if (prefillName) setName(prefillName);
        } else {
          setInviteError(res.error || 'Invitation invalide ou expirée');
        }
      }).catch(() => {
        setInviteError('Impossible de vérifier l\'invitation');
      }).finally(() => setResolvingInvite(false));
    }
  }, [location.search]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await registerWithCredentials(name, email, password, inviteData?.code);
    if (success) navigate('/onboarding');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg)' }}>
      <div className="card card-elevated animate-slide" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/Confamily/logo.png" alt="Confamily Logo" style={{ display: 'block', width: 80, height: 80, borderRadius: 16, objectFit: 'cover', margin: '0 auto 16px' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
            {inviteData ? 'Rejoindre votre famille' : 'Créer votre famille'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {inviteData ? 'Vous avez été invité(e) sur Confamily' : 'Rejoignez Confamily gratuitement'}
          </p>
        </div>

        {resolvingInvite && <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>Vérification de l'invitation...</div>}
        
        {inviteError && <div style={{ background: '#fce8e8', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{inviteError}</div>}
        
        {error && <div style={{ background: '#fce8e8', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        {!resolvingInvite && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label><User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Nom complet</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom" required disabled={isLoading || !!(inviteData && inviteData.name)} />
            </div>
            <div className="input-group">
              <label><Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required disabled={isLoading} />
            </div>
            <div className="input-group">
              <label><Lock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mot de passe</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 caractères" required minLength={6} disabled={isLoading} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }} disabled={isLoading || !!inviteError}>
              {isLoading ? 'Création en cours...' : (inviteData ? 'Rejoindre' : 'Créer mon compte')}
            </button>
          </form>
        )}
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

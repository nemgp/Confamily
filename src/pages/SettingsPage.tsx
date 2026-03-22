import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { WhatsAppInvite } from '../components/Invite/WhatsAppInvite';
import { Moon, Sun, LogOut, User, Crown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SettingsPage() {
  const { user, darkMode, toggleDarkMode, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '32px' }}>Paramètres</h1>

      {/* Profile */}
      <div className="card" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="avatar avatar-lg">{user?.name?.charAt(0) || 'U'}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 700, marginBottom: '2px' }}>{user?.name || 'Utilisateur'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
        </div>
        {user?.isPremium && <span className="badge badge-premium"><Crown size={12} /> Premium</span>}
      </div>

      {/* Dark Mode */}
      <div className="card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={toggleDarkMode}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {darkMode ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--primary)" />}
          <div>
            <div style={{ fontWeight: 600 }}>Mode sombre</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{darkMode ? 'Activé' : 'Désactivé'}</div>
          </div>
        </div>
        <div style={{ width: '50px', height: '28px', borderRadius: '14px', background: darkMode ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'var(--transition)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: darkMode ? '25px' : '3px', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }} />
        </div>
      </div>

      {/* Premium */}
      {!user?.isPremium && (
        <Link to="/pricing" className="card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff', border: 'none', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Crown size={24} />
            <div>
              <div style={{ fontWeight: 700 }}>Passer en Premium</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Coffre-fort, impression d'arbre, membres illimités</div>
            </div>
          </div>
          <ChevronRight size={20} />
        </Link>
      )}

      {/* Invitations */}
      <div style={{ marginBottom: '16px' }}>
        <WhatsAppInvite />
      </div>

      {/* Logout */}
      <button className="btn btn-ghost btn-block" onClick={handleLogout} style={{ color: 'var(--danger)', justifyContent: 'center' }}>
        <LogOut size={18} /> Se déconnecter
      </button>
    </div>
  );
}

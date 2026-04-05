import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { WhatsAppInvite } from '../components/Invite/WhatsAppInvite';
import { Moon, Sun, LogOut, Crown, ChevronRight, Bell, Globe, Shield, Info, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function SettingsPage() {
  const { user, darkMode, toggleDarkMode, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('fr');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte et votre accès ? Cette action est irréversible.")) {
      setIsDeleting(true);
      try {
        const { deleteAccount } = await import('../api/googleAPI');
        const res = await deleteAccount();
        if (res.success) {
          logout();
          navigate('/');
        } else {
          alert("Erreur lors de la suppression du compte : " + res.error);
        }
      } catch (e) {
        alert("Erreur réseau");
      }
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '32px' }}>Paramètres</h1>

      {/* Profile */}
      <p style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Profil</p>
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="avatar avatar-lg">{user?.name?.charAt(0) || 'U'}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 700, marginBottom: '2px' }}>{user?.name || 'Utilisateur'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email || 'Non connecté'}</p>
        </div>
        {user?.isPremium && <span className="badge badge-premium"><Crown size={12} /> Premium</span>}
      </div>

      {/* Apparence */}
      <p style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Apparence</p>
      <div className="card" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={toggleDarkMode}>
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

      {/* Langue */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe size={20} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: 600 }}>Langue</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Langue de l'interface</div>
          </div>
        </div>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
          <option value="ar">🇸🇦 العربية</option>
          <option value="wo">🇸🇳 Wolof</option>
        </select>
      </div>

      {/* Notifications */}
      <p style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Notifications</p>
      <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setNotifications(n => !n)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={20} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: 600 }}>Notifications</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nouveaux messages et ajouts de membres</div>
          </div>
        </div>
        <div style={{ width: '50px', height: '28px', borderRadius: '14px', background: notifications ? 'var(--primary)' : 'var(--border)', position: 'relative', transition: 'var(--transition)' }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: notifications ? '25px' : '3px', transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }} />
        </div>
      </div>

      {/* Confidentialité */}
      <p style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Compte</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={20} color="var(--primary)" />
            <div style={{ fontWeight: 600 }}>Membres de l'arbre</div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={20} color="var(--primary)" />
            <div style={{ fontWeight: 600 }}>Confidentialité & Données</div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info size={20} color="var(--primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>À propos de Confamily</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Version 1.0.0</div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* Premium upgrade */}
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

      {/* Logout & Delete */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="btn btn-ghost btn-block" onClick={handleLogout} style={{ color: 'var(--text-secondary)', justifyContent: 'center' }}>
          <LogOut size={18} /> Se déconnecter
        </button>
        <button className="btn btn-outline btn-block" onClick={handleDeleteAccount} disabled={isDeleting} style={{ color: 'var(--danger)', borderColor: 'var(--danger)', justifyContent: 'center' }}>
          {isDeleting ? 'Suppression en cours...' : 'Supprimer mon compte'}
        </button>
      </div>
    </div>
  );
}

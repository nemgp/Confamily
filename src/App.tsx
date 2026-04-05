import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FamilyTreeViewer } from './components/FamilyTree/FamilyTreeViewer';
import { MemberDetails } from './components/FamilyTree/MemberDetails';
import { PrintTree } from './components/FamilyTree/PrintTree';
import { MessagesView } from './components/Messages/MessagesView';
import { OnboardingView } from './components/Onboarding/OnboardingView';
import { LandingPage } from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { VaultPage } from './pages/VaultPage';
import { PricingPage } from './pages/PricingPage';
import { useFamilyStore } from './store/familyStore';
import { useAuthStore } from './store/authStore';
import { MessageSquare, Settings, Lock, Crown, TreePine, List, LayoutGrid, MapPin, Briefcase, Calendar, Moon, Sun, Share2, Plus, UserPlus } from 'lucide-react';

function Sidebar() {
  const loc = useLocation();
  const path = loc.pathname;
  const { darkMode, toggleDarkMode } = useAuthStore();

  const links = [
    { to: '/dashboard', icon: TreePine, label: 'Arbre' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/vault', icon: Lock, label: 'Coffre' },
    { to: '/pricing', icon: Crown, label: 'Premium' },
    { to: '/settings', icon: Settings, label: 'Réglages' },
  ];

  const shareWhatsApp = () => {
    const link = window.location.origin + window.location.pathname + '#/register';
    const msg = `🌳 Rejoins notre arbre généalogique familial sur Confamily ! Inscris-toi ici : ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <nav className="sidebar">
      <Link to="/dashboard" className="sidebar-logo" style={{ background: 'transparent', padding: 0 }}>
        <img src="/Confamily/logo.png" alt="Confamily" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
      </Link>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${path === l.to ? 'active' : ''}`} title={l.label}>
          <l.icon size={22} />
        </Link>
      ))}

      {/* Bottom shortcuts */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px' }}>
        <button className="sidebar-link" title="Inviter via WhatsApp" onClick={shareWhatsApp} style={{ color: '#25D366' }}>
          <Share2 size={22} />
        </button>
        <button className="sidebar-link" title={darkMode ? 'Mode clair' : 'Mode sombre'} onClick={toggleDarkMode}>
          {darkMode ? <Sun size={22} color="#f39c12" /> : <Moon size={22} />}
        </button>
      </div>
    </nav>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, position: 'relative', overflow: 'auto' }} className="main-with-sidebar">
        {children}
      </main>
    </div>
  );
}

const getAvatarUrl = (gender?: 'M' | 'F', photoUrl?: string) => {
  return photoUrl || (gender === 'F' 
    ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria&mouth=smile&hair=longHairStraight&backgroundColor=ffdfbf' 
    : 'https://api.dicebear.com/9.x/avataaars/svg?seed=Robert&mouth=smile&facialHair=beardLight&backgroundColor=b6e3f4');
};

function ListView() {
  const { nodes, selectMember } = useFamilyStore();
  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '16px' }}>Membres de la famille</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {nodes.map(n => (
          <div key={n.id} className="card" onClick={() => selectMember(n.id)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', cursor: 'pointer' }}>
            <img src={getAvatarUrl(n.data.gender, n.data.photoUrl)} alt={n.data.firstName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{n.data.firstName} {n.data.lastName}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {n.data.birthDate && <span><Calendar size={12} /> {n.data.birthDate}</span>}
                {n.data.location && <span><MapPin size={12} /> {n.data.location}</span>}
                {n.data.profession && <span><Briefcase size={12} /> {n.data.profession}</span>}
              </div>
            </div>
            <span className="badge badge-primary">{n.data.relation}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridView() {
  const { nodes, selectMember } = useFamilyStore();
  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '16px' }}>Membres de la famille</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {nodes.map(n => (
          <div key={n.id} className="card" onClick={() => selectMember(n.id)} style={{ textAlign: 'center', cursor: 'pointer', padding: '24px 16px' }}>
            <img src={getAvatarUrl(n.data.gender, n.data.photoUrl)} alt={n.data.firstName} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{n.data.firstName}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{n.data.lastName}</div>
            <span className="badge badge-primary">{n.data.relation}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyTreeState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px',
      background: 'var(--bg)'
    }}>
      <div style={{
        fontSize: '5rem', marginBottom: '20px',
        animation: 'float 4s ease-in-out infinite'
      }}>🌳</div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>
        Construisez votre arbre familial
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.7, marginBottom: '32px' }}>
        Commencez par vous ajouter, puis invitez vos parents, frères et sœurs, enfants...
        Votre histoire familiale commence ici.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={onAdd}>
          <UserPlus size={20} /> Ajouter le premier membre
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ou invitez vos proches via WhatsApp ↗</p>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'grid'>('tree');
  const { nodes, openAddModal, syncWithBackend, isSyncing, syncError } = useFamilyStore();
  const modes: { key: 'tree' | 'list' | 'grid'; icon: typeof TreePine; label: string }[] = [
    { key: 'tree', icon: TreePine, label: 'Arbre' },
    { key: 'list', icon: List, label: 'Liste' },
    { key: 'grid', icon: LayoutGrid, label: 'Grille' },
  ];

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  const isEmpty = nodes.length === 0;

  return (
    <AppLayout>
      {isSyncing && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,247,242,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: 200, height: 24, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 150, height: 16, borderRadius: 8 }} />
          </div>
        </div>
      )}
      
      {syncError && <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#fce8e8', color: '#e74c3c', padding: '12px 24px', borderRadius: 8, zIndex: 60, boxShadow: 'var(--shadow-md)' }}>{syncError}</div>}

      {/* Top toolbar */}
      {!isEmpty && (
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5, display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: 'var(--radius-full)', padding: '4px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => setViewMode(m.key)}
              className={`btn btn-sm ${viewMode === m.key ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}
              title={m.label}
            >
              <m.icon size={16} /> <span className="hide-mobile">{m.label}</span>
            </button>
          ))}
        </div>
      )}
      {/* PrintTree masqué sur mobile pour éviter le chevauchement */}
      {!isEmpty && (
        <div className="hide-mobile" style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 5 }}>
          <PrintTree />
        </div>
      )}

      {isEmpty ? (
        <EmptyTreeState onAdd={() => openAddModal('moi')} />
      ) : (
        <>
          {viewMode === 'tree' && (
            <>
              <FamilyTreeViewer />
              <MemberDetails />
            </>
          )}
          {viewMode === 'list' && <ListView />}
          {viewMode === 'grid' && <GridView />}

          {/* FAB — icône seule sur mobile, texte complet sur desktop */}
          <button
            className="btn btn-primary fab-add-btn"
            onClick={() => {
               if (nodes.length === 0) openAddModal('moi');
               else openAddModal('enfant');
            }}
            title="Ajouter un membre"
          >
            <Plus size={20} />
            <span className="fab-label">Ajouter un membre</span>
          </button>
        </>
      )}
    </AppLayout>
  );
}

function MessagesPage() {
  return (
    <AppLayout>
      <MessagesView />
    </AppLayout>
  );
}

function VaultPageWrapper() {
  return (
    <AppLayout>
      <VaultPage />
    </AppLayout>
  );
}

function PricingPageWrapper() {
  return (
    <AppLayout>
      <PricingPage />
    </AppLayout>
  );
}

function SettingsPageWrapper() {
  return (
    <AppLayout>
      <SettingsPage />
    </AppLayout>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingView />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/vault" element={<VaultPageWrapper />} />
        <Route path="/pricing" element={<PricingPageWrapper />} />
        <Route path="/settings" element={<SettingsPageWrapper />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

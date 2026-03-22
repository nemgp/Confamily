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
import { MessageSquare, Users, Settings, Lock, Crown, TreePine } from 'lucide-react';

function Sidebar() {
  const loc = useLocation();
  const path = loc.pathname;

  const links = [
    { to: '/dashboard', icon: TreePine, label: 'Arbre' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/vault', icon: Lock, label: 'Coffre' },
    { to: '/pricing', icon: Crown, label: 'Premium' },
    { to: '/settings', icon: Settings, label: 'Réglages' },
  ];

  return (
    <nav className="sidebar">
      <Link to="/dashboard" className="sidebar-logo">C</Link>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${path === l.to ? 'active' : ''}`} title={l.label}>
          <l.icon size={22} />
        </Link>
      ))}
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

function DashboardPage() {
  return (
    <AppLayout>
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 5 }}>
        <PrintTree />
      </div>
      <FamilyTreeViewer />
      <MemberDetails />
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

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { FamilyTreeViewer } from './components/FamilyTree/FamilyTreeViewer';
import { MemberDetails } from './components/FamilyTree/MemberDetails';
import { MessagesView } from './components/Messages/MessagesView';
import { OnboardingView } from './components/Onboarding/OnboardingView';
import { MessageSquare, Users, Settings } from 'lucide-react';

function Dashboard() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar Navigation */}
      <nav style={{
        width: '80px',
        background: 'var(--surface-color)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 0',
        gap: '2rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '20px', 
          background: 'var(--primary-color)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          marginBottom: '2rem'
        }}>
          C
        </div>
        
        <Link to="/dashboard" style={{ color: 'var(--primary-color)' }}>
          <Users size={28} />
        </Link>
        <Link to="/messages" style={{ color: 'var(--text-muted)' }}>
          <MessageSquare size={28} />
        </Link>
        <div style={{ marginTop: 'auto' }}>
          <Settings size={28} color="var(--text-muted)" />
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative' }}>
        <FamilyTreeViewer />
        <MemberDetails />
      </main>
    </div>
  );
}

function MessagesLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <nav style={{ width: '80px', background: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', gap: '2rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '2rem' }}>C</div>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)' }}><Users size={28} /></Link>
        <Link to="/messages" style={{ color: 'var(--primary-color)' }}><MessageSquare size={28} /></Link>
        <div style={{ marginTop: 'auto' }}><Settings size={28} color="var(--text-muted)" /></div>
      </nav>
      <main style={{ flex: 1, position: 'relative' }}>
        <MessagesView />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OnboardingView />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messages" element={<MessagesLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState } from 'react';
import { Send, Phone, Video, Search } from 'lucide-react';

const MOCK_CONTACTS = [
  { id: '2', name: 'Papa', online: true },
  { id: '3', name: 'Maman', online: false },
  { id: 'g1', name: 'Descendants de Confamily Senior', isGroup: true }
];

export function MessagesView() {
  const [selectedContact, setSelectedContact] = useState(MOCK_CONTACTS[0]);

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Liste des contacts */}
      <div style={{
        width: '320px',
        borderRight: '1px solid var(--border-color)',
        background: 'var(--surface-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0 }}>Messages</h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-color)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            marginTop: '1rem'
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              style={{ border: 'none', background: 'transparent', marginLeft: '10px', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {MOCK_CONTACTS.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedContact(c)}
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                background: selectedContact.id === c.id ? 'var(--bg-color)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div style={{
                width: '45px', height: '45px', borderRadius: '50%',
                background: c.isGroup ? 'var(--secondary-color)' : 'var(--primary-color)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {c.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {c.isGroup ? 'Groupe de branche' : (c.online ? 'En ligne' : 'Hors ligne')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
        {/* Header chat */}
        <div style={{
          padding: '1.5rem',
          background: 'var(--surface-color)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedContact.name}</div>
          </div>
          <div style={{ display: 'flex', gap: '15px', color: 'var(--primary-color)' }}>
            <Phone size={24} style={{ cursor: 'pointer' }} />
            <Video size={24} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Aujourd'hui
          </div>
          <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '15px 15px 15px 0', maxWidth: '60%', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            Bonjour ! J'ai ajouté une nouvelle photo de famille sur mon profil.
          </div>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '1rem', borderRadius: '15px 15px 0 15px', maxWidth: '60%', marginLeft: 'auto', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
            Super, je vais regarder ça tout de suite !
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '1.5rem', background: 'var(--surface-color)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-color)',
            padding: '0.8rem 1.5rem',
            borderRadius: '30px',
            gap: '15px'
          }}>
            <input 
              type="text" 
              placeholder="Écrivez votre message..." 
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem' }}
            />
            <button style={{
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Video, Search, Users as UsersIcon, ChevronLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import * as API from '../../api/googleAPI';
import { useFamilyStore } from '../../store/familyStore';
import { useAuthStore } from '../../store/authStore';

type Contact = { id: string; name: string; online?: boolean; isGroup?: boolean; lastMessage?: string; gender?: 'M' | 'F'; photoUrl?: string };
type Message = { id: string; from: string; content: string; time: string; mine: boolean };

const getAvatarUrl = (gender?: 'M' | 'F', photoUrl?: string) => {
  return photoUrl || (gender === 'F' 
    ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria&mouth=smile&hair=longHairStraight&backgroundColor=ffdfbf' 
    : 'https://api.dicebear.com/9.x/avataaars/svg?seed=Robert&mouth=smile&facialHair=beardLight&backgroundColor=b6e3f4');
};

export function MessagesView() {
  const { nodes } = useFamilyStore();
  const { user } = useAuthStore();
  const location = useLocation();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetContactId = params.get('contactId');

    API.getConversations().then(res => {
      if (res.success && res.conversations) {
        const cts: Contact[] = res.conversations.map(c => {
          let name = 'Utilisateur inconnu';
          let gender: 'M' | 'F' | undefined = undefined;
          let photoUrl = undefined;
          
          if (!c.isGroup) {
            const node = nodes.find(n => n.data.linkedUserId === c.contactId || n.id === c.contactId);
            if (node) {
              name = `${node.data.firstName} ${node.data.lastName}`;
              gender = node.data.gender;
              photoUrl = node.data.photoUrl;
            }
          } else {
            name = 'Groupe familial';
          }
          
          return {
            id: c.contactId,
            name,
            isGroup: c.isGroup,
            lastMessage: c.lastMessage,
            gender,
            photoUrl
          };
        });

        // Add dummy target if not in list
        if (targetContactId && !cts.find(c => c.id === targetContactId)) {
          const tNode = nodes.find(n => n.data.linkedUserId === targetContactId || n.id === targetContactId);
          if (tNode) {
            cts.unshift({
              id: targetContactId,
              name: `${tNode.data.firstName} ${tNode.data.lastName}`,
              gender: tNode.data.gender,
              photoUrl: tNode.data.photoUrl
            });
          }
        }

        setContacts(cts);
        
        // Auto-select
        if (targetContactId) {
           const target = cts.find(c => c.id === targetContactId);
           if (target) {
              setSelected(target);
              setMobileShowChat(true);
              setMessages([]);
              API.getMessages(target.id, target.isGroup ? target.id : undefined).then(mr => {
                if (mr.success && mr.messages) {
                  setMessages(mr.messages.map(m => {
                    const isMine = m.fromId === user?.id;
                    const senderNode = nodes.find(n => n.data.linkedUserId === m.fromId);
                    return {
                      id: m.id,
                      from: isMine ? 'Moi' : (senderNode ? senderNode.data.firstName : 'Ami'),
                      content: m.content,
                      time: new Date(m.timestamp).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
                      mine: isMine
                    };
                  }));
                }
              });
           }
        }
      }
    });
  }, [nodes, location.search, user?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectContact = async (c: Contact) => {
    setSelected(c);
    setMobileShowChat(true);
    setMessages([]); // clear while loading
    const res = await API.getMessages(c.id, c.isGroup ? c.id : undefined);
    if (res.success && res.messages) {
      setMessages(res.messages.map(m => {
        const isMine = m.fromId === user?.id;
        const senderNode = nodes.find(n => n.data.linkedUserId === m.fromId);
        return {
          id: m.id,
          from: isMine ? 'Moi' : (senderNode ? senderNode.data.firstName : 'Ami'),
          content: m.content,
          time: new Date(m.timestamp).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
          mine: isMine
        };
      }));
    }
  };

  const send = async () => {
    if (!input.trim() || !selected) return;
    const content = input;
    setInput('');
    
    // Optimistic UI
    const tempId = Date.now().toString();
    const msg: Message = { id: tempId, from: 'Moi', content, time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }), mine: true };
    setMessages(prev => [...prev, msg]);
    
    // API
    await API.sendMessage(selected.id, content, selected.isGroup ? selected.id : undefined);
    
    // Refresh conversations so it appears in the sidebar
    setContacts(prev => {
      const idx = prev.findIndex(c => c.id === selected.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: content };
        return updated;
      }
      return prev;
    });
  };

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Contacts Panel */}
      <div className={`messages-sidebar ${mobileShowChat ? 'hide-mobile' : ''}`} style={{ width: '300px', borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '12px' }}>Messages</h2>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', padding: '10px 16px', borderRadius: 'var(--radius-full)', gap: '8px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--text)', fontSize: '0.9rem' }} />
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Aucune conversation trouvée. Sélectionnez un membre dans l'arbre pour démarrer.
            </div>
          ) : (
            filtered.map(c => (
              <div key={c.id} onClick={() => selectContact(c)} style={{
                padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                background: selected?.id === c.id ? 'var(--primary-light)' : 'transparent',
                borderLeft: selected?.id === c.id ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'var(--transition)'
              }}>
                {c.isGroup ? (
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--accent))' }}>
                    <UsersIcon size={18} />
                  </div>
                ) : (
                  <img src={getAvatarUrl(c.gender, c.photoUrl)} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.lastMessage}
                  </div>
                </div>
                {c.online && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`chat-area ${!mobileShowChat ? 'hide-mobile' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Sélectionnez une conversation pour démarrer
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  className="btn btn-ghost show-mobile"
                  onClick={() => setMobileShowChat(false)}
                  style={{ marginRight: -4, minWidth: 44, minHeight: 44, padding: '10px' }}
                  title="Retour"
                >
                  <ChevronLeft size={24} />
                </button>
                {selected.isGroup ? (
                  <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--accent))' }}>
                    <UsersIcon size={16} />
                  </div>
                ) : (
                  <img src={getAvatarUrl(selected.gender, selected.photoUrl)} alt={selected.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>{selected.name}</div>
                  <div style={{ fontSize: '0.75rem', color: selected.online ? 'var(--success)' : 'var(--text-muted)' }}>{selected.isGroup ? 'Groupe de branche' : (selected.online ? 'En ligne' : 'Hors ligne')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-icon btn-ghost"><Phone size={18} /></button>
                <button className="btn btn-icon btn-ghost"><Video size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}><span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>Aujourd'hui</span></div>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                  <div style={{
                    maxWidth: '65%', padding: '12px 16px', borderRadius: m.mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: m.mine ? 'var(--primary)' : 'var(--surface)', color: m.mine ? '#fff' : 'var(--text)',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    {!m.mine && <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px', color: 'var(--primary)' }}>{m.from}</div>}
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>{m.content}</p>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'right', marginTop: '4px' }}>{m.time}</div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 24px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', padding: '8px 8px 8px 20px', borderRadius: 'var(--radius-full)', gap: '8px' }}>
                <input type="text" placeholder="Écrivez votre message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', color: 'var(--text)' }} />
                <button className="btn btn-primary btn-icon" onClick={send} style={{ width: '40px', height: '40px' }}><Send size={16} /></button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

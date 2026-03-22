import { useState, useRef } from 'react';
import { useFamilyStore, Relation } from '../../store/familyStore';
import { X, MessageCircle, UserPlus, MapPin, Briefcase, Calendar, Edit3, Save, Trash2, Camera } from 'lucide-react';

const relationLabels: Record<Relation, string> = {
  moi: 'Vous', parent: 'Parent', enfant: 'Enfant', conjoint: 'Conjoint(e)',
  frere_soeur: 'Frère/Sœur', grand_parent: 'Grand-Parent', oncle_tante: 'Oncle/Tante', cousin: 'Cousin(e)'
};

export function MemberDetails() {
  const { selectedMember, selectMember, openAddModal, updateMember, removeMember } = useFamilyStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const photoRef = useRef<HTMLInputElement>(null);

  if (!selectedMember) return null;

  const startEdit = () => {
    setForm({ firstName: selectedMember.firstName, lastName: selectedMember.lastName, birthDate: selectedMember.birthDate || '', location: selectedMember.location || '', profession: selectedMember.profession || '' });
    setEditing(true);
  };

  const saveEdit = () => {
    updateMember(selectedMember.id, form);
    setEditing(false);
  };

  const addOptions: { label: string; rel: Relation }[] = [
    { label: 'Enfant', rel: 'enfant' },
    { label: 'Conjoint(e)', rel: 'conjoint' },
    { label: 'Frère/Sœur', rel: 'frere_soeur' },
    { label: 'Parent', rel: 'parent' },
  ];

  return (
    <div className="animate-slide member-details-drawer" style={{
      position: 'absolute', right: 0, top: 0, height: '100%',
      background: 'var(--surface)', borderLeft: '1px solid var(--border-light)',
      padding: '24px', boxShadow: '-4px 0 20px rgba(0,0,0,0.06)', zIndex: 10,
      display: 'flex', flexDirection: 'column', overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span className="badge badge-primary">{relationLabels[selectedMember.relation]}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!editing && <button className="btn btn-icon btn-ghost mobile-large-btn" onClick={startEdit}><Edit3 size={22} /></button>}
          <button className="btn btn-icon btn-ghost mobile-large-btn" onClick={() => selectMember(null)}><X size={22} /></button>
        </div>
      </div>

      {/* Avatar + Name */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div className="avatar avatar-xl" style={{ margin: '0 auto 12px', cursor: editing ? 'pointer' : 'default' }}
            onClick={() => editing && photoRef.current?.click()}>
            {selectedMember.photoUrl ? <img src={selectedMember.photoUrl} alt="" /> : selectedMember.firstName.charAt(0)}
          </div>
          {editing && (
            <div onClick={() => photoRef.current?.click()} style={{ position: 'absolute', bottom: '8px', right: '-4px', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
              <Camera size={14} color="#fff" />
            </div>
          )}
          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => updateMember(selectedMember.id, { photoUrl: reader.result as string });
            reader.readAsDataURL(file);
          }} />
        </div>
        {editing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} style={{ fontSize: '0.9rem' }} />
            <input className="input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} style={{ fontSize: '0.9rem' }} />
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '2px' }}>{selectedMember.firstName} {selectedMember.lastName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedMember.gender === 'F' ? '♀' : '♂'} {selectedMember.isAlive ? 'En vie' : 'Décédé(e)'}</p>
          </>
        )}
      </div>

      {/* Details */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="input-group"><label><Calendar size={14} /> Date de naissance</label><input className="input" type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} /></div>
            <div className="input-group"><label><MapPin size={14} /> Lieu</label><input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ville, Pays" /></div>
            <div className="input-group"><label><Briefcase size={14} /> Profession</label><input className="input" value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} placeholder="Profession" /></div>
            <button className="btn btn-primary btn-sm btn-block" onClick={saveEdit}><Save size={16} /> Sauvegarder</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><Calendar size={16} /><span>{selectedMember.birthDate || 'Non renseignée'}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><MapPin size={16} /><span>{selectedMember.location || 'Non renseigné'}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}><Briefcase size={16} /><span>{selectedMember.profession || 'Non renseignée'}</span></div>
          </div>
        )}
      </div>

      {/* Actions */}
      <button className="btn btn-primary btn-block" style={{ marginBottom: '8px' }}>
        <MessageCircle size={18} /> Démarrer une discussion
      </button>

      <div style={{ marginTop: '16px' }}>
        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Ajouter un lien :</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {addOptions.map(o => (
            <button key={o.rel} className="btn btn-outline btn-sm" onClick={() => openAddModal(o.rel)}>
              <UserPlus size={14} /> {o.label}
            </button>
          ))}
        </div>
      </div>

      {selectedMember.relation !== 'moi' && (
        <button className="btn btn-ghost btn-sm" onClick={() => { removeMember(selectedMember.id); selectMember(null); }} style={{ marginTop: 'auto', color: 'var(--danger)' }}>
          <Trash2 size={16} /> Retirer de l'arbre
        </button>
      )}
    </div>
  );
}

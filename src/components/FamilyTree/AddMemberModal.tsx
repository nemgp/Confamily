import { useState } from 'react';
import { useFamilyStore, Relation } from '../../store/familyStore';
import { X, UserPlus } from 'lucide-react';

const relationLabels: Record<Relation, string> = {
  moi: 'Moi', parent: 'Parent', enfant: 'Enfant', conjoint: 'Conjoint(e)',
  frere_soeur: 'Frère/Sœur', grand_parent: 'Grand-Parent', oncle_tante: 'Oncle/Tante', cousin: 'Cousin(e)'
};

export function AddMemberModal() {
  const { showAddModal, addRelationType, closeAddModal, addMember, selectedMember } = useFamilyStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');

  if (!showAddModal || !addRelationType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = 'member_' + Date.now();
    addMember(
      { id, firstName, lastName, birthDate, location, profession, relation: addRelationType, gender, isAlive: true },
      selectedMember?.id || '1'
    );
    setFirstName(''); setLastName(''); setBirthDate(''); setLocation(''); setProfession('');
  };

  return (
    <div className="modal-overlay" onClick={closeAddModal}>
      <div className="modal animate-slide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><UserPlus size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Ajouter : {relationLabels[addRelationType]}</h2>
          <button className="btn btn-icon btn-ghost" onClick={closeAddModal}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label>Prénom</label>
              <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Prénom" required />
            </div>
            <div className="input-group">
              <label>Nom</label>
              <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Nom" required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className={`btn btn-sm ${gender === 'M' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGender('M')} style={{ flex: 1 }}>♂ Homme</button>
            <button type="button" className={`btn btn-sm ${gender === 'F' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGender('F')} style={{ flex: 1 }}>♀ Femme</button>
          </div>
          <div className="input-group">
            <label>Date de naissance</label>
            <input className="input" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Lieu de résidence</label>
            <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ville, Pays" />
          </div>
          <div className="input-group">
            <label>Profession</label>
            <input className="input" value={profession} onChange={e => setProfession(e.target.value)} placeholder="Ex: Enseignant" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px' }}>
            <UserPlus size={18} /> Ajouter à l'arbre
          </button>
        </form>
      </div>
    </div>
  );
}

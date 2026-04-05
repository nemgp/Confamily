import { useState, useRef, useEffect } from 'react';
import { useFamilyStore } from '../../store/familyStore';
import { X, UserPlus, Camera } from 'lucide-react';

const relationLabels: Record<string, string> = {
  moi: 'Moi', parent: 'Parent', enfant: 'Enfant', conjoint: 'Conjoint(e)',
  frere_soeur: 'Frère/Sœur', grand_parent: 'Grand-Parent', oncle_tante: 'Oncle/Tante', cousin: 'Cousin(e)'
};

export function AddMemberModal() {
  const { showAddModal, addRelationType, closeAddModal, addMemberRemote, selectedMember, getParentsOf } = useFamilyStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [photoUrl, setPhotoUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddModal) {
      if (addRelationType === 'conjoint' && selectedMember?.gender) {
        setGender(selectedMember.gender === 'M' ? 'F' : 'M');
      } else {
        setGender('M');
      }
    }
  }, [showAddModal, addRelationType, selectedMember]);

  if (!showAddModal || !addRelationType) return null;

  // Validation: max 2 parents
  const refId = selectedMember?.id || '1';
  if (addRelationType === 'parent') {
    const existingParents = getParentsOf(refId);
    if (existingParents.length >= 2) {
      return (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal animate-slide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Maximum atteint</h2>
              <button className="btn btn-icon btn-ghost" onClick={closeAddModal}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Ce membre a déjà 2 parents. Vous ne pouvez pas en ajouter davantage.
            </p>
            <button className="btn btn-primary btn-block" onClick={closeAddModal} style={{ marginTop: '16px' }}>Compris</button>
          </div>
        </div>
      );
    }
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = 'member_' + Date.now();
    addMemberRemote(
      { id, firstName, lastName, birthDate, location, profession, relation: addRelationType, gender, isAlive: true, photoUrl: photoUrl || undefined },
      refId,
      addRelationType
    );
    setFirstName(''); setLastName(''); setBirthDate(''); setLocation(''); setProfession(''); setPhotoUrl('');
  };

  return (
    <div className="modal-overlay" onClick={closeAddModal}>
      <div className="modal animate-slide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><UserPlus size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Ajouter : {relationLabels[addRelationType]}</h2>
          <button className="btn btn-icon btn-ghost" onClick={closeAddModal}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Photo */}
          <div style={{ textAlign: 'center' }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto', cursor: 'pointer', overflow: 'hidden', background: photoUrl ? 'transparent' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px dashed var(--border)', transition: 'var(--transition)' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={28} color="var(--primary)" />
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Cliquez pour ajouter une photo</p>
          </div>

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

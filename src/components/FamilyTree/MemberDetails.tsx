import { useFamilyStore } from '../../store/familyStore';
import { X, MessageCircle, UserPlus, Info } from 'lucide-react';

export function MemberDetails() {
  const { selectedMember, selectMember } = useFamilyStore();

  if (!selectedMember) return null;

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: '350px',
      height: '100%',
      background: 'var(--surface-color)',
      borderLeft: '1px solid var(--border-color)',
      padding: '2rem',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={24} color="var(--primary-color)" />
          {selectedMember.firstName}
        </h2>
        <button 
          onClick={() => selectMember(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
        ><X size={24} color="var(--text-muted)" /></button>
      </div>
      
      <h3 style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{selectedMember.lastName}</h3>
      
      <div style={{ margin: '1rem 0', padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
        <p style={{ margin: '0.5rem 0' }}><strong>Relation :</strong> {selectedMember.relation}</p>
        <p style={{ margin: '0.5rem 0' }}><strong>Date de naissance:</strong> {selectedMember.birthDate || 'Non renseignée'}</p>
      </div>

      <button style={{
        marginTop: 'auto',
        background: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer'
      }}>
        <MessageCircle size={20} />
        Démarrer une discussion
      </button>
      
      <button style={{
        marginTop: '1rem',
        background: 'transparent',
        color: 'var(--primary-color)',
        border: '2px solid var(--primary-color)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer'
      }}>
        <UserPlus size={20} />
        Ajouter un lien de parenté
      </button>
    </div>
  );
}

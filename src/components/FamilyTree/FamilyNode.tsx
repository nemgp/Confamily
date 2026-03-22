import { Handle, Position } from '@xyflow/react';
import { FamilyMember } from '../../store/familyStore';

export function FamilyNode({ data }: { data: FamilyMember }) {
  const isMe = data.relation === 'moi';
  const genderColor = data.gender === 'F' ? '#e8a87c' : '#d97736';

  return (
    <div style={{
      padding: '12px 20px',
      borderRadius: '16px',
      background: isMe
        ? 'linear-gradient(135deg, #d97736, #e8a87c)'
        : 'var(--surface)',
      color: isMe ? '#fff' : 'var(--text)',
      border: isMe ? 'none' : '2px solid var(--border)',
      boxShadow: isMe ? '0 4px 20px rgba(217,119,54,0.3)' : 'var(--shadow-sm)',
      textAlign: 'center',
      minWidth: '140px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: genderColor, border: 'none', width: 8, height: 8 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
        <img 
          src={data.photoUrl || (data.gender === 'F' 
            ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria&mouth=smile&hair=longHairStraight&backgroundColor=ffdfbf' 
            : 'https://api.dicebear.com/9.x/avataaars/svg?seed=Robert&mouth=smile&facialHair=beardLight&backgroundColor=b6e3f4')} 
          alt={data.firstName} 
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: isMe ? '2px solid #fff' : `2px solid ${genderColor}`, background: '#fff' }} 
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{data.firstName}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{data.lastName}</div>
        </div>
      </div>

      {data.isAlive === false && (
        <div style={{ fontSize: '0.65rem', marginTop: '4px', opacity: 0.6 }}>✝ Décédé(e)</div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: genderColor, border: 'none', width: 8, height: 8 }} />
    </div>
  );
}

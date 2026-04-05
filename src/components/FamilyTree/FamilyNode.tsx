import { Handle, Position } from '@xyflow/react';
import { FamilyMember } from '../../store/familyStore';
import { MapPin, Briefcase } from 'lucide-react';

export function FamilyNode({ data }: { data: FamilyMember }) {
  const isMe = data.relation === 'moi';
  const genderColor = data.gender === 'F' ? '#e8a87c' : '#d97736';
  const avatarUrl = data.photoUrl || (data.gender === 'F'
    ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maria&mouth=smile&hair=longHairStraight&backgroundColor=ffdfbf'
    : 'https://api.dicebear.com/9.x/avataaars/svg?seed=Robert&mouth=smile&facialHair=beardLight&backgroundColor=b6e3f4');

  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '16px',
      background: isMe
        ? 'linear-gradient(135deg, #d97736, #e8a87c)'
        : 'var(--surface)',
      color: isMe ? '#fff' : 'var(--text)',
      border: isMe ? '2px solid rgba(255,255,255,0.3)' : `2px solid ${genderColor}22`,
      boxShadow: isMe
        ? '0 6px 24px rgba(217,119,54,0.35)'
        : '0 2px 12px rgba(0,0,0,0.07)',
      textAlign: 'center',
      minWidth: '160px',
      maxWidth: '200px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
    }}>
      <Handle type="target" position={Position.Top} style={{ background: genderColor, border: '2px solid #fff', width: 10, height: 10 }} />

      {/* Avatar */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
        <img
          src={avatarUrl}
          alt={data.firstName}
          style={{
            width: 44, height: 44, borderRadius: '50%', objectFit: 'cover',
            border: isMe ? '3px solid rgba(255,255,255,0.8)' : `3px solid ${genderColor}`,
            background: '#fff', display: 'block',
          }}
        />
        {/* Gender dot */}
        <div style={{
          position: 'absolute', bottom: 0, right: -2, width: 14, height: 14,
          borderRadius: '50%', background: genderColor,
          border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px', color: '#fff', fontWeight: 900,
        }}>
          {data.gender === 'F' ? '♀' : '♂'}
        </div>
      </div>

      {/* Name */}
      <div style={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>{data.firstName}</div>
      <div style={{ fontSize: '0.75rem', opacity: isMe ? 0.85 : 0.6, marginBottom: data.location || data.profession ? '6px' : 0 }}>{data.lastName}</div>

      {/* Extra info */}
      {(data.location || data.profession) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
          {data.profession && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.68rem', opacity: 0.75 }}>
              <Briefcase size={10} /> {data.profession}
            </div>
          )}
          {data.location && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.68rem', opacity: 0.75 }}>
              <MapPin size={10} /> {data.location}
            </div>
          )}
        </div>
      )}

      {data.isAlive === false && (
        <div style={{ fontSize: '0.65rem', marginTop: '6px', opacity: 0.65, background: 'rgba(0,0,0,0.08)', borderRadius: '6px', padding: '2px 6px' }}>✝ Décédé(e)</div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: genderColor, border: '2px solid #fff', width: 10, height: 10 }} />
    </div>
  );
}

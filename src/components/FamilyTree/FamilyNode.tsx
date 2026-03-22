import { Handle, Position } from '@xyflow/react';
import { FamilyMember } from '../../store/familyStore';

export function FamilyNode({ data }: { data: FamilyMember }) {
  const isMe = data.relation === 'moi';
  
  return (
    <div style={{
      padding: '10px 20px',
      borderRadius: 'var(--radius-md)',
      background: isMe ? 'var(--primary-color)' : 'var(--surface-color)',
      color: isMe ? '#fff' : 'var(--text-color)',
      border: '2px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'center',
      minWidth: '120px'
    }}>
      <Handle type="target" position={Position.Top} />
      
      <div style={{ fontWeight: 'bold' }}>{data.firstName}</div>
      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{data.lastName}</div>
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

import { ReactFlow, Controls, Background, BackgroundVariant, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFamilyStore } from '../../store/familyStore';
import { FamilyNode } from './FamilyNode';
import { AddMemberModal } from './AddMemberModal';
import { useMemo } from 'react';

export function FamilyTreeViewer() {
  const { nodes, edges, selectMember, cycleEdgeColor } = useFamilyStore();
  const nodeTypes = useMemo(() => ({ familyNode: FamilyNode }), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_: unknown, node: { id: string }) => selectMember(node.id)}
        onEdgeClick={(_: unknown, edge: { id: string }) => cycleEdgeColor(edge.id)}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background color="var(--primary)" variant={BackgroundVariant.Dots} gap={30} size={1} />
        <Controls style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border-light)' }} />
        <MiniMap
          nodeColor="#d97736"
          maskColor="rgba(0,0,0,0.1)"
          style={{ borderRadius: '12px', border: '1px solid var(--border-light)' }}
        />
      </ReactFlow>
      <AddMemberModal />
    </div>
  );
}

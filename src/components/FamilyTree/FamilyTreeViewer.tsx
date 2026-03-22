import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFamilyStore } from '../../store/familyStore';
import { FamilyNode } from './FamilyNode';
import { useMemo } from 'react';

export function FamilyTreeViewer() {
  const { nodes, edges, selectMember } = useFamilyStore();
  const nodeTypes = useMemo(() => ({ familyNode: FamilyNode }), []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => selectMember(node.id)}
        fitView
      >
        <Background color="var(--primary-color)" variant={BackgroundVariant.Dots} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

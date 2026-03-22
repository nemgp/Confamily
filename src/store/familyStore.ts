import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';

export type FamilyMember = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  photoUrl?: string;
  relation: 'moi' | 'parent' | 'enfant' | 'conjoint' | 'frere_soeur';
};

interface FamilyState {
  nodes: Node<FamilyMember>[];
  edges: Edge[];
  selectedMember: FamilyMember | null;
  selectMember: (id: string | null) => void;
}

const initialNodes: Node<FamilyMember>[] = [
  {
    id: '1',
    position: { x: 400, y: 300 },
    data: { id: '1', firstName: 'Moi', lastName: 'Confamily', relation: 'moi' },
    type: 'familyNode',
  },
  {
    id: '2',
    position: { x: 250, y: 150 },
    data: { id: '2', firstName: 'Papa', lastName: 'Confamily', relation: 'parent' },
    type: 'familyNode',
  },
  {
    id: '3',
    position: { x: 550, y: 150 },
    data: { id: '3', firstName: 'Maman', lastName: 'Confamily', relation: 'parent' },
    type: 'familyNode',
  }
];

const initialEdges: Edge[] = [
  { id: 'e2-1', source: '2', target: '1', type: 'smoothstep' },
  { id: 'e3-1', source: '3', target: '1', type: 'smoothstep' },
];

export const useFamilyStore = create<FamilyState>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedMember: null,
  selectMember: (id) => set((state) => ({
    selectedMember: id ? state.nodes.find(n => n.id === id)?.data || null : null
  })),
}));

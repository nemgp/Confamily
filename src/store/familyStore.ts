import { create } from 'zustand';

export type Relation = 'moi' | 'parent' | 'enfant' | 'conjoint' | 'frere_soeur' | 'grand_parent' | 'oncle_tante' | 'cousin';

export type FamilyMember = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  location?: string;
  profession?: string;
  photoUrl?: string;
  relation: Relation;
  gender?: 'M' | 'F';
  isAlive?: boolean;
};

export type TreeNode = {
  id: string;
  position: { x: number; y: number };
  data: FamilyMember;
  type: string;
};

export type TreeEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  style?: Record<string, unknown>;
};

interface FamilyState {
  nodes: TreeNode[];
  edges: TreeEdge[];
  selectedMember: FamilyMember | null;
  showAddModal: boolean;
  addRelationType: Relation | null;
  selectMember: (id: string | null) => void;
  addMember: (member: FamilyMember, parentId?: string) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  openAddModal: (relationType: Relation) => void;
  closeAddModal: () => void;
}

function autoLayout(nodes: TreeNode[], edges: TreeEdge[]): TreeNode[] {
  // Simple vertical layout: group by generation
  const levels: Record<string, number> = {};
  const childrenMap: Record<string, string[]> = {};
  
  edges.forEach(e => {
    if (!childrenMap[e.source]) childrenMap[e.source] = [];
    childrenMap[e.source].push(e.target);
  });

  // Find roots (nodes with no incoming edges)
  const targets = new Set(edges.map(e => e.target));
  const roots = nodes.filter(n => !targets.has(n.id));
  
  // BFS to assign levels
  const queue = roots.map(r => ({ id: r.id, level: 0 }));
  const visited = new Set<string>();
  while (queue.length) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    levels[id] = level;
    (childrenMap[id] || []).forEach(child => queue.push({ id: child, level: level + 1 }));
  }
  
  // Assign unvisited nodes
  nodes.forEach(n => { if (!(n.id in levels)) levels[n.id] = 0; });
  
  // Position nodes
  const levelCounts: Record<number, number> = {};
  return nodes.map(n => {
    const level = levels[n.id] || 0;
    if (!levelCounts[level]) levelCounts[level] = 0;
    const x = 300 + levelCounts[level] * 220;
    const y = 80 + level * 180;
    levelCounts[level]++;
    return { ...n, position: { x, y } };
  });
}

const initialMembers: FamilyMember[] = [
  { id: '1', firstName: 'Moi', lastName: 'Confamily', relation: 'moi', gender: 'M', isAlive: true },
  { id: '2', firstName: 'Papa', lastName: 'Confamily', relation: 'parent', gender: 'M', isAlive: true },
  { id: '3', firstName: 'Maman', lastName: 'Confamily', relation: 'parent', gender: 'F', isAlive: true },
];

const initialNodes: TreeNode[] = initialMembers.map((m, i) => ({
  id: m.id, position: { x: 0, y: 0 }, data: m, type: 'familyNode',
}));

const initialEdges: TreeEdge[] = [
  { id: 'e2-1', source: '2', target: '1', type: 'smoothstep', style: { stroke: '#d97736', strokeWidth: 2 } },
  { id: 'e3-1', source: '3', target: '1', type: 'smoothstep', style: { stroke: '#d97736', strokeWidth: 2 } },
];

export const useFamilyStore = create<FamilyState>((set) => ({
  nodes: autoLayout(initialNodes, initialEdges),
  edges: initialEdges,
  selectedMember: null,
  showAddModal: false,
  addRelationType: null,

  selectMember: (id) => set((state) => ({
    selectedMember: id ? state.nodes.find(n => n.id === id)?.data || null : null
  })),

  addMember: (member, parentId) => set((state) => {
    const newNode: TreeNode = { id: member.id, position: { x: 0, y: 0 }, data: member, type: 'familyNode' };
    const newEdges = [...state.edges];
    if (parentId) {
      newEdges.push({
        id: `e${parentId}-${member.id}`,
        source: parentId,
        target: member.id,
        type: 'smoothstep',
        style: { stroke: '#d97736', strokeWidth: 2 }
      });
    }
    const allNodes = [...state.nodes, newNode];
    return { nodes: autoLayout(allNodes, newEdges), edges: newEdges, showAddModal: false };
  }),

  updateMember: (id, updates) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n),
    selectedMember: state.selectedMember?.id === id ? { ...state.selectedMember, ...updates } : state.selectedMember
  })),

  removeMember: (id) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    edges: state.edges.filter(e => e.source !== id && e.target !== id),
    selectedMember: state.selectedMember?.id === id ? null : state.selectedMember
  })),

  openAddModal: (relationType) => set({ showAddModal: true, addRelationType: relationType }),
  closeAddModal: () => set({ showAddModal: false, addRelationType: null }),
}));

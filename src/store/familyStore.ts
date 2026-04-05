import { create } from 'zustand';
import { useAuthStore } from './authStore';
import * as API from '../api/googleAPI';

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
  linkedUserId?: string;
  isBridge?: boolean;
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

// Relationship graph: who is related to whom and how
type RelationLink = {
  fromId: string;
  toId: string;
  type: 'parent_child' | 'spouse' | 'sibling';
};

interface FamilyState {
  nodes: TreeNode[];
  edges: TreeEdge[];
  relations: RelationLink[];
  selectedMember: FamilyMember | null;
  showAddModal: boolean;
  addRelationType: Relation | null;
  isSyncing: boolean;
  syncError: string | null;
  bridgeNodes: FamilyMember[]; // ghost nodes from other trees
  // Local actions
  selectMember: (id: string | null) => void;
  addMember: (member: FamilyMember, refId: string, relType: Relation) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  openAddModal: (relationType: Relation) => void;
  closeAddModal: () => void;
  getParentsOf: (id: string) => string[];
  edgeCustomColors: Record<string, string>;
  cycleEdgeColor: (edgeId: string) => void;
  // Backend sync actions
  syncWithBackend: () => Promise<void>;
  addMemberRemote: (member: FamilyMember, refId: string, relType: Relation) => Promise<void>;
  updateMemberRemote: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
  removeMemberRemote: (id: string) => Promise<void>;
}

const EDGE_STYLE_VERTICAL = { stroke: '#d97736', strokeWidth: 2 };
const EDGE_STYLE_HORIZONTAL = { stroke: '#e8a87c', strokeWidth: 2, strokeDasharray: '0' };
const NODE_W = 180;
const NODE_H = 80;
const H_GAP = 60;
const V_GAP = 140;

const COLORS = ['#d97736', '#3498db', '#e74c3c', '#27ae60', '#9b59b6', '#8c5b3b'];

function layoutTree(nodes: TreeNode[], relations: RelationLink[], customColors: Record<string, string> = {}): { nodes: TreeNode[], edges: TreeEdge[] } {
  if (nodes.length === 0) return { nodes: [], edges: [] };

  // Build adjacency maps
  const parentChildLinks = relations.filter(r => r.type === 'parent_child'); // fromId=parent, toId=child
  const spouseLinks = relations.filter(r => r.type === 'spouse');

  // Find parents of each node
  const parentsOf: Record<string, string[]> = {};
  const childrenOf: Record<string, string[]> = {};
  parentChildLinks.forEach(r => {
    if (!parentsOf[r.toId]) parentsOf[r.toId] = [];
    parentsOf[r.toId].push(r.fromId);
    if (!childrenOf[r.fromId]) childrenOf[r.fromId] = [];
    childrenOf[r.fromId].push(r.toId);
  });

  // Find spouse of each node
  const spouseOf: Record<string, string> = {};
  spouseLinks.forEach(r => {
    spouseOf[r.fromId] = r.toId;
    spouseOf[r.toId] = r.fromId;
  });

  // Assign generations via BFS from "moi" (id=1)
  const meNode = nodes.find(n => n.data.relation === 'moi') || nodes[0];
  const generation: Record<string, number> = {};
  const visited = new Set<string>();
  const queue: { id: string; gen: number }[] = [{ id: meNode.id, gen: 0 }];

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    generation[id] = gen;

    // Parents are one generation up
    (parentsOf[id] || []).forEach(pid => {
      if (!visited.has(pid)) queue.push({ id: pid, gen: gen - 1 });
    });
    // Children are one generation down
    (childrenOf[id] || []).forEach(cid => {
      if (!visited.has(cid)) queue.push({ id: cid, gen: gen + 1 });
    });
    // Spouses are same generation
    if (spouseOf[id] && !visited.has(spouseOf[id])) {
      queue.push({ id: spouseOf[id], gen: gen });
    }
  }

  // Assign unvisited
  nodes.forEach(n => { if (!(n.id in generation)) generation[n.id] = 0; });

  // Group by generation
  const genGroups: Record<number, string[]> = {};
  Object.entries(generation).forEach(([id, gen]) => {
    if (!genGroups[gen]) genGroups[gen] = [];
    genGroups[gen].push(id);
  });

  // Sort generations
  const sortedGens = Object.keys(genGroups).map(Number).sort((a, b) => a - b);
  const minGen = sortedGens[0] || 0;

  // Position nodes: spouses side by side, children centered under parents
  const positions: Record<string, { x: number; y: number }> = {};
  const placed = new Set<string>();

  sortedGens.forEach(gen => {
    const row = genGroups[gen];
    const y = (gen - minGen) * (NODE_H + V_GAP) + 80;

    // Group spouses together
    const groups: string[][] = [];
    const inGroup = new Set<string>();

    row.forEach(id => {
      if (inGroup.has(id)) return;
      if (spouseOf[id] && generation[spouseOf[id]] === gen && row.includes(spouseOf[id])) {
        groups.push([id, spouseOf[id]]);
        inGroup.add(id);
        inGroup.add(spouseOf[id]);
      } else {
        groups.push([id]);
        inGroup.add(id);
      }
    });

    let nextAvailableX = 100;
    // Try to center children under their parents
    groups.forEach(group => {
      // Check if any member has parents already placed
      let parentCenterX = -1;
      let parentCount = 0;
      
      group.forEach(id => {
        const parents = parentsOf[id] || [];
        parents.forEach(p => {
          if (placed.has(p)) {
            parentCenterX = parentCenterX < 0 ? positions[p].x : parentCenterX + positions[p].x;
            parentCount++;
          }
        });
      });

      let startX = nextAvailableX;
      
      if (parentCount > 0) {
        parentCenterX = parentCenterX / parentCount;
        const desiredStartX = parentCenterX - ((group.length - 1) * (NODE_W + H_GAP)) / 2;
        // Eviter la superposition en forçant startX >= nextAvailableX
        startX = Math.max(nextAvailableX, desiredStartX);
      }

      group.forEach((id, i) => {
        positions[id] = { x: startX + i * (NODE_W + H_GAP), y };
        placed.add(id);
      });

      nextAvailableX = startX + group.length * (NODE_W + H_GAP) + H_GAP;
    });
  });

  // Apply positions
  const positionedNodes = nodes.map(n => ({
    ...n,
    position: positions[n.id] || { x: 300, y: 300 }
  }));

  // Build edges
  const edges: TreeEdge[] = [];

  // Parent → Child edges (vertical)
  parentChildLinks.forEach(r => {
    const edgeId = `e-${r.fromId}-${r.toId}`;
    edges.push({
      id: edgeId,
      source: r.fromId,
      target: r.toId,
      type: 'smoothstep',
      style: { ...EDGE_STYLE_VERTICAL, stroke: customColors[edgeId] || EDGE_STYLE_VERTICAL.stroke },
    });
  });

  // Spouse edges (horizontal, using a step type)
  spouseLinks.forEach(r => {
    const edgeId = `e-spouse-${r.fromId}-${r.toId}`;
    edges.push({
      id: edgeId,
      source: r.fromId,
      target: r.toId,
      type: 'straight',
      style: { ...EDGE_STYLE_HORIZONTAL, stroke: customColors[edgeId] || EDGE_STYLE_HORIZONTAL.stroke },
    });
  });

  return { nodes: positionedNodes, edges };
}

// Initial data
const initialRelations: RelationLink[] = [];

const initialMembers: FamilyMember[] = [];

const initialNodes: TreeNode[] = initialMembers.map(m => ({
  id: m.id, position: { x: 0, y: 0 }, data: m, type: 'familyNode',
}));

const initialLayout = layoutTree(initialNodes, initialRelations);

export const useFamilyStore = create<FamilyState>((set, get) => ({
  nodes: initialLayout.nodes,
  edges: initialLayout.edges,
  relations: initialRelations,
  selectedMember: null,
  showAddModal: false,
  addRelationType: null,
  isSyncing: false,
  syncError: null,
  bridgeNodes: [],

  // ─── Backend sync ───────────────────────────────────────────────
  syncWithBackend: async () => {
    set({ isSyncing: true, syncError: null });
    try {
      const res = await API.getTree();
      if (!res.success) throw new Error(res.error || 'Erreur serveur');

      // Map API members → FamilyMember
      const apiMembers: FamilyMember[] = (res.members || []).map((m: API.Member) => ({
        id: m.id, firstName: m.firstName, lastName: m.lastName,
        birthDate: m.birthDate, location: m.location, profession: m.profession,
        photoUrl: m.photoUrl, relation: (m.relation as Relation) || 'moi',
        gender: m.gender === 'male' ? 'M' : m.gender === 'female' ? 'F' : undefined,
        isAlive: m.isAlive !== false,
        linkedUserId: m.linkedUserId,
      }));

      // Map API relations
      const apiRelations: RelationLink[] = (res.relations || []).map((r: API.Relation) => ({
        fromId: r.fromId, toId: r.toId, type: r.type,
      }));

      // Bridge ghost nodes
      const bridgeNodes: FamilyMember[] = (res.bridges || []).map((b: API.Member) => ({
        id: b.id, firstName: b.firstName, lastName: b.lastName,
        photoUrl: b.photoUrl, relation: (b.relation as Relation) || 'conjoint',
        gender: b.gender === 'male' ? 'M' : 'F',
        linkedToLocalMember: b.linkedToLocalMember,
        isBridge: true,
      } as FamilyMember & { isBridge: boolean; linkedToLocalMember?: string }));

      const apiNodes: TreeNode[] = apiMembers.map(m => ({ id: m.id, position: { x: 0, y: 0 }, data: m, type: 'familyNode' }));
      const result = layoutTree(apiNodes, apiRelations, get().edgeCustomColors);

      set({
        nodes: result.nodes, edges: result.edges,
        relations: apiRelations, bridgeNodes, isSyncing: false,
      });
    } catch (e: unknown) {
      // If API not configured, silently use local mock data
      const msg = e instanceof Error ? e.message : 'Erreur synchro';
      if (!msg.includes('API non configurée')) {
        set({ syncError: msg });
      }
      set({ isSyncing: false });
    }
  },

  addMemberRemote: async (member, refId, relType) => {
    const { user } = useAuthStore.getState();
    if (!user?.isPremium && get().nodes.length >= 50) {
      alert("Plan gratuit limité à 50 membres. L'arbre a atteint la limite.\nVeuillez passer en Premium pour ajouter des membres en illimité.");
      return;
    }

    // Optimistic local update first
    get().addMember(member, refId, relType);
    try {
      const res = await API.addMember({
        firstName: member.firstName, lastName: member.lastName,
        gender: member.gender === 'M' ? 'male' : 'female',
        birthDate: member.birthDate, location: member.location,
        profession: member.profession, relation: relType,
        refId, relType: relType === 'parent' ? 'parent_child' : relType === 'enfant' ? 'parent_child' : relType === 'conjoint' ? 'spouse' : 'sibling',
      });
      if (res.success && res.memberId && res.memberId !== member.id) {
        // Update local id to match server id
        get().updateMember(member.id, { id: res.memberId } as Partial<FamilyMember>);
      }
    } catch { /* silently keep local */ }
  },

  updateMemberRemote: async (id, updates) => {
    get().updateMember(id, updates);
    try {
      await API.updateMember(id, {
        ...updates,
        gender: updates.gender === 'M' ? 'male' : updates.gender === 'F' ? 'female' : undefined,
      } as Partial<API.Member>);
    } catch { /* silently keep local */ }
  },

  removeMemberRemote: async (id) => {
    get().removeMember(id);
    try { await API.removeMember(id); } catch { /* silently keep local */ }
  },

  selectMember: (id) => set((state) => ({
    selectedMember: id ? state.nodes.find(n => n.id === id)?.data || null : null
  })),

  getParentsOf: (id: string) => {
    return get().relations
      .filter(r => r.type === 'parent_child' && r.toId === id)
      .map(r => r.fromId);
  },

  addMember: (member, refId, relType) => set((state) => {
    const newNode: TreeNode = { id: member.id, position: { x: 0, y: 0 }, data: member, type: 'familyNode' };
    const newRelations = [...state.relations];

    if (relType === 'enfant') {
      // refId is parent, member is child
      newRelations.push({ fromId: refId, toId: member.id, type: 'parent_child' });
      // Also link spouse of refId as parent if exists
      const spouseLink = state.relations.find(r => r.type === 'spouse' && (r.fromId === refId || r.toId === refId));
      if (spouseLink) {
        const spouseId = spouseLink.fromId === refId ? spouseLink.toId : spouseLink.fromId;
        newRelations.push({ fromId: spouseId, toId: member.id, type: 'parent_child' });
      }
    } else if (relType === 'conjoint') {
      // Spouse link (horizontal)
      newRelations.push({ fromId: refId, toId: member.id, type: 'spouse' });
    } else if (relType === 'parent') {
      // member is parent of refId — max 2 parents check
      const existingParents = state.relations.filter(r => r.type === 'parent_child' && r.toId === refId);
      if (existingParents.length >= 2) {
        return {}; // Don't add, max 2 parents
      }
      newRelations.push({ fromId: member.id, toId: refId, type: 'parent_child' });
      // If there's already one parent, link the two as spouses
      if (existingParents.length === 1) {
        newRelations.push({ fromId: existingParents[0].fromId, toId: member.id, type: 'spouse' });
      }
    } else if (relType === 'frere_soeur') {
      // Sibling: link to the same parents as refId
      const parentLinks = state.relations.filter(r => r.type === 'parent_child' && r.toId === refId);
      parentLinks.forEach(pl => {
        newRelations.push({ fromId: pl.fromId, toId: member.id, type: 'parent_child' });
      });
    }

    const allNodes = [...state.nodes, newNode];
    const result = layoutTree(allNodes, newRelations, state.edgeCustomColors);
    return { nodes: result.nodes, edges: result.edges, relations: newRelations, showAddModal: false };
  }),

  updateMember: (id, updates) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n),
    selectedMember: state.selectedMember?.id === id ? { ...state.selectedMember, ...updates } : state.selectedMember
  })),

  removeMember: (id) => set((state) => {
    const newRelations = state.relations.filter(r => r.fromId !== id && r.toId !== id);
    const newNodes = state.nodes.filter(n => n.id !== id);
    const result = layoutTree(newNodes, newRelations, state.edgeCustomColors);
    return {
      nodes: result.nodes,
      edges: result.edges,
      relations: newRelations,
      selectedMember: state.selectedMember?.id === id ? null : state.selectedMember
    };
  }),

  openAddModal: (relationType: Relation) => set({ showAddModal: true, addRelationType: relationType }),
  closeAddModal: () => set({ showAddModal: false, addRelationType: null }),
  edgeCustomColors: {},
  cycleEdgeColor: (edgeId: string) => set((state) => {
    const currentColor = state.edgeCustomColors[edgeId] || (edgeId.includes('spouse') ? EDGE_STYLE_HORIZONTAL.stroke : EDGE_STYLE_VERTICAL.stroke);
    const currentIndex = COLORS.indexOf(currentColor as string);
    const nextColor = COLORS[(currentIndex + 1) % COLORS.length];
    
    const newCustomColors = { ...state.edgeCustomColors, [edgeId]: nextColor };
    const result = layoutTree(state.nodes, state.relations, newCustomColors);
    return { 
      edgeCustomColors: newCustomColors,
      nodes: result.nodes,
      edges: result.edges
    };
  }),
}));

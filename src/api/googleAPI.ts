// =============================================
// Confamily — API Client (Google Apps Script)
// =============================================
// Mettez l'URL de votre Web App déployée ici
// ou dans .env : VITE_API_URL=https://script.google.com/...
// =============================================

const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbygw_ECSjY-zXRoyG-K-wKzpDh3owiWA-ANnow3gXoGUl8jNMkKN9t-BP8KLbwf-yHb/exec';

// ─────────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────────

export function getSession(): string | null {
  return localStorage.getItem('cf_session');
}

export function getStoredUser(): User | null {
  try {
    const u = localStorage.getItem('cf_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

function saveSession(sessionId: string, user: User) {
  localStorage.setItem('cf_session', sessionId);
  localStorage.setItem('cf_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('cf_session');
  localStorage.removeItem('cf_user');
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  treeId: string;
  isPremium: boolean;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  location?: string;
  profession?: string;
  photoUrl?: string;
  relation?: string;
  gender?: 'male' | 'female' | 'other';
  isAlive?: boolean;
  linkedUserId?: string;
  isBridge?: boolean;
  fromTreeId?: string;
  linkedToLocalMember?: string;
}

export interface Relation {
  fromId: string;
  toId: string;
  type: 'parent_child' | 'spouse' | 'sibling';
}

export interface TreeBridge {
  bridgeId: string;
  tree1Id: string;
  member1Id: string;
  tree2Id: string;
  member2Id: string;
  status: 'pending' | 'active' | 'declined';
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  groupId?: string;
  timestamp: string;
}

export interface Conversation {
  contactId: string;
  lastMessage: string;
  isGroup: boolean;
  timestamp: string;
}

export interface VaultFile {
  fileId: string;
  name: string;
  url: string;
  size: number;
  date: string;
  mimeType: string;
}

export interface InviteResolved {
  treeId: string;
  memberId?: string;
  prefill?: { firstName?: string; lastName?: string; relation?: string; gender?: string };
}

// ─────────────────────────────────────────────
// CORE FETCH
// ─────────────────────────────────────────────

async function api<T = unknown>(params: Record<string, string>): Promise<T & { success: boolean; error?: string }> {
  if (!API_URL) {
    throw new Error('API non configurée. Déployez le Google Apps Script et ajoutez VITE_API_URL dans .env');
  }
  const sessionId = getSession();
  const query = new URLSearchParams({ ...params, ...(sessionId ? { sessionId } : {}) });
  const res = await fetch(`${API_URL}?${query.toString()}`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export async function register(name: string, email: string, password: string, inviteCode?: string) {
  const params: Record<string, string> = { action: 'register', name, email, password };
  if (inviteCode) params.inviteCode = inviteCode;
  const res = await api<{ sessionId: string; user: User }>(params);
  if (res.success && res.sessionId) saveSession(res.sessionId, res.user);
  return res;
}

export async function login(email: string, password: string) {
  const res = await api<{ sessionId: string; user: User }>({ action: 'login', email, password });
  if (res.success && res.sessionId) saveSession(res.sessionId, res.user);
  return res;
}

export async function logout() {
  try { await api({ action: 'logout' }); } catch {}
  clearSession();
}

export async function deleteAccount() {
  return api({ action: 'deleteAccount' });
}

export async function requestPasswordReset(email: string) {
  return api({ action: 'requestPasswordReset', email });
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  return api({ action: 'resetPassword', email, otp, newPassword });
}

export async function resolveInvite(code: string) {
  return api<InviteResolved>({ action: 'resolveInvite', code });
}

// ─────────────────────────────────────────────
// TREE
// ─────────────────────────────────────────────

export async function getTree() {
  return api<{ treeId: string; members: Member[]; relations: Relation[]; bridges: Member[] }>({ action: 'getTree' });
}

export async function addMember(data: {
  firstName: string; lastName?: string; gender?: string; birthDate?: string;
  location?: string; profession?: string; relation?: string; refId?: string; relType?: string;
}) {
  return api<{ memberId: string }>({ action: 'addMember', ...data as Record<string, string> });
}

export async function updateMember(memberId: string, data: Partial<Member>) {
  return api({ action: 'updateMember', memberId, ...data as Record<string, string> });
}

export async function removeMember(memberId: string) {
  return api({ action: 'removeMember', memberId });
}

export async function addRelation(fromId: string, toId: string, type: Relation['type']) {
  return api({ action: 'addRelation', fromId, toId, type });
}

export async function removeRelation(fromId: string, toId: string) {
  return api({ action: 'removeRelation', fromId, toId });
}

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

export async function getConversations() {
  return api<{ conversations: Conversation[] }>({ action: 'getConversations' });
}

export async function getMessages(contactId: string, groupId?: string) {
  const params: Record<string, string> = { action: 'getMessages' };
  if (groupId) params.groupId = groupId;
  else params.contactId = contactId;
  return api<{ messages: Message[] }>(params);
}

export async function sendMessage(toId: string, content: string, groupId?: string) {
  const params: Record<string, string> = { action: 'sendMessage', toId, content };
  if (groupId) params.groupId = groupId;
  return api<{ msgId: string }>(params);
}

// ─────────────────────────────────────────────
// INVITATIONS
// ─────────────────────────────────────────────

export async function createInvite(memberId?: string) {
  const params: Record<string, string> = { action: 'createInvite' };
  if (memberId) params.memberId = memberId;
  return api<{ code: string; expiresAt: string }>(params);
}

export function buildInviteUrl(code: string): string {
  return `${window.location.origin}${window.location.pathname}#/register?invite=${code}`;
}

export function buildWhatsAppUrl(inviteUrl: string, memberName?: string, fromName?: string): string {
  const msg = `🌳 ${fromName || 'Votre famille'} vous invite à rejoindre l'arbre familial Confamily${memberName ? ' en tant que ' + memberName : ''} !\n\nInscrivez-vous ici : ${inviteUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

// ─────────────────────────────────────────────
// TREE BRIDGES
// ─────────────────────────────────────────────

export async function createBridge(member1Id: string, tree2Id: string, member2Id: string) {
  return api<{ bridgeId: string }>({ action: 'createBridge', member1Id, tree2Id, member2Id });
}

export async function confirmBridge(bridgeId: string) {
  return api({ action: 'confirmBridge', bridgeId });
}

export async function getBridges() {
  return api<{ bridges: TreeBridge[] }>({ action: 'getBridges' });
}

// ─────────────────────────────────────────────
// VAULT
// ─────────────────────────────────────────────

export async function uploadToVault(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ success: boolean; fileId?: string; url?: string; name?: string; size?: number; error?: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (onProgress && ev.lengthComputable) onProgress(Math.round(ev.loaded / ev.total * 100));
    };
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const res = await api<{ fileId: string; url: string; name: string; size: number }>({
          action: 'uploadToVault',
          fileName: file.name,
          mimeType: file.type,
          fileData: base64,
        });
        resolve(res);
      } catch (e) { reject(e); }
    };
    reader.readAsDataURL(file);
  });
}

export async function getVaultFiles() {
  return api<{ files: VaultFile[] }>({ action: 'getVaultFiles' });
}

export async function deleteVaultFile(fileId: string) {
  return api({ action: 'deleteVaultFile', fileId });
}

// ─────────────────────────────────────────────
// PREMIUM
// ─────────────────────────────────────────────

export async function upgradeUser() {
  return api({ action: 'upgradeUser' });
}

export async function submitPayment(method: string, transactionId: string) {
  return api({ action: 'submitPayment', method, transactionId });
}

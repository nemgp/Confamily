// Google Apps Script API Client
// Replace this URL with your deployed Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

async function request(action: string, data?: Record<string, unknown>) {
  try {
    const params = new URLSearchParams({ action, ...data as Record<string, string> });
    const res = await fetch(`${API_URL}?${params.toString()}`);
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return { success: false, error: 'Network error' };
  }
}

// ===== AUTH =====
export async function apiRegister(email: string, name: string, password: string) {
  return request('register', { email, name, password });
}

export async function apiLogin(email: string, password: string) {
  return request('login', { email, password });
}

// ===== MEMBERS =====
export async function apiGetMembers(treeId: string) {
  return request('getMembers', { treeId });
}

export async function apiAddMember(treeId: string, member: Record<string, string>) {
  return request('addMember', { treeId, ...member });
}

export async function apiUpdateMember(memberId: string, updates: Record<string, string>) {
  return request('updateMember', { memberId, ...updates });
}

// ===== MESSAGES =====
export async function apiGetMessages(userId: string, contactId: string) {
  return request('getMessages', { userId, contactId });
}

export async function apiSendMessage(fromId: string, toId: string, content: string, groupId?: string) {
  return request('sendMessage', { fromId, toId, content, groupId: groupId || '' });
}

export async function apiGetConversations(userId: string) {
  return request('getConversations', { userId });
}

// ===== PREMIUM =====
export async function apiUpgradeUser(userId: string) {
  return request('upgradeUser', { userId });
}

export async function apiUploadToVault(userId: string, fileName: string, fileData: string) {
  return request('uploadToVault', { userId, fileName, fileData });
}

export async function apiGetVaultFiles(userId: string) {
  return request('getVaultFiles', { userId });
}

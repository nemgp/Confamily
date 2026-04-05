import { create } from 'zustand';
import * as API from '../api/googleAPI';

export type User = {
  id: string;
  email: string;
  name: string;
  treeId: string;
  isPremium: boolean;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  darkMode: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  registerWithCredentials: (name: string, email: string, password: string, inviteCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  // Local fallback (demo / before API setup)
  loginLocal: (user: User) => void;
  toggleDarkMode: () => void;
  setPremium: (val: boolean) => Promise<void>;
  clearError: () => void;
}

// Restore from localStorage (API session key)
const savedUser = API.getStoredUser() || (() => {
  try { const u = localStorage.getItem('confamily_user'); return u ? JSON.parse(u) : null; } catch { return null; }
})();
const savedDark = localStorage.getItem('confamily_dark') === 'true';
if (savedDark) document.documentElement.setAttribute('data-theme', 'dark');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser,
  isAuthenticated: !!savedUser,
  darkMode: savedDark,
  isLoading: false,
  error: null,

  loginWithCredentials: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await API.login(email, password);
      if (res.success && res.user) {
        set({ user: res.user as User, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ error: res.error || 'Connexion échouée', isLoading: false });
      return false;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur réseau';
      // Fallback to mock mode if API not configured
      if (msg.includes('API non configurée')) {
        set({ error: 'Mode démo — configurez VITE_API_URL pour persister les données', isLoading: false });
      } else {
        set({ error: msg, isLoading: false });
      }
      return false;
    }
  },

  registerWithCredentials: async (name, email, password, inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const res = await API.register(name, email, password, inviteCode);
      if (res.success && res.user) {
        set({ user: res.user as User, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ error: res.error || 'Inscription échouée', isLoading: false });
      return false;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Erreur réseau', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try { await API.logout(); } catch {}
    localStorage.removeItem('confamily_user');
    set({ user: null, isAuthenticated: false });
  },

  // Local login (demo / mock data)
  loginLocal: (user) => {
    localStorage.setItem('confamily_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  toggleDarkMode: () => set((state) => {
    const next = !state.darkMode;
    localStorage.setItem('confamily_dark', String(next));
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
    return { darkMode: next };
  }),

  setPremium: async (val) => {
    if (val) {
      try { await API.upgradeUser(); } catch {}
    }
    set((state) => {
      if (state.user) {
        const u = { ...state.user, isPremium: val };
        localStorage.setItem('confamily_user', JSON.stringify(u));
        return { user: u };
      }
      return {};
    });
  },

  clearError: () => set({ error: null }),
}));

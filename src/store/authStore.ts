import { create } from 'zustand';

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
  login: (user: User) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  setPremium: (val: boolean) => void;
}

// Restore from localStorage
const savedUser = localStorage.getItem('confamily_user');
const savedDark = localStorage.getItem('confamily_dark') === 'true';
if (savedDark) document.documentElement.setAttribute('data-theme', 'dark');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
  darkMode: savedDark,
  login: (user) => {
    localStorage.setItem('confamily_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('confamily_user');
    set({ user: null, isAuthenticated: false });
  },
  toggleDarkMode: () => set((state) => {
    const next = !state.darkMode;
    localStorage.setItem('confamily_dark', String(next));
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
    return { darkMode: next };
  }),
  setPremium: (val) => set((state) => {
    if (state.user) {
      const u = { ...state.user, isPremium: val };
      localStorage.setItem('confamily_user', JSON.stringify(u));
      return { user: u };
    }
    return {};
  }),
}));

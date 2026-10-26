import { create } from 'zustand';

export type Theme = 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function applyTheme() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.remove('dark');
  document.documentElement.setAttribute('data-theme', 'light');
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('noctra-theme', 'light');
  }
}

// Immediately apply light theme
applyTheme();

export const useTheme = create<ThemeState>(() => ({
  theme: 'light',
  setTheme: () => applyTheme(),
  toggleTheme: () => applyTheme(),
}));

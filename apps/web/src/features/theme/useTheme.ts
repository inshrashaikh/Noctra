import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('noctra-theme') as Theme) || 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('noctra-theme', theme);
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('noctra-theme', next);
    applyTheme(next);
    set({ theme: next });
  },
}));

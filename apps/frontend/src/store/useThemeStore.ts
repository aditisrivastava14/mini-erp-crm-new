import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: typeof window !== 'undefined' && localStorage.getItem('theme')
        ? localStorage.getItem('theme') === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleTheme: () => set((state) => {
        const newTheme = !state.isDarkMode;
        if (newTheme) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
        return { isDarkMode: newTheme };
      }),
      setTheme: (isDark) => set(() => {
        if (isDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
        return { isDarkMode: isDark };
      }),
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);


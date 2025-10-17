import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
      },
      
      setTheme: (theme) => set({ theme }),
      
      initTheme: () => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
          set({ theme: savedTheme })
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          set({ theme: prefersDark ? 'dark' : 'light' })
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
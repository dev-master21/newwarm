// frontend/src/store/themeStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // По умолчанию светлая тема
      
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
          // По умолчанию светлая тема
          set({ theme: 'light' })
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
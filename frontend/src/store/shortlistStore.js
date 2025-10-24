import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export const useShortlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (villa) => {
        const items = get().items
        const exists = items.some(item => item.id === villa.id)
        
        if (!exists) {
          set({ items: [...items, villa] })
          toast.success('Added to shortlist')
        } else {
          toast.info('Already in shortlist')
        }
      },
      
      removeItem: (villaId) => {
        set({ items: get().items.filter(item => item.id !== villaId) })
        toast.success('Removed from shortlist')
      },
      
      isInShortlist: (villaId) => {
        return get().items.some(item => item.id === villaId)
      },
      
      clearAll: () => {
        set({ items: [] })
        toast.success('Shortlist cleared')
      },
    }),
    {
      name: 'shortlist-storage',
    }
  )
)
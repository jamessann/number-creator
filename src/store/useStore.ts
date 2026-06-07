import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FictionalNumber, Exponent, Theme } from '../types'

interface State {
  numbers: FictionalNumber[]
  exponents: Exponent[]
  theme: Theme
  unlimitedStrength: boolean

  addNumber: (n: Omit<FictionalNumber, 'id' | 'createdAt'>) => FictionalNumber
  removeNumber: (id: string) => void
  addExponent: (e: Omit<Exponent, 'id' | 'createdAt'>) => Exponent
  removeExponent: (id: string) => void
  setTheme: (theme: Theme) => void
  setUnlimitedStrength: (on: boolean) => void
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      numbers: [],
      exponents: [],
      theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      unlimitedStrength: false,

      addNumber: (n) => {
        const created: FictionalNumber = { ...n, id: uid(), createdAt: Date.now() }
        set((s) => ({ numbers: [created, ...s.numbers] }))
        return created
      },
      removeNumber: (id) => set((s) => ({ numbers: s.numbers.filter((n) => n.id !== id) })),

      addExponent: (e) => {
        const created: Exponent = { ...e, id: uid(), createdAt: Date.now() }
        set((s) => ({ exponents: [created, ...s.exponents] }))
        return created
      },
      removeExponent: (id) => set((s) => ({ exponents: s.exponents.filter((e) => e.id !== id) })),

      setTheme: (theme) => set({ theme }),
      setUnlimitedStrength: (unlimitedStrength) => set({ unlimitedStrength }),
    }),
    { name: 'number-creator-store' }
  )
)

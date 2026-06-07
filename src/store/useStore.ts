import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FictionalNumber, Exponent, CustomTier, Theme } from '../types'
import { registerCustomTiers } from '../lib/bignum'

interface State {
  numbers: FictionalNumber[]
  exponents: Exponent[]
  customTiers: CustomTier[]
  theme: Theme
  unlimitedStrength: boolean

  addNumber: (n: Omit<FictionalNumber, 'id' | 'createdAt'>) => FictionalNumber
  removeNumber: (id: string) => void
  addExponent: (e: Omit<Exponent, 'id' | 'createdAt'>) => Exponent
  removeExponent: (id: string) => void
  addTier: (t: { name: string; short: string; desc: string }) => CustomTier
  removeTier: (token: string) => void
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
      customTiers: [],
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

      addTier: (t) => {
        const created: CustomTier = {
          token: `TIER_${uid()}`,
          name: t.name,
          short: t.short,
          desc: t.desc,
          createdAt: Date.now(),
        }
        set((s) => {
          const customTiers = [...s.customTiers, created]
          registerCustomTiers(customTiers)
          return { customTiers }
        })
        return created
      },
      removeTier: (token) =>
        set((s) => {
          const customTiers = s.customTiers.filter((t) => t.token !== token)
          registerCustomTiers(customTiers)
          return { customTiers }
        }),

      setTheme: (theme) => set({ theme }),
      setUnlimitedStrength: (unlimitedStrength) => set({ unlimitedStrength }),
    }),
    {
      name: 'number-creator-store',
      // Re-plug saved custom tiers into the ladder when the app loads.
      onRehydrateStorage: () => (state) => {
        if (state?.customTiers?.length) registerCustomTiers(state.customTiers)
      },
    }
  )
)

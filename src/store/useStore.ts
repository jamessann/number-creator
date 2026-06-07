import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FictionalNumber, Exponent, CustomTier, Automation, Theme } from '../types'
import { registerCustomTiers, tierOfValue, valueAtTier } from '../lib/bignum'

interface State {
  numbers: FictionalNumber[]
  exponents: Exponent[]
  customTiers: CustomTier[]
  automations: Automation[]
  theme: Theme
  unlimitedStrength: boolean

  addNumber: (n: Omit<FictionalNumber, 'id' | 'createdAt'>) => FictionalNumber
  removeNumber: (id: string) => void
  setNumberValue: (id: string, value: string) => void
  addExponent: (e: Omit<Exponent, 'id' | 'createdAt'>) => Exponent
  removeExponent: (id: string) => void
  addTier: (t: { name: string; short: string; desc: string; rank: number }) => CustomTier
  removeTier: (token: string) => void
  addAutomation: (a: { name: string; gainTiers: number; intervalSecs: number; numberId: string }) => Automation
  removeAutomation: (id: string) => void
  /** Apply any due automation gains up to `now` (called on load + on a timer). */
  runAutomations: (now: number) => void
  setTheme: (theme: Theme) => void
  setUnlimitedStrength: (on: boolean) => void
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      numbers: [],
      exponents: [],
      customTiers: [],
      automations: [],
      theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      unlimitedStrength: false,

      addNumber: (n) => {
        const created: FictionalNumber = { ...n, id: uid(), createdAt: Date.now() }
        set((s) => ({ numbers: [created, ...s.numbers] }))
        return created
      },
      removeNumber: (id) => set((s) => ({ numbers: s.numbers.filter((n) => n.id !== id) })),
      setNumberValue: (id, value) =>
        set((s) => ({
          numbers: s.numbers.map((n) => (n.id === id ? { ...n, value } : n)),
        })),

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
          rank: t.rank,
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

      addAutomation: (a) => {
        const created: Automation = {
          ...a,
          id: uid(),
          lastTick: Date.now(),
          createdAt: Date.now(),
        }
        set((s) => ({ automations: [created, ...s.automations] }))
        return created
      },
      removeAutomation: (id) =>
        set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })),

      runAutomations: (now) => {
        const s = get()
        if (!s.automations.length) return
        const numbers = [...s.numbers]
        let changed = false

        const automations = s.automations.map((a) => {
          const idx = numbers.findIndex((n) => n.id === a.numberId)
          if (idx === -1) return a
          const intervalMs = a.intervalSecs * 1000
          const steps = Math.floor((now - a.lastTick) / intervalMs)
          if (steps <= 0) return a
          changed = true
          const newTier = tierOfValue(numbers[idx].value) + a.gainTiers * steps
          numbers[idx] = { ...numbers[idx], value: valueAtTier(newTier) }
          return { ...a, lastTick: a.lastTick + steps * intervalMs }
        })

        if (changed) set({ numbers, automations })
      },

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

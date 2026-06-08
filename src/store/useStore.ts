import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FictionalNumber, Exponent, CustomTier, Automation, ChallengeState, Theme } from '../types'
import { registerCustomTiers, parseTier, makeTierValue, valueAtTier } from '../lib/bignum'
import { CHALLENGES, rollReward, type Difficulty, type Reward } from '../lib/challenges'
import { generateGlyph, generateDefinition } from '../lib/generator'

interface State {
  numbers: FictionalNumber[]
  exponents: Exponent[]
  customTiers: CustomTier[]
  automations: Automation[]
  challenges: ChallengeState
  /** Seconds shaved off every automation's interval (from challenge rewards). Stacks. */
  automationSpeedBonus: number
  /** Highest tier level the player has unlocked (1 = normal tiers). */
  maxTierLevel: number
  theme: Theme
  unlimitedStrength: boolean

  addNumber: (n: Omit<FictionalNumber, 'id' | 'createdAt'>) => FictionalNumber
  removeNumber: (id: string) => void
  setNumberValue: (id: string, value: string) => void
  addExponent: (e: Omit<Exponent, 'id' | 'createdAt'>) => Exponent
  removeExponent: (id: string) => void
  addTier: (t: { name: string; short: string; desc: string; rank: number }) => CustomTier
  removeTier: (token: string) => void
  addAutomation: (a: { name: string; gainTiers: number; intervalSecs: number; numberIds: string[] }) => Automation
  removeAutomation: (id: string) => void
  runAutomations: (now: number) => void
  tickChallenges: () => void
  recordDetailedNumber: () => void
  claimChallenge: (d: Difficulty) => Reward | null
  setTheme: (theme: Theme) => void
  setUnlimitedStrength: (on: boolean) => void
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function dayKey(): string {
  return new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local
}

function freshChallenges(day: string): ChallengeState {
  return { day, playSeconds: 0, detailedCount: 0, claimed: { easy: false, medium: false, hard: false } }
}

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function buildFreeNumber(value: string): FictionalNumber {
  const glyph = generateGlyph()
  const def = generateDefinition()
  return {
    id: uid(),
    name: def.name,
    englishContext: def.englishContext,
    value,
    svgPath: glyph.svgPath,
    viewBox: glyph.viewBox,
    createdAt: Date.now(),
  }
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      numbers: [],
      exponents: [],
      customTiers: [],
      automations: [],
      challenges: freshChallenges(dayKey()),
      automationSpeedBonus: 0,
      maxTierLevel: 1,
      theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      unlimitedStrength: false,

      addNumber: (n) => {
        const created: FictionalNumber = { ...n, id: uid(), createdAt: Date.now() }
        set((s) => ({ numbers: [created, ...s.numbers] }))
        return created
      },
      removeNumber: (id) => set((s) => ({ numbers: s.numbers.filter((n) => n.id !== id) })),
      setNumberValue: (id, value) =>
        set((s) => ({ numbers: s.numbers.map((n) => (n.id === id ? { ...n, value } : n)) })),

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
        const created: Automation = { ...a, id: uid(), lastTick: Date.now(), createdAt: Date.now() }
        set((s) => ({ automations: [created, ...s.automations] }))
        return created
      },
      removeAutomation: (id) =>
        set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })),

      runAutomations: (now) => {
        const s = get()
        if (!s.automations.length) return
        const bonus = s.automationSpeedBonus || 0
        const numbers = [...s.numbers]
        let changed = false

        const automations = s.automations.map((a) => {
          const intervalMs = Math.max(100, (a.intervalSecs - bonus) * 1000)
          const steps = Math.floor((now - a.lastTick) / intervalMs)
          if (steps <= 0) return a
          const ids = a.numberIds ?? (a.numberId ? [a.numberId] : [])
          ids.forEach((id) => {
            const idx = numbers.findIndex((n) => n.id === id)
            if (idx === -1) return
            const { level, tier } = parseTier(numbers[idx].value)
            numbers[idx] = { ...numbers[idx], value: makeTierValue(level, tier + a.gainTiers * steps) }
          })
          changed = true
          return { ...a, lastTick: a.lastTick + steps * intervalMs }
        })

        if (changed) set({ numbers, automations })
      },

      tickChallenges: () => {
        const today = dayKey()
        set((s) =>
          s.challenges.day !== today
            ? { challenges: freshChallenges(today) }
            : { challenges: { ...s.challenges, playSeconds: s.challenges.playSeconds + 1 } }
        )
      },

      recordDetailedNumber: () =>
        set((s) => {
          const today = dayKey()
          const c = s.challenges.day === today ? s.challenges : freshChallenges(today)
          return { challenges: { ...c, detailedCount: c.detailedCount + 1 } }
        }),

      claimChallenge: (d) => {
        const s = get()
        const def = CHALLENGES.find((x) => x.id === d)
        if (!def) return null
        const progress = def.metric === 'play' ? s.challenges.playSeconds : s.challenges.detailedCount
        if (progress < def.target || s.challenges.claimed[d]) return null

        const reward = rollReward(d)
        set((state) => {
          const next: Partial<State> = {
            challenges: { ...state.challenges, claimed: { ...state.challenges.claimed, [d]: true } },
          }
          if (reward.kind === 'autoSpeed') {
            next.automationSpeedBonus = (state.automationSpeedBonus || 0) + reward.amount
          } else if (reward.kind === 'freeNumber') {
            const tier = randInt(reward.tierMin, reward.tierMax)
            next.numbers = [buildFreeNumber(valueAtTier(tier)), ...state.numbers]
          } else if (reward.kind === 'bumpAll') {
            next.numbers = state.numbers.map((n) => {
              const { level, tier } = parseTier(n.value)
              return { ...n, value: makeTierValue(level, tier + reward.tiers) }
            })
          } else if (reward.kind === 'tierLevel') {
            const newLevel = (state.maxTierLevel || 1) + 1
            next.maxTierLevel = newLevel
            next.numbers = [buildFreeNumber(makeTierValue(newLevel, randInt(9, 100))), ...state.numbers]
          }
          return next
        })
        return reward
      },

      setTheme: (theme) => set({ theme }),
      setUnlimitedStrength: (unlimitedStrength) => set({ unlimitedStrength }),
    }),
    {
      name: 'number-creator-store',
      onRehydrateStorage: () => (state) => {
        if (state?.customTiers?.length) registerCustomTiers(state.customTiers)
      },
    }
  )
)

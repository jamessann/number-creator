import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FictionalNumber, Exponent, CustomTier, Automation, ChallengeState, Theme } from '../types'
import { registerCustomTiers, parseTier, makeTierValue, valueAtTier } from '../lib/bignum'
import {
  challengesForIndex,
  dayIndexOf,
  progressFor,
  rollReward,
  PERIOD_MS,
  type Difficulty,
  type Reward,
  type ProgressSnapshot,
} from '../lib/challenges'
import { generateGlyph, generateDefinition } from '../lib/generator'

interface State {
  numbers: FictionalNumber[]
  exponents: Exponent[]
  customTiers: CustomTier[]
  automations: Automation[]
  challenges: ChallengeState
  /** Seconds shaved off every automation's interval (rewards + shop). Stacks. */
  automationSpeedBonus: number
  /** Highest tier level the player has unlocked (1 = normal tiers). */
  maxTierLevel: number
  /** Premium currency earned from challenges. */
  jewels: number
  /** Total seconds spent in the app across all time. */
  totalPlaySeconds: number
  /** Seconds spent in the app this calendar day (for the Create page). */
  todayPlaySeconds: number
  /** Calendar day the todayPlaySeconds counter belongs to. */
  calDay: string
  /** How many times the current challenges have been reset (shifts the rotation). */
  challengeOffset: number
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
  recordNumberCreated: (detailed: boolean) => void
  recordExponentApplied: () => void
  claimChallenge: (d: Difficulty) => Reward | null
  resetChallenges: () => boolean
  buyTierLevel: () => boolean
  buyAutoSpeed: () => boolean
  setTheme: (theme: Theme) => void
  setUnlimitedStrength: (on: boolean) => void
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// The challenge period key: which 10-hour window we're in (as a string).
function dayKey(): string {
  return String(Math.floor(Date.now() / PERIOD_MS))
}

// Calendar day, used for the Create page's "today" playtime.
function calDayKey(): string {
  return new Date().toLocaleDateString('en-CA')
}

function freshChallenges(day: string): ChallengeState {
  return {
    day,
    playSeconds: 0,
    numbersCreated: 0,
    detailedCount: 0,
    exponentsApplied: 0,
    automationsStarted: 0,
    customTiersMade: 0,
    claimed: { easy: false, medium: false, hard: false },
    rewards: {},
  }
}

/** Return today's challenge state, resetting it if the day has rolled over. */
function today(c: ChallengeState): ChallengeState {
  return c.day === dayKey() ? c : freshChallenges(dayKey())
}

function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function snapshotOf(s: State): ProgressSnapshot {
  const c = today(s.challenges)
  let maxTier = 0
  let maxLevel = s.maxTierLevel || 1
  for (const n of s.numbers) {
    const { level, tier } = parseTier(n.value)
    if (level > maxLevel) maxLevel = level
    const eff = level > 1 ? Number.MAX_SAFE_INTEGER : tier
    if (eff > maxTier) maxTier = eff
  }
  return {
    playSeconds: c.playSeconds ?? 0,
    numbersCreated: c.numbersCreated ?? 0,
    detailedCount: c.detailedCount ?? 0,
    exponentsApplied: c.exponentsApplied ?? 0,
    automationsStarted: c.automationsStarted ?? 0,
    customTiersMade: c.customTiersMade ?? 0,
    maxTier,
    maxTierLevel: maxLevel,
  }
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
      jewels: 0,
      totalPlaySeconds: 0,
      todayPlaySeconds: 0,
      calDay: calDayKey(),
      challengeOffset: 0,
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
          const c = today(s.challenges)
          return { customTiers, challenges: { ...c, customTiersMade: c.customTiersMade + 1 } }
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
        set((s) => {
          const c = today(s.challenges)
          return {
            automations: [created, ...s.automations],
            challenges: { ...c, automationsStarted: c.automationsStarted + 1 },
          }
        })
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
        set((s) => {
          const c = today(s.challenges)
          const cal = calDayKey()
          const todayPlaySeconds = s.calDay === cal ? (s.todayPlaySeconds || 0) + 1 : 1
          return {
            challenges: { ...c, playSeconds: c.playSeconds + 1 },
            totalPlaySeconds: (s.totalPlaySeconds || 0) + 1,
            todayPlaySeconds,
            calDay: cal,
          }
        })
      },

      recordNumberCreated: (detailed) =>
        set((s) => {
          const c = today(s.challenges)
          return {
            challenges: {
              ...c,
              numbersCreated: c.numbersCreated + 1,
              detailedCount: detailed ? c.detailedCount + 1 : c.detailedCount,
            },
          }
        }),

      recordExponentApplied: () =>
        set((s) => {
          const c = today(s.challenges)
          return { challenges: { ...c, exponentsApplied: c.exponentsApplied + 1 } }
        }),

      claimChallenge: (d) => {
        const s = get()
        const def = challengesForIndex(dayIndexOf(dayKey()) + (s.challengeOffset || 0)).find((x) => x.id === d)
        if (!def) return null
        const progress = progressFor(def.metric, snapshotOf(s))
        if (progress < def.target || s.challenges.claimed[d]) return null

        const reward = rollReward(d)
        set((state) => {
          const next: Partial<State> = {
            challenges: {
              ...state.challenges,
              claimed: { ...state.challenges.claimed, [d]: true },
              rewards: { ...state.challenges.rewards, [d]: reward.label },
            },
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
          } else if (reward.kind === 'jewels') {
            next.jewels = (state.jewels || 0) + reward.amount
          }
          return next
        })
        return reward
      },

      resetChallenges: () => {
        const s = get()
        if ((s.jewels || 0) < 35) return false
        set((state) => {
          const c = today(state.challenges)
          return {
            jewels: state.jewels - 35,
            challengeOffset: (state.challengeOffset || 0) + 1,
            challenges: {
              ...c,
              numbersCreated: 0,
              detailedCount: 0,
              exponentsApplied: 0,
              automationsStarted: 0,
              customTiersMade: 0,
              claimed: { easy: false, medium: false, hard: false },
              rewards: {},
            },
          }
        })
        return true
      },

      buyTierLevel: () => {
        const s = get()
        if ((s.jewels || 0) < 20) return false
        set((state) => {
          const newLevel = (state.maxTierLevel || 1) + 1
          return {
            jewels: state.jewels - 20,
            maxTierLevel: newLevel,
            numbers: [buildFreeNumber(makeTierValue(newLevel, randInt(9, 100))), ...state.numbers],
          }
        })
        return true
      },

      buyAutoSpeed: () => {
        const s = get()
        if ((s.jewels || 0) < 20) return false
        set((state) => ({
          jewels: state.jewels - 20,
          automationSpeedBonus: (state.automationSpeedBonus || 0) + 0.02,
        }))
        return true
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

export type Difficulty = 'easy' | 'medium' | 'hard'

export type Metric =
  | 'play' // seconds in the app today
  | 'create' // numbers created today
  | 'detailed' // detailed numbers created today
  | 'exponent' // exponents applied today
  | 'automation' // automations started today
  | 'customtier' // custom infinities made today
  | 'maxtier' // highest tier reached (any number)
  | 'tierlevel' // highest tier level reached

export interface ChallengeDef {
  id: Difficulty
  title: string
  goal: string
  target: number
  metric: Metric
  emoji: string
}

type Variant = { goal: string; target: number; metric: Metric }

// Each difficulty rotates through this list of UNIQUE challenges — a different
// one each refresh, repeating once the whole cycle is used up.
// These all take real effort (time, lots of detailed numbers, or tier levels)
// so none can be finished instantly.
const EASY_POOL: Variant[] = [
  { goal: 'Stay in the game for 2 minutes', target: 120, metric: 'play' },
  { goal: 'Stay in the game for 3 minutes', target: 180, metric: 'play' },
  { goal: 'Create 2 detailed numbers (good drawing + description)', target: 2, metric: 'detailed' },
  { goal: 'Use exponents 3 times', target: 3, metric: 'exponent' },
  { goal: 'Start 2 automations', target: 2, metric: 'automation' },
  { goal: 'Create 3 detailed numbers', target: 3, metric: 'detailed' },
]

const MEDIUM_POOL: Variant[] = [
  { goal: 'Stay in the game for 15 minutes', target: 900, metric: 'play' },
  { goal: 'Stay in the game for 10 minutes', target: 600, metric: 'play' },
  { goal: 'Create 6 detailed numbers (good drawing + description)', target: 6, metric: 'detailed' },
  { goal: 'Use exponents 8 times', target: 8, metric: 'exponent' },
  { goal: 'Create 8 detailed numbers', target: 8, metric: 'detailed' },
  { goal: 'Stay in the game for 20 minutes', target: 1200, metric: 'play' },
]

const HARD_POOL: Variant[] = [
  { goal: 'Create 20 detailed numbers (good drawing + description)', target: 20, metric: 'detailed' },
  { goal: 'Stay in the game for 30 minutes', target: 1800, metric: 'play' },
  { goal: 'Reach tier level 2 — make a "tier tier" number!', target: 2, metric: 'tierlevel' },
  { goal: 'Use exponents 15 times', target: 15, metric: 'exponent' },
  { goal: 'Create 15 detailed numbers', target: 15, metric: 'detailed' },
  { goal: 'Stay in the game for 25 minutes', target: 1500, metric: 'play' },
]

/** How many periods the whole rotation lasts before it repeats. */
export const CYCLE_LENGTH = EASY_POOL.length // 6

/** Challenges refresh on this cooldown. */
export const PERIOD_HOURS = 10
export const PERIOD_MS = PERIOD_HOURS * 60 * 60 * 1000

/** The challenge period key is just the period index stored as a string. */
export function dayIndexOf(day: string): number {
  const n = Number(day)
  return Number.isFinite(n) ? n : 0
}

/** The three challenges for a given rotation index (cycles forever). */
export function challengesForIndex(index: number): ChallengeDef[] {
  const i = ((index % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH
  return [
    { id: 'easy', title: 'Easy', emoji: '🟢', ...EASY_POOL[i] },
    { id: 'medium', title: 'Medium', emoji: '🟡', ...MEDIUM_POOL[i] },
    { id: 'hard', title: 'Hard', emoji: '🔴', ...HARD_POOL[i] },
  ]
}

/** The three challenges for a given day. */
export function challengesForDay(day: string): ChallengeDef[] {
  return challengesForIndex(dayIndexOf(day))
}

export interface ProgressSnapshot {
  playSeconds: number
  numbersCreated: number
  detailedCount: number
  exponentsApplied: number
  automationsStarted: number
  customTiersMade: number
  maxTier: number
  maxTierLevel: number
}

export function progressFor(metric: Metric, s: ProgressSnapshot): number {
  switch (metric) {
    case 'play':
      return s.playSeconds
    case 'create':
      return s.numbersCreated
    case 'detailed':
      return s.detailedCount
    case 'exponent':
      return s.exponentsApplied
    case 'automation':
      return s.automationsStarted
    case 'customtier':
      return s.customTiersMade
    case 'maxtier':
      return s.maxTier
    case 'tierlevel':
      return s.maxTierLevel
  }
}

export type Reward =
  | { kind: 'autoSpeed'; amount: number; label: string }
  | { kind: 'freeNumber'; tierMin: number; tierMax: number; label: string }
  | { kind: 'bumpAll'; tiers: number; label: string }
  | { kind: 'tierLevel'; label: string }
  | { kind: 'jewels'; amount: number; label: string }

export const REWARD_POOLS: Record<Difficulty, Reward[]> = {
  easy: [
    { kind: 'autoSpeed', amount: 0.005, label: 'Faster automations: −0.005s apply time (stacks!)' },
    { kind: 'freeNumber', tierMin: 1, tierMax: 9, label: 'A free surprise number (tier 1–9)!' },
    { kind: 'bumpAll', tiers: 2, label: '+2 tiers to ALL your numbers!' },
    { kind: 'jewels', amount: 5, label: '5 jewels 💎' },
  ],
  medium: [
    { kind: 'freeNumber', tierMin: 9, tierMax: 1000000, label: 'A free detailed number (tier 9 to 1,000,000)!' },
    { kind: 'autoSpeed', amount: 0.01, label: 'Faster automations: −0.01s apply time (stacks!)' },
    { kind: 'bumpAll', tiers: 10, label: '+10 tiers to ALL your numbers!' },
    { kind: 'jewels', amount: 10, label: '10 jewels 💎' },
  ],
  hard: [
    { kind: 'tierLevel', label: '+1 Tier Level — a free "tier tier" number layer! 🔼' },
    { kind: 'autoSpeed', amount: 0.02, label: 'Faster automations: −0.02s apply time (stacks!)' },
    { kind: 'jewels', amount: 20, label: '20 jewels 💎' },
  ],
}

export function rollReward(d: Difficulty): Reward {
  const pool = REWARD_POOLS[d]
  return pool[Math.floor(Math.random() * pool.length)]
}

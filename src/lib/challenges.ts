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
// one each day, repeating once the whole cycle is used up.
const EASY_POOL: Variant[] = [
  { goal: 'Stay in the game for 2 minutes', target: 120, metric: 'play' },
  { goal: 'Create 3 numbers', target: 3, metric: 'create' },
  { goal: 'Use an exponent 1 time', target: 1, metric: 'exponent' },
  { goal: 'Start 1 automation', target: 1, metric: 'automation' },
  { goal: 'Stay in the game for 1 minute', target: 60, metric: 'play' },
  { goal: 'Create 5 numbers', target: 5, metric: 'create' },
]

const MEDIUM_POOL: Variant[] = [
  { goal: 'Stay in the game for 15 minutes', target: 900, metric: 'play' },
  { goal: 'Create 10 numbers', target: 10, metric: 'create' },
  { goal: 'Make 3 of your own infinities', target: 3, metric: 'customtier' },
  { goal: 'Use exponents 5 times', target: 5, metric: 'exponent' },
  { goal: 'Create 5 detailed numbers', target: 5, metric: 'detailed' },
  { goal: 'Get any number to tier 50', target: 50, metric: 'maxtier' },
]

const HARD_POOL: Variant[] = [
  { goal: 'Create 20 detailed numbers (good drawing + description)', target: 20, metric: 'detailed' },
  { goal: 'Stay in the game for 30 minutes', target: 1800, metric: 'play' },
  { goal: 'Reach a tier level (make a "tier tier" number!)', target: 2, metric: 'tierlevel' },
  { goal: 'Get any number to tier 1000', target: 1000, metric: 'maxtier' },
  { goal: 'Start 5 automations', target: 5, metric: 'automation' },
  { goal: 'Create 30 numbers', target: 30, metric: 'create' },
]

/** How many days the whole rotation lasts before it repeats. */
export const CYCLE_LENGTH = EASY_POOL.length // 6

/** Whole-days since the Unix epoch for a YYYY-MM-DD day key. */
export function dayIndexOf(day: string): number {
  const ms = Date.parse(`${day}T00:00:00Z`)
  return isNaN(ms) ? 0 : Math.floor(ms / 86400000)
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

export const REWARD_POOLS: Record<Difficulty, Reward[]> = {
  easy: [
    { kind: 'autoSpeed', amount: 0.005, label: 'Faster automations: −0.005s apply time (stacks!)' },
    { kind: 'freeNumber', tierMin: 1, tierMax: 9, label: 'A free surprise number (tier 1–9)!' },
    { kind: 'bumpAll', tiers: 2, label: '+2 tiers to ALL your numbers!' },
  ],
  medium: [
    { kind: 'freeNumber', tierMin: 9, tierMax: 1000000, label: 'A free detailed number (tier 9 to 1,000,000)!' },
    { kind: 'autoSpeed', amount: 0.01, label: 'Faster automations: −0.01s apply time (stacks!)' },
    { kind: 'bumpAll', tiers: 10, label: '+10 tiers to ALL your numbers!' },
  ],
  hard: [
    { kind: 'tierLevel', label: '+1 Tier Level — a free "tier tier" number layer! 🔼' },
    { kind: 'autoSpeed', amount: 0.02, label: 'Faster automations: −0.02s apply time (stacks!)' },
  ],
}

export function rollReward(d: Difficulty): Reward {
  const pool = REWARD_POOLS[d]
  return pool[Math.floor(Math.random() * pool.length)]
}

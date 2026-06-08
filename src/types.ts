export interface FictionalNumber {
  id: string
  name: string
  englishContext: string
  /** Either a decimal digit string (any size) or a boundless token — see lib/bignum. */
  value: string
  svgPath: string
  viewBox: string
  createdAt: number
}

export interface Exponent {
  id: string
  name: string
  /** The tier this exponent upgrades a number to. */
  targetTier: number
  /** Legacy: old exponents stored a multiplier instead of a target tier. */
  multiplier?: number
  explanation: string
  example: string
  createdAt: number
}

export interface Automation {
  id: string
  name: string
  /** Tiers added each time it activates. */
  gainTiers: number
  /** Seconds between activations (0.5 → 86400). */
  intervalSecs: number
  /** The fictional numbers this automation grows. */
  numberIds: string[]
  /** Legacy: older automations grew a single number. */
  numberId?: string
  /** Timestamp of the last applied activation (ms). */
  lastTick: number
  createdAt: number
}

export interface CustomTier {
  token: string
  name: string
  short: string
  desc: string
  /** Chosen position on the infinite ladder (higher = bigger). */
  rank: number
  createdAt: number
}

export interface ChallengeState {
  /** Local day key (YYYY-MM-DD) these counts belong to. */
  day: string
  /** Seconds spent in the app today. */
  playSeconds: number
  /** Numbers created today. */
  numbersCreated: number
  /** Detailed numbers created today. */
  detailedCount: number
  /** Exponents applied today. */
  exponentsApplied: number
  /** Automations started today. */
  automationsStarted: number
  /** Custom infinities made today. */
  customTiersMade: number
  claimed: { easy: boolean; medium: boolean; hard: boolean }
  /** The reward label won for each claimed challenge (so it stays visible). */
  rewards: { easy?: string; medium?: string; hard?: string }
}

export type Theme = 'light' | 'dark'

export interface Settings {
  theme: Theme
  unlimitedStrength: boolean
}

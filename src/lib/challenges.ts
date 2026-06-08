export type Difficulty = 'easy' | 'medium' | 'hard'

export interface ChallengeDef {
  id: Difficulty
  title: string
  goal: string
  target: number
  metric: 'play' | 'detailed'
  emoji: string
}

export const CHALLENGES: ChallengeDef[] = [
  { id: 'easy', title: 'Easy', goal: 'Stay in the game for 2 minutes', target: 120, metric: 'play', emoji: '🟢' },
  { id: 'medium', title: 'Medium', goal: 'Stay in the game for 15 minutes', target: 900, metric: 'play', emoji: '🟡' },
  { id: 'hard', title: 'Hard', goal: 'Create 20 detailed numbers (good drawing + description)', target: 20, metric: 'detailed', emoji: '🔴' },
]

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

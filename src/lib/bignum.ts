// A fictional number's "worth" can be:
//  - a finite whole number of any size (stored as a plain digit string, math via BigInt), or
//  - a "boundless" legendary number too big (or too infinite) to write out.
//
// Boundless numbers come in two kinds:
//  - 'huge'     finite but unimaginably big (Googolplex, Graham's Number)
//  - 'infinite' actual infinities / cardinals (∞, ℵ₀, ℵ₁, Ω)

export type Boundless = {
  token: string
  name: string
  short: string
  kind: 'huge' | 'infinite'
  desc: string
  /** Position on the infinite ladder (higher = bigger). Only for kind 'infinite'. */
  rank?: number
  /** True for tiers beyond real maths — pure imagination. */
  fictional?: boolean
  /** True for user-created tiers. */
  custom?: boolean
}

export const BOUNDLESS: Record<string, Boundless> = {
  GOOGOLPLEX: {
    token: 'GOOGOLPLEX',
    name: 'Googolplex',
    short: 'googolplex',
    kind: 'huge',
    desc: '1 followed by a googol zeros — too big to ever write down!',
  },
  GRAHAMS: {
    token: 'GRAHAMS',
    name: "Graham's Number",
    short: "Graham's number",
    kind: 'huge',
    desc: 'So huge the whole universe is too small to write it — but still finite!',
  },
  INFINITY: {
    token: 'INFINITY',
    name: 'Infinity',
    short: '∞',
    kind: 'infinite',
    rank: 1,
    desc: 'Bigger than every number. It never, ever ends.',
  },
  ALEPH_NULL: {
    token: 'ALEPH_NULL',
    name: 'Aleph-null',
    short: 'ℵ₀',
    kind: 'infinite',
    rank: 2,
    desc: 'The smallest infinity — it counts all the whole numbers.',
  },
  ALEPH_ONE: {
    token: 'ALEPH_ONE',
    name: 'Aleph-one',
    short: 'ℵ₁',
    kind: 'infinite',
    rank: 3,
    desc: 'An even BIGGER infinity than aleph-null!',
  },
  ABSOLUTE: {
    token: 'ABSOLUTE',
    name: 'Absolute Infinity',
    short: 'Ω',
    kind: 'infinite',
    rank: 4,
    desc: 'The biggest infinity in real maths. Past here, it is all imagination!',
  },
  // --- Beyond real maths: pure fictional imagination ---
  BEYOND: {
    token: 'BEYOND',
    name: 'Beyond Infinity',
    short: 'Ω⁺',
    kind: 'infinite',
    rank: 5,
    fictional: true,
    desc: 'One step past the biggest real infinity. You are in imagination now!',
  },
  HYPER: {
    token: 'HYPER',
    name: 'Hyper Infinity',
    short: 'Ω²',
    kind: 'infinite',
    rank: 6,
    fictional: true,
    desc: 'Infinity stacked on infinity. Whoa.',
  },
  COSMIC: {
    token: 'COSMIC',
    name: 'Cosmic Infinity',
    short: 'Ω∞',
    kind: 'infinite',
    rank: 7,
    fictional: true,
    desc: 'So big it would fill every universe... twice.',
  },
  HOOPER: {
    token: 'HOOPER',
    name: "Hooper's Infinity",
    short: '✦',
    kind: 'infinite',
    rank: 8,
    fictional: true,
    desc: 'The biggest number anyone has ever imagined. Nothing beats it. 👑',
  },
}

// --- Dynamic registry: built-ins plus user-created custom tiers ---

// The live set of boundless numbers (built-ins + custom). Functions read this.
let registry: Record<string, Boundless> = { ...BOUNDLESS }
// Infinite tiers in ascending size order (rebuilt whenever custom tiers change).
let infiniteLadder: string[] = buildLadder(registry)

function buildLadder(map: Record<string, Boundless>): string[] {
  return Object.values(map)
    .filter((b) => b.kind === 'infinite')
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((b) => b.token)
}

/**
 * Plug user-created tiers into the ladder. Each custom tier sits ABOVE every
 * built-in (and earlier custom) tier, in creation order — so the newest one a
 * user invents becomes the biggest number of all.
 */
export function registerCustomTiers(tiers: Array<{ token: string; name: string; short: string; desc: string; createdAt: number }>): void {
  const next: Record<string, Boundless> = { ...BOUNDLESS }
  const ordered = [...tiers].sort((a, b) => a.createdAt - b.createdAt)
  ordered.forEach((t, i) => {
    next[t.token] = {
      token: t.token,
      name: t.name,
      short: t.short,
      kind: 'infinite',
      fictional: true,
      custom: true,
      rank: 100 + i, // always above the built-in ladder (max rank 8)
      desc: t.desc,
    }
  })
  registry = next
  infiniteLadder = buildLadder(next)
}

/** Quick-pick chips for any custom tiers (for the worth picker). */
export function customTierChips(
  tiers: Array<{ token: string; name: string; short: string }>
): LegendaryPick[] {
  return tiers.map((t) => ({ label: `${t.short} ${t.name}`, value: t.token }))
}

// Quick-pick chips for the "how much is it worth?" picker.
export interface LegendaryPick {
  label: string
  value: string // digit string or boundless token
}

const ten = (n: number) => '1' + '0'.repeat(n)

export const LEGENDARY_PICKS: LegendaryPick[] = [
  { label: 'Million', value: ten(6) },
  { label: 'Billion', value: ten(9) },
  { label: 'Trillion', value: ten(12) },
  { label: 'Quadrillion', value: ten(15) },
  { label: 'Quintillion', value: ten(18) },
  { label: 'Googol', value: ten(100) },
  { label: 'Centillion', value: ten(303) },
  { label: 'Googolplex', value: 'GOOGOLPLEX' },
  { label: "Graham's №", value: 'GRAHAMS' },
  { label: '∞ Infinity', value: 'INFINITY' },
  { label: 'ℵ₀ Aleph-null', value: 'ALEPH_NULL' },
  { label: 'ℵ₁ Aleph-one', value: 'ALEPH_ONE' },
  { label: 'Ω Absolute ∞', value: 'ABSOLUTE' },
  { label: 'Ω⁺ Beyond ∞', value: 'BEYOND' },
  { label: 'Ω² Hyper ∞', value: 'HYPER' },
  { label: 'Ω∞ Cosmic ∞', value: 'COSMIC' },
  { label: "✦ Hooper's ∞", value: 'HOOPER' },
]

// Known powers of ten that have a fun name.
const POWER_NAMES: Record<number, string> = {
  6: 'a million',
  9: 'a billion',
  12: 'a trillion',
  15: 'a quadrillion',
  18: 'a quintillion',
  100: 'a googol',
  303: 'a centillion',
}

export function isBoundless(v: string): boolean {
  return v in registry
}

/** Normalise a raw value string. Returns '' if it isn't usable. */
export function normaliseValue(raw: string): string {
  const v = String(raw)
  if (v in registry) return v
  // strip commas/spaces, keep digits
  const digits = v.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
  return digits
}

function digitsToFriendly(d: string): string {
  if (d.length <= 21) return BigInt(d).toLocaleString()

  const exp = d.length - 1
  const isPowerOfTen = d === '1' + '0'.repeat(exp)
  if (isPowerOfTen) {
    const name = POWER_NAMES[exp]
    return name ? `10^${exp} (${name}!)` : `10^${exp}`
  }
  const lead = `${d[0]}.${d.slice(1, 3)}`
  return `${lead} × 10^${exp} (${d.length} digits!)`
}

/** Friendly display string for any value. */
export function formatValue(raw: string): string {
  const v = String(raw)
  if (v in registry) {
    const b = registry[v]
    return b.kind === 'infinite' ? `${b.short} ${b.name}` : b.name
  }
  if (/^\d+$/.test(v)) return digitsToFriendly(v)

  // Legacy numeric / exponential strings (e.g. "1e+80").
  const n = Number(v)
  if (!isFinite(n)) return '∞ Infinity'
  if (Number.isInteger(n) && Math.abs(n) < 1e21) return n.toLocaleString()
  const [m, e] = n.toExponential(2).split('e')
  return `${m} × 10^${e.replace('+', '')}`
}

export interface MultiplyResult {
  value: string // resulting value (digit string or boundless token)
  display: string // friendly formatted result
  boundless: Boundless | null
  /** Playful sentence for boundless results (level-ups, top-of-ladder, etc.). */
  note?: string
}

/** Multiply a value by a (small) whole multiplier. */
export function multiplyValue(raw: string, multiplier: number): MultiplyResult {
  const v = String(raw)
  if (v in registry) {
    const b = registry[v]

    // Infinite numbers can't get "more multiplied" — instead they level UP
    // the imaginary ladder, so an exponent really does make them bigger.
    if (b.kind === 'infinite') {
      const idx = infiniteLadder.indexOf(b.token)
      const steps = multiplier >= 50 ? 3 : multiplier >= 10 ? 2 : 1
      const targetIdx = Math.min(idx + steps, infiniteLadder.length - 1)
      const next = registry[infiniteLadder[targetIdx]]
      const note =
        targetIdx > idx
          ? `It leveled up to ${next.short} ${next.name}! ${next.desc}`
          : `${b.short} ${b.name} is the biggest number anyone has ever imagined — nothing can beat it! 👑`
      return { value: next.token, display: formatValue(next.token), boundless: next, note }
    }

    // Huge-but-finite numbers stay huge.
    return {
      value: v,
      display: formatValue(v),
      boundless: b,
      note: "It was already too big to write down... now it's even more unimaginable! 🤯",
    }
  }
  if (/^\d+$/.test(v)) {
    const r = (BigInt(v) * BigInt(Math.round(multiplier))).toString()
    return { value: r, display: formatValue(r), boundless: null }
  }
  const n = Number(v) * multiplier
  const r = isFinite(n) ? n : Infinity
  const out = isFinite(r) ? String(BigInt(Math.round(r))) : 'INFINITY'
  return { value: out, display: formatValue(out), boundless: out === 'INFINITY' ? BOUNDLESS.INFINITY : null }
}

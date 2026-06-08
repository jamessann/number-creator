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
 * Plug user-created tiers into the ladder. Each tier sits at the rank the user
 * chose, so they can place a new infinity anywhere — top, bottom, or between
 * two existing ones.
 */
export function registerCustomTiers(
  tiers: Array<{ token: string; name: string; short: string; desc: string; rank: number }>
): void {
  const next: Record<string, Boundless> = { ...BOUNDLESS }
  tiers.forEach((t) => {
    next[t.token] = {
      token: t.token,
      name: t.name,
      short: t.short,
      kind: 'infinite',
      fictional: true,
      custom: true,
      rank: t.rank,
      desc: t.desc,
    }
  })
  registry = next
  infiniteLadder = buildLadder(next)
}

/** The current infinite ladder, smallest → biggest, for building position pickers. */
export function getInfiniteLadder(): Array<{ token: string; name: string; short: string; rank: number }> {
  return infiniteLadder.map((token) => {
    const b = registry[token]
    return { token, name: b.name, short: b.short, rank: b.rank ?? 0 }
  })
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

const TIER_RE = /^TIERX_(\d+)$/
// Tier LEVEL tokens: LV<level>_<tier>, e.g. LV2_9 = "tier tier 9" (level 2, tier 9).
const LV_RE = /^LV(\d+)_(\d+)$/

export function isBoundless(v: string): boolean {
  const s = String(v)
  return s in registry || TIER_RE.test(s) || LV_RE.test(s)
}

/**
 * Decompose a value into its tier LEVEL and tier.
 *  - level 1 = a normal "tier N" (∞, ℵ₀, Ω, Tier N Infinity, …)
 *  - level 2 = "tier tier N", level 3 = "tier tier tier N", …
 * A higher level always beats any tier of a lower level.
 */
export function parseTier(raw: string): { level: number; tier: number } {
  const v = String(raw)
  const lv = LV_RE.exec(v)
  if (lv) return { level: Number(lv[1]), tier: Number(lv[2]) }
  if (v in registry) return { level: 1, tier: registry[v].kind === 'infinite' ? registry[v].rank ?? 0 : 0 }
  const m = TIER_RE.exec(v)
  if (m) return { level: 1, tier: Number(m[1]) }
  return { level: 1, tier: 0 }
}

/** The current tier of a value. Finite/huge numbers are tier 0. */
export function tierOfValue(raw: string): number {
  return parseTier(raw).tier
}

/** The tier LEVEL of a value (1 = normal tier, 2 = "tier tier", …). */
export function tierLevelOf(raw: string): number {
  return parseTier(raw).level
}

/** A value token for a tier at level 1: a named infinity if one exists, else a generic tier. */
export function valueAtTier(tier: number): string {
  const named = getInfiniteLadder().find((t) => t.rank === tier)
  return named ? named.token : `TIERX_${tier}`
}

/** A value token at a given tier LEVEL and tier. Level 1 uses the normal ladder. */
export function makeTierValue(level: number, tier: number): string {
  if (level <= 1) return valueAtTier(tier)
  return `LV${level}_${tier}`
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
  const lv = LV_RE.exec(v)
  if (lv) {
    const level = Number(lv[1])
    const tier = Number(lv[2])
    return `⭐ ${'tier '.repeat(level)}${tier}`
  }
  const tm = TIER_RE.exec(v)
  if (tm) {
    const tier = Number(tm[1])
    const named = getInfiniteLadder().find((t) => t.rank === tier)
    return named ? `${registry[named.token].short} ${registry[named.token].name}` : `⭐ Tier ${tier} Infinity`
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

/**
 * Upgrade any number straight to a chosen tier. If a named infinity already
 * lives at that tier we use it; otherwise we mint a brand-new "Tier N Infinity".
 */
export function upgradeToTier(_raw: string, tier: number): MultiplyResult {
  const named = getInfiniteLadder().find((t) => t.rank === tier)
  if (named) {
    const b = registry[named.token]
    return {
      value: b.token,
      display: formatValue(b.token),
      boundless: b,
      note: `It got upgraded to ${b.short} ${b.name} — tier ${tier}! ${b.desc}`,
    }
  }
  const synthetic: Boundless = {
    token: `TIERX_${tier}`,
    name: `Tier ${tier} Infinity`,
    short: '⭐',
    kind: 'infinite',
    fictional: true,
    custom: true,
    rank: tier,
    desc: '',
  }
  return {
    value: synthetic.token,
    display: `${synthetic.short} ${synthetic.name}`,
    boundless: synthetic,
    note: `It got upgraded to ⭐ Tier ${tier} Infinity — a brand-new level of infinity! 🌟`,
  }
}

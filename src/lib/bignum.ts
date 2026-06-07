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
    desc: 'Bigger than every number. It never, ever ends.',
  },
  ALEPH_NULL: {
    token: 'ALEPH_NULL',
    name: 'Aleph-null',
    short: 'ℵ₀',
    kind: 'infinite',
    desc: 'The smallest infinity — it counts all the whole numbers.',
  },
  ALEPH_ONE: {
    token: 'ALEPH_ONE',
    name: 'Aleph-one',
    short: 'ℵ₁',
    kind: 'infinite',
    desc: 'An even BIGGER infinity than aleph-null!',
  },
  ABSOLUTE: {
    token: 'ABSOLUTE',
    name: 'Absolute Infinity',
    short: 'Ω',
    kind: 'infinite',
    desc: 'The infinity beyond all infinities. Nothing is bigger.',
  },
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
  return v in BOUNDLESS
}

/** Normalise a raw value string. Returns '' if it isn't usable. */
export function normaliseValue(raw: string): string {
  const v = String(raw)
  if (v in BOUNDLESS) return v
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
  if (v in BOUNDLESS) {
    const b = BOUNDLESS[v]
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
}

/** Multiply a value by a (small) whole multiplier. */
export function multiplyValue(raw: string, multiplier: number): MultiplyResult {
  const v = String(raw)
  if (v in BOUNDLESS) {
    const b = BOUNDLESS[v]
    return { value: v, display: formatValue(v), boundless: b }
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

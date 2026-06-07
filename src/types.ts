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
  multiplier: number
  explanation: string
  example: string
  createdAt: number
}

export type Theme = 'light' | 'dark'

export interface Settings {
  theme: Theme
  unlimitedStrength: boolean
}

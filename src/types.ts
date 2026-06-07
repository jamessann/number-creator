export interface FictionalNumber {
  id: string
  name: string
  englishContext: string
  value: number
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

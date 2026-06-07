import { getStroke } from 'perfect-freehand'
import { getSvgPathFromStroke } from './freehand'

// Word banks for randomly assembled fictional-number definitions.
const ADJECTIVES = [
  'wobbly', 'gigantic', 'sneaky', 'sparkly', 'invisible', 'bouncy',
  'mysterious', 'cosmic', 'fuzzy', 'electric', 'ancient', 'turbo',
  'squishy', 'glowing', 'rocket-powered', 'upside-down',
]

const NOUNS = [
  'zillion', 'bloop', 'kazoodle', 'wibble', 'snorf', 'gazumpilion',
  'quibblequad', 'flooble', 'zonk', 'splonk', 'mega-twirl', 'noodlon',
  'fizzbang', 'wumple', 'octosquint', 'grumbleplex',
]

const POWERS = [
  'is worth more than all the stars',
  'can only be counted on a Tuesday',
  'is bigger than your imagination',
  'hides between 7 and 8',
  'doubles itself when nobody is looking',
  'is taller than the tallest dinosaur',
  'lives at the edge of the number line',
  'is too big to fit in a calculator',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Generate a random smooth glyph as an SVG path + a tight viewBox. */
export function generateGlyph(): { svgPath: string; viewBox: string } {
  const cx = 100
  const cy = 100
  const segments = 5 + Math.floor(Math.random() * 5)
  const points: number[][] = []

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    const radius = 40 + Math.random() * 50
    const x = cx + Math.cos(t) * radius + (Math.random() - 0.5) * 30
    const y = cy + Math.sin(t) * radius + (Math.random() - 0.5) * 30
    points.push([x, y, 0.5 + Math.random() * 0.5])
  }

  const stroke = getStroke(points, {
    size: 16,
    thinning: 0.6,
    smoothing: 0.9,
    streamline: 0.8,
    simulatePressure: true,
  })

  return {
    svgPath: getSvgPathFromStroke(stroke),
    viewBox: '0 0 200 200',
  }
}

/** Build a playful name + definition for a free fictional number. */
export function generateDefinition(): {
  name: string
  englishContext: string
  value: number
  explanation: string
} {
  const adj = pick(ADJECTIVES)
  const noun = pick(NOUNS)
  const name = `${adj.charAt(0).toUpperCase() + adj.slice(1)} ${noun.charAt(0).toUpperCase() + noun.slice(1)}`
  const value = Math.floor(10 ** (2 + Math.random() * 6))
  return {
    name,
    englishContext: noun,
    value,
    explanation: `A ${adj} ${noun} that ${pick(POWERS)}.`,
  }
}

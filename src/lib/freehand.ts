import { getStroke } from 'perfect-freehand'

export type Point = [number, number, number] // x, y, pressure

const STROKE_OPTIONS = {
  size: 14,
  thinning: 0.6,
  smoothing: 0.7,
  streamline: 0.6,
  easing: (t: number) => t,
  simulatePressure: true,
}

/** Convert an array of smoothed stroke outline points into an SVG path `d` string. */
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return ''

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...stroke[0], 'Q'] as (string | number)[]
  )

  d.push('Z')
  return d.join(' ')
}

/** Turn raw captured points into one smoothed SVG path that cleans up rough edges. */
export function pointsToSmoothPath(points: Point[]): string {
  if (points.length < 2) return ''
  const stroke = getStroke(points, STROKE_OPTIONS)
  return getSvgPathFromStroke(stroke)
}

/** Compute a tight viewBox for a set of strokes, with padding. */
export function computeViewBox(allPoints: Point[][], pad = 20): string {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const stroke of allPoints) {
    for (const [x, y] of stroke) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (!isFinite(minX)) return '0 0 100 100'

  const x = minX - pad
  const y = minY - pad
  const w = maxX - minX + pad * 2
  const h = maxY - minY + pad * 2
  return `${x} ${y} ${w} ${h}`
}

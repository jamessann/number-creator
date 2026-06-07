import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react'
import { getStroke } from 'perfect-freehand'
import { getSvgPathFromStroke, computeViewBox, type Point } from '../../lib/freehand'
import './DrawingPad.css'

export interface DrawingPadHandle {
  /** Smoothed result, or null if nothing drawn. */
  getResult: () => { svgPath: string; viewBox: string } | null
  clear: () => void
  isEmpty: () => boolean
}

const LIVE_OPTIONS = {
  size: 14,
  thinning: 0.6,
  smoothing: 0.7,
  streamline: 0.5,
  simulatePressure: true,
}

// Final pass uses heavier smoothing/streamline to "clean up rough edges".
const FINAL_OPTIONS = {
  size: 14,
  thinning: 0.6,
  smoothing: 0.92,
  streamline: 0.82,
  simulatePressure: true,
}

export const DrawingPad = forwardRef<DrawingPadHandle, { className?: string }>(
  function DrawingPad({ className }, ref) {
    const [strokes, setStrokes] = useState<Point[][]>([])
    const [current, setCurrent] = useState<Point[]>([])
    const drawing = useRef(false)

    const allStrokes = current.length ? [...strokes, current] : strokes

    useImperativeHandle(ref, () => ({
      getResult: () => {
        if (!strokes.length) return null
        const paths = strokes.map((s) =>
          getSvgPathFromStroke(getStroke(s, FINAL_OPTIONS))
        )
        return {
          svgPath: paths.join(' '),
          viewBox: computeViewBox(strokes),
        }
      },
      clear: () => {
        setStrokes([])
        setCurrent([])
      },
      isEmpty: () => strokes.length === 0,
    }))

    const localPoint = (e: React.PointerEvent<SVGSVGElement>): Point => {
      const rect = e.currentTarget.getBoundingClientRect()
      return [e.clientX - rect.left, e.clientY - rect.top, e.pressure || 0.5]
    }

    const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* capture is best-effort */
      }
      drawing.current = true
      setCurrent([localPoint(e)])
    }, [])

    const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
      if (!drawing.current) return
      const pt = localPoint(e)
      setCurrent((pts) => [...pts, pt])
    }, [])

    const handlePointerUp = useCallback(() => {
      if (!drawing.current) return
      drawing.current = false
      setCurrent((pts) => {
        if (pts.length > 1) setStrokes((s) => [...s, pts])
        return []
      })
    }, [])

    const undo = () => setStrokes((s) => s.slice(0, -1))
    const clear = () => {
      setStrokes([])
      setCurrent([])
    }

    return (
      <div className={`pad${className ? ` ${className}` : ''}`}>
        <svg
          className="pad__canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {allStrokes.map((stroke, i) => (
            <path
              key={i}
              d={getSvgPathFromStroke(getStroke(stroke, LIVE_OPTIONS))}
              className="pad__ink"
            />
          ))}
        </svg>
        <div className="pad__tools">
          <button className="btn btn--ghost pad__tool" onClick={undo} disabled={!strokes.length}>
            ↶ Undo
          </button>
          <button className="btn btn--ghost pad__tool" onClick={clear} disabled={!strokes.length}>
            🗑 Clear
          </button>
        </div>
      </div>
    )
  }
)

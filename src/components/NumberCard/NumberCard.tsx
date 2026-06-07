import type { FictionalNumber } from '../../types'
import { formatValue } from '../../lib/bignum'
import './NumberCard.css'

interface Props {
  number: FictionalNumber
  selected?: boolean
  onClick?: () => void
  onDelete?: () => void
}

/** Renders a stored fictional number's smoothed SVG glyph as a tappable button. */
export function NumberCard({ number, selected, onClick, onDelete }: Props) {
  return (
    <div className={`number-card${selected ? ' number-card--selected' : ''}`}>
      <button className="number-card__btn" onClick={onClick} aria-pressed={selected}>
        <svg className="number-card__glyph" viewBox={number.viewBox} aria-hidden>
          <path d={number.svgPath} className="number-card__ink" />
        </svg>
        <span className="number-card__name">{number.name || number.englishContext}</span>
        <span className="number-card__value">worth {formatValue(number.value)}</span>
      </button>
      {onDelete && (
        <button
          className="number-card__delete"
          onClick={onDelete}
          aria-label={`Delete ${number.name}`}
        >
          ✕
        </button>
      )}
    </div>
  )
}

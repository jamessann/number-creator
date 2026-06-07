import type { Exponent } from '../../types'
import './ExponentCard.css'

interface Props {
  exponent: Exponent
  selected?: boolean
  onClick?: () => void
  onDelete?: () => void
}

export function ExponentCard({ exponent, selected, onClick, onDelete }: Props) {
  return (
    <div className={`exp-card${selected ? ' exp-card--selected' : ''}`}>
      <button className="exp-card__btn" onClick={onClick} aria-pressed={selected}>
        <span className="exp-card__badge">×{exponent.multiplier}</span>
        <span className="exp-card__name">{exponent.name}</span>
        <span className="exp-card__desc">{exponent.explanation}</span>
      </button>
      {onDelete && (
        <button
          className="exp-card__delete"
          onClick={onDelete}
          aria-label={`Delete ${exponent.name}`}
        >
          ✕
        </button>
      )}
    </div>
  )
}

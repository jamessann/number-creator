import { useNavigate } from 'react-router-dom'
import { NumberCard } from '../../components/NumberCard/NumberCard'
import { useStore } from '../../store/useStore'
import './Library.css'

export function Library() {
  const numbers = useStore((s) => s.numbers)
  const removeNumber = useStore((s) => s.removeNumber)
  const navigate = useNavigate()

  return (
    <div className="library">
      <h1 className="page__title">My Fictional Numbers 🔢</h1>
      <p className="page__subtitle">
        Tap a number to make it bigger with an exponent!
      </p>

      {numbers.length === 0 ? (
        <div className="empty">
          <span className="empty__emoji">🪄</span>
          <p>You haven't made any numbers yet.</p>
          <button className="btn btn--primary" onClick={() => navigate('/')}>
            Create your first one!
          </button>
        </div>
      ) : (
        <div className="library__grid">
          {numbers.map((n) => (
            <NumberCard
              key={n.id}
              number={n}
              onClick={() => navigate(`/exponents?n=${n.id}`)}
              onDelete={() => removeNumber(n.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

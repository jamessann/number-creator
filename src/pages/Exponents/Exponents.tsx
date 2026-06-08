import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { ExponentCard } from '../../components/ExponentCard/ExponentCard'
import { NumberCard } from '../../components/NumberCard/NumberCard'
import { useStore } from '../../store/useStore'
import { formatValue, upgradeToTier, getInfiniteLadder } from '../../lib/bignum'
import './Exponents.css'

/** The tier an exponent targets (new exponents use targetTier; old ones used multiplier). */
function tierOf(e: { targetTier?: number; multiplier?: number }): number {
  return e.targetTier ?? e.multiplier ?? 1
}

function makeExample(tier: number): string {
  return `Upgrades any number to ${upgradeToTier('1', tier).display}!`
}

export function Exponents() {
  const numbers = useStore((s) => s.numbers)
  const exponents = useStore((s) => s.exponents)
  const addExponent = useStore((s) => s.addExponent)
  const removeExponent = useStore((s) => s.removeExponent)
  const setNumberValue = useStore((s) => s.setNumberValue)
  const recordExponentApplied = useStore((s) => s.recordExponentApplied)

  const [params] = useSearchParams()
  const initialNumber = params.get('n')

  const [selectedNumberId, setSelectedNumberId] = useState<string | null>(initialNumber)
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [expName, setExpName] = useState('')
  const [expTier, setExpTier] = useState('10')
  const [expExplanation, setExpExplanation] = useState('')

  const selectedNumber = numbers.find((n) => n.id === selectedNumberId) ?? null
  const selectedExp = exponents.find((e) => e.id === selectedExpId) ?? null

  // Highest named tier, shown as a hint when typing a tier.
  const ladder = getInfiniteLadder()
  const topNamed = ladder[ladder.length - 1]

  const tierNum = Math.max(1, Math.round(Number(expTier) || 1))

  const handleCreate = () => {
    if (!expName.trim()) return
    const created = addExponent({
      name: expName.trim(),
      targetTier: tierNum,
      explanation: expExplanation.trim() || `Upgrades any number to tier ${tierNum}!`,
      example: makeExample(tierNum),
    })
    setSelectedExpId(created.id)
    setExpName('')
    setExpTier('10')
    setExpExplanation('')
    setDialogOpen(false)
  }

  const result =
    selectedNumber && selectedExp
      ? upgradeToTier(selectedNumber.value, tierOf(selectedExp))
      : null

  const scrollIntoView = (e: React.FocusEvent<HTMLElement>) => {
    const el = e.target
    setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
  }

  return (
    <div className="exponents">
      <h1 className="page__title">Exponent Library ⚡</h1>
      <p className="page__subtitle">
        An exponent upgrades your number to a tier you choose — type any tier number!
      </p>

      {/* Step 1: pick a number */}
      <h2 className="exponents__step">1. Pick a number</h2>
      {numbers.length === 0 ? (
        <p className="exponents__hint">Make a number first on the Create page!</p>
      ) : (
        <div className="exponents__numbers">
          {numbers.map((n) => (
            <NumberCard
              key={n.id}
              number={n}
              selected={n.id === selectedNumberId}
              onClick={() => {
                setSelectedNumberId(n.id)
                setApplied(false)
              }}
            />
          ))}
        </div>
      )}

      {/* Step 2: pick / create an exponent */}
      <h2 className="exponents__step">2. Pick an exponent</h2>
      <div className="exponents__grid">
        {exponents.map((e) => (
          <ExponentCard
            key={e.id}
            exponent={e}
            selected={e.id === selectedExpId}
            onClick={() => {
              setSelectedExpId(e.id)
              setApplied(false)
            }}
            onDelete={() => {
              removeExponent(e.id)
              if (selectedExpId === e.id) setSelectedExpId(null)
            }}
          />
        ))}

        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger asChild>
            <button className="exponents__create">
              <span className="exponents__create-plus">＋</span>
              Create your exponent
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog__overlay" />
            <Dialog.Content className="dialog__content">
              <Dialog.Title className="dialog__title">Create your exponent ⚡</Dialog.Title>
              <Dialog.Description className="dialog__desc">
                Give it a name and type which tier it upgrades your number to.
              </Dialog.Description>

              <label className="dialog__field">
                <span className="home__label">Name</span>
                <input
                  className="home__input"
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  onFocus={scrollIntoView}
                  placeholder="e.g. Mega Boost"
                />
              </label>

              <label className="dialog__field">
                <span className="home__label">Upgrade to tier:</span>
                <input
                  className="home__input"
                  type="text"
                  inputMode="numeric"
                  value={expTier}
                  onChange={(e) => setExpTier(e.target.value.replace(/[^0-9]/g, ''))}
                  onFocus={scrollIntoView}
                  placeholder="type a tier number"
                />
                {topNamed && (
                  <span className="exponents__tier-hint">
                    Tip: {topNamed.short} {topNamed.name} is tier {topNamed.rank}. Type higher
                    for a brand-new infinity!
                  </span>
                )}
              </label>

              <label className="dialog__field">
                <span className="home__label">Explain it (optional)</span>
                <input
                  className="home__input"
                  value={expExplanation}
                  onChange={(e) => setExpExplanation(e.target.value)}
                  onFocus={scrollIntoView}
                  placeholder="What does it do?"
                />
              </label>

              <p className="dialog__example">Example: {makeExample(tierNum)}</p>

              <div className="dialog__actions">
                <Dialog.Close asChild>
                  <button className="btn btn--ghost">Cancel</button>
                </Dialog.Close>
                <button className="btn btn--primary" onClick={handleCreate}>
                  Create
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Step 3: the result */}
      {selectedNumber && selectedExp && result !== null && (
        <div className="exponents__result">
          <h2 className="exponents__step">3. Your supercharged number! 🚀</h2>
          <div className="exponents__result-card">
            <svg className="exponents__result-glyph" viewBox={selectedNumber.viewBox} aria-hidden>
              <path d={selectedNumber.svgPath} className="number-card__ink" />
            </svg>
            <div className="exponents__result-math">
              <p className="exponents__result-eq">
                {formatValue(selectedNumber.value)} → tier {tierOf(selectedExp)} ={' '}
                <strong>{result.display}</strong>
              </p>
              <p className="exponents__result-desc">
                Your <strong>{selectedNumber.name}</strong> got a{' '}
                <strong>{selectedExp.name}</strong>! {result.note}
              </p>
              {applied ? (
                <p className="exponents__applied">
                  ✅ Saved! {selectedNumber.name} is now {result.display}.
                </p>
              ) : (
                <button
                  className="btn exponents__apply"
                  onClick={() => {
                    setNumberValue(selectedNumber.id, result.value)
                    recordExponentApplied()
                    setApplied(true)
                  }}
                >
                  ⚡ Keep this upgrade!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

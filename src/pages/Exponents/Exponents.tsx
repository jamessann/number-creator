import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import * as Slider from '@radix-ui/react-slider'
import { ExponentCard } from '../../components/ExponentCard/ExponentCard'
import { NumberCard } from '../../components/NumberCard/NumberCard'
import { useStore } from '../../store/useStore'
import './Exponents.css'

function makeExample(multiplier: number): string {
  const base = 2 + Math.floor(Math.random() * 7)
  return `If you had ${base}, this exponent makes it ${base * multiplier}!`
}

export function Exponents() {
  const numbers = useStore((s) => s.numbers)
  const exponents = useStore((s) => s.exponents)
  const addExponent = useStore((s) => s.addExponent)
  const removeExponent = useStore((s) => s.removeExponent)

  const [params] = useSearchParams()
  const initialNumber = params.get('n')

  const [selectedNumberId, setSelectedNumberId] = useState<string | null>(initialNumber)
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [expName, setExpName] = useState('')
  const [expMultiplier, setExpMultiplier] = useState(2)
  const [expExplanation, setExpExplanation] = useState('')

  const selectedNumber = numbers.find((n) => n.id === selectedNumberId) ?? null
  const selectedExp = exponents.find((e) => e.id === selectedExpId) ?? null

  const handleCreate = () => {
    if (!expName.trim()) return
    const created = addExponent({
      name: expName.trim(),
      multiplier: expMultiplier,
      explanation: expExplanation.trim() || `Makes numbers ${expMultiplier} times bigger!`,
      example: makeExample(expMultiplier),
    })
    setSelectedExpId(created.id)
    setExpName('')
    setExpMultiplier(2)
    setExpExplanation('')
    setDialogOpen(false)
  }

  const result =
    selectedNumber && selectedExp
      ? selectedNumber.value * selectedExp.multiplier
      : null

  return (
    <div className="exponents">
      <h1 className="page__title">Exponent Library ⚡</h1>
      <p className="page__subtitle">
        An exponent is a multiplier that makes your number much bigger!
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
              onClick={() => setSelectedNumberId(n.id)}
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
            onClick={() => setSelectedExpId(e.id)}
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
                Give it a name and pick how much bigger it makes your numbers.
              </Dialog.Description>

              <label className="dialog__field">
                <span className="home__label">Name</span>
                <input
                  className="home__input"
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  placeholder="e.g. Mega Boost"
                />
              </label>

              <label className="dialog__field">
                <span className="home__label">Multiplier: ×{expMultiplier}</span>
                <Slider.Root
                  className="slider"
                  min={2}
                  max={100}
                  step={1}
                  value={[expMultiplier]}
                  onValueChange={([v]) => setExpMultiplier(v)}
                >
                  <Slider.Track className="slider__track">
                    <Slider.Range className="slider__range" />
                  </Slider.Track>
                  <Slider.Thumb className="slider__thumb" aria-label="Multiplier" />
                </Slider.Root>
              </label>

              <label className="dialog__field">
                <span className="home__label">Explain it (optional)</span>
                <input
                  className="home__input"
                  value={expExplanation}
                  onChange={(e) => setExpExplanation(e.target.value)}
                  placeholder="What does it do?"
                />
              </label>

              <p className="dialog__example">
                Example: {makeExample(expMultiplier)}
              </p>

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
                {selectedNumber.value.toLocaleString()} × {selectedExp.multiplier} ={' '}
                <strong>{result.toLocaleString()}</strong>
              </p>
              <p className="exponents__result-desc">
                Your <strong>{selectedNumber.name}</strong> got a{' '}
                <strong>{selectedExp.name}</strong>! {selectedExp.explanation} It's now worth a
                whopping {result.toLocaleString()}!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

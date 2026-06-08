import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { NumberCard } from '../../components/NumberCard/NumberCard'
import { useStore } from '../../store/useStore'
import { formatValue } from '../../lib/bignum'
import './Automations.css'

interface IntervalOption {
  label: string
  secs: number
}

const INTERVALS: IntervalOption[] = [
  { label: '0.5 secs', secs: 0.5 },
  { label: '1 sec', secs: 1 },
  { label: '2 secs', secs: 2 },
  { label: '5 secs', secs: 5 },
  { label: '10 secs', secs: 10 },
  { label: '30 secs', secs: 30 },
  { label: '1 min', secs: 60 },
  { label: '5 mins', secs: 300 },
  { label: '30 mins', secs: 1800 },
  { label: '1 hour', secs: 3600 },
  { label: '6 hours', secs: 21600 },
  { label: '1 day', secs: 86400 },
]

function intervalLabel(secs: number): string {
  return INTERVALS.find((i) => i.secs === secs)?.label ?? `${secs} secs`
}

function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`
}

export function Automations() {
  const numbers = useStore((s) => s.numbers)
  const automations = useStore((s) => s.automations)
  const addAutomation = useStore((s) => s.addAutomation)
  const removeAutomation = useStore((s) => s.removeAutomation)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [autoName, setAutoName] = useState('+?')
  const [gain, setGain] = useState('2')
  const [intervalSecs, setIntervalSecs] = useState(10)

  // Local 1s tick so the countdowns animate smoothly.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const selectedNumbers = numbers.filter((n) => selectedIds.includes(n.id))
  const gainNum = Math.max(1, Math.round(Number(gain) || 1))

  const toggleNumber = (id: string) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const scrollIntoView = (e: React.FocusEvent<HTMLElement>) => {
    const el = e.target
    setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
  }

  const handleCreate = () => {
    if (!selectedNumbers.length || !autoName.trim()) return
    addAutomation({
      name: autoName.trim(),
      gainTiers: gainNum,
      intervalSecs,
      numberIds: selectedNumbers.map((n) => n.id),
    })
    setAutoName('+?')
    setGain('2')
    setIntervalSecs(10)
    setSelectedIds([])
    setDialogOpen(false)
  }

  return (
    <div className="automations">
      <h1 className="page__title">Automations 🤖</h1>
      <p className="page__subtitle">
        Make a number grow all by itself — even while no one is watching!
      </p>

      {/* Step 1: pick numbers */}
      <h2 className="automations__step">1. Pick numbers to grow (tap as many as you like!)</h2>
      {numbers.length === 0 ? (
        <p className="automations__hint">Make a number first on the Create page!</p>
      ) : (
        <div className="automations__numbers">
          {numbers.map((n) => (
            <NumberCard
              key={n.id}
              number={n}
              selected={selectedIds.includes(n.id)}
              onClick={() => toggleNumber(n.id)}
            />
          ))}
        </div>
      )}

      {/* Step 2: make an automation */}
      <h2 className="automations__step">2. Make your automation</h2>
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Trigger asChild>
          <button className="automations__make">
            <span className="automations__make-plus">＋</span>
            Make your automation
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog__overlay" />
          <Dialog.Content className="dialog__content">
            <Dialog.Title className="dialog__title">Make your automation 🤖</Dialog.Title>
            <Dialog.Description className="dialog__desc">
              {selectedNumbers.length
                ? `It will grow ${selectedNumbers.length} number${selectedNumbers.length > 1 ? 's' : ''} on their own, forever.`
                : 'Pick one or more numbers above first, then set them growing!'}
            </Dialog.Description>

            <label className="dialog__field">
              <span className="home__label">Name your automation</span>
              <input
                className="home__input"
                value={autoName}
                onChange={(e) => setAutoName(e.target.value)}
                onFocus={scrollIntoView}
                placeholder="e.g. +?"
              />
            </label>

            <label className="dialog__field">
              <span className="home__label">Enter gain (tiers): +{gainNum}</span>
              <input
                className="home__input"
                type="text"
                inputMode="numeric"
                value={gain}
                onChange={(e) => setGain(e.target.value.replace(/[^0-9]/g, ''))}
                onFocus={scrollIntoView}
                placeholder="how many tiers each time?"
              />
            </label>

            <label className="dialog__field">
              <span className="home__label">Time to activate gain</span>
              <select
                className="home__input automations__select"
                value={String(intervalSecs)}
                onChange={(e) => setIntervalSecs(Number(e.target.value))}
              >
                {INTERVALS.map((i) => (
                  <option key={i.secs} value={String(i.secs)}>
                    every {i.label}
                  </option>
                ))}
              </select>
            </label>

            <p className="dialog__example">
              Adds <strong>+{gainNum} tiers</strong> every{' '}
              <strong>{intervalLabel(intervalSecs)}</strong>
              {selectedNumbers.length
                ? ` to ${selectedNumbers.map((n) => n.name).join(', ')}.`
                : '.'}
            </p>

            <div className="dialog__actions">
              <Dialog.Close asChild>
                <button className="btn btn--ghost">Cancel</button>
              </Dialog.Close>
              <button
                className="btn btn--primary"
                onClick={handleCreate}
                disabled={!selectedNumbers.length}
              >
                Start it!
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Running automations */}
      {automations.length > 0 && (
        <>
          <h2 className="automations__step">Running automations ⏱️</h2>
          <div className="automations__list">
            {automations.map((a) => {
              const ids = a.numberIds ?? (a.numberId ? [a.numberId] : [])
              const targets = ids
                .map((id) => numbers.find((n) => n.id === id))
                .filter((n): n is NonNullable<typeof n> => Boolean(n))
              const nextIn = a.intervalSecs * 1000 - ((now - a.lastTick) % (a.intervalSecs * 1000))
              return (
                <div key={a.id} className="automation-card">
                  <div className="automation-card__head">
                    <span className="automation-card__name">{a.name}</span>
                    <button
                      className="automation-card__delete"
                      onClick={() => removeAutomation(a.id)}
                      aria-label={`Stop ${a.name}`}
                    >
                      ⏹ Stop
                    </button>
                  </div>
                  <p className="automation-card__rule">
                    +{a.gainTiers} tiers every {intervalLabel(a.intervalSecs)}
                  </p>
                  {targets.length ? (
                    <ul className="automation-card__targets">
                      {targets.map((number) => (
                        <li key={number.id} className="automation-card__target">
                          <strong>{number.name}</strong> is now{' '}
                          <span className="automation-card__value">
                            {formatValue(number.value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="automation-card__target">(its numbers were deleted)</p>
                  )}
                  <p className="automation-card__next">⏳ next gain in {formatCountdown(nextIn)}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

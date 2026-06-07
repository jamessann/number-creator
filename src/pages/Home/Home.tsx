import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Toast from '@radix-ui/react-toast'
import * as Dialog from '@radix-ui/react-dialog'
import { DrawingPad, type DrawingPadHandle } from '../../components/DrawingPad/DrawingPad'
import { HelpButton } from '../../components/HelpButton/HelpButton'
import { useStore } from '../../store/useStore'
import {
  LEGENDARY_PICKS,
  customTierChips,
  getInfiniteLadder,
  formatValue,
  normaliseValue,
  isBoundless,
} from '../../lib/bignum'
import './Home.css'

interface TierSlot {
  label: string
  rank: number
}

/** Build the choices for "where does this new infinity go?" (biggest first). */
function buildTierSlots(): TierSlot[] {
  const ladder = getInfiniteLadder() // ascending (smallest → biggest)
  if (!ladder.length) return [{ label: '👑 The new BIGGEST of all!', rank: 1 }]
  const desc = [...ladder].reverse() // biggest first
  const slots: TierSlot[] = [
    { label: '👑 The new BIGGEST of all!', rank: desc[0].rank + 1 },
  ]
  for (let i = 0; i < desc.length - 1; i++) {
    const upper = desc[i]
    const lower = desc[i + 1]
    slots.push({
      label: `Between ${upper.short} ${upper.name} and ${lower.short} ${lower.name}`,
      rank: (upper.rank + lower.rank) / 2,
    })
  }
  slots.push({ label: '🐣 The new smallest infinity', rank: ladder[0].rank - 1 })
  return slots
}

export function Home() {
  const padRef = useRef<DrawingPadHandle>(null)
  const addNumber = useStore((s) => s.addNumber)
  const customTiers = useStore((s) => s.customTiers)
  const addTier = useStore((s) => s.addTier)
  const removeTier = useStore((s) => s.removeTier)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [englishContext, setEnglishContext] = useState('')
  const [worth, setWorth] = useState('')
  const [error, setError] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

  // "Make your own infinity tier" dialog state
  const [tierOpen, setTierOpen] = useState(false)
  const [tierName, setTierName] = useState('')
  const [tierShort, setTierShort] = useState('')
  const [tierDesc, setTierDesc] = useState('')
  const [tierRank, setTierRank] = useState<number | null>(null)

  // Recomputed whenever the dialog opens or the tier list changes.
  const tierSlots = useMemo(() => buildTierSlots(), [customTiers, tierOpen])
  const effectiveRank = tierRank ?? tierSlots[0].rank

  const handleCreateTier = () => {
    if (!tierName.trim()) return
    const tier = addTier({
      name: tierName.trim(),
      short: tierShort.trim() || '✦',
      desc: tierDesc.trim() || `${tierName.trim()} — a brand-new infinity!`,
      rank: effectiveRank,
    })
    setWorth(tier.token)
    setTierName('')
    setTierShort('')
    setTierDesc('')
    setTierRank(null)
    setTierOpen(false)
  }

  // Keep the focused field visible above the iPad keyboard.
  const scrollIntoView = (e: React.FocusEvent<HTMLElement>) => {
    const el = e.target
    setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300)
  }

  const handleSave = () => {
    const result = padRef.current?.getResult()
    if (!result) {
      setError('Draw your number first! ✏️')
      return
    }
    if (!englishContext.trim() && !name.trim()) {
      setError('Give your number a name or describe it!')
      return
    }
    const normalised = normaliseValue(worth)
    addNumber({
      name: name.trim() || englishContext.trim(),
      englishContext: englishContext.trim(),
      value: normalised || String(Math.floor(100 + Math.random() * 9900)),
      svgPath: result.svgPath,
      viewBox: result.viewBox,
    })
    setError('')
    setToastOpen(true)
    padRef.current?.clear()
    setName('')
    setEnglishContext('')
    setWorth('')
  }

  return (
    <div className="home">
      <header className="home__header">
        <div>
          <h1 className="page__title">Create your fictional number! 🔮</h1>
          <p className="page__subtitle">
            Draw a number that doesn't exist yet, then tell us all about it.
          </p>
        </div>
        <HelpButton />
      </header>

      <div className="home__workspace">
        <section className="home__draw">
          <DrawingPad ref={padRef} />
        </section>

        <aside className="home__details">
          <label className="home__field">
            <span className="home__label">Name your number</span>
            <input
              className="home__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={scrollIntoView}
              placeholder="e.g. Squiggleplex"
            />
          </label>

          <label className="home__field">
            <span className="home__label">What number is it like? (English)</span>
            <input
              className="home__input"
              value={englishContext}
              onChange={(e) => setEnglishContext(e.target.value)}
              onFocus={scrollIntoView}
              placeholder="e.g. seven and a half"
            />
          </label>

          <div className="home__field">
            <span className="home__label">How much is it worth?</span>
            <input
              className="home__input"
              type="text"
              inputMode="numeric"
              value={isBoundless(worth) ? '' : worth}
              onChange={(e) => setWorth(normaliseValue(e.target.value))}
              onFocus={scrollIntoView}
              placeholder="type a number, or pick a big one below"
            />
            <div className="home__picks">
              {[...LEGENDARY_PICKS, ...customTierChips(customTiers)].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`home__pick${worth === p.value ? ' home__pick--active' : ''}`}
                  onClick={() => setWorth(p.value)}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                className="home__pick home__pick--new"
                onClick={() => setTierOpen(true)}
              >
                ➕ New infinity
              </button>
            </div>
            {worth && <p className="home__preview">= {formatValue(worth)}</p>}
          </div>

          {error && <p className="home__error">{error}</p>}

          <button className="btn btn--primary home__save" onClick={handleSave}>
            ✨ Make my number!
          </button>
        </aside>
      </div>

      <Dialog.Root
        open={tierOpen}
        onOpenChange={(open) => {
          if (open) setTierRank(null)
          setTierOpen(open)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog__overlay" />
          <Dialog.Content className="dialog__content">
            <Dialog.Title className="dialog__title">Make your own infinity! ✦</Dialog.Title>
            <Dialog.Description className="dialog__desc">
              Invent a brand-new infinity and choose exactly where it sits on the
              ladder — the new biggest of all, or anywhere in between!
            </Dialog.Description>

            <label className="dialog__field">
              <span className="home__label">Name</span>
              <input
                className="home__input"
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
                onFocus={scrollIntoView}
                placeholder="e.g. Mega Ultra Infinity"
              />
            </label>

            <label className="dialog__field">
              <span className="home__label">Symbol (optional)</span>
              <input
                className="home__input"
                value={tierShort}
                onChange={(e) => setTierShort(e.target.value)}
                onFocus={scrollIntoView}
                maxLength={4}
                placeholder="e.g. ✦ or ∞∞"
              />
            </label>

            <label className="dialog__field">
              <span className="home__label">What makes it special? (optional)</span>
              <input
                className="home__input"
                value={tierDesc}
                onChange={(e) => setTierDesc(e.target.value)}
                onFocus={scrollIntoView}
                placeholder="Describe it!"
              />
            </label>

            <label className="dialog__field">
              <span className="home__label">Which tier? Where does it go?</span>
              <select
                className="home__input home__select"
                value={String(effectiveRank)}
                onChange={(e) => setTierRank(parseFloat(e.target.value))}
              >
                {tierSlots.map((slot) => (
                  <option key={slot.rank} value={String(slot.rank)}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>

            {tierName.trim() && (
              <p className="home__preview">
                = {tierShort.trim() || '✦'} {tierName.trim()}
              </p>
            )}

            {customTiers.length > 0 && (
              <div className="home__tier-list">
                <span className="home__label">Your infinities</span>
                {customTiers.map((t) => (
                  <div key={t.token} className="home__tier-row">
                    <span>
                      {t.short} {t.name}
                    </span>
                    <button
                      type="button"
                      className="home__tier-delete"
                      onClick={() => {
                        if (worth === t.token) setWorth('')
                        removeTier(t.token)
                      }}
                      aria-label={`Delete ${t.name}`}
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="dialog__actions">
              <Dialog.Close asChild>
                <button className="btn btn--ghost">Cancel</button>
              </Dialog.Close>
              <button className="btn btn--primary" onClick={handleCreateTier}>
                Create
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Toast.Root className="toast" open={toastOpen} onOpenChange={setToastOpen} duration={4000}>
        <Toast.Title>This is your fictional number! 🎉</Toast.Title>
        <Toast.Action altText="See it in My Numbers" asChild>
          <button className="btn btn--ghost home__toast-btn" onClick={() => navigate('/library')}>
            See My Numbers →
          </button>
        </Toast.Action>
      </Toast.Root>
    </div>
  )
}

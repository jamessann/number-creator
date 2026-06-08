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

function formatDuration(secs: number): string {
  const s = Math.floor(secs || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function Home() {
  const padRef = useRef<DrawingPadHandle>(null)
  const addNumber = useStore((s) => s.addNumber)
  const recordNumberCreated = useStore((s) => s.recordNumberCreated)
  const customTiers = useStore((s) => s.customTiers)
  const todaySeconds = useStore((s) => s.todayPlaySeconds)
  const totalSeconds = useStore((s) => s.totalPlaySeconds)
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
  const [tierLevel, setTierLevel] = useState('')

  // Highest named tier right now, for the typing hint + a sensible default.
  const ladder = useMemo(() => getInfiniteLadder(), [customTiers, tierOpen])
  const topNamed = ladder[ladder.length - 1]
  const defaultRank = topNamed ? topNamed.rank + 1 : 1
  const chosenRank = tierLevel.trim() ? Math.max(1, Math.round(Number(tierLevel))) : defaultRank

  const handleCreateTier = () => {
    if (!tierName.trim()) return
    const tier = addTier({
      name: tierName.trim(),
      short: tierShort.trim() || '✦',
      desc: tierDesc.trim() || `${tierName.trim()} — a tier ${chosenRank} infinity!`,
      rank: chosenRank,
    })
    setWorth(tier.token)
    setTierName('')
    setTierShort('')
    setTierDesc('')
    setTierLevel('')
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
    // Count toward daily challenges (detailed = a real drawing + a real description).
    const detailed = result.svgPath.length > 450 && englishContext.trim().length >= 12
    recordNumberCreated(detailed)
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
          <p className="home__playtime">
            ⏱️ Time in game today: <strong>{formatDuration(todaySeconds)}</strong> · all time:{' '}
            <strong>{formatDuration(totalSeconds)}</strong>
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
          if (open) setTierLevel('')
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
              <span className="home__label">Which tier? (type a number)</span>
              <input
                className="home__input"
                type="text"
                inputMode="numeric"
                value={tierLevel}
                onChange={(e) => setTierLevel(e.target.value.replace(/[^0-9]/g, ''))}
                onFocus={scrollIntoView}
                placeholder={`e.g. ${defaultRank} — higher is bigger`}
              />
              {topNamed && (
                <span className="exponents__tier-hint">
                  {topNamed.short} {topNamed.name} is tier {topNamed.rank}. A higher number is
                  bigger!
                </span>
              )}
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Switch from '@radix-ui/react-switch'
import { useStore } from '../../store/useStore'
import { generateGlyph, generateDefinition } from '../../lib/generator'
import { formatValue } from '../../lib/bignum'
import './Settings.css'

interface FreeNumber {
  svgPath: string
  viewBox: string
  name: string
  englishContext: string
  value: string
  explanation: string
}

export function SettingsPage() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const unlimitedStrength = useStore((s) => s.unlimitedStrength)
  const setUnlimitedStrength = useStore((s) => s.setUnlimitedStrength)
  const addNumber = useStore((s) => s.addNumber)
  const navigate = useNavigate()

  const [free, setFree] = useState<FreeNumber | null>(null)
  const [saved, setSaved] = useState(false)

  const roll = () => {
    const glyph = generateGlyph()
    const def = generateDefinition()
    setFree({ ...glyph, ...def })
    setSaved(false)
  }

  const keepIt = () => {
    if (!free) return
    addNumber({
      name: free.name,
      englishContext: free.englishContext,
      value: free.value,
      svgPath: free.svgPath,
      viewBox: free.viewBox,
    })
    setSaved(true)
  }

  return (
    <div className="settings">
      <h1 className="page__title">Settings ⚙️</h1>

      <div className="settings__row">
        <div>
          <span className="settings__label">Dark mode 🌙</span>
          <span className="settings__hint">Switch between light and dark.</span>
        </div>
        <Switch.Root
          className="switch"
          checked={theme === 'dark'}
          onCheckedChange={(on) => setTheme(on ? 'dark' : 'light')}
          aria-label="Dark mode"
        >
          <Switch.Thumb className="switch__thumb" />
        </Switch.Root>
      </div>

      <div className="settings__row">
        <div>
          <span className="settings__label">Unlimited Strength 💪✨</span>
          <span className="settings__hint">A mystery power... turn it on to find out!</span>
        </div>
        <Switch.Root
          className="switch"
          checked={unlimitedStrength}
          onCheckedChange={setUnlimitedStrength}
          aria-label="Unlimited strength"
        >
          <Switch.Thumb className="switch__thumb" />
        </Switch.Root>
      </div>

      {unlimitedStrength && (
        <div className="settings__mystery">
          <h2 className="settings__mystery-title">🎁 Free Fictional Number!</h2>
          <p className="settings__hint">
            No drawing needed — let the machine invent one for you.
          </p>

          {free && (
            <div className="settings__free-card">
              <svg className="settings__free-glyph" viewBox={free.viewBox} aria-hidden>
                <path d={free.svgPath} className="number-card__ink" />
              </svg>
              <div>
                <p className="settings__free-name">{free.name}</p>
                <p className="settings__free-desc">{free.explanation}</p>
                <p className="settings__free-value">Worth {formatValue(free.value)}</p>
              </div>
            </div>
          )}

          <div className="settings__free-actions">
            <button className="btn btn--ghost" onClick={roll}>
              🎲 {free ? 'Another one!' : 'Generate one!'}
            </button>
            {free && !saved && (
              <button className="btn btn--primary" onClick={keepIt}>
                💾 Keep it!
              </button>
            )}
            {saved && (
              <button className="btn btn--primary" onClick={() => navigate('/library')}>
                ✅ Saved! See it →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

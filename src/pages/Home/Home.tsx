import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Toast from '@radix-ui/react-toast'
import { DrawingPad, type DrawingPadHandle } from '../../components/DrawingPad/DrawingPad'
import { HelpButton } from '../../components/HelpButton/HelpButton'
import { useStore } from '../../store/useStore'
import './Home.css'

export function Home() {
  const padRef = useRef<DrawingPadHandle>(null)
  const addNumber = useStore((s) => s.addNumber)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [englishContext, setEnglishContext] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [toastOpen, setToastOpen] = useState(false)

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
    addNumber({
      name: name.trim() || englishContext.trim(),
      englishContext: englishContext.trim(),
      value: Number(value) || Math.floor(100 + Math.random() * 9900),
      svgPath: result.svgPath,
      viewBox: result.viewBox,
    })
    setError('')
    setToastOpen(true)
    padRef.current?.clear()
    setName('')
    setEnglishContext('')
    setValue('')
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
              placeholder="e.g. Squiggleplex"
            />
          </label>

          <label className="home__field">
            <span className="home__label">What number is it like? (English)</span>
            <input
              className="home__input"
              value={englishContext}
              onChange={(e) => setEnglishContext(e.target.value)}
              placeholder="e.g. seven and a half"
            />
          </label>

          <label className="home__field">
            <span className="home__label">How much is it worth?</span>
            <input
              className="home__input"
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="pick a number (or we'll surprise you)"
            />
          </label>

          {error && <p className="home__error">{error}</p>}

          <button className="btn btn--primary home__save" onClick={handleSave}>
            ✨ Make my number!
          </button>
        </aside>
      </div>

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

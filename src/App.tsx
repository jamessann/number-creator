import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import * as Toast from '@radix-ui/react-toast'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Home } from './pages/Home/Home'
import { Library } from './pages/Library/Library'
import { Exponents } from './pages/Exponents/Exponents'
import { Automations } from './pages/Automations/Automations'
import { Challenges } from './pages/Challenges/Challenges'
import { SettingsPage } from './pages/Settings/Settings'
import { Help } from './pages/Help/Help'
import { useStore } from './store/useStore'

export default function App() {
  const theme = useStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Drive automations + challenge timers: catch up on load, then tick every second.
  useEffect(() => {
    const tick = () => {
      useStore.getState().runAutomations(Date.now())
      useStore.getState().tickChallenges()
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Tooltip.Provider delayDuration={300}>
      <Toast.Provider swipeDirection="right">
        <HashRouter>
          <div className="app">
            <Sidebar />
            <main className="app__content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/exponents" element={<Exponents />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/challenges" element={<Challenges />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </main>
          </div>
          <Toast.Viewport className="toast__viewport" />
        </HashRouter>
      </Toast.Provider>
    </Tooltip.Provider>
  )
}

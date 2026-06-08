import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const LINKS = [
  { to: '/', label: 'Create', icon: '✏️', end: true },
  { to: '/library', label: 'My Numbers', icon: '🔢' },
  { to: '/exponents', label: 'Exponents', icon: '⚡' },
  { to: '/automations', label: 'Automations', icon: '🤖' },
  { to: '/challenges', label: 'Challenges', icon: '🏆' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/help', label: 'Help', icon: '❓' },
]

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden>🔮</span>
        <span className="sidebar__title">Number Creator</span>
      </div>
      <ul className="sidebar__list">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
              }
            >
              <span className="sidebar__icon" aria-hidden>{link.icon}</span>
              <span className="sidebar__label">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

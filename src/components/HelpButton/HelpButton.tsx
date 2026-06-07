import { useNavigate } from 'react-router-dom'
import * as Tooltip from '@radix-ui/react-tooltip'
import './HelpButton.css'

/** Floating "?" button (top-left on Home, per the original diagram). */
export function HelpButton() {
  const navigate = useNavigate()
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          className="help-button"
          onClick={() => navigate('/help')}
          aria-label="What is a fictional number?"
        >
          ?
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="help-button__tip" side="bottom" sideOffset={6}>
          What is a fictional number?
          <Tooltip.Arrow className="help-button__arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { parseTier } from '../../lib/bignum'
import {
  challengesForIndex,
  dayIndexOf,
  progressFor,
  CYCLE_LENGTH,
  type Difficulty,
  type Reward,
  type ProgressSnapshot,
} from '../../lib/challenges'
import './Challenges.css'

function formatTime(secs: number): string {
  const s = Math.floor(secs)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function Challenges() {
  const challenges = useStore((s) => s.challenges)
  const numbers = useStore((s) => s.numbers)
  const maxTierLevel = useStore((s) => s.maxTierLevel)
  const claimChallenge = useStore((s) => s.claimChallenge)
  const automationSpeedBonus = useStore((s) => s.automationSpeedBonus)
  const jewels = useStore((s) => s.jewels)
  const challengeOffset = useStore((s) => s.challengeOffset)
  const resetChallenges = useStore((s) => s.resetChallenges)

  const [won, setWon] = useState<Partial<Record<Difficulty, Reward>>>({})

  const snapshot: ProgressSnapshot = useMemo(() => {
    let maxTier = 0
    let maxLevel = maxTierLevel || 1
    for (const n of numbers) {
      const { level, tier } = parseTier(n.value)
      if (level > maxLevel) maxLevel = level
      const eff = level > 1 ? Number.MAX_SAFE_INTEGER : tier
      if (eff > maxTier) maxTier = eff
    }
    return {
      playSeconds: challenges.playSeconds ?? 0,
      numbersCreated: challenges.numbersCreated ?? 0,
      detailedCount: challenges.detailedCount ?? 0,
      exponentsApplied: challenges.exponentsApplied ?? 0,
      automationsStarted: challenges.automationsStarted ?? 0,
      customTiersMade: challenges.customTiersMade ?? 0,
      maxTier,
      maxTierLevel: maxLevel,
    }
  }, [numbers, maxTierLevel, challenges])

  const dayIndex = dayIndexOf(challenges.day) + (challengeOffset || 0)
  const todays = challengesForIndex(dayIndex)
  const tomorrow = challengesForIndex(dayIndex + 1)
  const cycleDay = (((dayIndex % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH) + 1

  const claim = (d: Difficulty) => {
    const reward = claimChallenge(d)
    if (reward) setWon((w) => ({ ...w, [d]: reward }))
  }

  const reset = () => {
    if (resetChallenges()) setWon({})
  }

  return (
    <div className="challenges">
      <h1 className="page__title">Daily Challenges 🏆</h1>
      <p className="page__subtitle">
        New challenges every day! Day {cycleDay} of {CYCLE_LENGTH} — then the cycle repeats.
      </p>

      <div className="challenges__stats">
        <div className="challenges__stat">
          💎 Jewels
          <strong>{jewels || 0}</strong>
        </div>
        <div className="challenges__stat">
          ⚡ Automation speed bonus
          <strong>+{(automationSpeedBonus || 0).toFixed(3)}s</strong>
        </div>
        <div className="challenges__stat">
          🔼 Max tier level
          <strong>{maxTierLevel}</strong>
        </div>
      </div>

      <button
        className="btn btn--ghost challenges__reset"
        onClick={reset}
        disabled={(jewels || 0) < 35}
      >
        🔄 Reset challenges for 35 💎
      </button>

      <div className="challenges__grid">
        {todays.map((c) => {
          const progress = progressFor(c.metric, snapshot)
          const pct = Math.min(100, Math.round((progress / c.target) * 100))
          const done = progress >= c.target
          const claimed = challenges.claimed[c.id]
          const progressText =
            c.metric === 'play'
              ? `${formatTime(progress)} / ${formatTime(c.target)}`
              : `${Math.min(progress, c.target)} / ${c.target}`

          return (
            <div key={c.id} className={`challenge-card challenge-card--${c.id}`}>
              <div className="challenge-card__head">
                <span className="challenge-card__emoji">{c.emoji}</span>
                <span className="challenge-card__title">{c.title}</span>
              </div>
              <p className="challenge-card__goal">{c.goal}</p>

              <div className="challenge-card__bar">
                <div className="challenge-card__fill" style={{ width: `${pct}%` }} />
              </div>
              <p className="challenge-card__progress">{progressText}</p>

              {claimed ? (
                <div className="challenge-card__claimed">
                  ✅ Done today!
                  {won[c.id] && <span className="challenge-card__won">{won[c.id]!.label}</span>}
                </div>
              ) : done ? (
                <button className="btn btn--primary challenge-card__claim" onClick={() => claim(c.id)}>
                  🎁 Claim reward!
                </button>
              ) : (
                <p className="challenge-card__todo">Keep going! 💪</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="challenges__tomorrow">
        <h2 className="challenges__tomorrow-title">🔮 Tomorrow's challenges</h2>
        <ul className="challenges__tomorrow-list">
          {tomorrow.map((c) => (
            <li key={c.id}>
              {c.emoji} <strong>{c.title}:</strong> {c.goal}
            </li>
          ))}
        </ul>
        <p className="challenges__note">
          See? Different every day — they only repeat after {CYCLE_LENGTH} days. Challenges and
          progress reset each day.
        </p>
      </div>
    </div>
  )
}

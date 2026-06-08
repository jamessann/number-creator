import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { CHALLENGES, type Difficulty, type Reward } from '../../lib/challenges'
import './Challenges.css'

function formatTime(secs: number): string {
  const s = Math.floor(secs)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function Challenges() {
  const challenges = useStore((s) => s.challenges)
  const claimChallenge = useStore((s) => s.claimChallenge)
  const automationSpeedBonus = useStore((s) => s.automationSpeedBonus)
  const maxTierLevel = useStore((s) => s.maxTierLevel)

  const [won, setWon] = useState<Partial<Record<Difficulty, Reward>>>({})

  const claim = (d: Difficulty) => {
    const reward = claimChallenge(d)
    if (reward) setWon((w) => ({ ...w, [d]: reward }))
  }

  return (
    <div className="challenges">
      <h1 className="page__title">Daily Challenges 🏆</h1>
      <p className="page__subtitle">
        Three new challenges every day. The harder the challenge, the better the reward!
      </p>

      <div className="challenges__stats">
        <div className="challenges__stat">
          ⚡ Automation speed bonus
          <strong>−{(automationSpeedBonus || 0).toFixed(3)}s</strong>
        </div>
        <div className="challenges__stat">
          🔼 Max tier level
          <strong>{maxTierLevel}</strong>
        </div>
      </div>

      <div className="challenges__grid">
        {CHALLENGES.map((c) => {
          const progress = c.metric === 'play' ? challenges.playSeconds : challenges.detailedCount
          const pct = Math.min(100, Math.round((progress / c.target) * 100))
          const done = progress >= c.target
          const claimed = challenges.claimed[c.id]
          const progressText =
            c.metric === 'play'
              ? `${formatTime(progress)} / ${formatTime(c.target)}`
              : `${Math.min(progress, c.target)} / ${c.target} detailed numbers`

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

      <p className="challenges__note">
        🔴 A number counts as "detailed" when it has a good drawing <em>and</em> a description.
        Challenges reset every day.
      </p>
    </div>
  )
}

import { useState } from 'react'
import { useStore } from '../../store/useStore'
import './Shop.css'

interface ShopItem {
  id: string
  title: string
  desc: string
  emoji: string
  cost: number
  buy: () => boolean
}

export function Shop() {
  const jewels = useStore((s) => s.jewels)
  const maxTierLevel = useStore((s) => s.maxTierLevel)
  const automationSpeedBonus = useStore((s) => s.automationSpeedBonus)
  const buyTierLevel = useStore((s) => s.buyTierLevel)
  const buyAutoSpeed = useStore((s) => s.buyAutoSpeed)

  const [flash, setFlash] = useState<string | null>(null)

  const items: ShopItem[] = [
    {
      id: 'tierLevel',
      title: '+1 Tier Level',
      desc: 'Unlock the next "tier tier" layer and get a free number in it. Stacks!',
      emoji: '🔼',
      cost: 20,
      buy: buyTierLevel,
    },
    {
      id: 'autoSpeed',
      title: '+0.02 Automation Speed',
      desc: 'Makes every automation apply faster. Stacks!',
      emoji: '⚡',
      cost: 20,
      buy: buyAutoSpeed,
    },
  ]

  const purchase = (item: ShopItem) => {
    if (item.buy()) {
      setFlash(`Bought ${item.title}! ✅`)
      setTimeout(() => setFlash(null), 2500)
    }
  }

  return (
    <div className="shop">
      <h1 className="page__title">Shop 🛒</h1>
      <p className="page__subtitle">Spend your jewels on powerful upgrades. Everything stacks!</p>

      <div className="shop__bar">
        <span className="shop__balance">💎 {jewels || 0} jewels</span>
        <span className="shop__stat">🔼 Tier level {maxTierLevel}</span>
        <span className="shop__stat">⚡ +{(automationSpeedBonus || 0).toFixed(3)}s speed</span>
      </div>

      {flash && <p className="shop__flash">{flash}</p>}

      <div className="shop__grid">
        {items.map((item) => {
          const afford = (jewels || 0) >= item.cost
          return (
            <div key={item.id} className="shop-item">
              <span className="shop-item__emoji">{item.emoji}</span>
              <span className="shop-item__title">{item.title}</span>
              <p className="shop-item__desc">{item.desc}</p>
              <button
                className="btn btn--primary shop-item__buy"
                onClick={() => purchase(item)}
                disabled={!afford}
              >
                {afford ? `Buy for ${item.cost} 💎` : `Need ${item.cost} 💎`}
              </button>
            </div>
          )
        })}
      </div>

      <p className="shop__note">Earn jewels by completing daily challenges! 🏆</p>
    </div>
  )
}

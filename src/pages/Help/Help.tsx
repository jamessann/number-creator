import './Help.css'

export function Help() {
  return (
    <div className="help">
      <h1 className="page__title">Help ❓</h1>

      <section className="help__card">
        <h2 className="help__heading">What is a fictional number?</h2>
        <p className="help__text">
          A fictional number is a number that <strong>doesn't exist yet</strong>. It isn't
          worked out, and you can't find it on a normal calculator. It comes straight from
          your <strong>IMAGINATION</strong>! 🌈
        </p>
      </section>

      <section className="help__card">
        <h2 className="help__heading">How do I make one?</h2>
        <ol className="help__list">
          <li>Go to <strong>Create</strong> ✏️ and draw your number shape with your finger.</li>
          <li>The app smooths it out to make it look extra cool.</li>
          <li>Give it a name and tell us how much it's worth.</li>
          <li>Tap <strong>Make my number!</strong> ✨</li>
        </ol>
      </section>

      <section className="help__card">
        <h2 className="help__heading">What's an exponent? ⚡</h2>
        <p className="help__text">
          An exponent is a <strong>multiplier</strong> that makes your fictional number much
          bigger. Pick a number, pick an exponent, and watch it grow!
        </p>
        <p className="help__text">
          ✨ <strong>Secret:</strong> put an exponent on an infinity (like Absolute Infinity)
          and it <strong>levels up</strong> into something even bigger — all the way past real
          maths and into pure imagination!
        </p>
        <p className="help__text">
          🌀 <strong>Make your own infinity!</strong> On the Create page tap{' '}
          <strong>➕ New infinity</strong>, give it a name and symbol, and choose exactly
          where it goes on the ladder — the new biggest of all, or anywhere in between.
        </p>
      </section>

      <section className="help__card">
        <h2 className="help__heading">The mystery setting 💪</h2>
        <p className="help__text">
          Turn on <strong>Unlimited Strength</strong> in Settings to get a{' '}
          <strong>free fictional number</strong> — the app invents one for you, no drawing needed!
        </p>
      </section>
    </div>
  )
}

import { useState } from 'react'
import quotes from './quotes.js'

const colorPalettes = [
  { background: '#f2e8d8', quote: '#393229', button: '#b55238' },
  { background: '#dceaf2', quote: '#17324d', button: '#176b87' },
  { background: '#e7e3f4', quote: '#352c50', button: '#6650a4' },
  { background: '#e1eee1', quote: '#29432d', button: '#3e7950' },
  { background: '#f4e1e8', quote: '#4b2938', button: '#a74468' },
  { background: '#e8e9db', quote: '#343b2b', button: '#68763c' },
  { background: '#f3e4c8', quote: '#493817', button: '#a36a13' },
  { background: '#dce9e8', quote: '#1f3b39', button: '#307b73' },
]

function randomIndex(length) {
  return Math.floor(Math.random() * length)
}

function shuffledIndexes(length, excludedIndex = -1) {
  const indexes = Array.from({ length }, (_, index) => index).filter(
    (index) => index !== excludedIndex,
  )

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1)
    ;[indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]]
  }

  return indexes
}

function randomPaletteIndex(excludedIndex) {
  const choices = colorPalettes
    .map((_, index) => index)
    .filter((index) => index !== excludedIndex)
  return choices[randomIndex(choices.length)]
}

export default function RandomQuoteGenerator() {
  const [quoteIndex, setQuoteIndex] = useState(() => randomIndex(quotes.length))
  const [remainingIndexes, setRemainingIndexes] = useState(() =>
    shuffledIndexes(quotes.length, quoteIndex),
  )
  const [roundCount, setRoundCount] = useState(1)
  const [paletteIndex, setPaletteIndex] = useState(() =>
    randomIndex(colorPalettes.length),
  )

  function showNextQuote() {
    let nextIndex
    let nextRemaining
    let startsNewRound = false

    if (remainingIndexes.length > 0) {
      ;[nextIndex, ...nextRemaining] = remainingIndexes
    } else {
      const cycle = shuffledIndexes(quotes.length, quoteIndex)
      ;[nextIndex, ...nextRemaining] = cycle
      startsNewRound = true
    }

    setQuoteIndex(nextIndex)
    setRemainingIndexes(nextRemaining)
    setRoundCount((currentCount) => (startsNewRound ? 1 : currentCount + 1))
    setPaletteIndex((currentIndex) => randomPaletteIndex(currentIndex))
  }

  const palette = colorPalettes[paletteIndex]
  const currentQuote = quotes[quoteIndex]

  return (
    <main
      className="quote-page"
      style={{
        '--quote-background': palette.background,
        '--quote-color': palette.quote,
        '--quote-button': palette.button,
      }}
    >
      <section aria-labelledby="quote-app-heading" className="quote-card">
        <p className="quote-eyebrow">A little inspiration</p>
        <h1 id="quote-app-heading">Random Quote Generator</h1>
        <figure className="quote-content" aria-live="polite">
          <blockquote key={quoteIndex} className="quote-text">
            “{currentQuote.quote}”
          </blockquote>
          <figcaption className="quote-author">— {currentQuote.author}</figcaption>
        </figure>
        <button className="quote-button" onClick={showNextQuote} type="button">
          New quote <span aria-hidden="true">↗</span>
        </button>
        <p className="quote-count">
          {roundCount} of {quotes.length} quotes in this round
        </p>
      </section>
      <footer className="quote-footer">A fresh thought, one click away.</footer>
    </main>
  )
}

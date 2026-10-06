import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const operations = {
  add: { label: 'Addition (+)', symbol: '+', calculate: (first, second) => first + second },
  subtract: { label: 'Subtraction (-)', symbol: '−', calculate: (first, second) => first - second },
  multiply: { label: 'Multiplication (×)', symbol: '×', calculate: (first, second) => first * second },
  divide: { label: 'Division (÷)', symbol: '÷', calculate: (first, second) => first / second },
}

function formatResult(value) {
  return Number(value.toPrecision(12)).toString()
}

export default function Calculator() {
  const [firstNumber, setFirstNumber] = useState('')
  const [secondNumber, setSecondNumber] = useState('')
  const [operation, setOperation] = useState('add')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function calculate(event) {
    event.preventDefault()
    const first = Number(firstNumber)
    const second = Number(secondNumber)

    if (firstNumber.trim() === '' || secondNumber.trim() === '') {
      setError('Enter a value for both numbers.')
      setResult(null)
      return
    }

    if (!Number.isFinite(first) || !Number.isFinite(second)) {
      setError('Enter valid numbers to calculate.')
      setResult(null)
      return
    }

    if (operation === 'divide' && second === 0) {
      setError('You cannot divide by zero.')
      setResult(null)
      return
    }

    setError('')
    setResult(formatResult(operations[operation].calculate(first, second)))
  }

  return (
    <main className="calculator-page">
      <header className="calculator-header">
        <NavLink className="calculator-brand" to="/SnapScout/mountain">
          <span className="calculator-brand-mark" aria-hidden="true">S</span>
          SnapShot
        </NavLink>
        <NavLink className="calculator-back-link" to="/SnapScout/mountain">
          Back to galleries
        </NavLink>
      </header>

      <section className="calculator-card" aria-labelledby="calculator-title">
        <p className="calculator-eyebrow">Daily challenge</p>
        <h1 id="calculator-title">React Calculator</h1>
        <p className="calculator-description">
          Enter two numbers and choose an operation.
        </p>

        <form className="calculator-form" onSubmit={calculate}>
          <label htmlFor="first-number">First number</label>
          <input
            id="first-number"
            inputMode="decimal"
            onChange={(event) => setFirstNumber(event.target.value)}
            placeholder="e.g. 12"
            required
            step="any"
            type="number"
            value={firstNumber}
          />

          <label htmlFor="calculator-operation">Operation</label>
          <select
            id="calculator-operation"
            onChange={(event) => setOperation(event.target.value)}
            value={operation}
          >
            {Object.entries(operations).map(([value, item]) => (
              <option key={value} value={value}>{item.label}</option>
            ))}
          </select>

          <label htmlFor="second-number">Second number</label>
          <input
            id="second-number"
            inputMode="decimal"
            onChange={(event) => setSecondNumber(event.target.value)}
            placeholder="e.g. 8"
            required
            step="any"
            type="number"
            value={secondNumber}
          />

          <button className="calculator-submit" type="submit">Calculate</button>
        </form>

        {error && <p className="calculator-error" role="alert">{error}</p>}
        {result !== null && (
          <output className="calculator-result" aria-live="polite">
            <span>{firstNumber} {operations[operation].symbol} {secondNumber} =</span>
            <strong>{result}</strong>
          </output>
        )}
      </section>
      <footer className="calculator-footer">Small steps, smart solutions.</footer>
    </main>
  )
}

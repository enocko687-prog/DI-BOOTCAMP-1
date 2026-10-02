import { useState } from 'react'
import Car from './Components/Car'
import Color from './Components/Color'
import ContactForm from './Components/ContactForm'
import Events from './Components/Events'
import Forms from './Components/Forms'
import BookForm from './Components/BookForm'
import Clock from './Components/Clock'
import Form from './Components/Form'
import Phone from './Components/Phone'
import './App.css'

function App() {
  const carinfo = { name: 'Ford', model: 'Mustang' }
  const [languages, setLanguages] = useState([
    { name: 'Php', votes: 0 },
    { name: 'Python', votes: 0 },
    { name: 'JavaScript', votes: 0 },
    { name: 'Java', votes: 0 },
  ])

  const voteForLanguage = (languageName) => {
    setLanguages((currentLanguages) =>
      currentLanguages.map((language) =>
        language.name === languageName
          ? { ...language, votes: language.votes + 1 }
          : language,
      ),
    )
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">React practice · 10 exercises</p>
        <h1>Components in motion</h1>
        <p className="intro">
          Build a small collection of components, then bring them to life with
          state, events, and effects.
        </p>
      </header>

      <div className="exercise-list">
        <section className="exercise" aria-labelledby="exercise-1">
          <div className="exercise-heading">
            <span className="exercise-number">01</span>
            <div>
              <p className="exercise-label">Props and components</p>
              <h2 id="exercise-1">Car and garage</h2>
            </div>
          </div>
          <div className="exercise-content">
            <Car carInfo={carinfo} />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-2">
          <div className="exercise-heading">
            <span className="exercise-number">02</span>
            <div>
              <p className="exercise-label">Event handlers</p>
              <h2 id="exercise-2">Events</h2>
            </div>
          </div>
          <div className="exercise-content">
            <Events />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-3">
          <div className="exercise-heading">
            <span className="exercise-number">03</span>
            <div>
              <p className="exercise-label">State and updates</p>
              <h2 id="exercise-3">Phone</h2>
            </div>
          </div>
          <div className="exercise-content">
            <Phone />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-4">
          <div className="exercise-heading">
            <span className="exercise-number">04</span>
            <div>
              <p className="exercise-label">Side effects</p>
              <h2 id="exercise-4">Color effect</h2>
            </div>
          </div>
          <div className="exercise-content">
            <Color />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-5">
          <div className="exercise-heading">
            <span className="exercise-number">05</span>
            <div>
              <p className="exercise-label">Controlled inputs</p>
              <h2 id="exercise-5">Forms</h2>
            </div>
          </div>
          <div className="exercise-content">
            <Forms />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-6">
          <div className="exercise-heading">
            <span className="exercise-number">06</span>
            <div>
              <p className="exercise-label">Form data and state</p>
              <h2 id="exercise-6">New book</h2>
            </div>
          </div>
          <div className="exercise-content">
            <BookForm />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-7">
          <div className="exercise-heading">
            <span className="exercise-number">07</span>
            <div>
              <p className="exercise-label">Validate and review</p>
              <h2 id="exercise-7">Contact details</h2>
            </div>
          </div>
          <div className="exercise-content">
            <ContactForm />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-8">
          <div className="exercise-heading">
            <span className="exercise-number">08</span>
            <div>
              <p className="exercise-label">Effects and cleanup</p>
              <h2 id="exercise-8">Local clock</h2>
            </div>
          </div>
          <div className="exercise-content">
            <Clock />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-9">
          <div className="exercise-heading">
            <span className="exercise-number">09</span>
            <div>
              <p className="exercise-label">Custom validation</p>
              <h2 id="exercise-9">Form validation</h2>
            </div>
          </div>
          <div className="exercise-content">
            <Form />
          </div>
        </section>

        <section className="exercise" aria-labelledby="exercise-10">
          <div className="exercise-heading">
            <span className="exercise-number">10</span>
            <div>
              <p className="exercise-label">State and click events</p>
              <h2 id="exercise-10">Vote for a language</h2>
            </div>
          </div>
          <div className="exercise-content">
            <div className="vote-list" aria-label="Programming language votes">
              {languages.map((language) => (
                <div className="vote-row" key={language.name}>
                  <button
                    type="button"
                    aria-label={`Vote for ${language.name}`}
                    onClick={() => voteForLanguage(language.name)}
                  >
                    {language.name}
                  </button>
                  <p className="vote-total" aria-live="polite">
                    <strong>{language.votes}</strong>{' '}
                    {language.votes === 1 ? 'vote' : 'votes'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App

import { createContext, useContext, useRef, useState } from 'react'
import TodoList from './exersice xp gold.js'
import TaskManager from './exersice xp ninja.js'
import HeroloWeatherApp from './mini project herolo assignmet.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-shell theme-${theme}`} data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

function ThemeSwitcher() {
  const themeContext = useContext(ThemeContext)
  if (!themeContext) {
    throw new Error('ThemeSwitcher must be rendered inside ThemeProvider.')
  }

  const { theme, toggleTheme } = themeContext

  return (
    <button
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      {theme === 'light' ? '🌙 Dark theme' : '☀️ Light theme'}
    </button>
  )
}

function ThemedCard() {
  const themeContext = useContext(ThemeContext)
  if (!themeContext) {
    throw new Error('ThemedCard must be rendered inside ThemeProvider.')
  }

  const { theme } = themeContext

  return (
    <section className="exercise-card">
      <p className="eyebrow">Exercise 1 · useContext + useState</p>
      <h2>Theme switcher</h2>
      <p>
        This card reads the current <strong>{theme}</strong> theme from context.
        Toggle the button to change the page and card colors.
      </p>
      <ThemeSwitcher />
    </section>
  )
}

function CharacterCounter() {
  const inputRef = useRef(null)
  const [characterCount, setCharacterCount] = useState(0)

  function updateCharacterCount() {
    setCharacterCount(inputRef.current?.value.length ?? 0)
  }

  return (
    <section className="exercise-card">
      <p className="eyebrow">Exercise 2 · useRef</p>
      <h2>Character counter</h2>
      <label className="input-label" htmlFor="character-input">
        Type something below
      </label>
      <textarea
        id="character-input"
        onChange={updateCharacterCount}
        placeholder="Your text goes here…"
        ref={inputRef}
        rows="4"
      />
      <p aria-live="polite" className="character-count">
        Characters: <strong>{characterCount}</strong>
      </p>
    </section>
  )
}

export default function Exercises() {
  return (
    <ThemeProvider>
      <main className="content">
        <header className="page-header">
          <p className="eyebrow">Week 8 · Day 3</p>
          <h1>React hooks exercises</h1>
          <p>Practice shared theme context, a live character counter, and reducer state.</p>
        </header>
        <ThemedCard />
        <CharacterCounter />
        <TodoList />
        <TaskManager />
        <HeroloWeatherApp />
      </main>
    </ThemeProvider>
  )
}
import { Component } from 'react'
import countries from './countries.js'

const MAX_SUGGESTIONS = 8

export default class AutoCompletedText extends Component {
  constructor(props) {
    super(props)
    this.state = {
      suggestions: [],
      text: '',
      activeSuggestion: -1,
    }
  }

  handleChange = (event) => {
    const text = event.target.value
    const query = text.trim().toLocaleLowerCase()
    const suggestions = query
      ? countries
          .filter((country) => country.toLocaleLowerCase().startsWith(query))
          .slice(0, MAX_SUGGESTIONS)
      : []

    this.setState({ text, suggestions, activeSuggestion: -1 })
  }

  selectCountry = (country) => {
    this.setState({
      text: country,
      suggestions: [],
      activeSuggestion: -1,
    })
  }

  handleKeyDown = (event) => {
    const { suggestions, activeSuggestion } = this.state
    if (!suggestions.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      this.setState({
        activeSuggestion: (activeSuggestion + 1) % suggestions.length,
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      this.setState({
        activeSuggestion:
          activeSuggestion <= 0 ? suggestions.length - 1 : activeSuggestion - 1,
      })
    } else if (event.key === 'Enter' && activeSuggestion >= 0) {
      event.preventDefault()
      this.selectCountry(suggestions[activeSuggestion])
    } else if (event.key === 'Escape') {
      this.setState({ suggestions: [], activeSuggestion: -1 })
    }
  }

  render() {
    const { suggestions, text, activeSuggestion } = this.state
    const listId = 'country-suggestions'

    return (
      <section className="exercise-card" aria-labelledby="autocomplete-heading">
        <p className="exercise-label">Daily Challenge</p>
        <h2 id="autocomplete-heading">Country autocomplete</h2>
        <p>Start typing a country, then choose a suggestion.</p>
        <div className="autocomplete">
          <label className="form-label" htmlFor="country-search">
            Country
          </label>
          <input
            aria-activedescendant={
              activeSuggestion >= 0
                ? `${listId}-${activeSuggestion}`
                : undefined
            }
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={suggestions.length > 0}
            autoComplete="off"
            className="form-control"
            id="country-search"
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            placeholder="Search countries"
            role="combobox"
            type="text"
            value={text}
          />
          {suggestions.length > 0 && (
            <ul className="autocomplete-suggestions" id={listId} role="listbox">
              {suggestions.map((country, index) => (
                <li key={country} role="presentation">
                  <button
                    id={`${listId}-${index}`}
                    aria-selected={index === activeSuggestion}
                    className={`autocomplete-option${index === activeSuggestion ? ' active' : ''}`}
                    onClick={() => this.selectCountry(country)}
                    onMouseEnter={() => this.setState({ activeSuggestion: index })}
                    role="option"
                    type="button"
                  >
                    {country}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    )
  }
}

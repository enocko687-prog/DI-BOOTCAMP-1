import { useEffect, useState } from 'react'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const FAVORITES_STORAGE_KEY = 'herolo-weather-favorites'

function readSavedFavorites() {
  try {
    const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) {
      throw new Error('Saved favorites are not a list.')
    }
    return parsed
  } catch (error) {
    console.warn('Could not read saved weather favorites:', error)
    return []
  }
}

function getWeatherDescription(code) {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55].includes(code)) return 'Drizzle'
  if ([56, 57].includes(code)) return 'Freezing drizzle'
  if ([61, 63, 65].includes(code)) return 'Rain'
  if ([66, 67].includes(code)) return 'Freezing rain'
  if ([71, 73, 75, 77].includes(code)) return 'Snow'
  if ([80, 81, 82].includes(code)) return 'Rain showers'
  if ([85, 86].includes(code)) return 'Snow showers'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Weather unavailable'
}

function getWeatherIcon(code, isDay = true) {
  if (code === 0) return isDay ? '☀️' : '🌙'
  if (code === 1 || code === 2) return isDay ? '🌤️' : '☁️'
  if (code === 3 || [45, 48].includes(code)) return '☁️'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️'
  if ([95, 96, 99].includes(code)) return '⛈️'
  if (code >= 51) return '🌧️'
  return '🌡️'
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateString}T12:00:00`))
}

function locationLabel(location) {
  return [location.name, location.admin1, location.country]
    .filter((part, index, parts) => part && parts.indexOf(part) === index)
    .join(', ')
}

async function readJson(response, description) {
  if (!response.ok) {
    throw new Error(`${description} failed (HTTP ${response.status}).`)
  }
  return response.json()
}

async function fetchWeather(location) {
  const url = new URL(FORECAST_URL)
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '5',
  }).toString()

  const forecast = await readJson(await fetch(url), 'Weather lookup')
  if (!forecast.current || !forecast.daily) {
    throw new Error('The weather service returned incomplete weather data.')
  }

  return {
    id: location.id,
    name: location.name,
    admin1: location.admin1 ?? '',
    country: location.country ?? '',
    countryCode: location.country_code ?? '',
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: forecast.timezone,
    current: forecast.current,
    daily: forecast.daily,
    updatedAt: Date.now(),
  }
}

function WeatherDetails({ city, compact = false }) {
  const current = city.current
  const todayCode = city.daily.weather_code[0]

  return (
    <div className={compact ? 'weather-details compact' : 'weather-details'}>
      <div className="weather-current">
        <span aria-hidden="true" className="weather-icon">
          {getWeatherIcon(todayCode, Boolean(current.is_day))}
        </span>
        <div>
          <p className="weather-temperature">
            {Math.round(current.temperature_2m)}°
            <span>C</span>
          </p>
          <p className="weather-description">{getWeatherDescription(todayCode)}</p>
          <p className="weather-feels-like">
            Feels like {Math.round(current.apparent_temperature)}°C
          </p>
        </div>
      </div>
      {!compact && (
        <>
          <div className="weather-stats">
            <div>
              <span>Humidity</span>
              <strong>{current.relative_humidity_2m}%</strong>
            </div>
            <div>
              <span>Wind</span>
              <strong>{Math.round(current.wind_speed_10m)} km/h</strong>
            </div>
            <div>
              <span>Precipitation</span>
              <strong>{current.precipitation} mm</strong>
            </div>
          </div>
          <div className="forecast-list">
            {city.daily.time.map((date, index) => {
              const code = city.daily.weather_code[index]
              return (
                <div className="forecast-day" key={date}>
                  <span>{index === 0 ? 'Today' : formatDate(date)}</span>
                  <span aria-label={getWeatherDescription(code)}>
                    {getWeatherIcon(code)}
                  </span>
                  <span>
                    {Math.round(city.daily.temperature_2m_max[index])}° /{' '}
                    {Math.round(city.daily.temperature_2m_min[index])}°
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function HeroloWeatherApp() {
  const [page, setPage] = useState(() =>
    window.location.hash === '#/favorites' ? 'favorites' : 'weather',
  )
  const [favorites, setFavorites] = useState(readSavedFavorites)
  const [cityQuery, setCityQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [weather, setWeather] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    function syncPageFromHash() {
      setPage(window.location.hash === '#/favorites' ? 'favorites' : 'weather')
    }

    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/weather')
    }
    window.addEventListener('hashchange', syncPageFromHash)
    return () => window.removeEventListener('hashchange', syncPageFromHash)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('Could not save weather favorites:', error)
      setStatusMessage('Favorites could not be saved in this browser.')
    }
  }, [favorites])

  async function searchCity(event) {
    event.preventDefault()
    const query = cityQuery.trim()
    if (!query) {
      setErrorMessage('Enter a city name to search.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setStatusMessage('')
    setWeather(null)
    setSelectedCity(null)

    try {
      const url = new URL(GEOCODING_URL)
      url.search = new URLSearchParams({
        name: query,
        count: '1',
        language: 'en',
        format: 'json',
      }).toString()
      const data = await readJson(await fetch(url), 'City search')
      const location = data.results?.[0]
      if (!location) {
        throw new Error(`No city found for “${query}”. Check the spelling and try again.`)
      }

      const city = await fetchWeather(location)
      setSelectedCity(city)
      setWeather(city)
    } catch (error) {
      console.error('Could not search weather:', error)
      setErrorMessage(error.message || 'Could not load weather. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function saveFavorite() {
    if (!weather) return
    const existing = favorites.some(
      (favorite) => favorite.latitude === weather.latitude &&
        favorite.longitude === weather.longitude,
    )
    if (existing) {
      setStatusMessage(`${locationLabel(weather)} is already in your favorites.`)
      return
    }
    setFavorites((currentFavorites) => [weather, ...currentFavorites])
    setStatusMessage(`${locationLabel(weather)} was saved to your favorites.`)
  }

  function removeFavorite(city) {
    setFavorites((currentFavorites) =>
      currentFavorites.filter(
        (favorite) =>
          favorite.latitude !== city.latitude ||
          favorite.longitude !== city.longitude,
      ),
    )
    setStatusMessage(`${locationLabel(city)} was removed from your favorites.`)
  }

  function showFavorite(city) {
    setWeather(city)
    setSelectedCity(city)
    setCityQuery(city.name)
    setErrorMessage('')
    setStatusMessage('')
    window.location.hash = '#/weather'
  }

  const isFavorite =
    weather &&
    favorites.some(
      (favorite) =>
        favorite.latitude === weather.latitude &&
        favorite.longitude === weather.longitude,
    )

  return (
    <main className="weather-app">
      <header className="weather-header">
        <a aria-label="Herolo Weather home" className="weather-brand" href="#/weather">
          <span aria-hidden="true">☀</span> weatherly
        </a>
        <nav aria-label="Weather pages" className="weather-nav">
          <a
            aria-current={page === 'weather' ? 'page' : undefined}
            className={page === 'weather' ? 'active' : ''}
            href="#/weather"
          >
            Weather
          </a>
          <a
            aria-current={page === 'favorites' ? 'page' : undefined}
            className={page === 'favorites' ? 'active' : ''}
            href="#/favorites"
          >
            Favorites <span className="favorite-count">{favorites.length}</span>
          </a>
        </nav>
      </header>

      {page === 'weather' ? (
        <section className="weather-page">
          <div className="weather-intro">
            <p className="weather-eyebrow">Your day, at a glance</p>
            <h1>Weather around the world</h1>
            <p>Search for a city to see current conditions and a five-day forecast.</p>
          </div>

          <form className="city-search" onSubmit={searchCity}>
            <label className="visually-hidden" htmlFor="weather-city">
              Search for a city
            </label>
            <span aria-hidden="true" className="search-icon">⌕</span>
            <input
              autoComplete="off"
              id="weather-city"
              onChange={(event) => setCityQuery(event.target.value)}
              placeholder="Try Tokyo, London, or Nairobi"
              type="search"
              value={cityQuery}
            />
            <button disabled={isLoading} type="submit">
              {isLoading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {errorMessage && (
            <p className="weather-alert" role="alert">{errorMessage}</p>
          )}
          {statusMessage && (
            <p className="weather-status" role="status">{statusMessage}</p>
          )}
          {isLoading && <p className="weather-loading" role="status">Loading weather…</p>}

          {weather && !isLoading && (
            <article className="weather-card">
              <div className="weather-card-heading">
                <div>
                  <p className="weather-eyebrow">Current weather</p>
                  <h2>{locationLabel(weather)}</h2>
                  <p className="weather-local-time">
                    {weather.timezone} · Updated{' '}
                    {new Intl.DateTimeFormat(undefined, {
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(weather.updatedAt))}
                  </p>
                </div>
                <button
                  aria-pressed={Boolean(isFavorite)}
                  className={`favorite-button${isFavorite ? ' saved' : ''}`}
                  onClick={saveFavorite}
                  type="button"
                >
                  {isFavorite ? '★ Saved' : '☆ Save favorite'}
                </button>
              </div>
              <WeatherDetails city={weather} />
            </article>
          )}

          {!weather && !isLoading && !errorMessage && (
            <div className="weather-welcome">
              <span aria-hidden="true">🌤️</span>
              <p>Find the forecast for your next destination.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="favorites-page">
          <div className="weather-intro">
            <p className="weather-eyebrow">Saved places</p>
            <h1>Your favorite cities</h1>
            <p>Your favorites are saved on this device and stay here between visits.</p>
          </div>
          {statusMessage && (
            <p className="weather-status" role="status">{statusMessage}</p>
          )}
          {favorites.length === 0 ? (
            <div className="weather-welcome">
              <span aria-hidden="true">☆</span>
              <h2>No favorites yet</h2>
              <p>Search for a city and save it to see it here.</p>
              <a className="weather-primary-link" href="#/weather">Search for a city</a>
            </div>
          ) : (
            <div className="favorite-grid">
              {favorites.map((city) => (
                <article className="favorite-card" key={`${city.latitude},${city.longitude}`}>
                  <button
                    className="favorite-city-link"
                    onClick={() => showFavorite(city)}
                    type="button"
                  >
                    <span>{locationLabel(city)}</span>
                    <WeatherDetails city={city} compact />
                  </button>
                  <button
                    aria-label={`Remove ${locationLabel(city)} from favorites`}
                    className="favorite-remove"
                    onClick={() => removeFavorite(city)}
                    type="button"
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      <footer className="weather-footer">
        Weather data by <a href="https://open-meteo.com/" rel="noreferrer" target="_blank">Open-Meteo</a>
      </footer>
    </main>
  )
}

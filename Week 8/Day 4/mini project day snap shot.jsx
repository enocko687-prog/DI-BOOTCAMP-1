import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'

const categories = [
  { label: 'Mountain', slug: 'mountain', search: 'mountain landscape' },
  { label: 'Beaches', slug: 'beaches', search: 'beach coastline' },
  { label: 'Birds', slug: 'birds', search: 'wild birds' },
  { label: 'Food', slug: 'food', search: 'food cuisine' },
]

function imageSearchUrl(search, continuation) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: search,
    gsrnamespace: '6',
    gsrlimit: '30',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '800',
    format: 'json',
    origin: '*',
  })

  if (continuation) {
    Object.entries(continuation).forEach(([key, value]) => {
      params.set(key, String(value))
    })
  }

  return `https://commons.wikimedia.org/w/api.php?${params.toString()}`
}

function getPhotoTitle(fileTitle) {
  return fileTitle.replace(/^File:/, '').replace(/\.[^.]+$/, '').replaceAll('_', ' ')
}

function getPhotos(data) {
  return Object.values(data.query?.pages ?? [])
    .map((page) => {
      const image = page.imageinfo?.[0]
      const src = image?.thumburl ?? image?.url
      if (!src) return null
      return {
        id: page.pageid,
        title: getPhotoTitle(page.title),
        src,
        pageUrl: image.descriptionurl,
      }
    })
    .filter(Boolean)
}

function SnapshotGallery() {
  const { category } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const activeCategory = categories.find((item) => item.slug === category)
  const query = searchParams.get('query')?.trim()
  const isSearch = Boolean(query)
  const searchTerm = isSearch ? query : activeCategory?.search
  const heading = isSearch ? `Search: ${searchTerm}` : activeCategory?.label
  const [input, setInput] = useState(searchTerm ?? '')
  const [photos, setPhotos] = useState([])
  const [continuation, setContinuation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    setInput(searchTerm ?? '')
    setPhotos([])
    setContinuation(null)
    setError('')
    setLoading(true)

    if (!searchTerm) {
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()

    async function loadPhotos() {
      try {
        const response = await fetch(imageSearchUrl(searchTerm), {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Image search failed (${response.status}). Please try again.`)
        }

        const data = await response.json()
        setPhotos(getPhotos(data))
        setContinuation(data.continue ?? null)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Unable to load images. Please try again.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadPhotos()
    return () => controller.abort()
  }, [searchTerm, requestVersion])

  async function loadMorePhotos() {
    if (!continuation || loadingMore) return
    setLoadingMore(true)
    setError('')

    try {
      const response = await fetch(imageSearchUrl(searchTerm, continuation))
      if (!response.ok) {
        throw new Error(`More images could not be loaded (${response.status}).`)
      }

      const data = await response.json()
      const resultPhotos = getPhotos(data)

      setPhotos((currentPhotos) => {
        const existingIds = new Set(currentPhotos.map((photo) => photo.id))
        return [...currentPhotos, ...resultPhotos.filter((photo) => !existingIds.has(photo.id))]
      })
      setContinuation(data.continue ?? null)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load more images.')
    } finally {
      setLoadingMore(false)
    }
  }

  function submitSearch(event) {
    event.preventDefault()
    const trimmedInput = input.trim()
    if (trimmedInput) {
      navigate(`/search?query=${encodeURIComponent(trimmedInput)}`)
    }
  }

  if (!activeCategory && !isSearch) {
    return (
      <main className="snapshot-error-page">
        <p>That gallery does not exist.</p>
        <NavLink to="/SnapScout/mountain">Browse the mountain gallery</NavLink>
      </main>
    )
  }

  return (
    <main className="snapshot-page">
      <header className="snapshot-header">
        <NavLink className="snapshot-brand" to="/SnapScout/mountain" aria-label="SnapShot home">
          <span className="snapshot-brand-mark" aria-hidden="true">S</span>
          <span>Snap<span>Shot</span></span>
        </NavLink>
        <form className="snapshot-search" onSubmit={submitSearch} role="search">
          <label className="snapshot-visually-hidden" htmlFor="snapshot-search-input">
            Search photos
          </label>
          <input
            id="snapshot-search-input"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search for photos..."
            type="search"
            value={input}
          />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
        <nav className="snapshot-header-tools" aria-label="Other projects">
          <NavLink className="snapshot-quote-link" to="/quotes">Quote generator</NavLink>
          <NavLink className="snapshot-quote-link" to="/calculator">Calculator</NavLink>
        </nav>
      </header>

      <section className="snapshot-intro" aria-labelledby="snapshot-heading">
        <p className="snapshot-eyebrow">A world worth looking at</p>
        <h1 id="snapshot-heading">{heading} <span>collection</span></h1>
        <p>Find a little inspiration in the places, creatures, and flavors around us.</p>
      </section>

      <nav className="snapshot-categories" aria-label="Photo categories">
        {categories.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `snapshot-category${isActive && !isSearch ? ' is-active' : ''}`
            }
            key={item.slug}
            to={`/SnapScout/${item.slug}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <section className="snapshot-gallery-section" aria-live="polite">
        <div className="snapshot-results-heading">
          <h2>{isSearch ? 'Search results' : `${activeCategory.label} photos`}</h2>
          {!loading && !error && <span>{photos.length} photos</span>}
        </div>

        {loading && (
          <div className="snapshot-status" role="status">
            <span className="snapshot-spinner" aria-hidden="true" />
            Finding beautiful photos...
          </div>
        )}

        {error && (
          <div className="snapshot-error" role="alert">
            <p>{error}</p>
            <button onClick={() => setRequestVersion((version) => version + 1)} type="button">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <p className="snapshot-empty">No photos found. Try another search term.</p>
        )}

        {photos.length > 0 && (
          <div className="snapshot-grid">
            {photos.map((photo) => (
              <a
                className="snapshot-photo"
                href={photo.pageUrl}
                key={photo.id}
                rel="noreferrer"
                target="_blank"
                aria-label={`View photo details: ${photo.title}`}
              >
                <img alt={photo.title} loading="lazy" src={photo.src} />
                <span className="snapshot-photo-caption">
                  <span>{photo.title}</span>
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            ))}
          </div>
        )}

        {!loading && continuation && (
          <button
            className="snapshot-load-more"
            disabled={loadingMore}
            onClick={loadMorePhotos}
            type="button"
          >
            {loadingMore ? 'Loading photos...' : 'Load more photos'}
          </button>
        )}
      </section>

      <footer className="snapshot-footer">
        Images provided by Wikimedia Commons. Select a photo to view its source.
      </footer>
    </main>
  )
}

export default SnapshotGallery

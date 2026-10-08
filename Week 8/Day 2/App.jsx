import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import ErrorBoundary from './ErrorBoundary.js'
import JsonPostList from './PostList.js'
import Example1 from './Example1.js'
import Example2 from './Example2.js'
import Example3 from './Example3.js'
import webhookPayload from './exersice xp.js'
import { AxiosPostForm, FetchUserForm } from './exersice xp gold.js'
import { PostList as ApiPostList, UsersList } from './mini project users and post.js'
import { ExpressUsersList } from './exersice xp ninja.js'
import { Customers } from './components/customers.js'
import ServerMessageExercise from './Daily challange and data server.js'
import AutoCompletedText from './Daily challange form.js'
import './styles.css'

function HomeScreen() {
  const [webhookUrl, setWebhookUrl] = useState('')
  const [requestState, setRequestState] = useState({
    status: 'idle',
    message: '',
  })

  async function sendPost() {
    const destination = webhookUrl.trim()
    if (!destination) {
      setRequestState({
        status: 'error',
        message: 'Paste your webhook.site unique URL before sending.',
      })
      return
    }

    let parsedUrl
    try {
      parsedUrl = new URL(destination)
    } catch {
      setRequestState({
        status: 'error',
        message: 'Enter a valid webhook URL.',
      })
      return
    }

    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'webhook.site') {
      setRequestState({
        status: 'error',
        message: 'For safety, the destination must be an HTTPS webhook.site URL.',
      })
      return
    }

    setRequestState({ status: 'sending', message: 'Sending request…' })
    try {
      const response = await fetch(parsedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })
      const responseBody = await response.text()
      const result = {
        status: response.status,
        statusText: response.statusText,
        body: responseBody || '(empty response body)',
      }

      console.log('Webhook response:', result)
      if (!response.ok) {
        throw new Error(`Webhook request failed with HTTP ${response.status}.`)
      }
      setRequestState({
        status: 'success',
        message: `Request completed with HTTP ${response.status}. See the browser console for the response.`,
      })
    } catch (error) {
      console.error('Could not send webhook request:', error)
      setRequestState({
        status: 'error',
        message:
          error instanceof Error
            ? `${error.message} Confirm CORS is enabled on webhook.site.`
            : 'The request failed. Confirm CORS is enabled on webhook.site.',
      })
    }
  }

  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">Week 8 · Day 2</p>
        <h1>React Router and JSON</h1>
        <p className="lead">
          Explore error boundaries, render nested JSON data, and send a POST
          request from React.
        </p>
      </header>

      <ServerMessageExercise />

      <AutoCompletedText />

      <section className="exercise-card" aria-labelledby="posts-heading">
        <p className="exercise-label">Exercise 2</p>
        <h2 id="posts-heading">Display JSON data</h2>
        <JsonPostList />
      </section>

      <section className="exercise-card" aria-labelledby="api-data-heading">
        <p className="exercise-label">Week 9 · Day 2</p>
        <h2 id="api-data-heading">Fetch data from an API</h2>
        <div className="api-data-grid">
          <section aria-labelledby="api-posts-heading">
            <h3 id="api-posts-heading">Posts</h3>
            <ApiPostList />
          </section>
          <section aria-labelledby="api-users-heading">
            <h3 id="api-users-heading">Users</h3>
            <UsersList />
          </section>
        </div>
      </section>

      <section className="exercise-card" aria-labelledby="express-backend-heading">
        <p className="exercise-label">Week 9 · Express backend</p>
        <h2 id="express-backend-heading">Get JSON from Express</h2>
        <p>
          These class components load data from the local Express server through
          the Vite development proxy.
        </p>
        <div className="api-data-grid">
          <section aria-labelledby="express-users-heading">
            <h3 id="express-users-heading">Exercise 1: Backend users</h3>
            <ExpressUsersList />
          </section>
          <section aria-labelledby="express-customers-heading">
            <h3 id="express-customers-heading">Exercise 2: Customers</h3>
            <Customers />
          </section>
        </div>
      </section>

      <section className="exercise-card" aria-labelledby="profile-data-heading">
        <p className="exercise-label">Exercise 3</p>
        <h2 id="profile-data-heading">Parse nested profile data</h2>
        <div className="data-grid">
          <Example1 />
          <Example2 />
          <Example3 />
        </div>
      </section>

      <section className="exercise-card" aria-labelledby="post-heading">
        <p className="exercise-label">Exercise 4</p>
        <h2 id="post-heading">Post JSON data</h2>
        <p>
          Create a unique URL at webhook.site, enable CORS, and paste the URL
          below. The sample payload is sent only when you click the button.
        </p>
        <label className="form-label" htmlFor="webhook-url">
          Your webhook.site unique URL
        </label>
        <input
          autoComplete="url"
          className="form-control webhook-input"
          id="webhook-url"
          onChange={(event) => setWebhookUrl(event.target.value)}
          placeholder="https://webhook.site/your-unique-id"
          type="url"
          value={webhookUrl}
        />
        <button
          className="btn btn-primary mt-3"
          disabled={requestState.status === 'sending'}
          onClick={sendPost}
          type="button"
        >
          {requestState.status === 'sending' ? 'Sending…' : 'Send sample JSON'}
        </button>
        {requestState.message && (
          <p
            aria-live="polite"
            className={`request-message ${requestState.status}`}
            role={requestState.status === 'error' ? 'alert' : 'status'}
          >
            {requestState.message}
          </p>
        )}
      </section>

      <section className="exercise-card" aria-labelledby="post-forms-heading">
        <p className="exercise-label">Week 9 · Day 2</p>
        <h2 id="post-forms-heading">POST form exercises</h2>
        <p>
          These forms send your entries to JSONPlaceholder, a demonstration API.
          It returns a simulated created record; it does not permanently save it.
        </p>
        <div className="data-grid post-forms-grid">
          <FetchUserForm />
          <AxiosPostForm />
        </div>
      </section>
    </>
  )
}

function ProfileScreen() {
  return (
    <section className="exercise-card route-screen">
      <p className="eyebrow">React Router</p>
      <h1>Profile Screen</h1>
    </section>
  )
}

function ShopScreen() {
  throw new Error('ShopScreen error: this failure is caught by its boundary.')
}

function App() {
  return (
    <>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container nav-container">
          <span className="navbar-brand">React Exercises</span>
          <div className="navbar-nav">
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end to="/">
              Home
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/profile">
              Profile
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/shop">
              Shop
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="container page-shell">
        <Routes>
          <Route
            element={
              <ErrorBoundary key="home">
                <HomeScreen />
              </ErrorBoundary>
            }
            path="/"
          />
          <Route
            element={
              <ErrorBoundary key="profile">
                <ProfileScreen />
              </ErrorBoundary>
            }
            path="/profile"
          />
          <Route
            element={
              <ErrorBoundary key="shop">
                <ShopScreen />
              </ErrorBoundary>
            }
            path="/shop"
          />
          <Route
            element={
              <ErrorBoundary>
                <section className="exercise-card route-screen">
                  <h1>Page not found</h1>
                  <p>Choose Home, Profile, or Shop from the navigation.</p>
                </section>
              </ErrorBoundary>
            }
            path="*"
          />
        </Routes>
      </main>
    </>
  )
}

export { HomeScreen, ProfileScreen, ShopScreen }
export default App

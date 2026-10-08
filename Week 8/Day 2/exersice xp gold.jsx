import { Component } from 'react'
import axios from 'axios'

const USERS_API = 'https://jsonplaceholder.typicode.com/users/'
const POSTS_API = 'https://jsonplaceholder.typicode.com/posts'

export class FetchUserForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: '',
      email: '',
      status: 'idle',
      message: '',
    }
  }

  handleChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    this.setState({ status: 'sending', message: '' })

    try {
      const response = await fetch(USERS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          user: this.state.user,
          email: this.state.email,
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with HTTP ${response.status}.`)
      }

      const result = await response.json()
      console.log('User created with fetch:', result)
      this.setState({
        status: 'success',
        message: 'User submitted. See the browser console for the response.',
      })
    } catch (error) {
      console.error('Could not submit user with fetch:', error)
      this.setState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'The user request failed. Please try again.',
      })
    }
  }

  render() {
    const { user, email, status, message } = this.state

    return (
      <section className="data-card post-form-card" aria-labelledby="fetch-form-heading">
        <h3 id="fetch-form-heading">POST user with fetch</h3>
        <form onSubmit={this.handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="fetch-user">
              User
            </label>
            <input
              autoComplete="username"
              className="form-control"
              id="fetch-user"
              name="user"
              onChange={this.handleChange}
              placeholder="Enter a username"
              required
              type="text"
              value={user}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="fetch-email">
              Email
            </label>
            <input
              autoComplete="email"
              className="form-control"
              id="fetch-email"
              name="email"
              onChange={this.handleChange}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          <button className="btn btn-primary" disabled={status === 'sending'} type="submit">
            {status === 'sending' ? 'Submitting…' : 'Submit user'}
          </button>
        </form>
        {message && (
          <p
            aria-live="polite"
            className={`request-message ${status}`}
            role={status === 'error' ? 'alert' : 'status'}
          >
            {message}
          </p>
        )}
      </section>
    )
  }
}

export class AxiosPostForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userId: '',
      title: '',
      body: '',
      status: 'idle',
      message: '',
    }
  }

  handleChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    this.setState({ status: 'sending', message: '' })

    const { userId, title, body } = this.state
    try {
      const response = await axios.post(
        POSTS_API,
        { userId: Number(userId), title, body },
        { headers: { 'Content-Type': 'application/json' } },
      )
      console.log('Post created with Axios:', response.data)
      this.setState({
        status: 'success',
        message: 'Post submitted. See the browser console for the response.',
      })
    } catch (error) {
      console.error('Could not submit post with Axios:', error)
      this.setState({
        status: 'error',
        message: axios.isAxiosError(error)
          ? error.response
            ? `Request failed with HTTP ${error.response.status}.`
            : `Network error: ${error.message}`
          : 'The post request failed. Please try again.',
      })
    }
  }

  render() {
    const { userId, title, body, status, message } = this.state

    return (
      <section className="data-card post-form-card" aria-labelledby="axios-form-heading">
        <h3 id="axios-form-heading">POST post with Axios</h3>
        <form onSubmit={this.handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="axios-user-id">
              User ID
            </label>
            <input
              className="form-control"
              id="axios-user-id"
              min="1"
              name="userId"
              onChange={this.handleChange}
              placeholder="1"
              required
              type="number"
              value={userId}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="axios-title">
              Title
            </label>
            <input
              className="form-control"
              id="axios-title"
              name="title"
              onChange={this.handleChange}
              placeholder="Post title"
              required
              type="text"
              value={title}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="axios-body">
              Body
            </label>
            <textarea
              className="form-control"
              id="axios-body"
              name="body"
              onChange={this.handleChange}
              placeholder="Write your post"
              required
              rows="4"
              value={body}
            />
          </div>
          <button className="btn btn-primary" disabled={status === 'sending'} type="submit">
            {status === 'sending' ? 'Submitting…' : 'Submit post'}
          </button>
        </form>
        {message && (
          <p
            aria-live="polite"
            className={`request-message ${status}`}
            role={status === 'error' ? 'alert' : 'status'}
          >
            {message}
          </p>
        )}
      </section>
    )
  }
}

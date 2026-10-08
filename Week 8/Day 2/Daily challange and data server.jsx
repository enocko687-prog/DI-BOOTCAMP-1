import { Component } from 'react'

export default class ServerMessageExercise extends Component {
  constructor(props) {
    super(props)
    this.state = {
      helloMessage: '',
      inputValue: '',
      responseMessage: '',
      errorMessage: '',
      isLoading: true,
      isSubmitting: false,
    }
  }

  componentDidMount() {
    this.loadHelloMessage()
  }

  componentWillUnmount() {
    this.controller?.abort()
  }

  loadHelloMessage = async () => {
    this.controller = new AbortController()
    try {
      const response = await fetch('/api/hello', {
        signal: this.controller.signal,
      })
      if (!response.ok) {
        throw new Error(`Could not load the greeting (HTTP ${response.status}).`)
      }
      const data = await response.json()
      this.setState({ helloMessage: data.message, isLoading: false })
    } catch (error) {
      if (error.name === 'AbortError') return
      console.error('Could not load Express greeting:', error)
      this.setState({
        errorMessage: error.message || 'Could not connect to the Express server.',
        isLoading: false,
      })
    }
  }

  handleChange = (event) => {
    this.setState({
      inputValue: event.target.value,
      responseMessage: '',
      errorMessage: '',
    })
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const value = this.state.inputValue.trim()
    if (!value) {
      this.setState({ errorMessage: 'Enter a message before submitting.' })
      return
    }

    this.setState({
      isSubmitting: true,
      responseMessage: '',
      errorMessage: '',
    })
    try {
      const response = await fetch('/api/world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message: value }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `Request failed (HTTP ${response.status}).`)
      }
      this.setState({
        responseMessage: data.message,
        isSubmitting: false,
      })
    } catch (error) {
      console.error('Could not send message to Express:', error)
      this.setState({
        errorMessage: error.message || 'Could not send the message to Express.',
        isSubmitting: false,
      })
    }
  }

  render() {
    const {
      helloMessage,
      inputValue,
      responseMessage,
      errorMessage,
      isLoading,
      isSubmitting,
    } = this.state

    return (
      <section className="exercise-card" aria-labelledby="express-message-heading">
        <p className="exercise-label">Week 9 · Daily Challenge</p>
        <h2 id="express-message-heading">Send a message to Express</h2>
        {isLoading ? (
          <p role="status">Loading greeting…</p>
        ) : (
          <h3>{helloMessage || 'Express greeting unavailable'}</h3>
        )}
        <form className="server-message-form" onSubmit={this.handleSubmit}>
          <label className="form-label" htmlFor="server-message">
            Message for the server
          </label>
          <div className="server-message-controls">
            <input
              className="form-control"
              id="server-message"
              onChange={this.handleChange}
              placeholder="Type a message"
              type="text"
              value={inputValue}
            />
            <button
              className="btn btn-primary"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Sending…' : 'Send to server'}
            </button>
          </div>
        </form>
        {responseMessage && (
          <p className="server-response" role="status">
            {responseMessage}
          </p>
        )}
        {errorMessage && (
          <p className="request-message error" role="alert">
            {errorMessage}
          </p>
        )}
      </section>
    )
  }
}

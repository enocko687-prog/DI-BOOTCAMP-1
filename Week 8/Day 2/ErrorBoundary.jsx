import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="error-fallback" role="alert">
          <h1>Something went wrong.</h1>
          <p>This screen failed, but the rest of the app is still available.</p>
        </section>
      )
    }

    return this.props.children
  }
}

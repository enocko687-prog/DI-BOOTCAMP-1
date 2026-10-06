import { Component, createElement } from 'react'

class ErrorBoundary extends Component {
  state = { error: null, errorInfo: null }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.error) {
      return createElement(
        'div',
        { className: 'error-fallback', role: 'alert' },
        createElement('h3', null, 'Something went wrong.'),
        createElement(
          'details',
          { style: { whiteSpace: 'pre-wrap' } },
          this.state.error.toString(),
          createElement('br'),
          this.state.errorInfo?.componentStack,
        ),
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';

class ErrorBoundary extends Component {
  state = {
    error: null,
    errorInfo: null,
    hasError: false,
  };

  static getDerivedStateFromError(error) {
    return { error, hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card my-5" role="alert">
          <div className="card-body">
            <h3 className="card-title">This section could not be displayed.</h3>
            <p className="card-text">
              An error occurred while rendering this part of the page.
            </p>
            <details className="error-details">
              <summary>Error details</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
            <Button
              className="mt-3"
              onClick={() => window.location.reload()}
              variant="primary"
            >
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

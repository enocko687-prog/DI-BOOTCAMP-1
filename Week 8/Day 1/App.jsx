import { Component } from 'react'
import ErrorBoundary from './ErrorBoundary.js'
import { BuggyCounter } from './App.js'
import './styles.css'

class FavoriteColor extends Component {
  state = { favoriteColor: 'red' }

  timerId = null

  componentDidMount() {
    this.timerId = window.setTimeout(() => {
      this.setState({ favoriteColor: 'yellow' })
    }, 1000)
  }

  componentWillUnmount() {
    window.clearTimeout(this.timerId)
  }

  shouldComponentUpdate() {
    return true
  }

  getSnapshotBeforeUpdate() {
    console.log('in getSnapshotBeforeUpdate')
    return null
  }

  componentDidUpdate() {
    console.log('after update')
  }

  changeColor = () => {
    this.setState({ favoriteColor: 'blue' })
  }

  render() {
    return (
      <div className="color-demo">
        <p>
          My favorite color is{' '}
          <strong style={{ color: this.state.favoriteColor }}>
            {this.state.favoriteColor}
          </strong>
          .
        </p>
        <button
          className="button button-secondary"
          onClick={this.changeColor}
          type="button"
        >
          Change color to blue
        </button>
        <p className="hint">
          Starts red, changes to yellow after one second, and can be changed to blue.
          Check the browser console for lifecycle logs.
        </p>
      </div>
    )
  }
}

export class Child extends Component {
  componentWillUnmount() {
    window.alert('The Child component has been unmounted.')
  }

  render() {
    return <h3 className="hello">Hello World!</h3>
  }
}

class App extends Component {
  state = { show: true }

  render() {
    return (
      <main className="page-shell">
        <header className="page-header">
          <p className="eyebrow">React class components</p>
          <h1>Error boundaries and lifecycle</h1>
          <p className="intro">
            Explore error boundaries, updating lifecycle methods, and component
            unmounting.
          </p>
        </header>

        <section className="exercise" aria-labelledby="boundary-title">
          <div className="exercise-heading">
            <span className="exercise-number">01</span>
            <div>
              <p className="exercise-label">Exercise 1</p>
              <h2 id="boundary-title">Error boundary simulations</h2>
            </div>
          </div>
          <div className="exercise-content">
            <h3>Simulation 1: one boundary around both counters</h3>
            <p className="hint">
              Click either counter five times. The shared boundary replaces both
              counters when one crashes.
            </p>
            <ErrorBoundary>
              <div className="counter-row">
                <BuggyCounter />
                <BuggyCounter />
              </div>
            </ErrorBoundary>

            <h3>Simulation 2: a boundary for each counter</h3>
            <p className="hint">
              Each counter fails independently, so the other one remains usable.
            </p>
            <div className="counter-row">
              <ErrorBoundary>
                <BuggyCounter />
              </ErrorBoundary>
              <ErrorBoundary>
                <BuggyCounter />
              </ErrorBoundary>
            </div>

            <h3>Simulation 3: no error boundary</h3>
            <p className="hint">
              Click the counter five times to see an uncaught render error blank
              this page. Refresh the browser to run the demos again.
            </p>
            <div className="counter-row">
              <BuggyCounter />
            </div>
          </div>
        </section>

        <section className="exercise" aria-labelledby="updating-title">
          <div className="exercise-heading">
            <span className="exercise-number">02</span>
            <div>
              <p className="exercise-label">Exercise 2</p>
              <h2 id="updating-title">Updating lifecycle</h2>
            </div>
          </div>
          <div className="exercise-content">
            <FavoriteColor />
          </div>
        </section>

        <section className="exercise" aria-labelledby="unmounting-title">
          <div className="exercise-heading">
            <span className="exercise-number">03</span>
            <div>
              <p className="exercise-label">Exercise 3</p>
              <h2 id="unmounting-title">Unmounting lifecycle</h2>
            </div>
          </div>
          <div className="exercise-content">
            {this.state.show ? (
              <Child />
            ) : (
              <p className="hint">The Child component is no longer mounted.</p>
            )}
            <div className="button-row">
              <button
                className="button"
                disabled={!this.state.show}
                onClick={() => this.setState({ show: false })}
                type="button"
              >
                Delete
              </button>
              {!this.state.show && (
                <button
                  className="button button-secondary"
                  onClick={() => this.setState({ show: true })}
                  type="button"
                >
                  Show again
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    )
  }
}

export default App

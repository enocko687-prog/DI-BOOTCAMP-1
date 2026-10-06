import { createElement, Component } from 'react'

export class BuggyCounter extends Component {
  state = { counter: 0 }

  handleClick = () => {
    this.setState(({ counter }) => ({ counter: counter + 1 }))
  }

  render() {
    if (this.state.counter >= 5) {
      throw new Error('I crashed!')
    }

    return createElement(
      'button',
      {
        className: 'counter',
        onClick: this.handleClick,
        type: 'button',
        'aria-label': `Counter: ${this.state.counter}. Click to increment`,
      },
      this.state.counter,
    )
  }
}

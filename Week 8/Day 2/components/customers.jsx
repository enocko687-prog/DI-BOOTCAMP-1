import { Component } from 'react'

export default class Customers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      customers: [],
      isLoaded: false,
      errorMsg: '',
    }
  }

  componentDidMount() {
    this.controller = new AbortController()
    fetch('/api/customers/', { signal: this.controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load customers (HTTP ${response.status}).`)
        }
        return response.json()
      })
      .then((customers) => {
        this.setState({ customers, isLoaded: true })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('Could not load Express customers:', error)
        this.setState({
          isLoaded: true,
          errorMsg: error.message || 'Could not load customers from the Express backend.',
        })
      })
  }

  componentWillUnmount() {
    this.controller?.abort()
  }

  render() {
    const { customers, isLoaded, errorMsg } = this.state

    if (!isLoaded) {
      return <p role="status">Loading customers…</p>
    }

    if (errorMsg) {
      return <p className="request-message error" role="alert">{errorMsg}</p>
    }

    return (
      <ul className="express-customer-list">
        {customers.map((customer) => (
          <li key={customer.id}>
            <strong>{customer.firstName} {customer.lastName}</strong>
            <span>Customer ID: {customer.id}</span>
          </li>
        ))}
      </ul>
    )
  }
}

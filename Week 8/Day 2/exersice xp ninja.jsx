import { Component } from 'react'

export class ExpressUsersList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      isLoaded: false,
      errorMsg: '',
    }
  }

  componentDidMount() {
    this.controller = new AbortController()
    fetch('/users', { signal: this.controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load backend users (HTTP ${response.status}).`)
        }
        return response.json()
      })
      .then((users) => {
        this.setState({ users, isLoaded: true })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('Could not load Express backend users:', error)
        this.setState({
          isLoaded: true,
          errorMsg: error.message || 'Could not load users from the Express backend.',
        })
      })
  }

  componentWillUnmount() {
    this.controller?.abort()
  }

  render() {
    const { users, isLoaded, errorMsg } = this.state

    if (!isLoaded) {
      return <p role="status">Loading Express users…</p>
    }

    if (errorMsg) {
      return <p className="request-message error" role="alert">{errorMsg}</p>
    }

    return (
      <ul className="express-user-list">
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.username}</strong>
            <span>User ID: {user.id}</span>
          </li>
        ))}
      </ul>
    )
  }
}

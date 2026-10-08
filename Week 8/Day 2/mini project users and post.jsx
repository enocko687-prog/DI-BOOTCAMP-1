import { Component } from 'react'

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts'
const USERS_URL = 'https://jsonplaceholder.typicode.com/users'

export class PostList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      errorMsg: '',
      isLoading: true,
    }
  }

  componentDidMount() {
    this.controller = new AbortController()
    fetch(POSTS_URL, { signal: this.controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load posts (HTTP ${response.status}).`)
        }
        return response.json()
      })
      .then((posts) => {
        this.setState({ posts, errorMsg: '', isLoading: false })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('Could not load posts:', error)
        this.setState({
          errorMsg: error.message || 'Could not load posts. Please try again.',
          isLoading: false,
        })
      })
  }

  componentWillUnmount() {
    this.controller?.abort()
  }

  render() {
    const { posts, errorMsg, isLoading } = this.state

    if (isLoading) {
      return <p role="status">Loading posts…</p>
    }

    if (errorMsg) {
      return <p className="request-message error" role="alert">{errorMsg}</p>
    }

    if (posts.length === 0) {
      return <p>No posts were returned by the API.</p>
    }

    return (
      <div className="api-post-list">
        {posts.map((post) => (
          <article className="api-post" key={post.id}>
            <p className="api-item-meta">Post {post.id} · User {post.userId}</p>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </article>
        ))}
      </div>
    )
  }
}

export class UsersList extends Component {
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
    fetch(USERS_URL, { signal: this.controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load users (HTTP ${response.status}).`)
        }
        return response.json()
      })
      .then((users) => {
        this.setState({ users, isLoaded: true, errorMsg: '' })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('Could not load users:', error)
        this.setState({
          isLoaded: true,
          errorMsg: error.message || 'Could not load users. Please try again.',
        })
      })
  }

  componentWillUnmount() {
    this.controller?.abort()
  }

  render() {
    const { users, isLoaded, errorMsg } = this.state

    if (!isLoaded) {
      return <p role="status">Loading users…</p>
    }

    if (errorMsg) {
      return <p className="request-message error" role="alert">{errorMsg}</p>
    }

    return (
      <ul className="api-user-list">
        {users.map((user) => (
          <li className="api-user" key={user.id}>
            <strong>{user.name}</strong>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </li>
        ))}
      </ul>
    )
  }
}

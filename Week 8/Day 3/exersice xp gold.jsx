import { useReducer, useState } from 'react'

function todoReducer(todos, action) {
  switch (action.type) {
    case 'add':
      return [...todos, action.todo]
    case 'remove':
      return todos.filter((todo) => todo.id !== action.id)
    default:
      throw new Error(`Unknown todo action: ${action.type}`)
  }
}

function createTodoId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export default function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, [])
  const [newTodo, setNewTodo] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const text = newTodo.trim()
    if (!text) return

    dispatch({
      type: 'add',
      todo: { id: createTodoId(), text },
    })
    setNewTodo('')
  }

  return (
    <section className="exercise-card" aria-labelledby="todo-heading">
      <p className="eyebrow">Exercise 3 · useReducer</p>
      <h2 id="todo-heading">Todo list</h2>
      <form className="todo-form" onSubmit={handleSubmit}>
        <label className="input-label" htmlFor="new-todo">
          Add a todo
        </label>
        <div className="todo-controls">
          <input
            className="todo-input"
            id="new-todo"
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="What needs to get done?"
            type="text"
            value={newTodo}
          />
          <button className="theme-toggle" disabled={!newTodo.trim()} type="submit">
            Add todo
          </button>
        </div>
      </form>
      {todos.length === 0 ? (
        <p className="todo-empty" role="status">
          No todos yet. Add one above to get started.
        </p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li className="todo-item" key={todo.id}>
              <span>{todo.text}</span>
              <button
                aria-label={`Remove ${todo.text}`}
                className="todo-remove"
                onClick={() => dispatch({ type: 'remove', id: todo.id })}
                type="button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

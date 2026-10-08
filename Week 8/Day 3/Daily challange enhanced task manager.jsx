import { createContext, useContext, useReducer, useRef, useState } from 'react'

const TaskContext = createContext(null)

function taskReducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, tasks: [...state.tasks, action.task] }
    case 'toggle':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, completed: !task.completed } : task,
        ),
      }
    case 'edit':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, text: action.text } : task,
        ),
      }
    case 'remove':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      }
    case 'filter':
      return { ...state, filter: action.filter }
    default:
      throw new Error(`Unknown task action: ${action.type}`)
  }
}

function createTaskId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    filter: 'all',
  })

  return (
    <TaskContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TaskContext.Provider>
  )
}

function useTasks() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('Task components must be rendered inside TaskProvider.')
  }
  return context
}

function AddTaskForm() {
  const { dispatch } = useTasks()
  const [text, setText] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const taskText = text.trim()
    if (!taskText) return

    dispatch({
      type: 'add',
      task: { id: createTaskId(), text: taskText, completed: false },
    })
    setText('')
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label className="input-label" htmlFor="enhanced-new-task">
        Add a task
      </label>
      <div className="todo-controls">
        <input
          className="todo-input"
          id="enhanced-new-task"
          onChange={(event) => setText(event.target.value)}
          placeholder="What needs to get done?"
          type="text"
          value={text}
        />
        <button className="theme-toggle" disabled={!text.trim()} type="submit">
          Add task
        </button>
      </div>
    </form>
  )
}

function TaskItem({ task }) {
  const { dispatch } = useTasks()
  const [isEditing, setIsEditing] = useState(false)
  const editInputRef = useRef(null)

  function startEditing() {
    setIsEditing(true)
    requestAnimationFrame(() => {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    })
  }

  function saveEdit(event) {
    event.preventDefault()
    const updatedText = editInputRef.current?.value.trim()
    if (updatedText) {
      dispatch({ type: 'edit', id: task.id, text: updatedText })
      setIsEditing(false)
    } else {
      editInputRef.current?.focus()
    }
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  return (
    <li className={`task-item${task.completed ? ' completed' : ''}`}>
      <label className="task-label">
        <input
          aria-label={`Mark ${task.text} ${task.completed ? 'active' : 'completed'}`}
          checked={task.completed}
          onChange={() => dispatch({ type: 'toggle', id: task.id })}
          type="checkbox"
        />
        {!isEditing && <span>{task.text}</span>}
      </label>
      {isEditing ? (
        <form className="task-edit-form" onSubmit={saveEdit}>
          <input
            aria-label={`Edit ${task.text}`}
            className="todo-input task-edit-input"
            defaultValue={task.text}
            onKeyDown={(event) => {
              if (event.key === 'Escape') cancelEdit()
            }}
            ref={editInputRef}
            required
          />
          <button className="task-action" type="submit">Save</button>
          <button className="task-action" onClick={cancelEdit} type="button">
            Cancel
          </button>
        </form>
      ) : (
        <div className="task-actions">
          <button
            aria-label={`Edit ${task.text}`}
            className="task-action"
            onClick={startEditing}
            type="button"
          >
            Edit
          </button>
          <button
            aria-label={`Remove ${task.text}`}
            className="todo-remove"
            onClick={() => dispatch({ type: 'remove', id: task.id })}
            type="button"
          >
            Remove
          </button>
        </div>
      )}
    </li>
  )
}

const filters = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
]

function TaskFilters() {
  const { filter, dispatch, tasks } = useTasks()

  return (
    <div aria-label="Filter tasks" className="task-filters" role="group">
      {filters.map((option) => (
        <button
          aria-pressed={filter === option.id}
          className={`task-filter${filter === option.id ? ' active' : ''}`}
          disabled={tasks.length === 0}
          key={option.id}
          onClick={() => dispatch({ type: 'filter', filter: option.id })}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function TaskList() {
  const { tasks, filter } = useTasks()
  const completedCount = tasks.filter((task) => task.completed).length
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  return (
    <>
      <div className="task-list-heading">
        <p className="task-summary" aria-live="polite">
          {completedCount} of {tasks.length} tasks completed
        </p>
        <TaskFilters />
      </div>
      {visibleTasks.length === 0 ? (
        <p className="todo-empty" role="status">
          {tasks.length === 0
            ? 'No tasks yet. Add your first task above.'
            : `No ${filter} tasks.`}
        </p>
      ) : (
        <ul className="todo-list">
          {visibleTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </>
  )
}

export default function TaskManager() {
  return (
    <TaskProvider>
      <section className="exercise-card" aria-labelledby="enhanced-task-manager-heading">
        <p className="eyebrow">Daily Challenge · useContext + useReducer + useRef</p>
        <h2 id="enhanced-task-manager-heading">Enhanced task manager</h2>
        <p>
          Add tasks, mark them complete, edit their text, and filter the list by
          completion status.
        </p>
        <AddTaskForm />
        <TaskList />
      </section>
    </TaskProvider>
  )
}

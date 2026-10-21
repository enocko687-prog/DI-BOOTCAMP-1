import { useReducer, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  initialTodoState,
  todoReducer,
} from "../../building a typescript and react todo.ts";

type TodoFilter = "all" | "active" | "completed";

const filters: TodoFilter[] = ["all", "active", "completed"];

export default function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<TodoFilter>("all");
  const nextId = useRef(1);

  const visibleTodos = state.todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });
  const activeCount = state.todos.filter((todo) => !todo.completed).length;

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = newTodo.trim();
    if (!text) return;

    dispatch({
      type: "add",
      todo: { id: nextId.current, text, completed: false },
    });
    nextId.current += 1;
    setNewTodo("");
  }

  return (
    <section className="xp-card todo-card" aria-labelledby="todo-title">
      <div className="xp-heading">
        <span className="xp-number">07</span>
        <div>
          <p>DAILY CHALLENGE</p>
          <h2 id="todo-title">My to-do list</h2>
        </div>
      </div>

      <form className="todo-form" onSubmit={addTodo}>
        <label className="visually-hidden" htmlFor="new-todo">
          New task
        </label>
        <input
          id="new-todo"
          value={newTodo}
          onChange={(event) => setNewTodo(event.target.value)}
          placeholder="What needs to get done?"
          maxLength={120}
          required
        />
        <button className="xp-button" type="submit" disabled={!newTodo.trim()}>
          Add task
        </button>
      </form>

      <div className="todo-toolbar" aria-label="Filter tasks">
        <div className="todo-filters">
          {filters.map((option) => (
            <button
              key={option}
              className={`todo-filter${filter === option ? " is-active" : ""}`}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        <button
          className="todo-clear"
          type="button"
          disabled={!state.todos.some((todo) => todo.completed)}
          onClick={() => dispatch({ type: "clearCompleted" })}
        >
          Clear completed
        </button>
      </div>

      {visibleTodos.length === 0 ? (
        <p className="todo-empty" aria-live="polite">
          {state.todos.length === 0
            ? "Your list is empty. Add a task to get started."
            : `No ${filter} tasks.`}
        </p>
      ) : (
        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li className="todo-item" key={todo.id}>
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => dispatch({ type: "toggle", id: todo.id })}
                />
                <span className={todo.completed ? "todo-text is-completed" : "todo-text"}>
                  {todo.text}
                </span>
              </label>
              <button
                className="todo-delete"
                type="button"
                aria-label={`Delete ${todo.text}`}
                onClick={() => dispatch({ type: "delete", id: todo.id })}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="todo-count" aria-live="polite">
        {activeCount} {activeCount === 1 ? "task" : "tasks"} left
      </p>
    </section>
  );
}

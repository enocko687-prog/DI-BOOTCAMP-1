import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, connect } from "react-redux";
import { createStore } from "redux";
import "./styles.css";

const h = React.createElement;

// Actions
const ADD_TODO = "todos/add";
const TOGGLE_TODO = "todos/toggle";
const REMOVE_TODO = "todos/remove";

let nextTodoId = 1;

const addTodo = (text) => ({
  type: ADD_TODO,
  payload: { id: nextTodoId++, text },
});

const toggleTodo = (id) => ({
  type: TOGGLE_TODO,
  payload: { id },
});

const removeTodo = (id) => ({
  type: REMOVE_TODO,
  payload: { id },
});

// Reducer
const initialState = {
  todos: [],
};

function todoReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, { ...action.payload, completed: false }],
      };
    case TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo,
        ),
      };
    case REMOVE_TODO:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
      };
    default:
      return state;
  }
}

// Store
const store = createStore(todoReducer);

// Components
function TodoForm({ addTodo: createTodo }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    createTodo(trimmedText);
    setText("");
  }

  return h(
    "form",
    { className: "todo-form", onSubmit: handleSubmit },
    h("label", { className: "sr-only", htmlFor: "new-todo" }, "New task"),
    h("input", {
      id: "new-todo",
      type: "text",
      value: text,
      onChange: (event) => setText(event.target.value),
      placeholder: "What needs to get done?",
      autoComplete: "off",
    }),
    h("button", { className: "add-button", type: "submit" }, "Add task"),
  );
}

const ConnectedTodoForm = connect(null, { addTodo })(TodoForm);

function TodoItem({ todo, onToggle, onRemove }) {
  return h(
    "li",
    { className: `todo-item${todo.completed ? " is-complete" : ""}` },
    h("label", { className: "todo-label" }, [
      h("input", {
        key: "checkbox",
        type: "checkbox",
        checked: todo.completed,
        onChange: () => onToggle(todo.id),
        "aria-label": `Mark "${todo.text}" ${
          todo.completed ? "incomplete" : "complete"
        }`,
      }),
      h("span", { key: "text" }, todo.text),
    ]),
    h(
      "button",
      {
        className: "remove-button",
        type: "button",
        onClick: () => onRemove(todo.id),
        "aria-label": `Remove "${todo.text}"`,
      },
      "Remove",
    ),
  );
}

function TodoList({ todos, toggleTodo: onToggle, removeTodo: onRemove }) {
  if (todos.length === 0) {
    return h(
      "p",
      { className: "empty-state" },
      "Your list is clear. Add a task to get started.",
    );
  }

  return h(
    "ul",
    { className: "todo-list" },
    todos.map((todo) =>
      h(TodoItem, {
        key: todo.id,
        todo,
        onToggle,
        onRemove,
      }),
    ),
  );
}

const ConnectedTodoList = connect(
  (state) => ({ todos: state.todos }),
  { toggleTodo, removeTodo },
)(TodoList);

function TodoSummary({ total, completed }) {
  const remaining = total - completed;

  return h(
    "p",
    { className: "todo-summary", "aria-live": "polite" },
    `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`,
  );
}

const ConnectedTodoSummary = connect((state) => ({
  total: state.todos.length,
  completed: state.todos.filter((todo) => todo.completed).length,
}))(TodoSummary);

function App() {
  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "A little more focus"),
      h("h1", { id: "page-title" }, "My todo list"),
      h(
        "p",
        { className: "intro" },
        "Write it down, check it off, and keep moving.",
      ),
      h(ConnectedTodoForm),
      h(ConnectedTodoSummary),
      h(ConnectedTodoList),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(App))),
);
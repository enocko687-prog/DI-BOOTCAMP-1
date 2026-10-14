import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import "./styles.css";

const h = React.createElement;

const todoSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare(text) {
        return {
          payload: {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            text: text.trim(),
            completed: false,
          },
        };
      },
    },
    toggleTodo(state, action) {
      const todo = state.find((item) => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    removeTodo(state, action) {
      return state.filter((todo) => todo.id !== action.payload);
    },
  },
});

const { addTodo, toggleTodo, removeTodo } = todoSlice.actions;

const store = configureStore({
  reducer: {
    todos: todoSlice.reducer,
  },
});

function AddTodo() {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const task = text.trim();

    if (!task) {
      setError("Enter a task before adding it.");
      return;
    }

    dispatch(addTodo(task));
    setText("");
    setError("");
  }

  return h(
    "form",
    { className: "todo-form", onSubmit: handleSubmit },
    h("label", { className: "sr-only", htmlFor: "new-todo" }, "New task"),
    h("input", {
      id: "new-todo",
      type: "text",
      value: text,
      onChange: (event) => {
        setText(event.target.value);
        if (error) setError("");
      },
      placeholder: "What needs to get done?",
      maxLength: 160,
      autoComplete: "off",
    }),
    h("button", { className: "add-button", type: "submit" }, "Add task"),
    error ? h("p", { className: "error-message", role: "alert" }, error) : null,
  );
}

function TodoItem({ todo }) {
  const dispatch = useDispatch();

  return h(
    "li",
    { className: `todo-item${todo.completed ? " is-complete" : ""}` },
    h("label", { className: "todo-label" }, [
      h("input", {
        key: "checkbox",
        type: "checkbox",
        checked: todo.completed,
        onChange: () => dispatch(toggleTodo(todo.id)),
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
        onClick: () => dispatch(removeTodo(todo.id)),
        "aria-label": `Remove "${todo.text}"`,
      },
      "Remove",
    ),
  );
}

function TodoList() {
  const todos = useSelector((state) => state.todos);
  const completedCount = todos.filter((todo) => todo.completed).length;

  return h(
    React.Fragment,
    null,
    h(
      "p",
      { className: "todo-summary", "aria-live": "polite" },
      todos.length === 0
        ? "No tasks yet"
        : `${todos.length - completedCount} ${
            todos.length - completedCount === 1 ? "task" : "tasks"
          } remaining`,
    ),
    todos.length === 0
      ? h(
          "p",
          { className: "empty-state" },
          "Your list is clear. Add a task to get started.",
        )
      : h(
          "ul",
          { className: "todo-list" },
          todos.map((todo) => h(TodoItem, { key: todo.id, todo })),
        ),
  );
}

function App() {
  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "React + Redux Toolkit"),
      h("h1", { id: "page-title" }, "My todo list"),
      h(
        "p",
        { className: "intro" },
        "Add a task, check it off when it is done, or remove it from your list.",
      ),
      h(AddTodo),
      h(TodoList),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(App))),
);
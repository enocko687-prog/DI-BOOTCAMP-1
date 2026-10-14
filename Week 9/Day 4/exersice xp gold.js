import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  configureStore,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import "./styles.css";

const h = React.createElement;

const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (_, { rejectWithValue }) => {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=10",
    );

    if (!response.ok) {
      return rejectWithValue(
        `The todo service returned an error (${response.status}).`,
      );
    }

    const todos = await response.json();
    if (!Array.isArray(todos)) {
      return rejectWithValue("The todo service returned invalid data.");
    }

    return todos.map((todo) => ({
      id: `api-${todo.id}`,
      text: todo.title,
      completed: Boolean(todo.completed),
    }));
  },
);

const todoSlice = createSlice({
  name: "todos",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(text) {
        return {
          payload: {
            id: `local-${crypto.randomUUID()}`,
            text: text.trim(),
            completed: false,
          },
        };
      },
    },
    toggleTodo(state, action) {
      const todo = state.items.find((item) => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    removeTodo(state, action) {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },
    setTodos(state, action) {
      state.items = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
    clearTodosError(state) {
      state.error = null;
      if (state.status === "failed") {
        state.status = "idle";
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error.message ||
          "Unable to fetch todos. Check your connection and try again.";
      });
  },
});

const {
  addTodo,
  toggleTodo,
  removeTodo,
  setTodos,
  clearTodosError,
} = todoSlice.actions;

const store = configureStore({
  reducer: {
    todos: todoSlice.reducer,
  },
});

function AddTodo() {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.todos.error);
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) {
      dispatch(clearTodosError());
      return;
    }

    dispatch(addTodo(text));
    setText("");
    dispatch(clearTodosError());
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
      placeholder: "Add your own task...",
      maxLength: 160,
      autoComplete: "off",
    }),
    h("button", { className: "add-button", type: "submit" }, "Add task"),
  );
}

function ToggleTodo({ todo }) {
  const dispatch = useDispatch();

  return h("input", {
    type: "checkbox",
    checked: todo.completed,
    onChange: () => dispatch(toggleTodo(todo.id)),
    "aria-label": `Mark "${todo.text}" ${
      todo.completed ? "incomplete" : "complete"
    }`,
  });
}

function RemoveTodo({ todo }) {
  const dispatch = useDispatch();

  return h(
    "button",
    {
      className: "remove-button",
      type: "button",
      onClick: () => dispatch(removeTodo(todo.id)),
      "aria-label": `Remove "${todo.text}"`,
    },
    "Remove",
  );
}

function TodoList() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.todos);
  const completed = items.filter((todo) => todo.completed).length;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTodos());
    }
  }, [dispatch, status]);

  return h(
    React.Fragment,
    null,
    h("div", { className: "todo-toolbar" }, [
      h(
        "p",
        { className: "todo-summary", "aria-live": "polite", key: "summary" },
        `${items.length - completed} remaining · ${completed} completed`,
      ),
      h(
        "button",
        {
          className: "refresh-button",
          type: "button",
          onClick: () => dispatch(fetchTodos()),
          disabled: status === "loading",
          key: "refresh",
        },
        status === "loading" ? "Fetching..." : "Fetch todos",
      ),
    ]),
    status === "loading" && items.length === 0
      ? h("p", { className: "request-status", role: "status" }, "Loading todos...")
      : null,
    error
      ? h("div", { className: "todo-fetch-error", role: "alert" }, [
          h("p", { key: "message" }, error),
          h(
            "button",
            {
              className: "retry-button",
              type: "button",
              onClick: () => dispatch(fetchTodos()),
              disabled: status === "loading",
              key: "retry",
            },
            "Try again",
          ),
        ])
      : null,
    items.length === 0 && status !== "loading"
      ? h(
          "p",
          { className: "empty-state" },
          "No tasks yet. Fetch the sample todos or add your own.",
        )
      : h(
          "ul",
          { className: "todo-list" },
          items.map((todo) =>
            h(
              "li",
              {
                className: `todo-item${todo.completed ? " is-complete" : ""}`,
                key: todo.id,
              },
              h("label", { className: "todo-label" }, [
                h(ToggleTodo, { todo, key: "toggle" }),
                h("span", { key: "text" }, todo.text),
              ]),
              h(RemoveTodo, { todo, key: "remove" }),
            ),
          ),
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
      h("h1", { id: "page-title" }, "Todo list with Thunks"),
      h(
        "p",
        { className: "intro" },
        "Fetch sample todos from the API or add your own, then complete or remove any task.",
      ),
      h(AddTodo),
      h(TodoList),
      h(
        "p",
        { className: "api-note" },
        "Sample todos are provided by JSONPlaceholder. Fetching replaces the current list with the API response.",
      ),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(App))),
);
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

const addTodo = (categoryId, text) => ({
  type: ADD_TODO,
  payload: {
    categoryId,
    todo: { id: `${categoryId}-${Date.now()}-${Math.random()}`, text },
  },
});

const toggleTodo = (categoryId, todoId) => ({
  type: TOGGLE_TODO,
  payload: { categoryId, todoId },
});

const removeTodo = (categoryId, todoId) => ({
  type: REMOVE_TODO,
  payload: { categoryId, todoId },
});

// Reducer and store
const initialState = {
  categories: [
    { id: "work", name: "Work", todos: [] },
    { id: "personal", name: "Personal", todos: [] },
    { id: "study", name: "Study", todos: [] },
  ],
};

function findCategory(state, categoryId) {
  const category = state.categories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error(`Cannot update todos: category "${categoryId}" does not exist.`);
  }

  return category;
}

function findTodo(category, todoId) {
  const todo = category.todos.find((item) => item.id === todoId);

  if (!todo) {
    throw new Error(
      `Cannot update todos: task "${todoId}" does not exist in ${category.name}.`,
    );
  }

  return todo;
}

function todoReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO: {
      const category = findCategory(state, action.payload.categoryId);

      return {
        ...state,
        categories: state.categories.map((item) =>
          item.id === category.id
            ? {
                ...item,
                todos: [
                  ...item.todos,
                  { ...action.payload.todo, completed: false },
                ],
              }
            : item,
        ),
      };
    }
    case TOGGLE_TODO: {
      const category = findCategory(state, action.payload.categoryId);
      const todo = findTodo(category, action.payload.todoId);

      return {
        ...state,
        categories: state.categories.map((item) =>
          item.id === category.id
            ? {
                ...item,
                todos: item.todos.map((currentTodo) =>
                  currentTodo.id === todo.id
                    ? { ...currentTodo, completed: !currentTodo.completed }
                    : currentTodo,
                ),
              }
            : item,
        ),
      };
    }
    case REMOVE_TODO: {
      const category = findCategory(state, action.payload.categoryId);
      const todo = findTodo(category, action.payload.todoId);

      return {
        ...state,
        categories: state.categories.map((item) =>
          item.id === category.id
            ? {
                ...item,
                todos: item.todos.filter(
                  (currentTodo) => currentTodo.id !== todo.id,
                ),
              }
            : item,
        ),
      };
    }
    default:
      return state;
  }
}

const store = createStore(todoReducer);

// Components
function TodoForm({ categories, addTodo: createTodo, onError }) {
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0].id);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    try {
      createTodo(categoryId, trimmedText);
      setText("");
      onError("");
    } catch (error) {
      onError(error.message);
    }
  }

  return h(
    "form",
    { className: "todo-form category-form", onSubmit: handleSubmit },
    h("label", { className: "sr-only", htmlFor: "new-todo" }, "New task"),
    h("input", {
      id: "new-todo",
      type: "text",
      value: text,
      onChange: (event) => setText(event.target.value),
      placeholder: "What needs to get done?",
      autoComplete: "off",
    }),
    h(
      "label",
      { className: "sr-only", htmlFor: "todo-category" },
      "Choose a category",
    ),
    h(
      "select",
      {
        id: "todo-category",
        className: "category-select",
        value: categoryId,
        onChange: (event) => setCategoryId(event.target.value),
      },
      categories.map((category) =>
        h("option", { key: category.id, value: category.id }, category.name),
      ),
    ),
    h("button", { className: "add-button", type: "submit" }, "Add task"),
  );
}

const ConnectedTodoForm = connect(
  (state) => ({ categories: state.categories }),
  { addTodo },
)(TodoForm);

function CategorySection({
  category,
  toggleTodo: onToggle,
  removeTodo: onRemove,
  onError,
}) {
  return h(
    "section",
    { className: "category-section", "aria-labelledby": `${category.id}-title` },
    h("div", { className: "category-heading" }, [
      h(
        "h2",
        { id: `${category.id}-title`, key: "title" },
        category.name,
      ),
      h(
        "span",
        { className: "category-count", key: "count" },
        `${category.todos.length} ${
          category.todos.length === 1 ? "task" : "tasks"
        }`,
      ),
    ]),
    category.todos.length === 0
      ? h("p", { className: "category-empty", key: "empty" }, "No tasks yet.")
      : h(
          "ul",
          { className: "todo-list", key: "todos" },
          category.todos.map((todo) =>
            h(
              "li",
              {
                className: `todo-item${todo.completed ? " is-complete" : ""}`,
                key: todo.id,
              },
              h("label", { className: "todo-label" }, [
                h("input", {
                  key: "checkbox",
                  type: "checkbox",
                  checked: todo.completed,
                  onChange: () => {
                    try {
                      onToggle(category.id, todo.id);
                      onError("");
                    } catch (error) {
                      onError(error.message);
                    }
                  },
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
                  onClick: () => {
                    try {
                      onRemove(category.id, todo.id);
                      onError("");
                    } catch (error) {
                      onError(error.message);
                    }
                  },
                  "aria-label": `Remove "${todo.text}" from ${category.name}`,
                },
                "Remove",
              ),
            ),
          ),
        ),
  );
}

function CategoryList({
  categories,
  toggleTodo: onToggle,
  removeTodo: onRemove,
  onError,
}) {
  const total = categories.reduce(
    (count, category) => count + category.todos.length,
    0,
  );
  const remaining = categories.reduce(
    (count, category) =>
      count + category.todos.filter((todo) => !todo.completed).length,
    0,
  );

  return h(
    React.Fragment,
    null,
    h(
      "p",
      { className: "todo-summary", "aria-live": "polite" },
      `${remaining} of ${total} ${
        total === 1 ? "task" : "tasks"
      } remaining`,
    ),
    h(
      "div",
      { className: "categories" },
      categories.map((category) =>
        h(CategorySection, {
          key: category.id,
          category,
          toggleTodo: onToggle,
          removeTodo: onRemove,
          onError,
        }),
      ),
    ),
  );
}

const ConnectedCategoryList = connect(
  (state) => ({ categories: state.categories }),
  { toggleTodo, removeTodo },
)(CategoryList);

function App() {
  const [error, setError] = useState("");

  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card category-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "Make room for what matters"),
      h("h1", { id: "page-title" }, "Tasks by category"),
      h(
        "p",
        { className: "intro" },
        "Keep work, personal plans, and study tasks in their own place.",
      ),
      h(ConnectedTodoForm, { onError: setError }),
      error
        ? h("p", { className: "error-message", role: "alert" }, error)
        : null,
      h(ConnectedCategoryList, { onError: setError }),
    ),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(App))),
);
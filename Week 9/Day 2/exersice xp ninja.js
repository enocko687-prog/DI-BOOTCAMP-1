import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, connect } from "react-redux";
import { createStore } from "redux";
import "./styles.css";

const h = React.createElement;

const USERS_KEY = "redux-todo-demo-users";
const SESSION_KEY = "redux-todo-demo-session";
const TODOS_KEY = "redux-todo-demo-todos";

const AUTH_REGISTER_SUCCESS = "auth/registerSuccess";
const AUTH_LOGIN_SUCCESS = "auth/loginSuccess";
const AUTH_LOGOUT = "auth/logout";
const AUTH_ERROR = "auth/error";
const CLEAR_AUTH_MESSAGE = "auth/clearMessage";
const ADD_TODO = "todos/add";
const TOGGLE_TODO = "todos/toggle";
const REMOVE_TODO = "todos/remove";

function createEmptyCategories() {
  return [
    { id: "work", name: "Work", todos: [] },
    { id: "personal", name: "Personal", todos: [] },
    { id: "study", name: "Study", todos: [] },
  ];
}

function readStorage(key, fallback) {
  const value = localStorage.getItem(key);
  return value === null ? fallback : JSON.parse(value);
}

function readUsers() {
  const users = readStorage(USERS_KEY, []);

  if (!Array.isArray(users)) {
    throw new Error("Saved account data is invalid. Clear this app's local storage and register again.");
  }

  return users;
}

function getSavedTodos(userId) {
  const todosByUser = readStorage(TODOS_KEY, {});
  const savedCategories = todosByUser[userId];

  if (!Array.isArray(savedCategories)) {
    return createEmptyCategories();
  }

  const defaults = createEmptyCategories();
  return defaults.map((category) => {
    const savedCategory = savedCategories.find(
      (item) => item.id === category.id,
    );

    return savedCategory && Array.isArray(savedCategory.todos)
      ? { ...category, todos: savedCategory.todos }
      : category;
  });
}

function saveUserTodos(userId, categories) {
  const todosByUser = readStorage(TODOS_KEY, {});
  todosByUser[userId] = categories;
  localStorage.setItem(TODOS_KEY, JSON.stringify(todosByUser));
}

function createPasswordHash(password, salt) {
  const encoder = new TextEncoder();

  return crypto.subtle
    .importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"])
    .then((key) =>
      crypto.subtle.deriveBits(
        { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
        key,
        256,
      ),
    )
    .then((bits) =>
      Array.from(new Uint8Array(bits), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join(""),
    );
}

function encodeBytes(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function decodeBytes(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
}

function createToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return encodeBytes(bytes);
}

function saveSession(user, token) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ userId: user.id, token }),
  );
}

function restoreSession() {
  const session = readStorage(SESSION_KEY, null);

  if (!session || typeof session.userId !== "string" || !session.token) {
    return { user: null, token: null, categories: createEmptyCategories() };
  }

  const user = readUsers().find((item) => item.id === session.userId);

  if (!user) {
    localStorage.removeItem(SESSION_KEY);
    return { user: null, token: null, categories: createEmptyCategories() };
  }

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token: session.token,
    categories: getSavedTodos(user.id),
  };
}

async function registerUser({ name, email, password }) {
  const users = readUsers();

  if (users.some((user) => user.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const user = {
    id: email,
    name,
    email,
    salt: encodeBytes(salt),
    passwordHash: await createPasswordHash(password, salt),
  };

  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const token = createToken();
  saveSession(user, token);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
    categories: createEmptyCategories(),
  };
}

async function loginUser({ email, password }) {
  const user = readUsers().find((item) => item.email === email);

  if (!user) {
    throw new Error("Email or password is incorrect.");
  }

  const passwordHash = await createPasswordHash(
    password,
    decodeBytes(user.salt),
  );

  if (passwordHash !== user.passwordHash) {
    throw new Error("Email or password is incorrect.");
  }

  const token = createToken();
  saveSession(user, token);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
    categories: getSavedTodos(user.id),
  };
}

const initialAuth = (() => {
  try {
    return { ...restoreSession(), error: "", notice: "" };
  } catch (error) {
    return {
      user: null,
      token: null,
      categories: createEmptyCategories(),
      error: error.message,
      notice: "",
    };
  }
})();

const initialState = {
  ...initialAuth,
  error: initialAuth.error,
  notice: "",
};

const registerSucceeded = (payload) => ({
  type: AUTH_REGISTER_SUCCESS,
  payload,
});

const loginSucceeded = (payload) => ({
  type: AUTH_LOGIN_SUCCESS,
  payload,
});

const logoutSucceeded = () => ({ type: AUTH_LOGOUT });
const setAuthError = (message) => ({ type: AUTH_ERROR, payload: message });
const clearAuthMessage = () => ({ type: CLEAR_AUTH_MESSAGE });

const addTodo = (categoryId, text) => ({
  type: ADD_TODO,
  payload: {
    categoryId,
    todo: {
      id: crypto.randomUUID(),
      text,
      completed: false,
    },
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

function todoReducer(state = initialState, action) {
  switch (action.type) {
    case AUTH_REGISTER_SUCCESS:
    case AUTH_LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        categories: action.payload.categories,
        error: "",
        notice:
          action.type === AUTH_REGISTER_SUCCESS
            ? "Your account is ready. You are now signed in."
            : `Welcome back, ${action.payload.user.name}.`,
      };
    case AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        categories: createEmptyCategories(),
        error: "",
        notice: "You have been signed out.",
      };
    case AUTH_ERROR:
      return { ...state, error: action.payload, notice: "" };
    case CLEAR_AUTH_MESSAGE:
      return { ...state, error: "", notice: "" };
    case ADD_TODO: {
      if (!state.user) {
        return { ...state, error: "Sign in to manage your tasks." };
      }

      const category = state.categories.find(
        (item) => item.id === action.payload.categoryId,
      );

      if (!category) {
        return { ...state, error: "Choose a valid category for this task." };
      }

      return {
        ...state,
        error: "",
        categories: state.categories.map((item) =>
          item.id === category.id
            ? { ...item, todos: [...item.todos, action.payload.todo] }
            : item,
        ),
      };
    }
    case TOGGLE_TODO:
    case REMOVE_TODO: {
      if (!state.user) {
        return { ...state, error: "Sign in to manage your tasks." };
      }

      const category = state.categories.find(
        (item) => item.id === action.payload.categoryId,
      );

      if (!category) {
        return { ...state, error: "That category does not exist." };
      }

      const todo = category.todos.find(
        (item) => item.id === action.payload.todoId,
      );

      if (!todo) {
        return { ...state, error: "That task does not exist in this category." };
      }

      return {
        ...state,
        error: "",
        categories: state.categories.map((item) => {
          if (item.id !== category.id) {
            return item;
          }

          return {
            ...item,
            todos:
              action.type === TOGGLE_TODO
                ? item.todos.map((currentTodo) =>
                    currentTodo.id === todo.id
                      ? { ...currentTodo, completed: !currentTodo.completed }
                      : currentTodo,
                  )
                : item.todos.filter((currentTodo) => currentTodo.id !== todo.id),
          };
        }),
      };
    }
    default:
      return state;
  }
}

const store = createStore(todoReducer);

function AuthForm({
  error,
  notice,
  registerSucceeded: onRegister,
  loginSucceeded: onLogin,
  setAuthError: onError,
  clearAuthMessage: clearMessage,
}) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegistering = mode === "register";

  function switchMode(nextMode) {
    setMode(nextMode);
    setName("");
    setEmail("");
    setPassword("");
    clearMessage();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      onError("Enter a valid email address.");
      return;
    }

    if (isRegistering && name.trim().length < 2) {
      onError("Enter your name (at least 2 characters).");
      return;
    }

    if (
      isRegistering &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
    ) {
      onError(
        "Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.",
      );
      return;
    }

    if (!password) {
      onError("Enter your password.");
      return;
    }

    try {
      const credentials = { email: normalizedEmail, password };
      const session = isRegistering
        ? await registerUser({ ...credentials, name: name.trim() })
        : await loginUser(credentials);

      if (isRegistering) {
        onRegister(session);
      } else {
        onLogin(session);
      }
      setPassword("");
    } catch (authError) {
      onError(authError.message || "Authentication failed. Please try again.");
    }
  }

  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card auth-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "Your plans, in one place"),
      h(
        "h1",
        { id: "page-title" },
        isRegistering ? "Create your account" : "Welcome back",
      ),
      h(
        "p",
        { className: "intro" },
        isRegistering
          ? "Register to organize your tasks by category."
          : "Sign in to see and manage your categorized tasks.",
      ),
      h(
        "form",
        { className: "auth-form", onSubmit: handleSubmit },
        isRegistering
          ? h(
              "label",
              { className: "auth-field" },
              "Name",
              h("input", {
                type: "text",
                value: name,
                onChange: (event) => setName(event.target.value),
                autoComplete: "name",
                required: true,
              }),
            )
          : null,
        h(
          "label",
          { className: "auth-field" },
          "Email",
          h("input", {
            type: "email",
            value: email,
            onChange: (event) => setEmail(event.target.value),
            autoComplete: "email",
            required: true,
          }),
        ),
        h(
          "label",
          { className: "auth-field" },
          "Password",
          h("input", {
            type: "password",
            value: password,
            onChange: (event) => setPassword(event.target.value),
            autoComplete: isRegistering ? "new-password" : "current-password",
            required: true,
          }),
        ),
        h(
          "button",
          { className: "add-button auth-submit", type: "submit" },
          isRegistering ? "Create account" : "Sign in",
        ),
      ),
      error
        ? h("p", { className: "error-message", role: "alert" }, error)
        : null,
      notice ? h("p", { className: "auth-notice", role: "status" }, notice) : null,
      h(
        "p",
        { className: "auth-switch" },
        isRegistering ? "Already have an account? " : "New here? ",
        h(
          "button",
          {
            className: "text-button",
            type: "button",
            onClick: () =>
              switchMode(isRegistering ? "login" : "register"),
          },
          isRegistering ? "Sign in" : "Create an account",
        ),
      ),
      h(
        "p",
        { className: "auth-demo-note" },
        "Demo app: accounts and tasks are stored in this browser only. This mock authentication is for learning, not production security.",
      ),
    ),
  );
}

const ConnectedAuthForm = connect(
  (state) => ({
    error: state.error,
    notice: state.notice,
  }),
  {
    registerSucceeded,
    loginSucceeded,
    setAuthError,
    clearAuthMessage,
  },
)(AuthForm);

function TodoForm({ categories, onAdd, onError }) {
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0].id);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    onAdd(categoryId, trimmedText);
    if (!store.getState().error) {
      setText("");
    } else {
      onError(store.getState().error);
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

function CategorySection({ category, onToggle, onRemove, onError }) {
  return h(
    "section",
    { className: "category-section", "aria-labelledby": `${category.id}-title` },
    h("div", { className: "category-heading" }, [
      h("h2", { id: `${category.id}-title`, key: "title" }, category.name),
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
                  onChange: () => onToggle(category.id, todo.id),
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
                  onClick: () => onRemove(category.id, todo.id),
                  "aria-label": `Remove "${todo.text}" from ${category.name}`,
                },
                "Remove",
              ),
            ),
          ),
        ),
  );
}

function TodoDashboard({
  user,
  token,
  categories,
  error,
  logoutSucceeded: onLogout,
  setAuthError: onError,
  addTodo: add,
  toggleTodo: toggle,
  removeTodo: remove,
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

  function updateTodos(action, ...args) {
    action(...args);
    const state = store.getState();

    if (state.user && state.token === token) {
      try {
        saveUserTodos(state.user.id, state.categories);
      } catch (storageError) {
        onError(`Could not save tasks in this browser: ${storageError.message}`);
      }
    }
  }

  function handleLogout() {
    try {
      localStorage.removeItem(SESSION_KEY);
      onLogout();
    } catch (storageError) {
      onError(`Could not sign out: ${storageError.message}`);
    }
  }

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
      h("div", { className: "account-bar" }, [
        h(
          "span",
          { className: "account-email", key: "account" },
          `Signed in as ${user.name} (${user.email})`,
        ),
        h(
          "button",
          {
            className: "logout-button",
            type: "button",
            onClick: handleLogout,
            key: "logout",
          },
          "Sign out",
        ),
      ]),
      h(TodoForm, {
        categories,
        onAdd: (categoryId, text) =>
          updateTodos(add, categoryId, text),
        onError,
      }),
      error
        ? h("p", { className: "error-message", role: "alert" }, error)
        : null,
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
            onToggle: (categoryId, todoId) =>
              updateTodos(toggle, categoryId, todoId),
            onRemove: (categoryId, todoId) =>
              updateTodos(remove, categoryId, todoId),
            onError,
          }),
        ),
      ),
    ),
  );
}

const ConnectedTodoDashboard = connect(
  (state) => ({
    user: state.user,
    token: state.token,
    categories: state.categories,
    error: state.error,
  }),
  (dispatch) => ({
    logoutSucceeded: () => dispatch(logoutSucceeded()),
    setAuthError: (message) => dispatch(setAuthError(message)),
    addTodo: (categoryId, text) => dispatch(addTodo(categoryId, text)),
    toggleTodo: (categoryId, todoId) =>
      dispatch(toggleTodo(categoryId, todoId)),
    removeTodo: (categoryId, todoId) =>
      dispatch(removeTodo(categoryId, todoId)),
  }),
)(TodoDashboard);

function App({ user, token }) {
  return user && token ? h(ConnectedTodoDashboard) : h(ConnectedAuthForm);
}

const ConnectedApp = connect((state) => ({
  user: state.user,
  token: state.token,
}))(App);

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(ConnectedApp))),
);
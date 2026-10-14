import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import "./styles.css";

const h = React.createElement;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    user: null,
    error: "",
  },
  reducers: {
    loginUser(state) {
      state.isAuthenticated = true;
      state.error = "";
    },
    logoutUser(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = "";
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setLoginError(state, action) {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

const { loginUser, logoutUser, setUser, setLoginError } = authSlice.actions;

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

function Login() {
  const dispatch = useDispatch();
  const error = useSelector((state) => state.auth.error);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      dispatch(setLoginError("Enter a valid email address."));
      return;
    }

    if (password.trim().length < 4) {
      dispatch(setLoginError("Password must contain at least 4 characters."));
      return;
    }

    dispatch(
      setUser({
        name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
      }),
    );
    dispatch(loginUser());
    setPassword("");
  }

  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card auth-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "React + Redux Toolkit"),
      h("h1", { id: "page-title" }, "Sign in"),
      h(
        "p",
        { className: "intro" },
        "Use any valid email and a password of at least 4 characters to try the authentication flow.",
      ),
      h(
        "form",
        { className: "auth-form", onSubmit: handleSubmit },
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
            autoComplete: "current-password",
            required: true,
          }),
        ),
        h("button", { className: "add-button auth-submit", type: "submit" }, "Sign in"),
      ),
      error ? h("p", { className: "error-message", role: "alert" }, error) : null,
      h(
        "p",
        { className: "auth-demo-note" },
        "This is a Redux Toolkit learning demo. It simulates login in the browser and does not verify credentials with a server.",
      ),
    ),
  );
}

function Logout() {
  const dispatch = useDispatch();

  return h(
    "button",
    {
      className: "logout-button",
      type: "button",
      onClick: () => dispatch(logoutUser()),
    },
    "Sign out",
  );
}

function AuthenticatedContent() {
  const user = useSelector((state) => state.auth.user);

  return h(
    "main",
    { className: "app-shell" },
    h(
      "section",
      { className: "todo-card auth-card", "aria-labelledby": "page-title" },
      h("p", { className: "eyebrow" }, "Authentication successful"),
      h("h1", { id: "page-title" }, `Hello, ${user.name}`),
      h(
        "p",
        { className: "intro" },
        "This content is shown only while Redux reports an authenticated user.",
      ),
      h("div", { className: "account-bar" }, [
        h("span", { className: "account-email", key: "email" }, user.email),
        h(Logout, { key: "logout" }),
      ]),
      h(
        "p",
        { className: "auth-notice", role: "status" },
        "Your user information is stored in the Redux authentication slice.",
      ),
    ),
  );
}

function AuthGate() {
  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated,
  );

  return isAuthenticated
    ? h(AuthenticatedContent)
    : h(Login);
}

function App() {
  return h(Provider, { store }, h(AuthGate));
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(App)),
);
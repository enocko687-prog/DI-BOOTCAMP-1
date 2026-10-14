import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import TodoList from "./src/components/TodoList.js";
import { store } from "./src/store.js";

createRoot(document.getElementById("root")).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(Provider, { store }, React.createElement(TodoList)),
  ),
);
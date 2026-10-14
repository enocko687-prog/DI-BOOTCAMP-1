import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import ProductList from "./src/components/ProductList.js";
import { store } from "./src/store.js";

createRoot(document.getElementById("root")).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(Provider, { store }, React.createElement(ProductList)),
  ),
);

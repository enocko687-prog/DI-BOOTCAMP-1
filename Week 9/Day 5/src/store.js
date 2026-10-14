import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./features/products/productsSlice.js";
import todosReducer from "./features/todos/todosSlice.js";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    todos: todosReducer,
  },
});

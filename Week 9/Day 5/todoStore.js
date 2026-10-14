import { configureStore, createSelector, createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [
    { id: "todo-1", text: "Plan the week", completed: true },
    { id: "todo-2", text: "Finish the Redux exercise", completed: false },
    { id: "todo-3", text: "Take a short break", completed: false },
  ],
  visibilityFilter: "All",
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(text) {
        return {
          payload: {
            id: nanoid(),
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
    setVisibilityFilter(state, action) {
      if (["All", "Active", "Completed"].includes(action.payload)) {
        state.visibilityFilter = action.payload;
      }
    },
  },
});

export const store = configureStore({
  reducer: {
    todos: todoSlice.reducer,
  },
});

export const { addTodo, toggleTodo, removeTodo, setVisibilityFilter } = todoSlice.actions;

const selectAllTodos = (state) => state.todos.items;
export const selectVisibilityFilter = (state) => state.todos.visibilityFilter;

export const selectTodos = createSelector(
  [selectAllTodos, selectVisibilityFilter],
  (todos, visibilityFilter) => {
    if (visibilityFilter === "Active") {
      return todos.filter((todo) => !todo.completed);
    }
    if (visibilityFilter === "Completed") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  },
);

export const selectFilteredTodosCount = createSelector(
  [selectTodos],
  (todos) => todos.length,
);
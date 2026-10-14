import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [
    { id: "todo-1", title: "Plan the week", completed: true },
    { id: "todo-2", title: "Finish the Redux exercise", completed: false },
    { id: "todo-3", title: "Take a short break", completed: false },
  ],
  visibilityFilter: "All",
};

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(title) {
        return {
          payload: {
            id: nanoid(),
            title: title.trim(),
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

export const { addTodo, toggleTodo, removeTodo, setVisibilityFilter } =
  todosSlice.actions;
export default todosSlice.reducer;

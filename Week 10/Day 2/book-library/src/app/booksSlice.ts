import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Book } from "../model/Book";

export type BookFilter = "all" | "read" | "unread";
export type BookSort = "title" | "author" | "addedAt";

export interface BooksState {
  books: Book[];
  categories: string[];
  filter: BookFilter;
  selectedCategory: string;
  sortBy: BookSort;
  sortDirection: "asc" | "desc";
  persistenceError: string | null;
}

export const initialBooksState: BooksState = {
  books: [],
  categories: ["General"],
  filter: "all",
  selectedCategory: "all",
  sortBy: "addedAt",
  sortDirection: "desc",
  persistenceError: null,
};

const booksSlice = createSlice({
  name: "books",
  initialState: initialBooksState,
  reducers: {
    addBook(state, action: PayloadAction<Book>) {
      if (state.books.some((book) => book.id === action.payload.id)) return;
      if (!state.categories.includes(action.payload.category)) {
        state.categories.push(action.payload.category);
      }
      state.books.push(action.payload);
    },
    removeBook(state, action: PayloadAction<string>) {
      state.books = state.books.filter((book) => book.id !== action.payload);
    },
    toggleReadStatus(state, action: PayloadAction<string>) {
      const book = state.books.find((item) => item.id === action.payload);
      if (book) {
        book.isRead = !book.isRead;
        book.progress = book.isRead ? 100 : 0;
      }
    },
    setProgress(state, action: PayloadAction<{ id: string; progress: number }>) {
      const book = state.books.find((item) => item.id === action.payload.id);
      if (book) {
        book.progress = Math.max(0, Math.min(100, action.payload.progress));
        book.isRead = book.progress === 100;
      }
    },
    setFilter(state, action: PayloadAction<BookFilter>) {
      state.filter = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setSort(state, action: PayloadAction<BookSort>) {
      if (state.sortBy === action.payload) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.sortBy = action.payload;
        state.sortDirection = "asc";
      }
    },
    addCategory(state, action: PayloadAction<string>) {
      const name = action.payload.trim();
      if (name && !state.categories.some((category) => category.toLowerCase() === name.toLowerCase())) {
        state.categories.push(name);
      }
    },
    renameCategory(state, action: PayloadAction<{ oldName: string; newName: string }>) {
      const name = action.payload.newName.trim();
      if (
        !name ||
        action.payload.oldName === "General" ||
        state.categories.some(
          (category) =>
            category !== action.payload.oldName &&
            category.toLowerCase() === name.toLowerCase(),
        )
      ) {
        return;
      }
      state.categories = state.categories.map((category) =>
        category === action.payload.oldName ? name : category,
      );
      state.books.forEach((book) => {
        if (book.category === action.payload.oldName) book.category = name;
      });
      if (state.selectedCategory === action.payload.oldName) state.selectedCategory = name;
    },
    deleteCategory(state, action: PayloadAction<string>) {
      if (action.payload === "General") return;
      state.categories = state.categories.filter((category) => category !== action.payload);
      state.books.forEach((book) => {
        if (book.category === action.payload) book.category = "General";
      });
      if (state.selectedCategory === action.payload) state.selectedCategory = "all";
    },
    importBooks(
      state,
      action: PayloadAction<{ books: Book[]; categories: string[] }>,
    ) {
      const imported = action.payload.books;
      const ids = new Set(state.books.map((book) => book.id));
      for (const book of imported) {
        if (!ids.has(book.id)) {
          state.books.push(book);
          ids.add(book.id);
        }
        if (!state.categories.includes(book.category)) state.categories.push(book.category);
      }
      for (const category of action.payload.categories) {
        if (
          category.trim() &&
          !state.categories.some((existing) => existing.toLowerCase() === category.toLowerCase())
        ) {
          state.categories.push(category.trim());
        }
      }
    },
    clearBooks(state) {
      state.books = [];
    },
    setPersistenceError(state, action: PayloadAction<string | null>) {
      state.persistenceError = action.payload;
    },
  },
});

export const {
  addBook,
  removeBook,
  toggleReadStatus,
  setProgress,
  setFilter,
  setSelectedCategory,
  setSort,
  addCategory,
  renameCategory,
  deleteCategory,
  importBooks,
  clearBooks,
  setPersistenceError,
} = booksSlice.actions;

export default booksSlice.reducer;

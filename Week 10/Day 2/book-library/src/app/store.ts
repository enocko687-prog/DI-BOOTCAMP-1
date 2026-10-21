import { configureStore } from "@reduxjs/toolkit";
import { BookItem } from "../model/Book";
import booksReducer, {
  initialBooksState,
  setPersistenceError,
  type BooksState,
} from "./booksSlice";

const STORAGE_KEY = "personal-book-library";

function loadState(): BooksState {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialBooksState;
    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Saved library must be an object.");
    }
    const data = parsed as Record<string, unknown>;
    if (!Array.isArray(data.books) || !Array.isArray(data.categories)) {
      throw new Error("Saved library is missing its books or categories.");
    }
    const books = data.books.map((book) => BookItem.fromJSON(book).serialize());
    const categories = data.categories.filter(
      (category): category is string => typeof category === "string" && !!category.trim(),
    );
    const uniqueCategories = [...new Set(["General", ...categories])];
    for (const book of books) {
      if (!uniqueCategories.includes(book.category)) uniqueCategories.push(book.category);
    }
    return { ...initialBooksState, books, categories: uniqueCategories };
  } catch (error) {
    return {
      ...initialBooksState,
      persistenceError:
        error instanceof Error
          ? `Could not load saved books: ${error.message}`
          : "Could not load saved books from this browser.",
    };
  }
}

export const store = configureStore({
  reducer: { books: booksReducer },
  preloadedState: { books: loadState() },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

let handlingPersistenceError = false;
store.subscribe(() => {
  if (handlingPersistenceError) return;
  const booksState = store.getState().books;
  const persistedData = {
    books: booksState.books,
    categories: booksState.categories,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
    if (booksState.persistenceError?.startsWith("Could not save")) {
      handlingPersistenceError = true;
      store.dispatch(setPersistenceError(null));
      handlingPersistenceError = false;
    }
  } catch {
    handlingPersistenceError = true;
    store.dispatch(
      setPersistenceError("Could not save changes to this browser's local storage."),
    );
    handlingPersistenceError = false;
  }
});

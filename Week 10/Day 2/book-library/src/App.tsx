import { useRef, useState, type ChangeEvent } from "react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { useAppSelector } from "./app/hooks";
import { importBooks, setPersistenceError } from "./app/booksSlice";
import { BookItem } from "./model/Book";
import BookInput from "./components/BookInput";
import BookList from "./components/BookList";
import CategoryManager from "./components/CategoryManager";
import "./app.css";

function LibraryApp() {
  const { books, persistenceError } = useAppSelector((state) => state.books);
  const fileInput = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState("");

  const readBooks = books.filter((book) => book.isRead).length;
  const averageProgress = books.length
    ? Math.round(books.reduce((total, book) => total + book.progress, 0) / books.length)
    : 0;

  function exportLibrary() {
    const payload = JSON.stringify({ books, categories: store.getState().books.categories }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-book-library.json";
    link.click();
    URL.revokeObjectURL(url);
    setImportMessage("Library exported.");
  }

  async function importLibrary(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (typeof parsed !== "object" || parsed === null || !("books" in parsed)) {
        throw new Error("The selected file is not a valid book library.");
      }
      const payload = parsed as { books: unknown; categories?: unknown };
      if (!Array.isArray(payload.books)) {
        throw new Error("The selected file does not contain a book list.");
      }
      const validBooks = payload.books.map((book) => BookItem.fromJSON(book).serialize());
      const categories =
        Array.isArray(payload.categories) &&
        payload.categories.every((category) => typeof category === "string")
          ? payload.categories
          : [];
      store.dispatch(importBooks({ books: validBooks, categories }));
      setImportMessage(`${validBooks.length} book${validBooks.length === 1 ? "" : "s"} imported.`);
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : "Could not import this library file.",
      );
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">YOUR PERSONAL READING SPACE</p>
          <h1>Book Library</h1>
          <p>Keep track of what you own, what you have read, and what is next.</p>
        </div>
        <div className="hero-actions">
          <button className="button button-secondary" type="button" onClick={exportLibrary}>
            Export library
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => fileInput.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={importLibrary}
            aria-label="Import library JSON"
          />
        </div>
      </header>

      <section className="stats-grid" aria-label="Reading statistics">
        <article className="stat-card">
          <span className="stat-label">BOOKS IN LIBRARY</span>
          <strong>{books.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">FINISHED</span>
          <strong>{readBooks}<small> / {books.length}</small></strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">AVERAGE PROGRESS</span>
          <strong>{averageProgress}<small>%</small></strong>
        </article>
      </section>

      <div className="main-grid">
        <aside className="sidebar">
          <section className="panel" aria-labelledby="add-book-title">
            <p className="eyebrow">GROW YOUR SHELF</p>
            <h2 id="add-book-title">Add a book</h2>
            <BookInput />
          </section>
          <CategoryManager />
        </aside>
        <BookList />
      </div>

      {(persistenceError || importMessage) && (
        <p
          className={persistenceError ? "app-notice is-error" : "app-notice"}
          role="status"
          aria-live="polite"
        >
          {persistenceError ?? importMessage}
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => {
              setImportMessage("");
              store.dispatch(setPersistenceError(null));
            }}
          >
            Dismiss
          </button>
        </p>
      )}
      <footer className="app-footer">Your reading list is saved in this browser.</footer>
    </main>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <LibraryApp />
    </Provider>
  );
}

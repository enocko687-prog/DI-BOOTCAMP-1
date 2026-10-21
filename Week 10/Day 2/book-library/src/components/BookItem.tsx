import type { Book } from "../model/Book";
import { useBooks } from "../hooks/useBooks";

export default function BookItemCard({ book }: { book: Book }) {
  const { removeBook, toggleReadStatus, setProgress } = useBooks();

  return (
    <article className="book-card">
      <div className="book-card-top">
        <span className="category-pill">{book.category}</span>
        <button
          className="icon-button delete-button"
          type="button"
          aria-label={`Delete ${book.title}`}
          onClick={() => removeBook(book.id)}
        >
          Delete
        </button>
      </div>
      <h3>{book.title}</h3>
      <p className="book-author">by {book.author}</p>
      <div className="progress-heading">
        <span>Reading progress</span>
        <span>{book.progress}%</span>
      </div>
      <input
        className="progress-range"
        type="range"
        min="0"
        max="100"
        step="5"
        value={book.progress}
        aria-label={`${book.title} reading progress`}
        onChange={(event) => setProgress(book.id, Number(event.target.value))}
      />
      <div className="book-card-bottom">
        <span className={book.isRead ? "read-status is-read" : "read-status"}>
          {book.isRead ? "Finished" : "In progress"}
        </span>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => toggleReadStatus(book.id)}
        >
          {book.isRead ? "Mark unread" : "Mark read"}
        </button>
      </div>
    </article>
  );
}

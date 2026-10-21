import { useState } from "react";
import type { FormEvent, Key, ReactNode } from "react";

export type Book = {
  id: number;
  title: string;
  author: string;
};

type ListProps<T> = {
  items: T[];
  getKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
};

function List<T>({ items, getKey, renderItem }: ListProps<T>) {
  if (items.length === 0) {
    return <p className="xp-status">No books yet. Add one above.</p>;
  }

  return (
    <ul className="xp-contact-list">
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

const startingBooks: Book[] = [
  { id: 1, title: "The Hobbit", author: "J. R. R. Tolkien" },
  { id: 2, title: "Pride and Prejudice", author: "Jane Austen" },
  { id: 3, title: "Things Fall Apart", author: "Chinua Achebe" },
];

export default function BookApp() {
  const [books, setBooks] = useState<Book[]>(startingBooks);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  function addBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newTitle = title.trim();
    const newAuthor = author.trim();
    if (!newTitle || !newAuthor) return;

    setBooks((currentBooks) => [
      ...currentBooks,
      {
        id: currentBooks.reduce((largestId, book) => Math.max(largestId, book.id), 0) + 1,
        title: newTitle,
        author: newAuthor,
      },
    ]);
    setTitle("");
    setAuthor("");
  }

  return (
    <section className="xp-card" aria-labelledby="book-list-title">
      <div className="xp-heading">
        <span className="xp-number">06</span>
        <div>
          <p>GENERICS + STATE</p>
          <h2 id="book-list-title">Book list</h2>
        </div>
      </div>
      <form className="xp-form" onSubmit={addBook}>
        <label className="xp-field">
          Book title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter a book title"
            required
          />
        </label>
        <label className="xp-field">
          Author
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Enter the author's name"
            required
          />
        </label>
        <button className="xp-button" type="submit">Add book</button>
      </form>
      <List<Book>
        items={books}
        getKey={(book) => book.id}
        renderItem={(book) => (
          <span>
            <strong>{book.title}</strong>
            <small>by {book.author}</small>
          </span>
        )}
      />
      <p className="xp-status" aria-live="polite">
        {books.length} {books.length === 1 ? "book" : "books"} in your list
      </p>
    </section>
  );
}

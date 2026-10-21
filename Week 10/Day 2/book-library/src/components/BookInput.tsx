import { useState, type FormEvent } from "react";
import { useAppSelector } from "../app/hooks";
import { useBooks } from "../hooks/useBooks";

export default function BookInput() {
  const categories = useAppSelector((state) => state.books.categories);
  const { addBook } = useBooks();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("General");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      addBook({ title, author, category });
      setTitle("");
      setAuthor("");
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add this book.");
    }
  }

  return (
    <form className="book-form" onSubmit={submit}>
      <label>
        Book title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="e.g. The Hobbit"
          required
        />
      </label>
      <label>
        Author
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          maxLength={100}
          placeholder="e.g. J. R. R. Tolkien"
          required
        />
      </label>
      <label>
        Category
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <button className="button button-primary" type="submit">Add book</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}

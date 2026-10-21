import { useState, type FormEvent, type ReactNode } from "react";
import type { FetchStatus } from "../types/types";

export interface DataFetcherProps<T> {
  items: T[];
  status: FetchStatus;
  error: string | null;
  onFetch: (query: string) => void;
  renderItem: (item: T) => ReactNode;
  emptyMessage?: string;
}

export default function DataFetcher<T>({
  items,
  status,
  error,
  onFetch,
  renderItem,
  emptyMessage = "No results found. Try another search.",
}: DataFetcherProps<T>) {
  const [query, setQuery] = useState("chicken");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onFetch(query.trim());
  }

  return (
    <section className="fetcher" aria-label="Recipe search">
      <form className="search-form" onSubmit={submit}>
        <label className="search-input">
          <span className="visually-hidden">Recipe or ingredient</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search recipes or ingredients..."
            required
          />
        </label>
        <button
          className="button button-primary"
          type="submit"
          disabled={status === "loading" || !query.trim()}
        >
          {status === "loading" ? "Searching..." : "Find recipes"}
        </button>
      </form>

      {status === "loading" && (
        <p className="message loading-message" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Finding delicious recipes...
        </p>
      )}
      {status === "failed" && error && (
        <div className="message error-message" role="alert">
          <p>{error}</p>
          <button className="button button-secondary" type="button" onClick={() => onFetch(query.trim())}>
            Try again
          </button>
        </div>
      )}
      {status === "succeeded" &&
        (items.length > 0 ? (
          <div className="recipe-grid">{items.map(renderItem)}</div>
        ) : (
          <p className="message empty-message" role="status">{emptyMessage}</p>
        ))}
      {status === "idle" && (
        <p className="message empty-message">
          Search by recipe name to load matching meals from TheMealDB.
        </p>
      )}
    </section>
  );
}

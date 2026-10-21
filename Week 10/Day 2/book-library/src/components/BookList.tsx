import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useAppSelector } from "../app/hooks";
import type { BookSort } from "../app/booksSlice";
import { useBooks } from "../hooks/useBooks";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import BookItemCard from "./BookItem";

type ReadFilter = "all" | "read" | "unread";

export default function BookList() {
  const { books, categories, filter, selectedCategory, sortBy, sortDirection } =
    useAppSelector((state) => state.books);
  const { setFilter, setCategory, setSort } = useBooks();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase());

  const visibleBooks = useMemo(() => {
    const filtered = books.filter((book) => {
      const matchesRead =
        filter === "all" || (filter === "read" ? book.isRead : !book.isRead);
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;
      const matchesSearch =
        !debouncedSearch ||
        book.title.toLowerCase().includes(debouncedSearch) ||
        book.author.toLowerCase().includes(debouncedSearch) ||
        book.category.toLowerCase().includes(debouncedSearch);
      return matchesRead && matchesCategory && matchesSearch;
    });

    return filtered.sort((first, second) => {
      const result =
        sortBy === "addedAt"
          ? first.addedAt.localeCompare(second.addedAt)
          : first[sortBy].localeCompare(second[sortBy]);
      return sortDirection === "asc" ? result : -result;
    });
  }, [books, filter, selectedCategory, debouncedSearch, sortBy, sortDirection]);

  function changeSort(event: ChangeEvent<HTMLSelectElement>) {
    const sort = event.target.value as BookSort;
    setSort(sort);
  }

  return (
    <section className="library-section" aria-labelledby="library-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">YOUR PERSONAL COLLECTION</p>
          <h2 id="library-title">Library <span className="count-badge">{books.length}</span></h2>
        </div>
        <label className="sort-control">
          Sort by
          <select value={sortBy} onChange={changeSort}>
            <option value="addedAt">Date added</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </label>
      </div>

      <div className="library-controls">
        <label className="search-control">
          <span className="visually-hidden">Search books</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, author, category..."
          />
        </label>
        <label className="filter-control">
          <span className="visually-hidden">Filter by category</span>
          <select value={selectedCategory} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option value={category} key={category}>{category}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="status-filters" aria-label="Filter by reading status">
        {(["all", "unread", "read"] as ReadFilter[]).map((item) => (
          <button
            className={filter === item ? "filter-chip is-active" : "filter-chip"}
            type="button"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
            key={item}
          >
            {item === "all" ? "All books" : item === "read" ? "Read" : "Unread"}
          </button>
        ))}
        <label className="sort-direction">
          <input
            type="checkbox"
            checked={sortDirection === "desc"}
            onChange={() => setSort(sortBy)}
          />
          Descending
        </label>
      </div>

      {visibleBooks.length > 0 ? (
        <div className="book-grid">
          {visibleBooks.map((book) => <BookItemCard book={book} key={book.id} />)}
        </div>
      ) : (
        <div className="empty-library">
          <span aria-hidden="true">▤</span>
          <p>{books.length ? "No books match these filters." : "Your library is waiting for its first book."}</p>
        </div>
      )}
    </section>
  );
}

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import {
  selectBooks,
  selectFantasyBooks,
  selectHorrorBooks,
  selectScienceFictionBooks,
  store,
} from "./bookStore.js";
import "./styles.css";

const h = React.createElement;

const genreOptions = [
  { label: "All books", selector: selectBooks },
  { label: "Horror", selector: selectHorrorBooks },
  { label: "Fantasy", selector: selectFantasyBooks },
  { label: "Science Fiction", selector: selectScienceFictionBooks },
];

function BookList() {
  const [selectedGenre, setSelectedGenre] = useState("All books");
  const selectedOption = genreOptions.find((option) => option.label === selectedGenre);
  const books = useSelector(selectedOption.selector);

  return h(
    "main",
    { className: "page-shell" },
    h("section", { className: "inventory", "aria-labelledby": "page-title" }, [
      h("header", { className: "page-header", key: "header" }, [
        h("p", { className: "eyebrow", key: "eyebrow" }, "THE READING ROOM · INVENTORY"),
        h("h1", { id: "page-title", key: "title" }, "Find your next story."),
        h(
          "p",
          { className: "intro", key: "intro" },
          "Browse the shelves by genre. Choose a collection to see the books inside.",
        ),
      ]),
      h(
        "div",
        { className: "genre-picker", role: "group", "aria-label": "Filter books by genre", key: "filters" },
        genreOptions.map((option) =>
          h(
            "button",
            {
              className: `genre-button${selectedGenre === option.label ? " is-selected" : ""}`,
              type: "button",
              "aria-pressed": selectedGenre === option.label,
              onClick: () => setSelectedGenre(option.label),
              key: option.label,
            },
            option.label,
          ),
        ),
      ),
      h("div", { className: "list-heading", key: "list-heading" }, [
        h("h2", { key: "genre" }, selectedGenre),
        h("span", { className: "book-count", key: "count" }, `${books.length} books`),
      ]),
      books.length
        ? h(
            "ul",
            { className: "book-grid", "aria-live": "polite", key: "book-list" },
            books.map((book, index) =>
              h("li", { className: "book-card", key: book.id }, [
                h("span", { className: "book-number", key: "number" }, String(index + 1).padStart(2, "0")),
                h("span", { className: "book-genre", key: "genre" }, book.genre),
                h("h3", { key: "title" }, book.title),
                h("p", { className: "book-author", key: "author" }, `by ${book.author}`),
              ]),
            ),
          )
        : h("p", { className: "empty-state", key: "empty" }, "No books in this collection yet."),
      h(
        "p",
        { className: "selector-note", key: "note" },
        "Genre collections are memoized with Redux Toolkit's createSelector.",
      ),
    ]),
  );
}

createRoot(document.getElementById("root")).render(
  h(React.StrictMode, null, h(Provider, { store }, h(BookList))),
);
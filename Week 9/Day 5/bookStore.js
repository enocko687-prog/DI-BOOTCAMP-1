import { configureStore, createSelector, createSlice } from "@reduxjs/toolkit";

const initialBooks = [
  { id: 1, title: "The Haunting of Hill House", author: "Shirley Jackson", genre: "Horror" },
  { id: 2, title: "Frankenstein", author: "Mary Shelley", genre: "Horror" },
  { id: 3, title: "The Shining", author: "Stephen King", genre: "Horror" },
  { id: 4, title: "A Wizard of Earthsea", author: "Ursula K. Le Guin", genre: "Fantasy" },
  { id: 5, title: "The Hobbit", author: "J. R. R. Tolkien", genre: "Fantasy" },
  { id: 6, title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy" },
  { id: 7, title: "Dune", author: "Frank Herbert", genre: "Science Fiction" },
  { id: 8, title: "Kindred", author: "Octavia E. Butler", genre: "Science Fiction" },
  { id: 9, title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", genre: "Science Fiction" },
];

const booksSlice = createSlice({
  name: "books",
  initialState: initialBooks,
  reducers: {},
});

export const store = configureStore({
  reducer: {
    books: booksSlice.reducer,
  },
});

export const selectBooks = (state) => state.books;

export const selectHorrorBooks = createSelector([selectBooks], (books) =>
  books.filter((book) => book.genre === "Horror"),
);

export const selectFantasyBooks = createSelector([selectBooks], (books) =>
  books.filter((book) => book.genre === "Fantasy"),
);

export const selectScienceFictionBooks = createSelector([selectBooks], (books) =>
  books.filter((book) => book.genre === "Science Fiction"),
);

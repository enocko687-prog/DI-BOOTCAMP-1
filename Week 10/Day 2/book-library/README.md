# Book Library

A React + TypeScript personal library app powered by Redux Toolkit. Add books,
track reading progress, organize categories, search and sort your collection,
and import or export a JSON backup. Changes are persisted in browser
`localStorage`.

## Run the development server

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build for VS Code Live Server

```sh
npm run build
```

Then open `dist/index.html` with Live Server. Vite uses relative asset paths
for the built app.

## Main source files

- `src/model/Book.ts` re-exports the `Book` interface and `BookItem` model from
  the supplied `mini projects gold personal book.ts` exercise file.
- `src/app/booksSlice.ts` defines Redux state and actions.
- `src/app/store.ts` configures the typed store and browser persistence.
- `src/hooks/` contains typed state operations and debounced search support.
- `src/components/` contains the book form, list, book cards, and category manager.

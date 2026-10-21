# Generic Data Fetcher

A React + TypeScript example that fetches recipes from TheMealDB and displays
them through a generic `DataFetcher<T>` component. Redux Toolkit manages the
request lifecycle and result state. The public search endpoint does not require
an API key.

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL in your browser and search for a recipe, for example
“chicken” or “pasta”.

## Run with Live Server

```sh
npm run build
```

Open `dist/index.html` with Live Server.

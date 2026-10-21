# Recipe Book

A vanilla TypeScript and Vite recipe book. Add recipes, expand their details,
mark favorites, and delete individual recipes or clear the collection. Recipes
persist in this browser's `localStorage`.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build for Live Server

```sh
npm run build
```

Then open `dist/index.html` with VS Code Live Server. The build emits relative
asset paths so it can be served from the `dist` directory.

Recipe IDs use the browser's built-in `crypto.randomUUID()`; a separate UUID
package is not needed.

import { Provider } from "react-redux";
import { store } from "./app/store";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchRecipeData } from "./features/dataSlice";
import type { Recipe } from "./types/types";
import DataFetcher from "./components/DataFetcher";
import "./app.css";

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="recipe-card" key={recipe.id}>
      <img
        className="recipe-image"
        src={recipe.thumbnail}
        alt=""
        loading="lazy"
      />
      <div className="recipe-content">
        <div className="recipe-meta">
          <span>{recipe.category}</span>
          <span>{recipe.area}</span>
        </div>
        <h2>{recipe.title}</h2>
        <details>
          <summary>Ingredients and instructions</summary>
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={`${recipe.id}-ingredient-${index}`}>{ingredient}</li>
            ))}
          </ul>
          <h3>Instructions</h3>
          <p className="instructions">{recipe.instructions}</p>
        </details>
      </div>
    </article>
  );
}

function RecipeSearchPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.recipes);

  function searchRecipes(query: string) {
    void dispatch(fetchRecipeData(query));
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">REACT · TYPESCRIPT · REDUX</p>
        <h1>Recipe Finder</h1>
        <p>A generic data-fetching component powered by typed Redux state.</p>
      </header>
      <DataFetcher<Recipe>
        items={items}
        status={status}
        error={error}
        onFetch={searchRecipes}
        renderItem={(recipe) => <RecipeCard recipe={recipe} key={recipe.id} />}
        emptyMessage="No matching recipes were found. Try another dish or ingredient."
      />
      <footer>Recipe data provided by TheMealDB.</footer>
    </main>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <RecipeSearchPage />
    </Provider>
  );
}

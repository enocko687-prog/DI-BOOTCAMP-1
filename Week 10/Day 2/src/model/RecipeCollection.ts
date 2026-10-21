import { RecipeItem } from "./RecipeItem";

const STORAGE_KEY = "week10-recipe-book";

export class RecipeCollection {
  private recipes: RecipeItem[];

  constructor() {
    this.recipes = this.load();
  }

  getAll(): RecipeItem[] {
    return [...this.recipes];
  }

  add(recipe: RecipeItem): void {
    if (this.recipes.some((existing) => existing.id === recipe.id)) {
      throw new Error("A recipe with this ID already exists.");
    }
    this.persist([...this.recipes, recipe]);
  }

  remove(id: string): void {
    this.persist(this.recipes.filter((recipe) => recipe.id !== id));
  }

  toggleFavorite(id: string): void {
    this.persist(
      this.recipes.map((recipe) =>
        recipe.id === id
          ? new RecipeItem(
              recipe.id,
              recipe.title,
              recipe.ingredients,
              recipe.instructions,
              !recipe.isFavorite,
            )
          : recipe,
      ),
    );
  }

  clear(): void {
    this.persist([]);
  }

  private persist(recipes: RecipeItem[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
      this.recipes = recipes;
    } catch (error) {
      throw new Error("Could not save recipes to this browser.", { cause: error });
    }
  }

  private load(): RecipeItem[] {
    let stored: string | null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      throw new Error("Could not read recipes from this browser.", { cause: error });
    }

    if (!stored) return [];

    try {
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        throw new Error("Saved recipes must be a list.");
      }
      return parsed.map(RecipeItem.fromJSON);
    } catch (error) {
      throw new Error(
        "Saved recipes could not be loaded. Clear the browser's recipe-book data and reload.",
        { cause: error },
      );
    }
  }
}

import type { MealApiItem, MealApiResponse, Recipe } from "../types/types";

const MEAL_SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php";

function mapRecipe(meal: MealApiItem): Recipe {
  const ingredients: string[] = [];
  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`]?.trim();
    const measure = meal[`strMeasure${index}`]?.trim();
    if (ingredient) ingredients.push(measure ? `${measure} ${ingredient}` : ingredient);
  }

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory ?? "Uncategorized",
    area: meal.strArea ?? "Unknown origin",
    thumbnail: meal.strMealThumb,
    instructions: meal.strInstructions ?? "No instructions are available.",
    ingredients,
  };
}

export async function fetchRecipes(query: string, signal?: AbortSignal): Promise<Recipe[]> {
  const searchTerm = query.trim();
  if (!searchTerm) {
    throw new Error("Enter a recipe name or ingredient to search.");
  }

  const url = new URL(MEAL_SEARCH_URL);
  url.searchParams.set("s", searchTerm);

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("Could not connect to the recipe service. Check your internet connection.", {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(`Recipe service returned HTTP ${response.status}. Please try again.`);
  }

  let payload: MealApiResponse;
  try {
    payload = (await response.json()) as MealApiResponse;
  } catch (error) {
    throw new Error("The recipe service returned an invalid response.", { cause: error });
  }

  if (payload.meals === null) return [];
  if (!Array.isArray(payload.meals)) {
    throw new Error("The recipe service returned data in an unexpected format.");
  }

  return payload.meals.map(mapRecipe);
}

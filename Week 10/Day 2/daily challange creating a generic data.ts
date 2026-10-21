export type FetchStatus = "idle" | "loading" | "succeeded" | "failed";

export interface Recipe {
  id: string;
  title: string;
  category: string;
  area: string;
  thumbnail: string;
  instructions: string;
  ingredients: string[];
}

export interface FetchDataState<T> {
  items: T[];
  status: FetchStatus;
  error: string | null;
}

export interface MealApiItem {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strMealThumb: string;
  strInstructions: string | null;
  [key: `strIngredient${number}`]: string | null;
  [key: `strMeasure${number}`]: string | null;
}

export interface MealApiResponse {
  meals: MealApiItem[] | null;
}
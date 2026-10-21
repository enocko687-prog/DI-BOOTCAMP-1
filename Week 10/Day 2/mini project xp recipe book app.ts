export class RecipeItem {
  constructor(
    public readonly id: string,
    public title: string,
    public ingredients: string[],
    public instructions: string,
    public isFavorite = false,
  ) {}

  static create(
    title: string,
    ingredients: string[],
    instructions: string,
  ): RecipeItem {
    return new RecipeItem(
      crypto.randomUUID(),
      title.trim(),
      ingredients.map((ingredient) => ingredient.trim()).filter(Boolean),
      instructions.trim(),
    );
  }

  static fromJSON(value: unknown): RecipeItem {
    if (
      typeof value !== "object" ||
      value === null ||
      !("id" in value) ||
      !("title" in value) ||
      !("ingredients" in value) ||
      !("instructions" in value) ||
      !("isFavorite" in value)
    ) {
      throw new Error("Saved recipe data has an invalid format.");
    }

    const recipe = value as Record<string, unknown>;
    if (
      typeof recipe.id !== "string" ||
      typeof recipe.title !== "string" ||
      !Array.isArray(recipe.ingredients) ||
      !recipe.ingredients.every((ingredient) => typeof ingredient === "string") ||
      typeof recipe.instructions !== "string" ||
      typeof recipe.isFavorite !== "boolean"
    ) {
      throw new Error("Saved recipe data has an invalid format.");
    }

    return new RecipeItem(
      recipe.id,
      recipe.title,
      recipe.ingredients,
      recipe.instructions,
      recipe.isFavorite,
    );
  }
}
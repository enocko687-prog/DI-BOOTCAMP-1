import type { RecipeItem } from "../model/RecipeItem";

export class RecipeTemplate {
  constructor(private readonly container: HTMLElement) {}

  render(recipes: RecipeItem[]): void {
    const fragment = document.createDocumentFragment();

    if (recipes.length === 0) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Your recipe book is empty. Add a recipe to get started.";
      fragment.append(empty);
    }

    for (const recipe of recipes) {
      const card = document.createElement("article");
      card.className = "recipe-card";
      card.dataset.recipeId = recipe.id;

      const heading = document.createElement("div");
      heading.className = "recipe-heading";

      const title = document.createElement("h2");
      title.textContent = recipe.title;

      const favorite = document.createElement("button");
      favorite.className = "icon-button favorite-button";
      favorite.type = "button";
      favorite.dataset.action = "favorite";
      favorite.setAttribute(
        "aria-label",
        recipe.isFavorite ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`,
      );
      favorite.setAttribute("aria-pressed", String(recipe.isFavorite));
      favorite.textContent = recipe.isFavorite ? "★ Favorite" : "☆ Favorite";

      heading.append(title, favorite);

      const details = document.createElement("div");
      details.className = "recipe-details";
      details.hidden = true;

      const ingredientsTitle = document.createElement("h3");
      ingredientsTitle.textContent = "Ingredients";
      const ingredients = document.createElement("ul");
      for (const ingredient of recipe.ingredients) {
        const item = document.createElement("li");
        item.textContent = ingredient;
        ingredients.append(item);
      }

      const instructionsTitle = document.createElement("h3");
      instructionsTitle.textContent = "Instructions";
      const instructions = document.createElement("p");
      instructions.textContent = recipe.instructions;
      details.append(ingredientsTitle, ingredients, instructionsTitle, instructions);

      const actions = document.createElement("div");
      actions.className = "recipe-actions";

      const showDetails = document.createElement("button");
      showDetails.className = "button button-secondary";
      showDetails.type = "button";
      showDetails.dataset.action = "details";
      showDetails.setAttribute("aria-expanded", "false");
      showDetails.textContent = "Show details";

      const deleteButton = document.createElement("button");
      deleteButton.className = "button button-danger";
      deleteButton.type = "button";
      deleteButton.dataset.action = "delete";
      deleteButton.textContent = "Delete";

      actions.append(showDetails, deleteButton);
      card.append(heading, details, actions);
      fragment.append(card);
    }

    this.container.replaceChildren(fragment);
  }
}

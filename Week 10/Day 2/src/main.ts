import "./style.css";
import { RecipeItem } from "./model/RecipeItem";
import { RecipeCollection } from "./model/RecipeCollection";
import { RecipeTemplate } from "./templates/RecipeTemplate";

function getElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`The recipe book page is missing ${selector}.`);
  }
  return element;
}

const form = getElement<HTMLFormElement>("#recipeEntryForm");
const titleInput = getElement<HTMLInputElement>("#recipeTitle");
const ingredientsInput = getElement<HTMLTextAreaElement>("#ingredients");
const instructionsInput = getElement<HTMLTextAreaElement>("#instructions");
const container = getElement<HTMLDivElement>("#recipeContainer");
const clearButton = getElement<HTMLButtonElement>("#clearRecipesButton");
const status = getElement<HTMLParagraphElement>("#statusMessage");
const collection = new RecipeCollection();
const template = new RecipeTemplate(container);

function render(): void {
  template.render(collection.getAll());
  clearButton.disabled = collection.getAll().length === 0;
}

function showError(error: unknown): void {
  status.textContent =
    error instanceof Error ? error.message : "Something went wrong. Please try again.";
  status.dataset.kind = "error";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const ingredients = ingredientsInput.value
    .split(/\r?\n/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);
  const title = titleInput.value.trim();
  const instructions = instructionsInput.value.trim();

  if (!title || ingredients.length === 0 || !instructions) {
    status.textContent = "Enter a title, at least one ingredient, and the instructions.";
    status.dataset.kind = "error";
    return;
  }

  try {
    collection.add(RecipeItem.create(title, ingredients, instructions));
    form.reset();
    status.textContent = "Recipe added and saved.";
    status.dataset.kind = "success";
    render();
    titleInput.focus();
  } catch (error) {
    showError(error);
  }
});

container.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const button = target.closest<HTMLButtonElement>("button[data-action]");
  const card = button?.closest<HTMLElement>("[data-recipe-id]");
  const action = button?.dataset.action;
  const id = card?.dataset.recipeId;
  if (!button || !id || !action) return;

  try {
    if (action === "favorite") {
      collection.toggleFavorite(id);
      status.textContent = "Favorite status updated.";
    } else if (action === "delete") {
      collection.remove(id);
      status.textContent = "Recipe deleted.";
    } else if (action === "details") {
      const details = card.querySelector<HTMLElement>(".recipe-details");
      if (!details) return;
      details.hidden = !details.hidden;
      button.setAttribute("aria-expanded", String(!details.hidden));
      button.textContent = details.hidden ? "Show details" : "Hide details";
      return;
    }
    status.dataset.kind = "success";
    render();
  } catch (error) {
    showError(error);
  }
});

clearButton.addEventListener("click", () => {
  if (!window.confirm("Delete every recipe in your book?")) return;
  try {
    collection.clear();
    status.textContent = "All recipes cleared.";
    status.dataset.kind = "success";
    render();
  } catch (error) {
    showError(error);
  }
});

render();

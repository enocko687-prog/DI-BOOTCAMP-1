import "./styles.css";

const root = document.getElementById("root");
const exercise = new URLSearchParams(window.location.search).get("exercise");

const exercises = {
  todo: {
    title: "Basic Todo List",
    description:
      "Add tasks, mark them complete, and remove them with a Redux Toolkit slice.",
    load: () => import("./exersice xp.js"),
  },
  auth: {
    title: "User Authentication",
    description:
      "Sign in, view protected content, and sign out using Redux authentication state.",
    load: () => import("./exersice xp gold.js"),
  },
  inventory: {
    title: "Store Inventory",
    description:
      "Add products, update stock quantities, and remove inventory items.",
    load: () => import("./exersice xp ninja.js"),
  },
  planner: {
    title: "Daily Planner",
    description:
      "Create, edit, and delete tasks for selected dates with browser persistence.",
    load: () => import("./Daily challange  planner application.js"),
  },
};

function renderHome() {
  root.innerHTML = `
    <main class="app-shell">
      <section class="todo-card exercise-home" aria-labelledby="page-title">
        <p class="eyebrow">React + Redux Toolkit</p>
        <h1 id="page-title">Choose an exercise</h1>
        <p class="intro">Open either exercise below. They have separate Redux stores and screens.</p>
        <div class="exercise-grid">
          ${Object.entries(exercises)
            .map(
              ([key, item], index) => `
                <a class="exercise-card" href="?exercise=${key}">
                  <span class="exercise-number">0${index + 1}</span>
                  <span class="exercise-title">${item.title}</span>
                  <span class="exercise-description">${item.description}</span>
                  <span class="exercise-open">Open exercise <span aria-hidden="true">→</span></span>
                </a>
              `,
            )
            .join("")}
        </div>
      </section>
    </main>
  `;
}

function renderError(message) {
  root.innerHTML = `
    <main class="app-shell">
      <section class="todo-card exercise-home" aria-labelledby="load-error-title">
        <p class="eyebrow">Exercise could not load</p>
        <h1 id="load-error-title">Something went wrong</h1>
        <p class="error-message" role="alert">${message}</p>
        <p class="intro"><a class="text-button" href="./">Return to all exercises</a></p>
      </section>
    </main>
  `;
}

if (!exercise) {
  renderHome();
} else if (!Object.hasOwn(exercises, exercise)) {
  renderError("That exercise does not exist. Choose one from the exercise menu.");
} else {
  document
    .querySelector(`.exercise-nav a[href="?exercise=${exercise}"]`)
    ?.setAttribute("aria-current", "page");
  exercises[exercise]
    .load()
    .catch((error) => renderError(`Unable to load the exercise: ${error.message}`));
}

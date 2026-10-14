import "./styles.css";

const root = document.getElementById("root");
const exercise = new URLSearchParams(window.location.search).get("exercise");

const exercises = {
  users: {
    title: "Fetching User Data",
    description: "Fetch a user profile asynchronously and handle API errors.",
    load: () => import("./exersice xp.js"),
  },
  todos: {
    title: "Todo List with Thunks",
    description: "Fetch, add, complete, and remove todos using Redux Toolkit.",
    load: () => import("./exersice xp gold.js"),
  },
  shop: {
    title: "Simulated E-commerce Store",
    description:
      "Browse products, simulate sign-in, and manage your shopping cart.",
    load: () => import("./exersice xp ninja.js"),
  },
  age: {
    title: "Age Tracker",
    description: "Increment and decrement age with asynchronous Redux actions.",
    load: () => import("./Daily challange age tracker with redux.js"),
  },
};

function renderHome() {
  root.innerHTML = `
    <main class="app-shell">
      <section class="user-card exercise-home" aria-labelledby="page-title">
        <p class="eyebrow">React + Redux Toolkit</p>
        <h1 id="page-title">Choose an exercise</h1>
        <p class="intro">Explore React apps powered by Redux Toolkit and asynchronous Thunks.</p>
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
      <section class="user-card exercise-home" aria-labelledby="load-error-title">
        <p class="eyebrow">Exercise could not load</p>
        <h1 id="load-error-title">Something went wrong</h1>
        <p class="user-error" role="alert">${message}</p>
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

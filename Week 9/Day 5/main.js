const exercise = new URLSearchParams(window.location.search).get("exercise");

if (exercise === "cart") {
  import("./exersice xp gold.js");
} else if (exercise === "manager") {
  import("./exersice todo list manager.js");
} else if (exercise === "todo") {
  import("./exersice xp ninja.js");
} else if (exercise === "products") {
  import("./exersice ecomers product filters.js");
} else {
  import("./exersice xp.js");
}

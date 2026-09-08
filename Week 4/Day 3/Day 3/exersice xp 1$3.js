// Exercise 1: HTML Form
// With method="get", submitted values appear in the URL query string.
const getForm = `
<form action="" method="get">
	<label for="get-name">Name:</label>
	<input id="get-name" type="text" name="name" required>

	<label for="get-message">Message:</label>
	<textarea id="get-message" name="message" required></textarea>

	<input type="submit" value="Send">
</form>`;

// Exercise 2: HTML Form #2
// With method="post", submitted values appear in the request payload in the Network tab.
const postForm = `
<form action="" method="post">
	<label for="post-name">Name:</label>
	<input id="post-name" type="text" name="name" required>

	<label for="post-message">Message:</label>
	<textarea id="post-message" name="message" required></textarea>

	<input type="submit" value="Send">
</form>`;

// Add both forms when this script is loaded in an HTML page.
if (typeof document !== "undefined") {
	document.body.insertAdjacentHTML("beforeend", getForm + postForm);
}

// Exercise 3: JSON Mario
const marioGame = {
	detail: "An amazing game!",
	characters: {
		mario: {
			description: "Small and jumpy. Likes princesses.",
			height: 10,
			weight: 3,
			speed: 12
		},
		bowser: {
			description: "Big and green, Hates princesses.",
			height: 16,
			weight: 6,
			speed: 4
		},
		princessPeach: {
			description: "Beautiful princess.",
			height: 12,
			weight: 2,
			speed: 2
		}
	}
};

const marioJson = JSON.stringify(marioGame);
const prettyMarioJson = JSON.stringify(marioGame, null, 2);

console.log(marioJson);
console.log(prettyMarioJson);

// JSON.stringify converts the nested objects into nested JSON objects.
// Add a breakpoint on the next line to inspect the JSON string in the debugger.
console.log(prettyMarioJson);

const giphyApiKey = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";
const form = document.querySelector("#gif-form");
const categoryInput = document.querySelector("#category");
const gifsContainer = document.querySelector("#gifs");
const deleteButton = document.querySelector("#delete-gifs");

async function searchGifs(category) {
	const url = new URL("https://api.giphy.com/v1/gifs/search");
	url.search = new URLSearchParams({
		q: category,
		rating: "g",
		limit: "12",
		api_key: giphyApiKey,
	});

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Giphy request failed: ${response.status}`);
	}

	return response.json();
}

function displayGifs(gifData) {
	gifsContainer.replaceChildren();

	gifData.data.forEach((gif) => {
		const image = document.createElement("img");
		image.src = gif.images.fixed_width.url;
		image.alt = gif.title || "Giphy result";
		image.loading = "lazy";
		gifsContainer.appendChild(image);
	});
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const category = categoryInput.value.trim();

	if (!category) {
		return;
	}

	try {
		const gifData = await searchGifs(category);
		displayGifs(gifData);
	} catch (error) {
		console.error("Unable to fetch GIFs:", error);
		gifsContainer.textContent = "Unable to load GIFs. Please try again.";
	}
});

deleteButton.addEventListener("click", () => {
	gifsContainer.replaceChildren();
});

// Exercise 2: Promise.all analysis
// After one second, the timer starts concurrentPromise. It logs its heading,
// starts both promises, then logs "fast promise is done" after one more
// second. At the two-second mark, the slow promise finishes. Promise.all
// preserves input order, so it then logs "slow" followed by "fast".

// Exercise 3: parallel with await Promise.all
// Five seconds after the script starts, the heading and both "starting..."
// messages print. The fast result prints after one second, the slow result
// after two seconds, and Promise.all completes after both results are logged.

// Exercise 4: parallel with Promise.then
// Thirteen seconds after the script starts, the heading and both starting
// messages print. The fast result is logged after one second and the slow
// result after two seconds. The two promises run in parallel, and no error
// handler is attached.

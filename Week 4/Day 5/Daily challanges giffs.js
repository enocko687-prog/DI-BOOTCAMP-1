const apiKey = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";
const form = document.querySelector("#gif-form");
const categoryInput = document.querySelector("#category");
const gifsContainer = document.querySelector("#gifs");
const deleteAllButton = document.querySelector("#delete-all");

async function fetchRandomGif(category) {
	const url = new URL("https://api.giphy.com/v1/gifs/random");
	url.search = new URLSearchParams({
		api_key: apiKey,
		tag: category,
		rating: "g",
	});

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Giphy request failed: ${response.status}`);
	}

	return response.json();
}

function appendGif(gifData) {
	const gif = gifData.data;
	const gifWrapper = document.createElement("article");
	const image = document.createElement("img");
	const deleteButton = document.createElement("button");

	image.src = gif.images.fixed_width.url;
	image.alt = gif.title || "Random GIF";
	image.loading = "lazy";

	deleteButton.type = "button";
	deleteButton.textContent = "DELETE";
	deleteButton.addEventListener("click", () => gifWrapper.remove());

	gifWrapper.append(image, deleteButton);
	gifsContainer.appendChild(gifWrapper);
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const category = categoryInput.value.trim();

	if (!category) {
		return;
	}

	try {
		const gifData = await fetchRandomGif(category);
		appendGif(gifData);
		categoryInput.value = "";
	} catch (error) {
		console.error("Unable to fetch a GIF:", error);
	}
});

deleteAllButton.addEventListener("click", () => {
	gifsContainer.replaceChildren();
});

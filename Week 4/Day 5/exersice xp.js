const giphyApiKey = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";

async function fetchJson(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Request failed: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

// Exercise 1: Giphy API
async function getHilariousGifs() {
	try {
		const url = `https://api.giphy.com/v1/gifs/search?q=hilarious&rating=g&api_key=${giphyApiKey}`;
		const gifs = await fetchJson(url);
		console.log("Exercise 1:", gifs);
	} catch (error) {
		console.error("Exercise 1 error:", error.message);
	}
}

// Exercise 2: Giphy API with limit and offset
async function getSunGifs() {
	try {
		const url = `https://api.giphy.com/v1/gifs/search?q=sun&rating=g&limit=10&offset=2&api_key=${giphyApiKey}`;
		const gifs = await fetchJson(url);
		console.log("Exercise 2:", gifs);
	} catch (error) {
		console.error("Exercise 2 error:", error.message);
	}
}

// Exercise 3: Async function
async function getStarship() {
	try {
		const starship = await fetchJson("https://www.swapi.tech/api/starships/9/");
		console.log("Exercise 3:", starship.result);
	} catch (error) {
		console.error("Exercise 3 error:", error.message);
	}
}

getHilariousGifs();
getSunGifs();
getStarship();

// Exercise 4: Analyze
// The output is "calling" immediately. The await pauses asyncCall for two
// seconds, then "resolved" is printed when the promise resolves.
function resolveAfter2Seconds() {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve("resolved");
		}, 2000);
	});
}

async function asyncCall() {
	console.log("calling");
	const result = await resolveAfter2Seconds();
	console.log(result);
}

asyncCall();

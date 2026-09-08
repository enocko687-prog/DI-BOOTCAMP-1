const giphyApiKey = "hpvZycW22qCjn5cRM1xtWB8NKq4dQ2My";

// Exercise 1: Giphy API #2
async function appendRandomGif() {
	try {
		const response = await fetch(
			`https://api.giphy.com/v1/gifs/random?api_key=${giphyApiKey}&rating=g`,
		);

		if (!response.ok) {
			throw new Error(`Giphy request failed: ${response.status}`);
		}

		const result = await response.json();
		const gifUrl = result.data.images.original.url;

		if (typeof document !== "undefined") {
			const image = document.createElement("img");
			image.src = gifUrl;
			image.alt = "Random GIF";
			document.body.appendChild(image);
		} else {
			console.log("Random GIF:", gifUrl);
		}
	} catch (error) {
		console.error("Giphy error:", error.message);
	}
}

appendRandomGif();

// Exercise 2: Analyze #2
// Output order:
// ==SEQUENTIAL START==
// starting slow promise
// slow promise is done
// slow
// starting fast promise
// fast promise is done
// fast
// The fast promise starts only after the slow promise has resolved, so the
// complete sequence takes about three seconds.

// Exercise 3: Analyze #3
// Four seconds after the script starts, the output begins with:
// ==CONCURRENT START with await==
// starting slow promise
// starting fast promise
// After one second, "fast promise is done" is printed. After two seconds,
// "slow promise is done" is printed, followed by "slow" and then "fast".
// Both promises start together, so the complete sequence takes about six
// seconds including the initial four-second setTimeout.

// Exercise 4: Modify fetch with Async/Await
const urls = [
	"https://jsonplaceholder.typicode.com/users",
	// This invalid URL intentionally tests the catch block.
	"https://jsonplaceholder.typicode.com/posts-that-do-not-exist",
	"https://jsonplaceholder.typicode.com/albums",
];

const getData = async function () {
	try {
		const data = await Promise.all(
			urls.map(async (url) => {
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error(`Request failed: ${response.status}`);
				}

				return response.json();
			}),
		);

		const [users, posts, albums] = data;
		console.log("users", users);
		console.log("posts", posts);
		console.log("albums", albums);
	} catch (error) {
		console.log("ooooooops");
	}
};

getData();

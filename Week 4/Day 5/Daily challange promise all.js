const form = document.querySelector("#sunrise-form");
const result = document.querySelector("#result");

async function getSunrise(latitude, longitude) {
	const url = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Sunrise request failed: ${response.status}`);
	}

	const data = await response.json();

	if (data.status !== "OK") {
		throw new Error(`Sunrise API error: ${data.status}`);
	}

	return new Date(data.results.sunrise).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	result.textContent = "Loading sunrise times...";

	const parisLatitude = document.querySelector("#paris-latitude").value;
	const parisLongitude = document.querySelector("#paris-longitude").value;
	const newYorkLatitude = document.querySelector("#new-york-latitude").value;
	const newYorkLongitude = document.querySelector("#new-york-longitude").value;

	try {
		const [parisSunrise, newYorkSunrise] = await Promise.all([
			getSunrise(parisLatitude, parisLongitude),
			getSunrise(newYorkLatitude, newYorkLongitude),
		]);

		result.innerHTML = `
			<p>Paris sunrise: ${parisSunrise}</p>
			<p>New York sunrise: ${newYorkSunrise}</p>
		`;
	} catch (error) {
		result.textContent = `Unable to retrieve sunrise times: ${error.message}`;
	}
});

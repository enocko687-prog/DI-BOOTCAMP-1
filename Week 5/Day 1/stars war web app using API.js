const API_URL = "https://www.swapi.tech/api/people";
const CHARACTER_COUNT = 83;

const elements = {
	button: document.querySelector("#random-character"),
	status: document.querySelector("#status"),
	card: document.querySelector("#character-card"),
	name: document.querySelector("#character-name"),
	height: document.querySelector("#character-height"),
	gender: document.querySelector("#character-gender"),
	birthYear: document.querySelector("#character-birth-year"),
	homeWorld: document.querySelector("#character-home-world"),
};

function showLoading() {
	elements.button.disabled = true;
	elements.card.hidden = true;
	elements.status.className = "status status-loading";
	elements.status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Loading character...</span>';
}

function showError() {
	elements.button.disabled = false;
	elements.card.hidden = true;
	elements.status.className = "status status-error";
	elements.status.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i><span>Oh no! That person is not available right now.</span>';
}

function showCharacter(character, homeWorld) {
	const properties = character.result.properties;

	elements.name.textContent = properties.name;
	elements.height.textContent = properties.height === "unknown" ? "Unknown" : `${properties.height} cm`;
	elements.gender.textContent = properties.gender;
	elements.birthYear.textContent = properties.birth_year;
	elements.homeWorld.textContent = homeWorld;
	elements.status.className = "status";
	elements.status.textContent = "Character found";
	elements.card.hidden = false;
	elements.button.disabled = false;
}

async function getJson(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	return response.json();
}

async function getRandomCharacter() {
	showLoading();

	try {
		const characterId = Math.floor(Math.random() * CHARACTER_COUNT) + 1;
		const character = await getJson(`${API_URL}/${characterId}`);
		const homeWorld = await getJson(character.result.properties.homeworld);
		showCharacter(character, homeWorld.result.properties.name);
	} catch (error) {
		console.error(error);
		showError();
	}
}

elements.button.addEventListener("click", getRandomCharacter);

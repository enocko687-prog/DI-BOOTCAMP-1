const MAX_POKEMON_ID = 1025;
let currentPokemonId = null;

const elements = {
	randomButton: document.querySelector("#random-pokemon"),
	previousButton: document.querySelector("#previous-pokemon"),
	nextButton: document.querySelector("#next-pokemon"),
	status: document.querySelector("#status"),
	card: document.querySelector("#pokemon-card"),
	image: document.querySelector("#pokemon-image"),
	name: document.querySelector("#pokemon-name"),
	id: document.querySelector("#pokemon-id"),
	height: document.querySelector("#pokemon-height"),
	weight: document.querySelector("#pokemon-weight"),
	types: document.querySelector("#pokemon-types"),
};

function setLoading(isLoading) {
	elements.randomButton.disabled = isLoading;
	elements.previousButton.disabled = isLoading || currentPokemonId === 1;
	elements.nextButton.disabled = isLoading || currentPokemonId === MAX_POKEMON_ID;
	elements.status.className = isLoading ? "status loading" : "status";
	elements.status.innerHTML = isLoading
		? '<i class="fa-solid fa-circle-notch fa-spin"></i> Searching the Pokédex...'
		: "";
}

function showError() {
	elements.card.hidden = true;
	elements.status.className = "status error";
	elements.status.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Oh no! That Pokémon isn\'t available...';
	elements.randomButton.disabled = false;
	elements.previousButton.disabled = true;
	elements.nextButton.disabled = true;
}

async function getPokemon(id) {
	const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

	if (!response.ok) {
		throw new Error(`PokéAPI returned ${response.status}`);
	}

	return response.json();
}

function displayPokemon(pokemon) {
	currentPokemonId = pokemon.id;
	elements.image.src = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
	elements.image.alt = pokemon.name;
	elements.name.textContent = pokemon.name;
	elements.id.textContent = `#${String(pokemon.id).padStart(3, "0")}`;
	elements.height.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
	elements.weight.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
	elements.types.replaceChildren();

	pokemon.types.forEach(({ type }) => {
		const typeBadge = document.createElement("span");
		typeBadge.className = `type ${type.name}`;
		typeBadge.textContent = type.name;
		elements.types.appendChild(typeBadge);
	});

	elements.card.hidden = false;
	elements.status.className = "status";
	elements.status.textContent = "Pokémon found";
	setLoading(false);
}

async function loadPokemon(id) {
	setLoading(true);

	try {
		const pokemon = await getPokemon(id);
		displayPokemon(pokemon);
	} catch (error) {
		console.error(error);
		showError();
	}
}

function getRandomPokemonId() {
	return Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
}

elements.randomButton.addEventListener("click", () => loadPokemon(getRandomPokemonId()));
elements.previousButton.addEventListener("click", () => {
	if (currentPokemonId > 1) loadPokemon(currentPokemonId - 1);
});
elements.nextButton.addEventListener("click", () => {
	if (currentPokemonId < MAX_POKEMON_ID) loadPokemon(currentPokemonId + 1);
});

elements.previousButton.disabled = true;
elements.nextButton.disabled = true;

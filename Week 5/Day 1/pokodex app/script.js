const statusElement = document.getElementById('status');
const errorElement = document.getElementById('error');
const pokemonDisplay = document.getElementById('pokemon-display');
const imageElement = document.getElementById('pokemon-image');
const idElement = document.getElementById('pokemon-id');
const nameElement = document.getElementById('pokemon-name');
const heightElement = document.getElementById('pokemon-height');
const weightElement = document.getElementById('pokemon-weight');
const typeElement = document.getElementById('pokemon-type');
const randomButton = document.getElementById('random-button');
const previousButton = document.getElementById('previous-button');
const nextButton = document.getElementById('next-button');

const maximumPokemonId = 1010;
let currentPokemonId = Math.floor(Math.random() * maximumPokemonId) + 1;

function setLoading(isLoading) {
	statusElement.classList.toggle('is-hidden', !isLoading);
	pokemonDisplay.classList.toggle('is-hidden', isLoading);
	errorElement.classList.add('is-hidden');
	randomButton.disabled = isLoading;
	previousButton.disabled = isLoading;
	nextButton.disabled = isLoading;
}

function showError() {
	statusElement.classList.add('is-hidden');
	pokemonDisplay.classList.add('is-hidden');
	errorElement.classList.remove('is-hidden');
	randomButton.disabled = false;
	previousButton.disabled = false;
	nextButton.disabled = false;
}

function formatName(name) {
	return name.replace(/-/g, ' ');
}

function displayPokemon(pokemon) {
	const artwork = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
	imageElement.src = artwork;
	imageElement.alt = formatName(pokemon.name);
	idElement.textContent = `#${String(pokemon.id).padStart(3, '0')}`;
	nameElement.textContent = formatName(pokemon.name);
	heightElement.textContent = `${pokemon.height / 10} m`;
	weightElement.textContent = `${pokemon.weight / 10} kg`;
	typeElement.textContent = pokemon.types.map(({ type }) => formatName(type.name)).join(' / ');
	currentPokemonId = pokemon.id;
	statusElement.classList.add('is-hidden');
	errorElement.classList.add('is-hidden');
	pokemonDisplay.classList.remove('is-hidden');
}

async function fetchPokemon(pokemonId) {
	setLoading(true);

	try {
		const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
		if (!response.ok) throw new Error('Pokemon request failed');
		displayPokemon(await response.json());
	} catch (error) {
		showError();
	}
}

function getRandomPokemon() {
	const randomId = Math.floor(Math.random() * maximumPokemonId) + 1;
	fetchPokemon(randomId);
}

function getPreviousPokemon() {
	const previousId = currentPokemonId === 1 ? maximumPokemonId : currentPokemonId - 1;
	fetchPokemon(previousId);
}

function getNextPokemon() {
	const nextId = currentPokemonId === maximumPokemonId ? 1 : currentPokemonId + 1;
	fetchPokemon(nextId);
}

randomButton.addEventListener('click', getRandomPokemon);
previousButton.addEventListener('click', getPreviousPokemon);
nextButton.addEventListener('click', getNextPokemon);
fetchPokemon(currentPokemonId);

const status = document.getElementById('status');
const characterCard = document.getElementById('character-card');
const errorMessage = document.getElementById('error');
const findCharacterButton = document.getElementById('find-character');
const nameElement = document.getElementById('name');
const heightElement = document.getElementById('height');
const genderElement = document.getElementById('gender');
const birthYearElement = document.getElementById('birth-year');
const homeworldElement = document.getElementById('homeworld');

function setLoadingState(isLoading) {
	status.classList.toggle('is-hidden', !isLoading);
	characterCard.classList.add('is-hidden');
	errorMessage.classList.add('is-hidden');
	findCharacterButton.disabled = isLoading;
}

function showError() {
	status.classList.add('is-hidden');
	characterCard.classList.add('is-hidden');
	errorMessage.classList.remove('is-hidden');
	findCharacterButton.disabled = false;
}

function displayCharacter(character, homeworld) {
	const properties = character.result.properties;
	nameElement.textContent = properties.name;
	heightElement.textContent = properties.height || 'Unknown';
	genderElement.textContent = properties.gender || 'Unknown';
	birthYearElement.textContent = properties.birth_year || 'Unknown';
	homeworldElement.textContent = homeworld;
	status.classList.add('is-hidden');
	errorMessage.classList.add('is-hidden');
	characterCard.classList.remove('is-hidden');
	findCharacterButton.disabled = false;
}

async function getRandomCharacter() {
	setLoadingState(true);
	const characterId = Math.floor(Math.random() * 83) + 1;

	try {
		const characterResponse = await fetch(`https://www.swapi.tech/api/people/${characterId}`);
		if (!characterResponse.ok) throw new Error('Character request failed');
		const character = await characterResponse.json();
		const properties = character.result?.properties;
		if (!properties?.name || !properties.homeworld) throw new Error('Invalid character response');

		const homeworldResponse = await fetch(properties.homeworld);
		if (!homeworldResponse.ok) throw new Error('Homeworld request failed');
		const homeworldData = await homeworldResponse.json();
		const homeworld = homeworldData.result?.properties?.name || 'Unknown';

		displayCharacter(character, homeworld);
	} catch (error) {
		showError();
	}
}

findCharacterButton.addEventListener('click', getRandomCharacter);
getRandomCharacter();

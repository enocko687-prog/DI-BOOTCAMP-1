// 1st daily challenge: Play with words
function makeAllCaps(words) {
	return new Promise((resolve, reject) => {
		if (words.every((word) => typeof word === "string")) {
			resolve(words.map((word) => word.toUpperCase()));
		} else {
			reject("Every item in the array must be a string.");
		}
	});
}

function sortWords(words) {
	return new Promise((resolve, reject) => {
		if (words.length > 4) {
			resolve([...words].sort());
		} else {
			reject("The array must contain more than four words.");
		}
	});
}

makeAllCaps([1, "pear", "banana"])
	.then((words) => sortWords(words))
	.then((result) => console.log(result))
	.catch((error) => console.log(error));

makeAllCaps(["apple", "pear", "banana"])
	.then((words) => sortWords(words))
	.then((result) => console.log(result))
	.catch((error) => console.log(error));

makeAllCaps(["apple", "pear", "banana", "melon", "kiwi"])
	.then((words) => sortWords(words))
	.then((result) => console.log(result))
	.catch((error) => console.log(error));

// 2nd daily challenge: Morse code
const morse = `{
	"0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
	"5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
	"a": ".-", "b": "-...", "c": "-.-.", "d": "-..", "e": ".", "f": "..-.",
	"g": "--.", "h": "....", "i": "..", "j": ".---", "k": "-.-", "l": ".-..",
	"m": "--", "n": "-.", "o": "---", "p": ".--.", "q": "--.-", "r": ".-.",
	"s": "...", "t": "-", "u": "..-", "v": "...-", "w": ".--", "x": "-..-",
	"y": "-.--", "z": "--..", ".": ".-.-.-", ",": "--..--", "?": "..--..",
	"!": "-.-.--", "-": "-....-", "/": "-..-.", "@": ".--.-.",
	"(": "-.--.", ")": "-.--.-"
}`;

function toJs() {
	return new Promise((resolve, reject) => {
		const morseJS = JSON.parse(morse);

		if (Object.keys(morseJS).length === 0) {
			reject("The Morse object is empty.");
		} else {
			resolve(morseJS);
		}
	});
}

function toMorse(morseJS) {
	return new Promise((resolve, reject) => {
		let word;

		if (typeof prompt === "function") {
			word = prompt("Enter a word or sentence:");
		} else if (typeof process !== "undefined" && process.argv[2]) {
			word = process.argv[2];
		} else {
			word = "Hello";
		}

		const characters = word.toLowerCase().split("");
		const hasUnknownCharacter = characters.some(
			(character) => !Object.prototype.hasOwnProperty.call(morseJS, character),
		);

		if (hasUnknownCharacter) {
			reject("The text contains a character that is not in the Morse object.");
		} else {
			resolve(characters.map((character) => morseJS[character]));
		}
	});
}

function joinWords(morseTranslation) {
	const translation = morseTranslation.join("\n");
	const output = typeof document !== "undefined"
		? document.getElementById("morse-output") || document.body.appendChild(document.createElement("div"))
		: null;

	if (output) {
		output.id = "morse-output";
		output.textContent = translation;
	} else {
		console.log(translation);
	}

	return translation;
}

toJs()
	.then((morseJS) => toMorse(morseJS))
	.then((morseTranslation) => joinWords(morseTranslation))
	.catch((error) => console.log(error));

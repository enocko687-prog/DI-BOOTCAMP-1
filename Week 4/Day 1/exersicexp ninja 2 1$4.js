// Exercise 1: Menu
const menu = [
	{
		type: "starter",
		name: "Houmous with Pita"
	},
	{
		type: "starter",
		name: "Vegetable Soup with Houmous peas"
	},
	{
		type: "dessert",
		name: "Chocolate Cake"
	}
];

const hasDessert = menu.some((course) => course.type === "dessert");
console.log(hasDessert ? "There is a dessert" : "There is no dessert");

const allStarters = menu.every((course) => course.type === "starter");
console.log(allStarters);

const hasMainCourse = menu.some((course) => course.type === "main course");

if (!hasMainCourse) {
	menu.push({
		type: "main course",
		name: "Vegetable Lasagna"
	});
}

const vegetarian = ["vegetable", "houmous", "eggs", "vanilla", "potatoes"];

menu.forEach((course) => {
	const courseName = course.name.toLowerCase();
	course.vegetarian = vegetarian.some((ingredient) => courseName.includes(ingredient));
});

console.log(menu);

// Exercise 2: Chop into chunks
function stringChop(string, chunkLength) {
	const chunks = [];

	for (let index = 0; index < string.length; index += chunkLength) {
		chunks.push(string.slice(index, index + chunkLength));
	}

	return chunks;
}

console.log(stringChop("developers", 2));

// Exercise 3: You said string?
function searchWord(string, word) {
	const words = string.toLowerCase().split(/\s+/);
	const searchTerm = word.toLowerCase();
	const occurrences = words.filter((currentWord) => currentWord === searchTerm).length;

	return `'${word}' was found ${occurrences} times.`;
}

console.log(searchWord("The quick brown fox", "fox"));

// Exercise 4: Reverse Array
function reverseArray(array) {
	let left = 0;
	let right = array.length - 1;

	while (left < right) {
		[array[left], array[right]] = [array[right], array[left]];
		left++;
		right--;
	}

	return array;
}

console.log(reverseArray([1, 2, 3, 4, 5]));
console.log(reverseArray([1, 2]));
console.log(reverseArray([]));
console.log(reverseArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));

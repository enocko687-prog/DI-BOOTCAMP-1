// Exercise 1: Sum elements
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((total, number) => total + number, 0);
console.log(sum);

// Exercise 2: Remove duplicates
const numbersWithDuplicates = [1, 2, 2, 3, 4, 4, 5];
const uniqueNumbers = [...new Set(numbersWithDuplicates)];
console.log(uniqueNumbers);

// Exercise 3: Remove certain values
const values = [NaN, 0, 15, false, -22, "", undefined, 47, null];
const filteredValues = values.filter((value) => value && !Number.isNaN(value));
console.log(filteredValues);

// Exercise 4: Repeat please!
function repeat(string, count = 1) {
	let result = "";

	for (let index = 0; index < count; index++) {
		result += string;
	}

	return result;
}

console.log(repeat("Ha!", 3));

// Exercise 5: Turtle & Rabbit
const startLine = "     ||<- Start line";
let turtle = "🐢";
let rabbit = "🐇";

console.log(startLine);
console.log(turtle.padStart(8));
console.log(rabbit.padStart(8));

turtle = turtle.trim().padEnd(9, "=");
console.log(turtle); // "🐢========"

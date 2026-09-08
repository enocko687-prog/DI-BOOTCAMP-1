// Exercise 1: Analyzing the map method
// Output: [2, 4, 6]
const doubledNumbers = [1, 2, 3].map((num) => {
	if (typeof num === "number") return num * 2;
	return;
});
console.log(doubledNumbers);

// Exercise 2: Analyzing the reduce method
// Output: [1, 2, 0, 1, 2, 3]
const reducedNumbers = [[0, 1], [2, 3]].reduce(
	(acc, cur) => acc.concat(cur),
	[1, 2],
);
console.log(reducedNumbers);

// Exercise 3: Analyze this code
// i is the current array index, so it takes the values 0, 1, 2, 3, 4, and 5.
const arrayNum = [1, 2, 4, 5, 8, 9];
const newArray = arrayNum.map((num, i) => {
	console.log(num, i);
	return num * 2;
});
console.log(newArray);

// Exercise 4: Nested arrays
const array = [[1], [2], [3], [[[4]]], [[[5]]]];
const flattenedArray = array.flat(2);
console.log(flattenedArray); // [1, 2, 3, [4], [5]]

const greeting = [
	["Hello", "young", "grasshopper!"],
	["you", "are"],
	["learning", "fast!"]
];
const joinedGreeting = greeting.map((words) => words.join(" "));
console.log(joinedGreeting); // ["Hello young grasshopper!", "you are", "learning fast!"]

const greetingString = joinedGreeting.join(" ");
console.log(greetingString); // "Hello young grasshopper! you are learning fast!"

const trapped = [[[[[[[[[[[[[[[[[[[[[[[[[[3]]]]]]]]]]]]]]]]]]]]]]]]]];
const freedNumber = trapped.flat(Infinity);
console.log(freedNumber); // [3]

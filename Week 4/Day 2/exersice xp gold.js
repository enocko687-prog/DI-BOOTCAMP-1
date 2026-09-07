// Exercise 1: Print Full Name
function printFullName({ first, last }) {
	return `Your full name is ${first} ${last}`;
}

console.log(printFullName({ first: "Elie", last: "Schoppik" }));

// Exercise 2: Keys and values
function keysAndValues(object) {
	const sortedEntries = Object.entries(object).sort(([firstKey], [secondKey]) => {
		return firstKey.localeCompare(secondKey);
	});

	return [
		sortedEntries.map(([key]) => key),
		sortedEntries.map(([, value]) => value)
	];
}

console.log(keysAndValues({ a: 1, b: 2, c: 3 }));
console.log(keysAndValues({ a: "Apple", b: "Microsoft", c: "Google" }));
console.log(keysAndValues({ key1: true, key2: false, key3: undefined }));

// Exercise 3: Counter class
class Counter {
	constructor() {
		this.count = 0;
	}

	increment() {
		this.count++;
	}
}

const counterOne = new Counter();
counterOne.increment();
counterOne.increment();

const counterTwo = counterOne;
counterTwo.increment();

console.log(counterOne.count); // 3: both variables reference the same Counter object.

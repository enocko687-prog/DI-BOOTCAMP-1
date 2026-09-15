export {};

// Exercise 1: Union Types
function processValue(value: string | number): string {
	if (typeof value === "number") {
		return `$${value.toFixed(2)}`;
	}

	return value.split("").reverse().join("");
}

console.log(processValue(100));
console.log(processValue("TypeScript"));

// Exercise 2: Array Type Annotations
function sumNumbersInArray(values: (number | string)[]): number {
	let total = 0;

	for (const value of values) {
		if (typeof value === "number") {
			total += value;
		}
	}

	return total;
}

console.log(sumNumbersInArray([10, "20", 30, "40"]));
console.log(sumNumbersInArray(["one", "two"]));

// Exercise 3: Type Aliases
type AdvancedUser = {
	name: string;
	age: number;
	address?: string;
};

function introduceAdvancedUser(user: AdvancedUser): string {
	const introduction = `Hello, my name is ${user.name} and I am ${user.age} years old.`;

	return user.address
		? `${introduction} I live at ${user.address}.`
		: introduction;
}

console.log(introduceAdvancedUser({ name: "Alice", age: 25 }));
console.log(
	introduceAdvancedUser({
		name: "Bob",
		age: 30,
		address: "123 Main Street",
	}),
);

// Exercise 4: Optional Parameters
function welcomeUser(name: string, greeting: string = "Hello"): string {
	return `${greeting}, ${name}!`;
}

console.log(welcomeUser("Alice"));
console.log(welcomeUser("Bob", "Good morning"));

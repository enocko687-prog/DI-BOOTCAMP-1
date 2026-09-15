export {};

// Exercise 1: Hello, World!
console.log("Hello, World!");

// Exercise 2: Type Annotations
const age: number = 25;
const name: string = "Alice";
console.log(age, name);

// Exercise 3: Union Types
const id: string | number = 12345;
console.log(id);

// Exercise 4: Control Flow with if...else
function describeNumber(value: number): string {
	if (value > 0) {
		return "The number is positive.";
	} else if (value < 0) {
		return "The number is negative.";
	} else {
        
		return "The number is zero.";
	}
}

console.log(describeNumber(10));
console.log(describeNumber(-5));
console.log(describeNumber(0));

// Exercise 5: Tuple Types
function getDetails(personName: string, personAge: number): [string, number, string] {
	return [
		personName,
		personAge,
		`Hello, ${personName}! You are ${personAge} years old.`,
	];
}

const details = getDetails("Alice", 25);
console.log(details);

// Exercise 6: Object Type Annotations
type Person = {
	name: string;
	age: number;
};

function createPerson(personName: string, personAge: number): Person {
	return { name: personName, age: personAge };
}

console.log(createPerson("Bob", 30));

// Exercise 7: Type Assertions
const inputElement = document.getElementById("name-input") as HTMLInputElement | null;

if (inputElement) {
	inputElement.value = "Alice";
}

// Exercise 8: switch Statement with Complex Conditions
function getAction(role: string): string {
	switch (role.toLowerCase()) {
		case "admin":
			return "Manage users and settings";
		case "editor":
			return "Edit content";
		case "viewer":
			return "View content";
		case "guest":
			return "Limited access";
		default:
			return "Invalid role";
	}
}

console.log(getAction("admin"));
console.log(getAction("editor"));
console.log(getAction("viewer"));
console.log(getAction("guest"));
console.log(getAction("unknown"));

// Exercise 9: Function Overloading with Default Parameters
function greet(): string;
function greet(personName: string): string;
function greet(personName: string = "Guest"): string {
	return `Hello, ${personName}!`;
}

console.log(greet("Alice"));
console.log(greet());

export {};

function validateUnionType(value: any, allowedTypes: string[]): boolean {
	return allowedTypes.includes(typeof value);
}

const userName = "Alice";
const userAge = 25;
const isLoggedIn = true;
const hobbies = ["reading", "coding"];

console.log(validateUnionType(userName, ["string", "number"]));
console.log(validateUnionType(userAge, ["string", "number"]));
console.log(validateUnionType(isLoggedIn, ["string", "number"]));
console.log(validateUnionType(hobbies, ["object"]));

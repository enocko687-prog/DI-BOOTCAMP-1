export {};

// Exercise 1: Conditional Types
type MappedType<T> = T extends number
	? number
	: T extends string
	  ? number
	  : never;

function mapType<T extends number | string>(value: T): MappedType<T> {
	if (typeof value === "number") {
		return (value * value) as MappedType<T>;
	}

	return value.length as MappedType<T>;
}

console.log(mapType(5));
console.log(mapType("TypeScript"));

// Exercise 2: Keyof and Lookup Types
function getProperty<ObjectType, Key extends keyof ObjectType>(
	object: ObjectType,
	key: Key,
): ObjectType[Key] {
	return object[key];
}

const user = {
	name: "Alice",
	age: 25,
	isAdmin: false,
};

console.log(getProperty(user, "name"));
console.log(getProperty(user, "age"));
console.log(getProperty(user, "isAdmin"));

// Exercise 3: Interfaces with Numeric Properties
interface HasNumericProperty {
	[key: string]: number;
}

function multiplyProperty<ObjectType extends HasNumericProperty>(
	object: ObjectType,
	key: keyof ObjectType,
	factor: number,
): number {
	return object[key] * factor;
}

const dimensions: HasNumericProperty = {
	width: 10,
	height: 5,
};

const scores: HasNumericProperty = {
	first: 8,
	second: 12,
};

console.log(multiplyProperty(dimensions, "width", 2));
console.log(multiplyProperty(dimensions, "height", 3));
console.log(multiplyProperty(scores, "second", 4));

export {};

// Exercise 1: Combining intersection types with type guards
interface User {
	name: string;
	email: string;
}

interface Admin {
	adminLevel: number;
}

type AdminUser = User & Admin;

function getProperty(user: AdminUser, propertyName: string): unknown {
	if (propertyName in user) {
		return user[propertyName as keyof AdminUser];
	}

	return undefined;
}

const adminUser: AdminUser = {
	name: "Enock",
	email: "enock@example.com",
	adminLevel: 3,
};

console.log(getProperty(adminUser, "name"));
console.log(getProperty(adminUser, "missingProperty"));

// Exercise 2: Type casting with generics
function castToType<T>(value: unknown, constructor: (value: unknown) => T): T {
	return constructor(value);
}

const castNumber = castToType("42", Number);
const castBoolean = castToType("true", Boolean);

console.log(castNumber);
console.log(castBoolean);

// Exercise 3: Type assertions with generic constraints
function getArrayLength<T extends number | string>(items: T[]): number {
	return items.length as number;
}

const numberArrayLength = getArrayLength([1, 2, 3, 4]);
const stringArrayLength = getArrayLength(["one", "two"]);

console.log(numberArrayLength);
console.log(stringArrayLength);

// Exercise 4: Generic interfaces with class implementation
interface Storage<T> {
	add(item: T): void;
	get(index: number): T | undefined;
}

class Box<T> implements Storage<T> {
	private readonly items: T[] = [];

	add(item: T): void {
		this.items.push(item);
	}

	get(index: number): T | undefined {
		return this.items[index];
	}
}

const numberBox = new Box<number>();
numberBox.add(10);
numberBox.add(20);

const stringBox = new Box<string>();
stringBox.add("first");
stringBox.add("second");

console.log(numberBox.get(1));
console.log(stringBox.get(0));

// Exercise 5: Combining generic classes with constraints
interface Item<T> {
	value: T;
}

class Queue<T> {
	private readonly items: Item<T>[] = [];

	add(item: Item<T>): void {
		this.items.push(item);
	}

	remove(): Item<T> | undefined {
		return this.items.shift();
	}
}

const numberQueue = new Queue<number>();
numberQueue.add({ value: 100 });
numberQueue.add({ value: 200 });

const stringQueue = new Queue<string>();
stringQueue.add({ value: "hello" });

console.log(numberQueue.remove());
console.log(stringQueue.remove());

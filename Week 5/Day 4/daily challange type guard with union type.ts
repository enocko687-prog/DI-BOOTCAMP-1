export {};

type User = {
	type: "user";
	name: string;
	age: number;
};

type Product = {
	type: "product";
	id: number;
	price: number;
};

type Order = {
	type: "order";
	orderId: string;
	amount: number;
};

type DataItem = User | Product | Order;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isUser(value: unknown): value is User {
	return (
		isRecord(value) &&
		value.type === "user" &&
		typeof value.name === "string" &&
		typeof value.age === "number"
	);
}

function isProduct(value: unknown): value is Product {
	return (
		isRecord(value) &&
		value.type === "product" &&
		typeof value.id === "number" &&
		typeof value.price === "number"
	);
}

function isOrder(value: unknown): value is Order {
	return (
		isRecord(value) &&
		value.type === "order" &&
		typeof value.orderId === "string" &&
		typeof value.amount === "number"
	);
}

function handleData(data: DataItem[]): string[] {
	return data.map((item) => {
		if (isUser(item)) {
			return `Hello ${item.name}, you are ${item.age} years old.`;
		}

		if (isProduct(item)) {
			return `Product ${item.id} costs $${item.price}.`;
		}

		if (isOrder(item)) {
			return `Order ${item.orderId} has a total amount of $${item.amount}.`;
		}

		return "Unrecognized data item.";
	});
}

const mixedData: DataItem[] = [
	{ type: "user", name: "Enock", age: 25 },
	{ type: "product", id: 101, price: 19.99 },
	{ type: "order", orderId: "ORD-001", amount: 59.97 },
];

console.log(handleData(mixedData));

const unexpectedData = [{ type: "unknown", value: true }] as unknown as DataItem[];
console.log(handleData(unexpectedData));

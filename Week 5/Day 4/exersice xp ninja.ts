export {};

// Exercise 1: TypeScript generics and intersection types
class Container<T extends object> {
	private readonly items: T[] = [];

	add(item: T): void {
		this.items.push(item);
	}

	remove(): T | undefined {
		return this.items.pop();
	}

	list(): T[] {
		return [...this.items];
	}
}

type Product = {
	name: string;
};

type Inventory = {
	quantity: number;
};

type InventoryProduct = Product & Inventory;

const productContainer = new Container<InventoryProduct>();
productContainer.add({ name: "Notebook", quantity: 12 });
productContainer.add({ name: "Pen", quantity: 30 });

console.log(productContainer.list());
console.log(productContainer.remove());

// Exercise 2: Generic interfaces and type casting
interface Response<T> {
	status: number;
	message: string;
	data: T;
}

function parseResponse<T>(response: Response<unknown>): T {
	return response.data as T;
}

const rawResponse: Response<unknown> = {
	status: 200,
	message: "Success",
	data: { id: 1, title: "TypeScript" },
};

type Article = {
	id: number;
	title: string;
};

const article = parseResponse<Article>(rawResponse);
console.log(article.title);

// Exercise 3: Generic classes and type assertions
class Repository<T> {
	private readonly items: T[] = [];

	add(item: T): void {
		this.items.push(item);
	}

	retrieve(index: number): T | undefined {
		return this.items[index] as T | undefined;
	}

	list(): T[] {
		return [...this.items];
	}
}

const userRepository = new Repository<{ name: string }>();
userRepository.add({ name: "Enock" });
userRepository.add({ name: "Maya" });

console.log(userRepository.retrieve(0));
console.log(userRepository.list());

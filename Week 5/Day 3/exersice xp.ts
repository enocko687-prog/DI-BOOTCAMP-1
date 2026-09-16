export {};

class Employee {
	private name: string;
	private salary: number;
	public position: string;
	protected department: string;

	constructor(
		name: string,
		salary: number,
		position: string,
		department: string
	) {
		this.name = name;
		this.salary = salary;
		this.position = position;
		this.department = department;
	}

	public getEmployeeInfo(): string {
		return `${this.name} - ${this.position}`;
	}
}

const employee = new Employee("Alice", 50000, "Developer", "Engineering");
console.log(employee.getEmployeeInfo());

class Product {
	readonly id: number;
	public name: string;
	public price: number;

	constructor(id: number, name: string, price: number) {
		this.id = id;
		this.name = name;
		this.price = price;
	}

	public getProductInfo(): string {
		return `${this.name}: $${this.price}`;
	}
}

const product = new Product(1, "Keyboard", 49.99);
console.log(product.getProductInfo());
// product.id = 2; // Error: Cannot assign to 'id' because it is readonly.

class Animal {
	public name: string;

	constructor(name: string) {
		this.name = name;
	}

	public makeSound(): string {
		return "Some animal sound";
	}
}

class Dog extends Animal {
	public override makeSound(): string {
		return "bark";
	}
}

const dog = new Dog("Buddy");
console.log(`${dog.name} says ${dog.makeSound()}`);

class Calculator {
	public static add(a: number, b: number): number {
		return a + b;
	}

	public static subtract(a: number, b: number): number {
		return a - b;
	}
}

console.log(Calculator.add(10, 5));
console.log(Calculator.subtract(10, 5));

interface User {
	readonly id: number;
	name: string;
	email: string;
}

interface PremiumUser extends User {
	membershipLevel?: string;
}

function printUserDetails(user: PremiumUser): void {
	console.log(`ID: ${user.id}`);
	console.log(`Name: ${user.name}`);
	console.log(`Email: ${user.email}`);

	if (user.membershipLevel) {
		console.log(`Membership level: ${user.membershipLevel}`);
	}
}

const premiumUser: PremiumUser = {
	id: 101,
	name: "Jordan",
	email: "jordan@example.com",
	membershipLevel: "Gold"
};

printUserDetails(premiumUser);

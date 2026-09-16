export {};

class Employee {
	public name: string;
	private age: number;
	protected salary: number;

	constructor(name: string, age: number, salary: number) {
		this.name = name;
		this.age = age;
		this.salary = salary;
	}

	protected calculateBonus(): number {
		return this.salary * 0.1;
	}

	public getSalaryDetails(): string {
		return `${this.name}'s salary is $${this.salary}`;
	}
}

class Manager extends Employee {
	public override getSalaryDetails(): string {
		const bonus = this.calculateBonus();
		return `${this.name}'s salary is $${this.salary}, with a bonus of $${bonus}`;
	}
}

class ExecutiveManager extends Manager {
	public approveBudget(amount: number): string {
		return `${this.name} approved a budget of $${amount}`;
	}
}

const executiveManager = new ExecutiveManager("Alice", 42, 100000);
console.log(executiveManager.getSalaryDetails());
console.log(executiveManager.approveBudget(250000));
// executiveManager.age; // Error: 'age' is private.
// executiveManager.calculateBonus(); // Error: protected members are not accessible here.

class Shape {
	public static totalShapes = 0;

	constructor() {
		Shape.totalShapes += 1;
	}

	public static getType(): string {
		return "Shape";
	}
}

class Circle extends Shape {
	constructor(public radius: number) {
		super();
	}

	public area(): number {
		return Math.PI * this.radius ** 2;
	}

	public static override getType(): string {
		return "Circle";
	}
}

class Square extends Shape {
	constructor(public side: number) {
		super();
	}

	public area(): number {
		return this.side ** 2;
	}

	public static override getType(): string {
		return "Square";
	}
}

const circle = new Circle(5);
const square = new Square(4);
console.log(`${Circle.getType()} area: ${circle.area()}`);
console.log(`${Square.getType()} area: ${square.area()}`);
console.log(`Total shapes: ${Shape.totalShapes}`);

interface Calculator {
	a: number;
	b: number;
	operate(operation: (a: number, b: number) => number): number;
}

class AdvancedCalculator implements Calculator {
	constructor(public a: number, public b: number) {}

	public operate(operation: (a: number, b: number) => number): number {
		return operation(this.a, this.b);
	}

	public add(): number {
		return this.operate((a, b) => a + b);
	}

	public subtract(): number {
		return this.operate((a, b) => a - b);
	}

	public multiply(): number {
		return this.operate((a, b) => a * b);
	}
}

const advancedCalculator = new AdvancedCalculator(12, 4);
console.log(advancedCalculator.add());
console.log(advancedCalculator.subtract());
console.log(advancedCalculator.multiply());

class Device {
	constructor(public readonly serialNumber: string) {}

	public getDeviceInfo(): string {
		return `Serial number: ${this.serialNumber}`;
	}
}

class Laptop extends Device {
	constructor(
		serialNumber: string,
		public model: string,
		public price: number
	) {
		super(serialNumber);
	}

	public override getDeviceInfo(): string {
		return `${super.getDeviceInfo()}, model: ${this.model}, price: $${this.price}`;
	}
}

const laptop = new Laptop("LAP-001", "ProBook", 1200);
laptop.model = "EliteBook";
laptop.price = 1350;
console.log(laptop.getDeviceInfo());
// laptop.serialNumber = "LAP-002"; // Error: Cannot assign to a readonly property.

interface Product {
	readonly name: string;
	price: number;
	discount?: number;
}

interface Electronics extends Product {
	warrantyPeriod: number;
}

class Smartphone implements Electronics {
	constructor(
		public readonly name: string,
		public price: number,
		public warrantyPeriod: number,
		public discount?: number
	) {}

	public getPriceAfterDiscount(): number {
		return this.discount === undefined
			? this.price
			: this.price * (1 - this.discount / 100);
	}
}

const smartphone = new Smartphone("Pixel", 800, 24, 10);
console.log(`Final price: $${smartphone.getPriceAfterDiscount()}`);
// smartphone.name = "Other phone"; // Error: Cannot assign to a readonly property.

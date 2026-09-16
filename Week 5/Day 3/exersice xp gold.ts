export {};

class Employee {
	protected name: string;
	protected salary: number;

	constructor(name: string, salary: number) {
		this.name = name;
		this.salary = salary;
	}

	public getDetails(): string {
		return `${this.name} earns $${this.salary}`;
	}
}

class Manager extends Employee {
	public department: string;

	constructor(name: string, salary: number, department: string) {
		super(name, salary);
		this.department = department;
	}

	public override getDetails(): string {
		return `${this.name} earns $${this.salary} and manages ${this.department}`;
	}
}

const manager = new Manager("Alice", 75000, "Engineering");
console.log(manager.getDetails());

class Car {
	public readonly make: string;
	private readonly model: string;
	public year: number;

	constructor(make: string, model: string, year: number) {
		this.make = make;
		this.model = model;
		this.year = year;
	}

	public getCarDetails(): string {
		return `${this.make} ${this.model} (${this.year})`;
	}
}

const car = new Car("Toyota", "Corolla", 2024);
console.log(car.getCarDetails());
// car.make = "Honda"; // Error: Cannot assign to 'make' because it is readonly.
// car.model = "Civic"; // Error: 'model' is private and readonly.

class MathUtils {
	public static PI = 3.14159;

	public static circumference(radius: number): number {
		return 2 * MathUtils.PI * radius;
	}
}

console.log(MathUtils.circumference(5));

interface Operation {
	operate(a: number, b: number): number;
}

class Addition implements Operation {
	public operate(a: number, b: number): number {
		return a + b;
	}
}

class Multiplication implements Operation {
	public operate(a: number, b: number): number {
		return a * b;
	}
}

const addition = new Addition();
const multiplication = new Multiplication();
console.log(addition.operate(6, 4));
console.log(multiplication.operate(6, 4));

interface Shape {
	color: string;
	getArea(): number;
}

interface Rectangle extends Shape {
	readonly width: number;
	readonly height: number;
	getPerimeter(): number;
}

class ColoredRectangle implements Rectangle {
	public color: string;
	public readonly width: number;
	public readonly height: number;

	constructor(color: string, width: number, height: number) {
		this.color = color;
		this.width = width;
		this.height = height;
	}

	public getArea(): number {
		return this.width * this.height;
	}

	public getPerimeter(): number {
		return 2 * (this.width + this.height);
	}
}

const rectangle = new ColoredRectangle("blue", 8, 3);
console.log(`Area: ${rectangle.getArea()}`);
console.log(`Perimeter: ${rectangle.getPerimeter()}`);

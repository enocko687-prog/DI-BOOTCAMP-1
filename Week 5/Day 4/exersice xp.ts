type Person = {
	name: string;
	age: number;
};

type Address = {
	street: string;
	city: string;
};

type PersonWithAddress = Person & Address;

const personWithAddress: PersonWithAddress = {
	name: "Enock",
	age: 25,
	street: "Main Street",
	city: "Tel Aviv",
};

function describeValue(value: number | string): string {
	if (typeof value === "number") {
		return "This is a number";
	}

	return "This is a string";
}

const numberDescription = describeValue(42);
const stringDescription = describeValue("TypeScript");

const someValue: any = "This value is stored as any";
const stringValue = someValue as string;
const uppercaseValue = stringValue.toUpperCase();

function getFirstElement(values: Array<number | string>): string {
	return values[0] as string;
}

const firstMixedElement = getFirstElement(["first", 2, "third"]);
const firstStringElement = getFirstElement(["first", "second"]);

function logLength<T extends { length: number }>(value: T): void {
	console.log(value.length);
}

logLength("TypeScript");
logLength([1, 2, 3]);

type Manager = {
	position: "Manager";
	department: string;
};

type Developer = {
	position: "Developer";
	department: string;
};

type Job = Manager | Developer;
type Employee = Person & Job;

function describeEmployee(employee: Employee): string {
	if (employee.position === "Manager") {
		return `${employee.name} is a manager in the ${employee.department} department.`;
	}

	return `${employee.name} is a developer in the ${employee.department} department.`;
}

const manager: Employee = {
	name: "Maya",
	age: 35,
	position: "Manager",
	department: "Engineering",
};

const developer: Employee = {
	name: "Daniel",
	age: 28,
	position: "Developer",
	department: "Engineering",
};

const managerDescription = describeEmployee(manager);
const developerDescription = describeEmployee(developer);

function formatInput<T extends { toString(): string }>(input: T): string {
	const formattedInput = input.toString() as string;
	return formattedInput;
}

const formattedNumber = formatInput(123);
const formattedText = formatInput("hello");

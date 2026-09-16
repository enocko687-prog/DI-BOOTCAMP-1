export {};

interface Book {
	title: string;
	author: string;
	isbn: string;
	publishedYear: number;
	genre?: string;
}

class Library {
	private books: Book[] = [];

	public addBook(book: Book): void {
		this.books.push(book);
	}

	public getBookDetails(isbn: string): string | undefined {
		const book = this.books.find((candidate) => candidate.isbn === isbn);

		if (!book) {
			return undefined;
		}

		const genre = book.genre ? `, genre: ${book.genre}` : "";
		return `${book.title} by ${book.author} (${book.publishedYear})${genre}`;
	}

	protected getBooks(): Book[] {
		return [...this.books];
	}
}

class DigitalLibrary extends Library {
	constructor(public readonly website: string) {
		super();
	}

	public listBooks(): string[] {
		return this.getBooks().map((book) => book.title);
	}
}

const digitalLibrary = new DigitalLibrary("https://example-library.com");

digitalLibrary.addBook({
	title: "The Hobbit",
	author: "J.R.R. Tolkien",
	isbn: "978-0261102217",
	publishedYear: 1937,
	genre: "Fantasy"
});

digitalLibrary.addBook({
	title: "Pride and Prejudice",
	author: "Jane Austen",
	isbn: "978-0141439518",
	publishedYear: 1813,
	genre: "Classic"
});

console.log(digitalLibrary.getBookDetails("978-0261102217"));
console.log(digitalLibrary.getBookDetails("978-0141439518"));
console.log(digitalLibrary.listBooks());

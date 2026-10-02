const { createRequire } = require('module');
const path = require('path');

const requireFromBookApi = createRequire(
	path.resolve(__dirname, '../../book-api/package.json')
);
const express = requireFromBookApi('express');

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(express.json());

let books = [
	{ id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', publishedYear: 1937 },
	{ id: 2, title: '1984', author: 'George Orwell', publishedYear: 1949 },
	{ id: 3, title: 'Pride and Prejudice', author: 'Jane Austen', publishedYear: 1813 }
];

app.get('/api/books', (req, res) => {
	res.status(200).json({ books });
});

app.get('/api/books/:bookId', (req, res) => {
	const bookId = Number(req.params.bookId);
	const book = books.find((item) => item.id === bookId);

	if (!Number.isInteger(bookId) || !book) {
		return res.status(404).json({ message: 'Book not found' });
	}

	return res.status(200).json(book);
});

app.post('/api/books', (req, res) => {
	const { title, author, publishedYear } = req.body;

	if (
		typeof title !== 'string' || !title.trim() ||
		typeof author !== 'string' || !author.trim() ||
		!Number.isInteger(publishedYear)
	) {
		return res.status(400).json({
			message: 'Title, author, and an integer publishedYear are required'
		});
	}

	const newBook = {
		id: books.length ? Math.max(...books.map((book) => book.id)) + 1 : 1,
		title: title.trim(),
		author: author.trim(),
		publishedYear
	};

	books.push(newBook);
	return res.status(201).json(newBook);
});

app.put('/api/books/:bookId', (req, res) => {
	const bookId = Number(req.params.bookId);
	const bookIndex = books.findIndex((item) => item.id === bookId);

	if (!Number.isInteger(bookId) || bookIndex === -1) {
		return res.status(404).json({ message: 'Book not found' });
	}

	const { title, author, publishedYear } = req.body;
	if (
		typeof title !== 'string' || !title.trim() ||
		typeof author !== 'string' || !author.trim() ||
		!Number.isInteger(publishedYear)
	) {
		return res.status(400).json({
			message: 'Title, author, and an integer publishedYear are required'
		});
	}

	books[bookIndex] = {
		id: bookId,
		title: title.trim(),
		author: author.trim(),
		publishedYear
	};

	return res.status(200).json(books[bookIndex]);
});

app.delete('/api/books/:bookId', (req, res) => {
	const bookId = Number(req.params.bookId);
	const bookIndex = books.findIndex((item) => item.id === bookId);

	if (!Number.isInteger(bookId) || bookIndex === -1) {
		return res.status(404).json({ message: 'Book not found' });
	}

	const [deletedBook] = books.splice(bookIndex, 1);
	return res.status(200).json({ message: 'Book deleted successfully', book: deletedBook });
});

app.use((req, res) => {
	res.status(404).json({ message: 'Invalid route' });
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => {
	console.log(`Book API server running on http://localhost:${PORT}`);
});

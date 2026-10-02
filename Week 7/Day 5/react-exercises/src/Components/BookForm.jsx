import { useState } from 'react'

const initialBook = {
  title: '',
  author: '',
  genre: '',
  yearPublished: '',
}

function BookForm() {
  const [book, setBook] = useState(initialBook)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setBook((currentBook) => ({ ...currentBook, [name]: value }))
    setSubmitted(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const bookData = { ...book }
    setBook(bookData)
    console.log('Book submitted:', bookData)
    setSubmitted(true)
  }

  return (
    <div className="forms-layout">
      <h3>New Book</h3>
      <form className="form-fields" onSubmit={handleSubmit}>
        <label className="form-field" htmlFor="book-title">
          Title
          <input
            id="book-title"
            name="title"
            value={book.title}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-field" htmlFor="book-author">
          Author
          <input
            id="book-author"
            name="author"
            value={book.author}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-field" htmlFor="book-genre">
          Genre
          <input
            id="book-genre"
            name="genre"
            value={book.genre}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-field" htmlFor="book-year">
          Year Published
          <input
            id="book-year"
            name="yearPublished"
            type="number"
            min="1"
            max={new Date().getFullYear()}
            value={book.yearPublished}
            onChange={handleChange}
            required
          />
        </label>

        <button className="form-submit" type="submit">Submit</button>
      </form>

      {submitted && (
        <p className="book-success" role="status">
          Book added successfully: {book.title} by {book.author} ({book.genre},{' '}
          {book.yearPublished}).
        </p>
      )}
    </div>
  )
}

export default BookForm
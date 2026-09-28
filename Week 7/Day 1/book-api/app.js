const express = require('express');
const bookRouter = require('./routes/books');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/books', bookRouter);

app.listen(PORT, () => {
  console.log(`Books API running at http://localhost:${PORT}`);
});

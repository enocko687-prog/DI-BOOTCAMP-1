const express = require('express');
const todoRouter = require('./routes/todos');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/todos', todoRouter);

app.listen(PORT, () => {
  console.log(`Todo API running at http://localhost:${PORT}`);
});

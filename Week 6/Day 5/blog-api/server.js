const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

const posts = [
  { id: 1, title: 'First Post', content: 'This is the first blog post.' },
  { id: 2, title: 'Second Post', content: 'This is the second blog post.' }
];

app.get('/posts', (req, res) => {
  res.status(200).json(posts);
});

app.get('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find((item) => item.id === id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  return res.status(200).json(post);
});

app.post('/posts', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newPost = {
    id: posts.length ? posts[posts.length - 1].id + 1 : 1,
    title,
    content
  };

  posts.push(newPost);
  return res.status(201).json(newPost);
});

app.put('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const updatedPost = { ...posts[index], ...req.body, id };
  posts[index] = updatedPost;

  return res.status(200).json(updatedPost);
});

app.delete('/posts/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const deletedPost = posts.splice(index, 1)[0];
  return res.status(200).json({ message: 'Post deleted', post: deletedPost });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Invalid route' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Blog API running on http://localhost:${PORT}`);
});

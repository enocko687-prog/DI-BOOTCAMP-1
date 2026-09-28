const express = require('express');
const app = express();
const router = express.Router();

const PORT = 3000;

app.use(express.json());

const posts = [
  {
    id: 1,
    title: 'Welcome to My Blog',
    content: 'This is my first blog post.',
    timestamp: new Date().toISOString()
  }
];

router.get('/posts', (req, res) => {
  res.json(posts);
});

router.get('/posts/:id', (req, res) => {
  const { id } = req.params;
  const post = posts.find((item) => item.id === Number(id));

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  return res.json(post);
});

router.post('/posts', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newPost = {
    id: posts.length ? posts[posts.length - 1].id + 1 : 1,
    title,
    content,
    timestamp: new Date().toISOString()
  };

  posts.push(newPost);
  return res.status(201).json(newPost);
});

router.put('/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const postIndex = posts.findIndex((item) => item.id === Number(id));

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  if (!title && !content) {
    return res.status(400).json({ message: 'Please provide title or content to update' });
  }

  posts[postIndex] = {
    ...posts[postIndex],
    title: title ?? posts[postIndex].title,
    content: content ?? posts[postIndex].content,
    timestamp: new Date().toISOString()
  };

  return res.json(posts[postIndex]);
});

router.delete('/posts/:id', (req, res) => {
  const { id } = req.params;
  const postIndex = posts.findIndex((item) => item.id === Number(id));

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const deletedPost = posts.splice(postIndex, 1)[0];
  return res.json({ message: 'Post deleted successfully', post: deletedPost });
});

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Blog API running on http://localhost:${PORT}`);
});

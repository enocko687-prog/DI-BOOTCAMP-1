const express = require('express');
const { fetchPosts } = require('./data/dataService');

const app = express();
const PORT = 5000;

app.get('/posts', async (req, res) => {
  try {
    const posts = await fetchPosts();
    console.log('Data retrieved successfully from JSONPlaceholder');
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Invalid route' });
});

app.listen(PORT, () => {
  console.log(`CRUD API running on http://localhost:${PORT}`);
});

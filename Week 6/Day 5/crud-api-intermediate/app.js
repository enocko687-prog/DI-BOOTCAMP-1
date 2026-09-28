const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(express.json());

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

app.get('/api/posts', async (req, res) => {
  try {
    const response = await axios.get(BASE_URL);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/${req.params.id}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const response = await axios.post(BASE_URL, req.body);
    return res.status(201).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const response = await axios.put(`${BASE_URL}/${req.params.id}`, req.body);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${req.params.id}`);
    return res.status(200).json({ message: 'Post deleted successfully', status: response.status });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Post not found' });
    }
    return res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Intermediate CRUD API running on http://localhost:${PORT}`);
});

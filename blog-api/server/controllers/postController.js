const postModel = require('../models/postModel');

function parsePostId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validatePost(title, content) {
  return typeof title === 'string' && title.trim() &&
    typeof content === 'string' && content.trim();
}

async function getAllPosts(req, res) {
  const posts = await postModel.getAllPosts();
  return res.status(200).json(posts);
}

async function getPostById(req, res) {
  const id = parsePostId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Post id must be a positive integer' });
  }

  const post = await postModel.getPostById(id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  return res.status(200).json(post);
}

async function createPost(req, res) {
  const { title, content } = req.body || {};
  if (!validatePost(title, content)) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const post = await postModel.createPost(title.trim(), content.trim());
  return res.status(201).json(post);
}

async function updatePost(req, res) {
  const id = parsePostId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Post id must be a positive integer' });
  }

  const { title, content } = req.body || {};
  if (!validatePost(title, content)) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const post = await postModel.updatePost(id, title.trim(), content.trim());
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  return res.status(200).json(post);
}

async function deletePost(req, res) {
  const id = parsePostId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Post id must be a positive integer' });
  }

  const post = await postModel.deletePost(id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  return res.status(200).json({ message: 'Post deleted successfully', post });
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};
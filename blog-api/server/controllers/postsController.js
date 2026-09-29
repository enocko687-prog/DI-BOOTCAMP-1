const posts = require("../models/postModel");

function parseId(value, res) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: "Post id must be a positive integer" });
    return null;
  }
  return id;
}

function validateFields(body, res, { requireBoth = false } = {}) {
  const { title, content } = body || {};
  if (requireBoth && (typeof title !== "string" || typeof content !== "string")) {
    res.status(400).json({ error: "title and content are required strings" });
    return null;
  }
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    res.status(400).json({ error: "title must be a non-empty string" });
    return null;
  }
  if (content !== undefined && typeof content !== "string") {
    res.status(400).json({ error: "content must be a string" });
    return null;
  }
  if (!requireBoth && title === undefined && content === undefined) {
    res.status(400).json({ error: "Provide title or content to update" });
    return null;
  }
  return {
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(content !== undefined ? { content } : {}),
  };
}

async function listPosts(req, res) {
  res.json(await posts.findAll());
}

async function getPost(req, res) {
  const id = parseId(req.params.id, res);
  if (id === null) return;
  const post = await posts.findById(id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

async function createPost(req, res) {
  const fields = validateFields(req.body, res, { requireBoth: true });
  if (!fields) return;
  const post = await posts.create({ title: fields.title.trim(), content: fields.content });
  res.status(201).json(post);
}

async function updatePost(req, res) {
  const id = parseId(req.params.id, res);
  if (id === null) return;
  const fields = validateFields(req.body, res);
  if (!fields) return;
  const post = await posts.update(id, fields);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
}

async function deletePost(req, res) {
  const id = parseId(req.params.id, res);
  if (id === null) return;
  const deleted = await posts.remove(id);
  if (!deleted) return res.status(404).json({ error: "Post not found" });
  res.status(204).end();
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost };

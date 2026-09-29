const express = require("express");
const postRoutes = require("./routes/posts");

const app = express();

app.use(express.json());
app.use("/posts", postRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.status ? err.message : "Internal server error",
  });
});

module.exports = app;

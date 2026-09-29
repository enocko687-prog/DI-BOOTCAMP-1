const express = require("express");
const controller = require("../controllers/postsController");

const router = express.Router();

router.get("/", controller.listPosts);
router.get("/:id", controller.getPost);
router.post("/", controller.createPost);
router.put("/:id", controller.updatePost);
router.delete("/:id", controller.deletePost);

module.exports = router;

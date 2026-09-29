const express = require("express");
const controller = require("../controllers/booksController");

const router = express.Router();

router.get("/", controller.listBooks);
router.get("/:bookId", controller.getBook);
router.post("/", controller.createBook);
router.put("/:bookId", controller.updateBook);
router.delete("/:bookId", controller.deleteBook);

module.exports = router;

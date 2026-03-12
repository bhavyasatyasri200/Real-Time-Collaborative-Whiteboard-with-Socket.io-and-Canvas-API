const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");

router.post("/", boardController.createBoard);

router.post("/:boardId", boardController.saveBoard);

router.get("/:boardId", boardController.getBoard);

module.exports = router;
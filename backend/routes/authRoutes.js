const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/session", authController.getSession);

module.exports = router;
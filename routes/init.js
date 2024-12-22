const express = require("express");
const router = express.Router();
const db = require("../models");
const InitService = require("../services/InitService");
const initService = new InitService(db);

// Initialize database with data
router.post("/", async (req, res, next) => {
  try {
    const result = await initService.init();
    return res.status(201).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

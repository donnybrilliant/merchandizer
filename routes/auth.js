const express = require("express");
const router = express.Router();
const db = require("../models");
const AuthService = require("../services/AuthService");
const authService = new AuthService(db);
const { validateLogin, validateRegister } = require("../middleware/validation");

// Login Route
router.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await authService.login(email, password);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// Register Route
router.post("/register", validateRegister, async (req, res, next) => {
  try {
    await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

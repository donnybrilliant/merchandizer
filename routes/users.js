const express = require("express");
const router = express.Router();
const db = require("../models");
const UserService = require("../services/UserService");
const isAuth = require("../middleware/auth");
const userService = new UserService(db);
const { validatePhoneNumber } = require("../middleware/validation");

router.use(isAuth);

// Get current user
router.get("/me", async (req, res, next) => {
  try {
    const user = await userService.getById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

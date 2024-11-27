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
// Update current user
router.put("/me", validatePhoneNumber, async (req, res, next) => {
  const { firstName, lastName, phone } = req.body;
  const userId = req.user.id;

  if (!firstName && !lastName && !phone) {
    return res.status(400).json({
      success: false,
      error: "At least one field must be provided to update",
    });
  }

  try {
    // Prepare update data
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    // Update user in the database
    const updatedUser = await userService.update(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "No changes made to profile",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

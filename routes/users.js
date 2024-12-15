const express = require("express");
const router = express.Router();
const db = require("../models");
const UserService = require("../services/UserService");
const userService = new UserService(db);
const createError = require("http-errors");
const { multerUpload, uploadToS3, resizeImage } = require("../utils/upload");
const { isAuth, adminOnly } = require("../middleware/auth");
const { validateUserUpdate } = require("../middleware/validation");

router.use(isAuth);

// Get all users
router.get("/", adminOnly, async (req, res, next) => {
  try {
    const users = await userService.getAll();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
});

// Get current user
router.get("/me", async (req, res, next) => {
  try {
    const user = await userService.getById(req.user.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// Update current user
router.put("/me", validateUserUpdate, async (req, res, next) => {
  const { firstName, lastName, phone } = req.body;
  const userId = req.user.id;

  try {
    // Prepare update data
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    const updatedUser = await userService.update(userId, updateData);

    if (updatedUser.noChanges) {
      return res.status(200).json({
        success: true,
        message: "No changes made to profile",
        data: updatedUser.data,
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

// Delete current user
router.delete("/me", async (req, res, next) => {
  // this needs to be updated, as a transaction to remove associated data
  const userId = req.user.id;

  try {
    const user = await userService.getById(userId);

    const deletedUser = await userService.delete(userId);
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: deletedUser,
    });
  } catch (err) {
    next(err);
  }
});

// Update user avatar
router.put(
  "/me/avatar",
  multerUpload.single("avatar"),
  async (req, res, next) => {
    const userId = req.user.id;

    if (!req.file) {
      throw createError(400, "No avatar file provided");
    }

    try {
      // Resize and convert image to PNG
      const resizedBuffer = await resizeImage(req.file.buffer, 400, 400);

      // Create/update avatar in S3
      const key = `users/${userId}-avatar.png`;
      const imageUrl = await uploadToS3(key, resizedBuffer, "image/png");

      const updatedUser = await userService.update(userId, {
        avatar: imageUrl,
      });

      if (updatedUser.noChanges) {
        return res.status(200).json({
          success: true,
          message: "No changes made to avatar",
          data: updatedUser.data,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Avatar updated successfully",
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

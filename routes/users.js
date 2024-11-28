const express = require("express");
const router = express.Router();
const db = require("../models");
const UserService = require("../services/UserService");
const userService = new UserService(db);
const multer = require("multer");
const sharp = require("sharp");
const { isAuth } = require("../middleware/auth");
const { validatePhoneNumber } = require("../middleware/validation");

router.use(isAuth);

// Get all users
router.get("/", async (req, res, next) => {
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

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        avatar: user.avatar ? "/users/me/avatar" : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update current user
router.patch("/me", validatePhoneNumber, async (req, res, next) => {
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

// Delete current user
router.delete("/me", async (req, res, next) => {
  // this needs to be updated, as a transaction to remove associated data
  const userId = req.user.id;

  try {
    const user = await userService.getById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await userService.delete(userId);
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// Multer setup for avatar uploads
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Update user avatar
router.patch("/me/avatar", upload.single("avatar"), async (req, res, next) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "No avatar file provided",
    });
  }

  try {
    // Resize and convert the image to PNG
    const resizedBuffer = await sharp(req.file.buffer)
      .resize(300, 300)
      .png()
      .toBuffer();

    // Update user's avatar and MIME type
    const updateData = {
      avatar: resizedBuffer,
    };

    const updatedUser = await userService.update(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// Get avatar
router.get("/me/avatar", async (req, res, next) => {
  const userId = req.user.id;

  try {
    const user = await userService.getById(userId);

    if (!user || !user.avatar) {
      return res.status(404).json({
        success: false,
        error: "Avatar not found",
      });
    }

    res.set("Content-Type", "image/png");
    return res.send(user.avatar);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

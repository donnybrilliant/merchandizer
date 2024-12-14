const express = require("express");
const router = express.Router();
const db = require("../models");
const UserService = require("../services/UserService");
const userService = new UserService(db);
const multer = require("multer");
const sharp = require("sharp");
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
router.put("/me", validateUserUpdate, async (req, res, next) => {
  const { firstName, lastName, phone } = req.body;
  const userId = req.user.id;

  try {
    // Prepare update data
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    // Update user in the database
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
    throw createError(400, "No avatar file provided");
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

    if (updatedUser.noChanges) {
      return res.status(200).json({
        success: true,
        message: "No changes made to avatar",
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

    if (!user.avatar) {
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

const express = require("express");
const router = express.Router();
const db = require("../models");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UserService = require("../services/UserService");
const userService = new UserService(db);
const { hashPassword } = require("../utils/hashPassword"); // Import the utility
const { isAuth } = require("../middleware/auth");
const { validateLogin, validateRegister } = require("../middleware/validation");

// Login Route
router.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userService.getByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Incorrect email or password" });
    }

    // Hash the provided password with the users salt
    const { hashedPassword } = await hashPassword(password, user.salt);

    // Verify the hashed password
    if (!crypto.timingSafeEqual(user.encryptedPassword, hashedPassword)) {
      return res
        .status(401)
        .json({ success: false, error: "Incorrect email or password" });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "You are logged in",
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Register Route
router.post("/register", validateRegister, async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await userService.getByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Email is already in use",
      });
    }

    // Hash the new password and generate a salt
    const { hashedPassword, salt } = await hashPassword(password);

    // Create the new user
    await userService.create({
      firstName,
      lastName,
      email,
      encryptedPassword: hashedPassword,
      salt,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// Change password route
router.patch("/users/me/password", isAuth, async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: "Both oldPassword and newPassword are required",
    });
  }

  try {
    const user = await userService.getByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify old password
    const { hashedPassword: oldHashedPassword } = await hashPassword(
      oldPassword,
      user.salt
    );
    if (!crypto.timingSafeEqual(user.encryptedPassword, oldHashedPassword)) {
      return res.status(400).json({
        success: false,
        error: "Incorrect old password",
      });
    }

    // Hash the new password
    const { hashedPassword: newHashedPassword, salt: newSalt } =
      await hashPassword(newPassword);

    // Update the password
    await userService.changePassword(userId, newHashedPassword, newSalt);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

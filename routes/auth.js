const express = require("express");
const router = express.Router();
const db = require("../models");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserService = require("../services/UserService");
const userService = new UserService(db);
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

    crypto.pbkdf2(
      password,
      user.salt,
      310000,
      32,
      "sha256",
      (err, hashedPassword) => {
        if (err) return next(err);

        if (!crypto.timingSafeEqual(user.encryptedPassword, hashedPassword)) {
          return res
            .status(401)
            .json({ success: false, error: "Incorrect email or password" });
        }

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
      }
    );
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

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async (err, hashedPassword) => {
        if (err) return next(err);

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
      }
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;

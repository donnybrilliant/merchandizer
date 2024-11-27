const { check, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errorMessages,
    });
  }
  next();
};

// Login validation
const validateLogin = [
  check("email").isEmail().withMessage("A valid email is required"),
  check("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Register validation
const validateRegister = [
  check("firstName").notEmpty().withMessage("First name is required"),
  check("lastName").notEmpty().withMessage("Last name is required"),
  check("email").isEmail().withMessage("A valid email is required"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  handleValidationErrors,
];

const validatePhoneNumber = [
  check("phone").isMobilePhone("any").withMessage("Invalid phone number"),
];

const validateNewPassword = [
  check("oldPassword").notEmpty().withMessage("Old password is required"),
  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
];

module.exports = {
  validateLogin,
  validateRegister,
  validatePhoneNumber,
  validateNewPassword,
};

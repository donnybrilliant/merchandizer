const { check, body, query, validationResult } = require("express-validator");
const createError = require("http-errors");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return next(
      createError(400, "Validation Error", {
        details: errorMessages,
      })
    );
  }
  next();
};

// Reusable middleware to ensure body is not empty
const validateNonEmptyBody = () => {
  return body().custom((value, { req }) => {
    if (!Object.keys(req.body).length) {
      throw new Error("At least one field must is required for updating");
    }
    return true;
  });
};

// Validate query parameters for searching
const validateQueryParams = (allowedParams) => [
  query().custom((_, { req }) => {
    const disallowedKeys = Object.keys(req.query).filter(
      (key) => !allowedParams.includes(key)
    );

    if (disallowedKeys.length > 0) {
      throw new Error(
        `Invalid query parameter: ${disallowedKeys.join(
          ", "
        )}. Allowed parameters are: ${allowedParams.join(", ")}`
      );
    }

    return true;
  }),
];

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

// Phone number validation
const validateUserUpdate = [
  validateNonEmptyBody(),
  check("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
  handleValidationErrors,
];

// Change password validation
const validateNewPassword = [
  check("oldPassword").notEmpty().withMessage("Old password is required"),
  check("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
  handleValidationErrors,
];

// Artist validation
const validateArtist = [
  check("name").notEmpty().withMessage("Name is required"),
  handleValidationErrors,
];

// Tour validation
const validateTour = [
  check("name").notEmpty().withMessage("Tour name is required"),
  check("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date (YYYY-MM-DD)"),
  check("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date (YYYY-MM-DD)")
    .custom((endDate, { req }) => {
      const startDate = req.body.startDate;
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  check("artistId")
    .notEmpty()
    .withMessage("Artist ID is required")
    .isInt()
    .withMessage("Artist ID must be an integer"),
  handleValidationErrors,
];

const validateTourUpdate = [
  validateNonEmptyBody(),
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Tour name must not be empty"),
  check("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date (YYYY-MM-DD)"),
  check("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date (YYYY-MM-DD)")
    .custom((endDate, { req }) => {
      const startDate = req.body.startDate;
      if (startDate && new Date(endDate) < new Date(startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  check("artistId")
    .optional()
    .isInt()
    .withMessage("Artist ID must be a valid integer"),
  handleValidationErrors,
];

// Regex to validate time in HH:mm format
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Show validation
const validateShow = [
  check("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date (YYYY-MM-DD)"),
  check("venue").notEmpty().withMessage("Venue is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("country").notEmpty().withMessage("Country is required"),
  check("artistId")
    .notEmpty()
    .withMessage("Artist ID is required")
    .isInt()
    .withMessage("Artist ID must be an integer"),
  check("tourId")
    .notEmpty()
    .withMessage("Tour ID is required")
    .isInt()
    .withMessage("Tour ID must be an integer"),
  check("getInTime")
    .optional()
    .matches(timeRegex)
    .withMessage("getInTime must be a valid time in HH:mm format"),
  check("loadOutTime")
    .optional()
    .matches(timeRegex)
    .withMessage("loadOutTime must be a valid time in HH:mm format"),
  check("doorsTime")
    .optional()
    .matches(timeRegex)
    .withMessage("doorsTime must be a valid time in HH:mm format"),
  check("onStageTime")
    .optional()
    .matches(timeRegex)
    .withMessage("onStageTime must be a valid time in HH:mm format"),
  handleValidationErrors,
];

const validateMultipleShows = [
  body().isArray().withMessage("Request body must be a an array of shows"),
  validateNonEmptyBody(),
  body("*.date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date (YYYY-MM-DD)"),
  body("*.venue").notEmpty().withMessage("Venue is required"),
  body("*.city").notEmpty().withMessage("City is required"),
  body("*.country").notEmpty().withMessage("Country is required"),
  body("*.artistId")
    .notEmpty()
    .withMessage("Artist ID is required")
    .isInt()
    .withMessage("Artist ID must be an integer"),
  check("tourId")
    .notEmpty()
    .withMessage("Tour ID is required")
    .isInt()
    .withMessage("Tour ID must be an integer"),
  check("getInTime")
    .optional()
    .matches(timeRegex)
    .withMessage("getInTime must be a valid time in HH:mm format"),
  check("loadOutTime")
    .optional()
    .matches(timeRegex)
    .withMessage("loadOutTime must be a valid time in HH:mm format"),
  check("doorsTime")
    .optional()
    .matches(timeRegex)
    .withMessage("doorsTime must be a valid time in HH:mm format"),
  check("onStageTime")
    .optional()
    .matches(timeRegex)
    .withMessage("onStageTime must be a valid time in HH:mm format"),
  handleValidationErrors,
];

// Update show validation
const validateShowUpdate = [
  validateNonEmptyBody(),
  check("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid date (YYYY-MM-DD)"),
  check("venue").optional().notEmpty().withMessage("Venue must not be empty"),
  check("city").optional().notEmpty().withMessage("City must not be empty"),
  check("country")
    .optional()
    .notEmpty()
    .withMessage("Country must not be empty"),
  check("artistId")
    .optional()
    .isInt()
    .withMessage("Artist ID must be an integer"),
  check("getInTime")
    .optional()
    .matches(timeRegex)
    .withMessage("getInTime must be a valid time in HH:mm format"),
  check("loadOutTime")
    .optional()
    .matches(timeRegex)
    .withMessage("loadOutTime must be a valid time in HH:mm format"),
  check("doorsTime")
    .optional()
    .matches(timeRegex)
    .withMessage("doorsTime must be a valid time in HH:mm format"),
  check("onStageTime")
    .optional()
    .matches(timeRegex)
    .withMessage("onStageTime must be a valid time in HH:mm format"),
  handleValidationErrors,
];

// Category validation
const validateCategory = [
  check("name").notEmpty().withMessage("Category name is required"),
  handleValidationErrors,
];

// Product validation
const validateProduct = [
  check("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 100 })
    .withMessage("Product name must not exceed 100 characters"),
  check("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  check("color")
    .optional()
    .isLength({ max: 30 })
    .withMessage("Color must not exceed 30 characters"),
  check("size")
    .optional()
    .isLength({ max: 10 })
    .withMessage("Size must not exceed 10 characters"),
  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isDecimal({ decimal_digits: "2" })
    .withMessage(
      "Price must be a valid decimal number with up to 2 decimal places"
    ),
  check("categoryId")
    .optional()
    .isInt()
    .withMessage("Category ID must be a valid integer"),
  check("artistId")
    .notEmpty()
    .withMessage("Artist ID is required")
    .isInt()
    .withMessage("Artist ID must be a valid integer"),
  handleValidationErrors,
];

// Update product validation
const validateProductUpdate = [
  validateNonEmptyBody(),
  check("name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Product name must not exceed 100 characters"),
  check("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  check("color")
    .optional()
    .isLength({ max: 30 })
    .withMessage("Color must not exceed 30 characters"),
  check("size")
    .optional()
    .isLength({ max: 10 })
    .withMessage("Size must not exceed 10 characters"),
  check("price")
    .optional()
    .isDecimal({ decimal_digits: "2" })
    .withMessage(
      "Price must be a valid decimal number with up to 2 decimal places"
    ),
  check("categoryId")
    .optional()
    .isInt()
    .withMessage("Category ID must be a valid integer"),
  check("artistId")
    .optional()
    .isInt()
    .withMessage("Artist ID must be a valid integer"),
  handleValidationErrors,
];

// Single inventory validation
const validateSingleInventory = [
  check("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt()
    .withMessage("Product ID must be an integer"),
  check("startInventory")
    .notEmpty()
    .withMessage("Start inventory is required")
    .isInt({ min: 0 })
    .withMessage("Start inventory must be a non-negative integer"),
  check("endInventory")
    .optional()
    .isInt({ min: 0 })
    .withMessage("End inventory must be a non-negative integer"),
  handleValidationErrors,
];

// Update single inventory validation
const validateSingleInventoryUpdate = [
  validateNonEmptyBody(),
  check("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt()
    .withMessage("Product ID must be an integer"),
  check("startInventory")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Start inventory must be a non-negative integer"),
  check("endInventory")
    .optional()
    .isInt({ min: 0 })
    .withMessage("End inventory must be a non-negative integer"),
  handleValidationErrors,
];

// Multiple inventory validation
const validateMultipleInventory = [
  body()
    .isArray()
    .withMessage("Request body must be an array of inventory items"),
  validateNonEmptyBody(),
  body("*.productId")
    .if((value, { req }) => Array.isArray(req.body))
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt()
    .withMessage("Product ID must be an integer"),
  body("*.startInventory")
    .if((value, { req }) => Array.isArray(req.body))
    .notEmpty()
    .withMessage("Start inventory is required")
    .isInt({ min: 0 })
    .withMessage("Start inventory must be a non-negative integer"),
  body("*.endInventory")
    .optional()
    .isInt({ min: 0 })
    .withMessage("End inventory must be a non-negative integer"),
  handleValidationErrors,
];

// Update multiple inventory validation
const validateMultipleInventoryUpdate = [
  body()
    .isArray()
    .withMessage("Request body must be an array of inventory items"),
  validateNonEmptyBody(),
  body("*.productId")
    .if((value, { req }) => Array.isArray(req.body))
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt()
    .withMessage("Product ID must be an integer"),
  body("*.startInventory")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Start inventory must be a non-negative integer"),
  body("*.endInventory")
    .optional()
    .isInt({ min: 0 })
    .withMessage("End inventory must be a non-negative integer"),
  handleValidationErrors,
];

// Adjustment validation
const validateAdjustment = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt()
    .withMessage("Product ID must be an integer"),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer."),
  body("reason").notEmpty().withMessage("Reason is required."),
  body("type")
    .isIn(["giveaway", "discount", "loss", "restock"])
    .withMessage("Type must be one of: giveaway, discount, loss, restock"),
  body("discountValue")
    .if((value, { req }) => req.body.type === "discount")
    .notEmpty()
    .withMessage("Discount value is required for type 'discount'")
    .isDecimal({ decimal_digits: "2" })
    .withMessage("Discount value must be a positive decimal number."),
  body("discountType")
    .if((value, { req }) => req.body.type === "discount")
    .notEmpty()
    .withMessage("Discount type is required for type 'discount'")
    .isIn(["fixed", "percentage"])
    .withMessage("Discount type must be 'fixed' or 'percentage'."),
  body("discountValue")
    .if((value, { req }) => req.body.type !== "discount")
    .isEmpty()
    .withMessage("Discount value is not allowed unless type is 'discount'"),
  body("discountType")
    .if((value, { req }) => req.body.type !== "discount")
    .isEmpty()
    .withMessage("Discount type is not allowed unless type is 'discount'"),
  handleValidationErrors,
];

// Update adjustment validation
const validateAdjustmentUpdate = [
  validateNonEmptyBody(),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer."),
  body("reason").optional().notEmpty().withMessage("Reason must not be empty."),
  body("type")
    .optional()
    .isIn(["giveaway", "discount", "loss", "restock"])
    .withMessage("Type must be one of: giveaway, discount, loss, restock"),
  body("discountValue")
    .optional()
    .if((value, { req }) => req.body.type === "discount")
    .notEmpty()
    .withMessage("Discount value is required for type 'discount'")
    .isDecimal({ decimal_digits: "2" })
    .withMessage("Discount value must be a positive decimal number."),
  body("discountType")
    .optional()
    .if((value, { req }) => req.body.type === "discount")
    .notEmpty()
    .withMessage("Discount type is required for type 'discount'")
    .isIn(["fixed", "percentage"])
    .withMessage("Discount type must be 'fixed' or 'percentage'."),
  body("discountValue")
    .optional()
    .if((value, { req }) => req.body.type !== "discount")
    .isEmpty()
    .withMessage("Discount value is not allowed unless type is 'discount'"),
  body("discountType")
    .optional()
    .if((value, { req }) => req.body.type !== "discount")
    .isEmpty()
    .withMessage("Discount type is not allowed unless type is 'discount'"),
  handleValidationErrors,
];

// Search Shows Validation
const validateShowSearch = [
  ...validateQueryParams(["city", "venue", "date", "country", "artist"]),
  check("city").optional().isString().withMessage("City must be a string"),
  check("venue").optional().isString().withMessage("Venue must be a string"),
  check("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date (YYYY-MM-DD)"),
  check("country")
    .optional()
    .isString()
    .withMessage("Country must be a string"),
  check("artist").optional().isString().withMessage("Artist must be a string"),
  handleValidationErrors,
];

// Search Products Validation
const validateProductSearch = [
  ...validateQueryParams([
    "name",
    "category",
    "artist",
    "color",
    "size",
    "minPrice",
    "maxPrice",
  ]),
  check("name").optional().isString().withMessage("Name must be a string"),
  check("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
  check("artist").optional().isString().withMessage("Artist must be a string"),
  check("color").optional().isString().withMessage("Color must be a string"),
  check("minPrice")
    .optional()
    .isDecimal()
    .withMessage("Min price must be a decimal number"),
  check("maxPrice")
    .optional()
    .isDecimal()
    .withMessage("Max price must be a decimal number"),
  handleValidationErrors,
];

// Search Categories Validation
const validateCategorySearch = [
  ...validateQueryParams(["name"]),
  check("name").optional().isString().withMessage("Name must be a string"),
  handleValidationErrors,
];

// Search Artists Validation
const validateArtistSearch = [
  ...validateQueryParams(["name"]),
  check("name").optional().isString().withMessage("Name must be a string"),
  handleValidationErrors,
];

module.exports = {
  validateLogin,
  validateRegister,
  validateUserUpdate,
  validateNewPassword,
  validateArtist,
  validateTour,
  validateTourUpdate,
  validateShow,
  validateMultipleShows,
  validateShowUpdate,
  validateCategory,
  validateProduct,
  validateProductUpdate,
  validateSingleInventory,
  validateSingleInventoryUpdate,
  validateMultipleInventory,
  validateMultipleInventoryUpdate,
  validateAdjustment,
  validateAdjustmentUpdate,
  validateCategorySearch,
  validateArtistSearch,
  validateProductSearch,
  validateShowSearch,
};

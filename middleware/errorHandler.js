const createError = require("http-errors");

// Error handler for non existing endpoints
function notFoundHandler(req, res, next) {
  next(createError(404, "Endpoint not found"));
}

// Error handler
function errorHandler(err, req, res, next) {
  if (err.name === "SequelizeForeignKeyConstraintError") {
    err.status = 400;
    err.message =
      "Cannot delete this because it is being used by another resource";
  }
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(err.details && { details: err.details }),
  });
}

module.exports = { notFoundHandler, errorHandler };

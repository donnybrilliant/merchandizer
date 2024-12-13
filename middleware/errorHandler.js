const createError = require("http-errors");

// Error handler for non existing endpoints
function notFoundHandler(req, res, next) {
  next(createError(404, "Endpoint not found"));
}

// Error handler
function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(err.details && { details: err.details }),
  });
}

module.exports = { notFoundHandler, errorHandler };

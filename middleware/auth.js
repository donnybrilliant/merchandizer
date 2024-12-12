const jwt = require("jsonwebtoken");
const db = require("../models");
const RoleService = require("../services/RoleService");
const roleService = new RoleService(db);

// Middleware to validate and authenticate API requests using JWT
function isAuth(req, res, next) {
  // Get JWT token from headers
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "No JWT token provided" });
  }

  try {
    // Verify the token and get decoded data
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    // Attach user to request object
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid JWT token" });
  }
}
// Middleware to restrict access to users with admin role
function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, error: "Admin access required" });
}

// Middleware to authorize a users action based on their role in a tour
function authorize(action) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const { tourId } = req.params;

      // If admin, continue
      if (user.role === "admin") {
        return next();
      }

      // If no tourId in params
      if (!tourId) {
        return res.status(403).json({ success: false, error: "Forbidden" });
      }

      // Find users role for this tour
      const userRoleTour = await roleService.checkUserRoleTour(user.id, tourId);

      if (!userRoleTour) {
        return res
          .status(403)
          .json({ success: false, error: "No access to this tour" });
      }

      // Check if the users role permits the requested action
      const canProceed = checkPermissions(userRoleTour.role, action);
      if (!canProceed) {
        return res
          .status(403)
          .json({ success: false, error: "Insufficient permissions" });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

// Check permissions for user role and the action they want to do
function checkPermissions(userRole, action) {
  const permissions = {
    manager: [
      "viewTour",
      "viewShows",
      "viewInventory",
      "viewAdjustments",
      "viewStats",
      "manageTour",
      "manageShows",
      "manageInventory",
      "manageAdjustments",
      "manageUsers",
      "deleteInventory",
    ],
    sales: [
      "viewTour",
      "viewShows",
      "viewInventory",
      "viewAdjustments",
      "viewStats",
      "manageInventory",
      "manageAdjustments",
    ],
    viewer: ["viewTour", "viewShows", "viewInventory", "viewStats"],
  };

  // Get allowed actions for the users role, defaulting to an empty array
  const allowedActions = permissions[userRole] || [];
  // Check if the action is included in the allowed actions
  return allowedActions.includes(action);
}

module.exports = { isAuth, adminOnly, authorize };

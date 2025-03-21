const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../models");
const RoleService = require("../services/RoleService");
const roleService = new RoleService(db);
const { authorize } = require("../middleware/auth");
const { validateAndFindUser } = require("../middleware/resourceValidation");
const {
  validateRole,
  validateRoleUpdate,
} = require("../middleware/validation");

router.post(
  "/",
  authorize("manageUsers"),
  validateRole,
  async (req, res, next) => {
    try {
      const { tourId } = req.params;
      const { userId, role, email } = req.body;
      const user = await roleService.addUserToTour(tourId, userId, role, email);
      return res.status(201).json({
        success: true,
        message: "User added to tour successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all users for a specific tour
router.get("/", authorize("manageUsers"), async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const users = await roleService.getUsersForTour(tourId);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// Update user role on a tour
router.put(
  "/:userId",
  authorize("manageUsers"),
  validateRoleUpdate,
  async (req, res, next) => {
    try {
      const { tourId, userId } = req.params;
      const { role } = req.body;
      const updatedRole = await roleService.updateUserRole(
        tourId,
        userId,
        role
      );
      if (updatedRole.noChanges) {
        return res.status(200).json({
          success: true,
          message: "No changes made to user role",
          data: updatedRole.data,
        });
      }
      return res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: updatedRole,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete user from a tour
router.delete("/:userId", authorize("manageUsers"), async (req, res, next) => {
  try {
    const { tourId, userId } = req.params;
    const deletedRole = await roleService.deleteUserFromTour(tourId, userId);
    return res.status(200).json({
      success: true,
      message: "User removed from the tour",
      data: deletedRole,
    });
  } catch (error) {
    next(error);
  }
});

router.param("userId", validateAndFindUser);

module.exports = router;

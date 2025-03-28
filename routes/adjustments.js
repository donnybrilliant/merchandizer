const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../models");
const AdjustmentService = require("../services/AdjustmentService");
const adjustmentService = new AdjustmentService(db);
const { authorize } = require("../middleware/auth");
const {
  validateAndFindAdjustment,
  validateAndFindProduct,
} = require("../middleware/resourceValidation");
const {
  validateAdjustment,
  validateAdjustmentUpdate,
} = require("../middleware/validation");

// Get all adjustments for a show
router.get("/", authorize("viewAdjustments"), async (req, res, next) => {
  try {
    const { showId } = req.params;
    const adjustments = await adjustmentService.getAllByShow(showId);
    if (!adjustments.length) {
      return res.status(200).json({
        success: true,
        message: "No adjustments exists for the show",
        data: adjustments,
      });
    }
    return res.status(200).json({
      success: true,
      data: adjustments,
    });
  } catch (err) {
    next(err);
  }
});

// Get adjustments for a product
router.get(
  "/product/:productId",
  authorize("viewAdjustments"),
  async (req, res, next) => {
    try {
      const { showId, productId } = req.params;
      const adjustments = await adjustmentService.getByProduct(
        showId,
        productId
      );
      if (!adjustments.length) {
        return res.status(200).json({
          success: false,
          message: "No adjustments found for the product in this show",
        });
      }
      return res.status(200).json({
        success: true,
        data: adjustments,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get a single adjustment by adjustmentId
router.get(
  "/:adjustmentId",
  authorize("viewAdjustments"),
  async (req, res, next) => {
    try {
      return res.status(200).json({
        success: true,
        data: req.adjustment,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Add adjustment
router.post(
  "/",
  authorize("manageAdjustments"),
  validateAdjustment,
  async (req, res, next) => {
    try {
      const { showId } = req.params;
      const { productId } = req.body;
      const adjustment = await adjustmentService.create(
        showId,
        productId,
        req.user.id,
        req.body
      );
      return res.status(201).json({
        success: true,
        message: "Adjustment created successfully",
        data: adjustment,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update adjustment
router.put(
  "/:adjustmentId",
  authorize("manageAdjustments"),
  validateAdjustmentUpdate,
  async (req, res, next) => {
    try {
      const updatedAdjustment = await adjustmentService.update(
        req.adjustment,
        req.body
      );
      if (updatedAdjustment.noChanges) {
        return res.status(200).json({
          success: true,
          message: "No changes made to adjustment",
          data: updatedAdjustment.data,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Adjustment updated successfully",
        data: updatedAdjustment,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Delete adjustment
router.delete(
  "/:adjustmentId",
  authorize("manageAdjustments"),
  async (req, res, next) => {
    try {
      const adjustment = await adjustmentService.delete(req.adjustment);
      return res.status(200).json({
        success: true,
        message: "Adjustment deleted successfully",
        data: adjustment,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.param("adjustmentId", validateAndFindAdjustment);
router.param("productId", validateAndFindProduct);

module.exports = router;

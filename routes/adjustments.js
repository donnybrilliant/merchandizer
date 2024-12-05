const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../models");
const AdjustmentService = require("../services/AdjustmentService");
const adjustmentService = new AdjustmentService(db);
const { isAuth } = require("../middleware/auth");
const {
  validateAdjustment,
  validateAdjustmentUpdate,
} = require("../middleware/validation");

router.use(isAuth);

// Get all adjustments for a show
router.get("/", async (req, res, next) => {
  try {
    const showId = req.params.id;
    const adjustments = await adjustmentService.getAllByShow(showId);

    if (!adjustments.length) {
      return res.status(404).json({
        success: false,
        message: "No adjustments found for the show.",
      });
    }

    return res.status(200).json({ success: true, data: adjustments });
  } catch (err) {
    next(err);
  }
});

// Get adjustments for a product
router.get("/:productId", async (req, res, next) => {
  try {
    const showId = req.params.id;
    const { productId } = req.params;
    const adjustments = await adjustmentService.getByProduct(showId, productId);

    if (!adjustments.length) {
      return res.status(404).json({
        success: false,
        message: "No adjustments found for the show and product",
      });
    }
    return res.status(200).json({ success: true, data: adjustments });
  } catch (err) {
    next(err);
  }
});

// Add adjustment
router.post("/", validateAdjustment, async (req, res, next) => {
  try {
    const showId = req.params.id;
    const { productId } = req.body;
    const adjustment = await adjustmentService.create({
      ...req.body,
      showId,
      productId,
      userId: req.user.id,
    });
    return res.status(201).json({ success: true, data: adjustment });
  } catch (err) {
    next(err);
  }
});

// Update adjustment
router.put(
  "/:adjustmentId",
  validateAdjustmentUpdate,
  async (req, res, next) => {
    try {
      const { adjustmentId } = req.params;
      const updatedAdjustment = await adjustmentService.update(
        adjustmentId,
        req.body
      );

      if (!updatedAdjustment) {
        return res.status(404).json({
          success: false,
          message: "No changes made to adjustment",
        });
      }

      return res.status(200).json({ success: true, data: updatedAdjustment });
    } catch (err) {
      next(err);
    }
  }
);

// Delete adjustment
router.delete("/:adjustmentId", async (req, res, next) => {
  try {
    const { adjustmentId } = req.params;
    const deleted = await adjustmentService.delete(adjustmentId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Adjustment deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

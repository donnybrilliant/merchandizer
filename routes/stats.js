const express = require("express");
const router = express.Router();
const db = require("../models");
const StatsService = require("../services/StatsService");
const statsService = new StatsService(db);
const { isAuth, authorize } = require("../middleware/auth");
const {
  checkTourExists,
  checkShowExists,
  checkProductExists,
} = require("../middleware/resourceValidation");

router.use(isAuth);

// Get stats for a specific show
router.get(
  "/tours/:tourId/shows/:showId",
  authorize("viewStats"),
  async (req, res, next) => {
    try {
      const { showId } = req.params;
      const stats = await statsService.getShowStats(showId);
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
);

// Get stats for a specific tour
router.get("/tours/:tourId", authorize("viewStats"), async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const stats = await statsService.getTourStats(tourId);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// Get stats for a product in a specific tour
router.get(
  "/tours/:tourId/products/:productId",
  authorize("viewStats"),
  async (req, res, next) => {
    try {
      const { tourId, productId } = req.params;
      const stats = await statsService.getProductStatsForTour(
        productId,
        tourId
      );
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

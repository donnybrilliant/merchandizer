const express = require("express");
const router = express.Router();
const db = require("../models");
const StatsService = require("../services/StatsService");
const statsService = new StatsService(db);

// Get stats for a specific show
router.get("/shows/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await statsService.getShowStats(id);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// Get stats for a specific tour
router.get("/tours/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await statsService.getTourStats(id);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// Get stats for a product in a specific tour
router.get("/tours/:id/products/:productId", async (req, res, next) => {
  try {
    const { id, productId } = req.params;
    const stats = await statsService.getProductStatsForTour(productId, id);
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

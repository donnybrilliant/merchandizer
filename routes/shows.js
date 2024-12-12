const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../models");
const ShowService = require("../services/ShowService");
const showService = new ShowService(db);
const inventoryRouter = require("./inventory");
const adjustmentRouter = require("./adjustments");
const { adminOnly, authorize } = require("../middleware/auth");
const {
  validateShow,
  validateShowUpdate,
} = require("../middleware/validation");

// Get all shows
router.get("/", authorize("viewShows"), async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const shows = await showService.getAllByTour(tourId);
    if (!shows.length) {
      return res
        .status(200)
        .json({ success: true, message: "No shows exist", data: shows });
    }
    return res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (err) {
    next(err);
  }
});

// Get all shows for admin
router.get("/all", adminOnly, async (req, res, next) => {
  try {
    const shows = await showService.getAll();
    if (!shows.length) {
      return res
        .status(200)
        .json({ success: true, message: "No shows exist", data: shows });
    }
    return res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (err) {
    next(err);
  }
});

// Search for shows
router.get("/search", authorize("viewShows"), async (req, res, next) => {
  try {
    const shows = await showService.search(req.query);
    if (!shows.length) {
      return res.status(404).json({
        success: true,
        message: "No shows found matching the query",
        data: shows,
      });
    }
    return res.status(200).json({ success: true, data: shows });
  } catch (err) {
    next(err);
  }
});

// Get show by id
router.get("/:showId", authorize("viewShows"), async (req, res, next) => {
  try {
    const show = await showService.getById(req.params.showId);
    if (!show) {
      return res.status(404).json({ success: false, error: "Show not found" });
    }
    return res.status(200).json({ success: true, data: show });
  } catch (err) {
    next(err);
  }
});

// Create new show
router.post(
  "/",
  authorize("manageShows"),
  validateShow,
  async (req, res, next) => {
    try {
      const show = await showService.create(req.body);
      return res.status(201).json({
        success: true,
        data: show,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update show by id
router.put(
  "/:showId",
  authorize("manageShows"),
  validateShowUpdate,
  async (req, res, next) => {
    try {
      const show = await showService.getById(req.params.showId);
      if (!show) {
        return res
          .status(404)
          .json({ success: false, error: "Show not found" });
      }
      const updatedShow = await showService.update(req.params.showId, req.body);
      if (!updatedShow) {
        return res
          .status(404)
          .json({ success: false, error: "No changes made to show" });
      }
      return res.status(200).json({
        success: true,
        data: updatedShow,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Delete show by id
router.delete("/:showId", authorize("manageShows"), async (req, res, next) => {
  try {
    const deleted = await showService.delete(req.params.showId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Show not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Show deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

router.use("/:showId/inventory", inventoryRouter);
router.use("/:showId/adjustments", adjustmentRouter);

module.exports = router;

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
  validateMultipleShows,
  validateShowUpdate,
} = require("../middleware/validation");
const { checkTourExists } = require("../middleware/resourceValidation");

router.use(checkTourExists);

// Get all shows or search shows
router.get("/", authorize("viewShows"), async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const shows = await showService.getAllByTour(tourId, req.query);
    if (!shows.length) {
      return res.status(200).json({
        success: true,
        message: Object.keys(req.query).length
          ? "No shows found matching the query"
          : "No shows exist",
        data: shows,
      });
    }
    return res.status(200).json({ success: true, data: shows });
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

// Get show by id
router.get("/:showId", authorize("viewShows"), async (req, res, next) => {
  try {
    const { showId } = req.params;
    const show = await showService.getById(showId);
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
      const { tourId } = req.params;
      const show = await showService.create(tourId, req.body);
      return res.status(201).json({
        success: true,
        data: show,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Create multiple shows
router.post(
  "/bulk",
  authorize("manageShows"),
  validateMultipleShows,
  async (req, res, next) => {
    try {
      const { tourId } = req.params;
      const shows = await showService.createMany(tourId, req.body);

      return res.status(201).json({
        success: true,
        data: shows,
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
      const { showId } = req.params;
      const updatedShow = await showService.update(showId, req.body);
      if (updatedShow.noChanges) {
        return res.status(200).json({
          success: true,
          message: "No changes made to show",
          data: updatedShow.data,
        });
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
    const { showId } = req.params;
    const show = await showService.delete(showId);
    return res.status(200).json({
      success: true,
      message: "Show deleted successfully",
      data: show,
    });
  } catch (err) {
    next(err);
  }
});

router.use("/:showId/inventory", inventoryRouter);
router.use("/:showId/adjustments", adjustmentRouter);

module.exports = router;

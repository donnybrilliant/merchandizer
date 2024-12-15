const express = require("express");
const router = express.Router();
const db = require("../models");
const TourService = require("../services/TourService");
const tourService = new TourService(db);
const showsRouter = require("./shows");
const rolesRouter = require("./roles");
const { isAuth, authorize, adminOnly } = require("../middleware/auth");
const {
  validateTour,
  validateTourUpdate,
} = require("../middleware/validation");

router.use(isAuth);

// Get all tours for user
router.get("/", async (req, res, next) => {
  try {
    const tours = await tourService.getAllForUser(req.user.id);
    if (!tours.length) {
      return res.status(200).json({
        success: true,
        message: "No tours exist",
        data: tours,
      });
    }
    return res.status(200).json({ success: true, data: tours });
  } catch (err) {
    next(err);
  }
});

// Get all tours for admin
router.get("/all", adminOnly, async (req, res, next) => {
  try {
    const tours = await tourService.getAll();
    if (!tours.length) {
      return res.status(200).json({
        success: true,
        message: "No tours exist",
        data: tours,
      });
    }
    return res.status(200).json({ success: true, data: tours });
  } catch (err) {
    next(err);
  }
});

// Get tour by id
router.get("/:tourId", authorize("viewTour"), async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const tour = await tourService.getById(tourId);
    return res.status(200).json({ success: true, data: tour });
  } catch (err) {
    next(err);
  }
});

// Create new tour
router.post("/", validateTour, async (req, res, next) => {
  try {
    const tour = await tourService.create(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Tour created successfully",
      data: tour,
    });
  } catch (err) {
    next(err);
  }
});

// Update tour by id
router.put(
  "/:tourId",
  authorize("manageTour"),
  validateTourUpdate,
  async (req, res, next) => {
    try {
      const { tourId } = req.params;
      const updatedTour = await tourService.update(tourId, req.body);
      if (updatedTour.noChanges) {
        return res.status(200).json({
          success: true,
          message: "No changes made to tour",
          data: updatedTour.data,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Tour updated successfully",
        data: updatedTour,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Delete tour by id
router.delete("/:tourId", authorize("manageTour"), async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const tour = await tourService.delete(tourId);
    return res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      data: tour,
    });
  } catch (err) {
    next(err);
  }
});

router.use("/:tourId/shows", showsRouter);
router.use("/:tourId/roles", rolesRouter);

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../models");
const TourService = require("../services/TourService");
const tourService = new TourService(db);
const { validateTour } = require("../middleware/validation");

// Get all tours
router.get("/", async (req, res, next) => {
  try {
    const tours = await tourService.getAll();
    if (!tours.length) {
      return res
        .status(200)
        .json({ success: true, message: "No tours exist", data: tours });
    }
    return res.status(200).json({ success: true, data: tours });
  } catch (err) {
    next(err);
  }
});

// Get tour by id
router.get("/:id", async (req, res, next) => {
  try {
    const tour = await tourService.getById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, error: "Tour not found" });
    }
    return res.status(200).json({ success: true, data: tour });
  } catch (err) {
    next(err);
  }
});

// Create new tour
router.post("/", validateTour, async (req, res, next) => {
  try {
    const tour = await tourService.create(req.body);
    return res.status(201).json({ success: true, data: tour });
  } catch (err) {
    next(err);
  }
});

// Update tour by id
router.put("/:id", validateTour, async (req, res, next) => {
  try {
    const tour = await tourService.getById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, error: "Tour not found" });
    }
    const updatedTour = await tourService.update(req.params.id, req.body);
    if (!updatedTour) {
      return res
        .status(404)
        .json({ success: false, error: "No changes made to tour" });
    }
    return res.status(200).json({ success: true, data: updatedTour });
  } catch (err) {
    next(err);
  }
});

// Delete tour by id
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await tourService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Tour not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Tour deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

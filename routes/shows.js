const express = require("express");
const router = express.Router();
const db = require("../models");
const ShowService = require("../services/ShowService");
const showService = new ShowService(db);
const inventoryRouter = require("./inventory");
const {
  validateShow,
  validateShowUpdate,
} = require("../middleware/validation");

// Get all shows
router.get("/", async (req, res, next) => {
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
router.get("/search", async (req, res, next) => {
  try {
    const shows = await showService.search(req.query);
    if (!shows.length) {
      return res.status(404).json({
        success: true,
        data: shows,
        message: "No shows found matching the query",
      });
    }
    return res.status(200).json({ success: true, data: shows });
  } catch (err) {
    next(err);
  }
});

// Get show by id
router.get("/:id", async (req, res, next) => {
  try {
    const show = await showService.getById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, error: "Show not found" });
    }
    return res.status(200).json({ success: true, data: show });
  } catch (err) {
    next(err);
  }
});

// Create new show
router.post("/", validateShow, async (req, res, next) => {
  try {
    const newShow = await showService.create(req.body);
    return res.status(201).json({
      success: true,
      data: newShow,
    });
  } catch (err) {
    next(err);
  }
});

// Update show by id
router.put("/:id", validateShowUpdate, async (req, res, next) => {
  try {
    const show = await showService.getById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, error: "Show not found" });
    }
    const updatedShow = await showService.update(req.params.id, req.body);
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
});

// Delete show by id
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await showService.delete(req.params.id);
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

router.use("/:id/inventory", inventoryRouter);

module.exports = router;

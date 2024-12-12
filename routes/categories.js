const express = require("express");
const router = express.Router();
const db = require("../models");
const CategoryService = require("../services/CategoryService");
const categoryService = new CategoryService(db);
const { isAuth } = require("../middleware/auth");
const { validateCategory } = require("../middleware/validation");

router.use(isAuth);

// Get all categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await categoryService.getAll();
    if (!categories.length) {
      return res.status(200).json({
        success: true,
        message: "No categories exist",
        data: categories,
      });
    }
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const categories = await categoryService.search(req.query.name);

    if (!categories.length) {
      return res.status(404).json({
        success: false,
        error: "No categories found matching the name",
      });
    }

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
});

// Get category by id
router.get("/:id", async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    return res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// Create new category
router.post("/", validateCategory, async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    return res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// Update category by id
router.put("/:id", validateCategory, async (req, res, next) => {
  try {
    const category = await categoryService.getById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    const updatedCategory = await categoryService.update(
      req.params.id,
      req.body
    );
    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, error: "No changes made to category" });
    }
    return res.status(200).json({ success: true, data: updatedCategory });
  } catch (err) {
    next(err);
  }
});

// Delete category by id
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await categoryService.delete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

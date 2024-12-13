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
    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// Search categories by name
router.get("/search", validateCategory, async (req, res, next) => {
  try {
    const { name } = req.query;
    const result = await categoryService.search(name);

    if (!result.length) {
      return res.status(200).json({
        success: true,
        error: "No categories found matching the name",
        data: result,
      });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Get category by id
router.get("/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await categoryService.getById(categoryId);
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
router.put("/:categoryId", validateCategory, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const updatedCategory = await categoryService.update(categoryId, req.body);
    if (updatedCategory.noChanges) {
      return res.status(200).json({
        success: true,
        message: "No changes made to category",
        data: updatedCategory.data,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category updated",
      data: updatedCategory,
    });
  } catch (err) {
    next(err);
  }
});

// Delete category by id
router.delete("/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await categoryService.delete(categoryId);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

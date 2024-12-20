const express = require("express");
const router = express.Router();
const db = require("../models");
const CategoryService = require("../services/CategoryService");
const categoryService = new CategoryService(db);
const { isAuth } = require("../middleware/auth");
const { validateAndFindCategory } = require("../middleware/resourceValidation");
const {
  validateCategory,
  validateCategorySearch,
} = require("../middleware/validation");

router.use(isAuth);

// Get all categories or search by name
router.get("/", validateCategorySearch, async (req, res, next) => {
  try {
    const categories = await categoryService.getAllByQuery(req.query);
    if (!categories.length) {
      return res.status(200).json({
        success: true,
        message: Object.keys(req.query).length
          ? `No categories found matching the name: ${req.query.name}`
          : "No categories exist",
        data: categories,
      });
    }
    return res.status(200).json({ success: true, data: categories });
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
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
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
      message: "Category updated successfully",
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

router.param("categoryId", validateAndFindCategory);

module.exports = router;

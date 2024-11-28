const express = require("express");
const router = express.Router();
const db = require("../models");
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);
const {
  validateProduct,
  validateProductUpdate,
} = require("../middleware/validation");

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await productService.getAll();
    if (!products.length) {
      return res.status(200).json({
        success: true,
        message: "No products exist",
        data: products,
      });
    }
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// Search for products
router.get("/search", async (req, res, next) => {
  try {
    const products = await productService.search(req.query);

    if (!products.length) {
      return res.status(404).json({
        success: false,
        data: products,
        message: "No products found matching the query",
      });
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (err) {
    next(err);
  }
});

// Get product by id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Create new product
router.post("/", validateProduct, async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Update product by id
router.put("/:id", validateProductUpdate, async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    const updatedProduct = await productService.update(req.params.id, req.body);
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, error: "No changes made to product" });
    }
    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (err) {
    next(err);
  }
});

// Delete product by id
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await productService.delete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

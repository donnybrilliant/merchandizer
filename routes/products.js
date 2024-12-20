const express = require("express");
const router = express.Router();
const db = require("../models");
const ProductService = require("../services/ProductService");
const productService = new ProductService(db);
const { multerUpload, uploadToS3, resizeImage } = require("../utils/upload");
const { isAuth } = require("../middleware/auth");
const { validateAndFindProduct } = require("../middleware/resourceValidation");
const {
  validateProduct,
  validateProductUpdate,
  validateProductSearch,
  validateImageUpload,
} = require("../middleware/validation");

router.use(isAuth);

// Get all products or search by query
router.get("/", validateProductSearch, async (req, res, next) => {
  try {
    const products = await productService.getAllByQuery(req.query);
    if (!products.length) {
      return res.status(200).json({
        success: true,
        message: Object.keys(req.query).length
          ? "No products found matching the query"
          : "No products exist",
        data: products,
      });
    }
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// Get product by id
router.get("/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await productService.getById(productId);
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// Create new product
router.post("/", validateProduct, async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
});

// Update product by id
router.put("/:productId", validateProductUpdate, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updatedProduct = await productService.update(productId, req.body);
    if (updatedProduct.noChanges) {
      return res.status(200).json({
        success: true,
        message: "No changes made to product",
        data: updatedProduct.data,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
});

// Delete product by id
router.delete("/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await productService.delete(productId);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (err) {
    next(err);
  }
});

// Update product image
router.put(
  "/:productId/image",
  multerUpload.single("image"),
  validateImageUpload("image"),
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      // Resize and convert the image to PNG
      const resizedBuffer = await resizeImage(req.file.buffer, 400, 400);

      // Create/update product image in S3
      const key = `products/${productId}-avatar.png`;
      const imageUrl = await uploadToS3(key, resizedBuffer, "image/png");

      const updatedProduct = await productService.update(productId, {
        image: imageUrl,
      });

      if (updatedProduct.noChanges) {
        return res.status(200).json({
          success: true,
          message: "No changes made to product",
          data: updatedProduct.data,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Product image updated successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

router.param("productId", validateAndFindProduct);

module.exports = router;

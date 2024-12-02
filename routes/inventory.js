const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../models");
const InventoryService = require("../services/InventoryService");
const inventoryService = new InventoryService(db);
const {
  validateShowInventory,
  validateShowInventoryArray,
  validateSingleInventory,
  validateSingleInventoryUpdate,
} = require("../middleware/validation");

// Get inventory for a specific show
router.get("/", async (req, res, next) => {
  try {
    const showId = req.params.id;
    const inventories = await inventoryService.getAllByShow(showId);
    if (!inventories.length) {
      return res
        .status(404)
        .json({ success: false, message: "No inventory found for the show" });
    }
    return res.status(200).json({ success: true, data: inventories });
  } catch (err) {
    next(err);
  }
});

// Get inventory for a specific show and product
router.get("/:productId", async (req, res, next) => {
  try {
    const showId = req.params.id;
    const productId = req.params.productId;
    const inventories = await inventoryService.getById(showId, productId);

    if (!inventories) {
      return res.status(404).json({
        success: false,
        message: "No inventory found for the show and product",
      });
    }
    return res.status(200).json({ success: true, data: inventories });
  } catch (err) {
    next(err);
  }
});


// Add inventory item for a show
router.post("/:productId", validateSingleInventory, async (req, res, next) => {
  try {
    const showId = req.params.id;
    const productId = req.params.productId;

    const newInventory = await inventoryService.create({
      ...req.body,
      showId,
      productId,
    });

    return res.status(201).json({ success: true, data: newInventory });
  } catch (err) {
    next(err);
  }
});


// Update inventory item for a show
router.put(
  "/:productId",
  validateSingleInventoryUpdate,
  async (req, res, next) => {
    try {
      const showId = req.params.id;
      const productId = req.params.productId;

      const updatedInventory = await inventoryService.update(
        showId,
        productId,
        req.body
      );

      if (!updatedInventory) {
        return res.status(404).json({
          success: false,
          message: "No changes made to inventory",
        });
      }

      return res.status(200).json({ success: true, data: updatedInventory });
    } catch (err) {
      next(err);
    }
  }
);

// Delete inventory item for a show
router.delete("/:productId", async (req, res, next) => {
  try {
    const showId = req.params.id;
    const productId = req.params.productId;

    const deleted = await inventoryService.delete(showId, productId);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Inventory item deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

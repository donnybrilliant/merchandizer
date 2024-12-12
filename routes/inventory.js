const express = require("express");
const router = express.Router({ mergeParams: true });
const db = require("../models");
const InventoryService = require("../services/InventoryService");
const inventoryService = new InventoryService(db);
const ShowService = require("../services/ShowService");
const showService = new ShowService(db);
const {
  validateSingleInventory,
  validateSingleInventoryUpdate,
  validateMultipleInventory,
  validateMultipleInventoryUpdate,
} = require("../middleware/validation");
const { authorize } = require("../middleware/auth");

// Get inventory for a specific show
router.get("/", authorize("viewInventory"), async (req, res, next) => {
  try {
    const showId = req.params.showId;
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
router.get(
  "/:productId",
  authorize("viewInventory"),
  async (req, res, next) => {
    try {
      const showId = req.params.showId;
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
  }
);

// Add multiple inventory items for a show
router.post(
  "/",
  authorize("manageInventory"),
  validateMultipleInventory,
  async (req, res, next) => {
    try {
      const showId = req.params.showId;

      const inventories = await inventoryService.createMany(showId, req.body);

      return res.status(201).json({ success: true, data: inventories });
    } catch (err) {
      next(err);
    }
  }
);

router.post("/copy", authorize("manageInventory"), async (req, res, next) => {
  try {
    const currentShowId = req.params.showId;

    // Find the previous show
    const previousShow = await showService.findPreviousShow(currentShowId);

    // Pass the previous show to copy the inventory
    const result = await inventoryService.copyInventoryFromPreviousShow(
      currentShowId,
      previousShow
    );

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Add inventory item for a show
router.post(
  "/:productId",
  authorize("manageInventory"),
  validateSingleInventory,
  async (req, res, next) => {
    try {
      const showId = req.params.showId;
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
  }
);

// Update multiple inventory items for a show
router.put(
  "/",
  authorize("manageInventory"),
  validateMultipleInventoryUpdate,
  async (req, res, next) => {
    try {
      const showId = req.params.showId;

      const inventories = await inventoryService.updateMany(showId, req.body);

      if (!inventories) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found or no changes made",
        });
      }

      return res.status(200).json({ success: true, data: inventories });
    } catch (err) {
      next(err);
    }
  }
);

// Update inventory item for a show
router.put(
  "/:productId",
  authorize("manageInventory"),
  validateSingleInventoryUpdate,
  async (req, res, next) => {
    try {
      const showId = req.params.showId;
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
router.delete(
  "/:productId",
  authorize("deleteInventory"),
  async (req, res, next) => {
    try {
      const showId = req.params.showId;
      const productId = req.params.productId;

      const deleted = await inventoryService.delete(showId, productId);

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Inventory item not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Inventory item deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

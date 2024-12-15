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
const {
  checkShowExists,
  checkProductExists,
} = require("../middleware/resourceValidation");

router.use(checkShowExists);

// Get inventory for a specific show
router.get("/", authorize("viewInventory"), async (req, res, next) => {
  try {
    const { showId } = req.params;
    const inventories = await inventoryService.getAllByShow(showId);
    if (!inventories.length) {
      return res.status(200).json({
        success: true,
        message: "No inventory exists for the show",
        data: inventories,
      });
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
  checkProductExists,
  async (req, res, next) => {
    try {
      const { showId, productId } = req.params;
      const inventory = await inventoryService.getById(showId, productId);
      return res.status(200).json({ success: true, data: inventory });
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
      const { showId } = req.params;
      const inventories = await inventoryService.createMany(showId, req.body);
      return res.status(201).json({
        success: true,
        message: "Inventory created successfully",
        data: inventories,
      });
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
    const { updated, unchanged } =
      await inventoryService.copyInventoryFromPreviousShow(
        currentShowId,
        previousShow
      );

    return res.status(200).json({
      success: true,
      message: "Inventory copy processed",
      data: {
        updated,
        unchanged,
      },
    });
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
      const { showId, productId } = req.params;
      const newInventory = await inventoryService.create(
        showId,
        productId,
        req.body
      );
      return res.status(201).json({
        success: true,
        message: "Inventory created successfully",
        data: newInventory,
      });
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
      const { showId } = req.params;
      const { updated, unchanged } = await inventoryService.updateMany(
        showId,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: "Inventory update processed",
        data: {
          updated,
          unchanged,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update inventory item for a show
router.put(
  "/:productId",
  authorize("manageInventory"),
  checkProductExists,
  validateSingleInventoryUpdate,
  async (req, res, next) => {
    try {
      const { showId, productId } = req.params;
      const updatedInventory = await inventoryService.update(
        showId,
        productId,
        req.body
      );
      if (updatedInventory.noChanges) {
        return res.status(200).json({
          success: true,
          message: "No changes made to inventory",
          data: updatedInventory.data,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Inventory updated successfully",
        data: updatedInventory,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Delete inventory item for a show
router.delete(
  "/:productId",
  authorize("deleteInventory"),
  checkProductExists,
  async (req, res, next) => {
    try {
      const { showId, productId } = req.params;
      const inventory = await inventoryService.delete(showId, productId);
      return res.status(200).json({
        success: true,
        message: "Inventory deleted successfully",
        data: inventory,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

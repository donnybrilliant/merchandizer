const createError = require("http-errors");
const { calculateAdjustments } = require("../utils/calculation");
const { isSameData, checkQuantities } = require("../utils/checks");

class InventoryService {
  constructor(db) {
    this.ShowInventory = db.ShowInventory;
    this.Product = db.Product;
    this.Adjustment = db.Adjustment;
    this.Show = db.Show;

    // Default includes and excludes
    this.defaultInclude = [
      {
        model: this.Product,
        attributes: ["id", "name", "price", "size", "color"],
      },
      {
        model: this.Show,
        attributes: ["id", "tourId"],
      },
      {
        model: this.Adjustment,
        attributes: ["id", "quantity", "reason", "type"],
      },
    ];
    this.defaultExclude = ["productId", "showId"];
  }

  // Check if inventory exists
  async checkInventoryExists(showId, productId) {
    // Check if product exists
    const product = await this.Product.findByPk(productId);
    if (!product) throw createError(404, "Product not found");

    const existingInventory = await this.ShowInventory.findOne({
      where: { showId, productId },
    });

    if (existingInventory) {
      throw createError(
        409,
        `Inventory for product ${productId} already exists`
      );
    }
  }

  // Get existing product ids from show
  async getExistingProductIds(showId) {
    const existingInventories = await this.ShowInventory.findAll({
      where: { showId },
      attributes: ["productId"],
      raw: true,
    });
    return existingInventories.map((inv) => inv.productId);
  }

  // Get all inventory items for a specific show
  async getAllByShow(showId) {
    return await this.ShowInventory.findAll({
      where: { showId },
      attributes: { exclude: this.defaultExclude },
      include: this.defaultInclude,
    });
  }

  // Get inventory item by show and product ID
  async getById(showId, productId) {
    const inventory = await this.ShowInventory.findOne({
      where: { showId, productId },
      attributes: { exclude: this.defaultExclude },
      include: this.defaultInclude,
    });

    if (!inventory) {
      throw createError(404, "Inventory not found");
    }

    return inventory;
  }

  // Create inventory item for a show
  async create(showId, productId, data) {
    // Validate inventory quantities
    checkQuantities(data.startInventory, data.endInventory);

    // Check if inventory already exists
    await this.checkInventoryExists(showId, productId);

    return await this.ShowInventory.create({ showId, productId, ...data });
  }

  // Create multiple inventory items for a show
  async createMany(showId, data) {
    const newInventories = [];

    for (const item of data) {
      const { productId, startInventory, endInventory } = item;

      // Validate inventory quantities
      checkQuantities(startInventory, endInventory);

      // Check if inventory already exists
      await this.checkInventoryExists(showId, productId);

      newInventories.push({ showId, productId, startInventory, endInventory });
    }

    return await this.ShowInventory.bulkCreate(newInventories);
  }

  // Update inventory item
  async update(showId, productId, data) {
    const inventory = await this.getById(showId, productId);

    // Validate inventory quantities
    checkQuantities(inventory.startInventory, data.endInventory);

    // Check if no changes are made
    if (isSameData(inventory, data)) {
      return { noChanges: true, data: inventory };
    }

    return inventory.update(data);
  }

  // Update multiple inventory items for a show
  async updateMany(showId, inventoryItems) {
    const updated = [];
    const unchanged = [];

    for (const item of inventoryItems) {
      const { productId, ...data } = item;

      const inventory = await this.getById(showId, productId);

      // Validate inventory quantities
      checkQuantities(inventory.startInventory, data.endInventory);

      // Check if no changes are made
      if (isSameData(inventory, data)) {
        unchanged.push({
          message: "No changes made",
          data: inventory.get({ plain: true }),
        });
        continue;
      }

      await inventory.update(data);
      updated.push({
        message: "Inventory updated",
        data: inventory.get({ plain: true }),
      });
    }

    return { updated, unchanged };
  }

  // Delete inventory item
  async delete(showId, productId) {
    const inventory = await this.getById(showId, productId);
    await inventory.destroy();
    return inventory;
  }

  // Copy inventory from the previous show
  async copyInventoryFromPreviousShow(currentShowId, previousShowId) {
    const previousInventories = await this.ShowInventory.findAll({
      where: { showId: previousShowId },
      include: [
        {
          model: this.Product,
          attributes: ["id", "name", "price", "size", "color"],
        },
      ],
    });

    if (!previousInventories.length) {
      throw createError(404, "No inventories found for the previous show");
    }

    const existingProductIds = await this.getExistingProductIds(currentShowId);

    const updated = [];
    const unchanged = [];

    for (const inventory of previousInventories) {
      const { productId, endInventory, Product } = inventory;

      if (existingProductIds.includes(productId)) {
        unchanged.push({
          message: "Inventory already exists",
          data: {
            productId,
            startInventory: endInventory,
            Product,
          },
        });
        continue;
      }

      if (endInventory === null) {
        throw createError(
          400,
          `End inventory for productId ${productId} doesn't exist. Cannot copy inventory`
        );
      }

      // Calculate adjustments
      const adjustments = await this.Adjustment.findAll({
        where: { showInventoryId: inventory.id },
      });

      const totalAdjustment = adjustments.length
        ? calculateAdjustments(adjustments)
        : 0;

      const startInventory = endInventory + totalAdjustment;

      // Create new inventory
      await this.ShowInventory.create({
        showId: currentShowId,
        productId,
        startInventory,
      });

      updated.push({
        message: "Inventory copied",
        data: {
          productId,
          startInventory,
          Product,
        },
      });
    }

    return { updated, unchanged };
  }
}

module.exports = InventoryService;

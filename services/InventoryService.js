const calculateAdjustments = require("../utils/calculation");
class InventoryService {
  constructor(db) {
    this.ShowInventory = db.ShowInventory;
    this.Product = db.Product;
    this.Adjustment = db.Adjustment;
    this.Show = db.Show;
  }

  // Get all inventory items for a specific show
  async getAllByShow(showId) {
    return await this.ShowInventory.findAll({
      where: { showId },
      include: [{ model: this.Product, attributes: ["id", "name", "price"] }],
    });
  }

  // Get all inventory items for a specific show
  async getById(showId, productId) {
    return await this.ShowInventory.findOne({
      where: { showId, productId },
      include: [{ model: this.Product, attributes: ["id", "name", "price"] }],
    });
  }

  // Create inventory item for a show
  async create(data) {
    // Check if product exists
    const product = await this.Product.findByPk(data.productId);
    if (!product) throw new Error("Product not found.");

    // Check if show exists
    const show = await this.Show.findByPk(data.showId);
    if (!show) throw new Error("Show not found.");

    if (data.endInventory && data.endInventory > data.startInventory) {
      throw new Error("End inventory cannot be more than start inventory");
    }

    const existingInventory = await this.ShowInventory.findOne({
      where: {
        showId: data.showId,
        productId: data.productId,
      },
    });

    if (existingInventory) {
      throw new Error("Inventory for this product and show already exists");
    }

    return await this.ShowInventory.create(data);
  }

  // Create multiple inventory items for a show
  async createMany(showId, inventoryItems) {
    const newInventories = [];

    for (const item of inventoryItems) {
      const { productId, startInventory, endInventory } = item;

      if (endInventory && endInventory > startInventory) {
        throw new Error("End inventory cannot be more than start inventory");
      }

      const existingInventory = await this.ShowInventory.findOne({
        where: { showId, productId },
      });

      if (existingInventory) {
        throw new Error(`Inventory for product ${productId} already exists`);
      }

      newInventories.push({ showId, productId, startInventory, endInventory });
    }

    return await this.ShowInventory.bulkCreate(newInventories);
  }

  // Update inventory item
  async update(showId, productId, data) {
    if (data.endInventory && data.endInventory > data.startInventory) {
      throw new Error("End inventory cannot be more than start inventory");
    }

    const existingInventory = await this.ShowInventory.findOne({
      where: { showId, productId },
    });

    if (!existingInventory) {
      throw new Error("Inventory not found");
    }

    const rowsUpdated = await this.ShowInventory.update(data, {
      where: { showId, productId },
    });

    if (!rowsUpdated[0]) return null;
    return await this.ShowInventory.findOne({ where: { showId, productId } });
  }

  // Update multiple inventory items for a show
  async updateMany(showId, inventoryItems) {
    const updatedInventories = [];

    for (const item of inventoryItems) {
      const { productId, ...data } = item;

      if (data.endInventory && data.endInventory > data.startInventory) {
        throw new Error("End inventory cannot be more than start inventory");
      }

      const rowsUpdated = await this.ShowInventory.update(data, {
        where: { showId, productId },
      });

      if (!rowsUpdated[0]) return null;

      const updatedInventory = await this.ShowInventory.findOne({
        where: { showId, productId },
      });

      updatedInventories.push(updatedInventory);
    }

    return updatedInventories;
  }

  // Delete inventory item
  async delete(showId, productId) {
    return await this.ShowInventory.destroy({ where: { showId, productId } });
  }

  async copyInventoryFromPreviousShow(currentShowId, previousShow) {
    const previousInventories = await this.ShowInventory.findAll({
      where: { showId: previousShow.id },
    });

    if (!previousInventories.length) {
      throw new Error("No inventories found for the previous show."); // show not found?
    }

    // Calculate adjusted endInventory for each product
    const adjustedEndInventories = await Promise.all(
      previousInventories.map(async (inventory) => {
        if (inventory.endInventory === null) {
          throw new Error(
            `End inventory for productId ${inventory.productId} is null. Cannot copy inventory.`
          );
        }
        // Find adjustments
        const adjustments = await this.Adjustment.findAll({
          where: { showInventoryId: inventory.id },
        });

        // Calculate adjustments
        const totalAdjustment = calculateAdjustments(adjustments);

        const adjustedEndInventory = inventory.endInventory + totalAdjustment;

        /*         if (isNaN(adjustedEndInventory) || adjustedEndInventory < 0) {
          throw new Error(
            `Invalid adjusted end inventory for productId ${inventory.productId}: ${adjustedEndInventory}`
          );
        } */

        return {
          productId: inventory.productId,
          adjustedEndInventory,
        };
      })
    );

    // Create startInventory for current show.
    await Promise.all(
      adjustedEndInventories.map(async (inventory) => {
        const productId = inventory.productId;
        const adjustedEndInventory = inventory.adjustedEndInventory;

        const existingInventory = await this.ShowInventory.findOne({
          where: { showId: currentShowId, productId },
        });

        if (!existingInventory) {
          await this.ShowInventory.create({
            showId: currentShowId,
            productId: productId,
            startInventory: adjustedEndInventory,
          });
        }
      })
    );

    // Return the updated inventory for the current show
    const updatedInventory = await this.getAllByShow(currentShowId);

    return {
      success: true,
      message: "Start inventory created from previous show for missing items.",
      data: updatedInventory,
    };
  }
}

module.exports = InventoryService;

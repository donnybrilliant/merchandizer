const { Op } = require("sequelize");

class InventoryService {
  constructor(db) {
    this.client = db.sequelize;
    this.ShowInventory = db.ShowInventory;
    this.Product = db.Product;
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
}

module.exports = InventoryService;

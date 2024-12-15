const createError = require("http-errors");
const { isSameData } = require("../utils/checks");

class AdjustmentService {
  constructor(db) {
    this.Adjustment = db.Adjustment;
    this.ShowInventory = db.ShowInventory;
    this.Product = db.Product;
    this.User = db.User;
    this.Show = db.Show;
  }

  // Get ShowInventory for a product in a show
  async getShowInventory(showId, productId) {
    // Check if product exists
    const product = await this.Product.findByPk(productId);
    if (!product) throw createError(404, "Product not found");

    const showInventory = await this.ShowInventory.findOne({
      where: { showId, productId },
    });

    if (!showInventory) {
      throw createError(
        404,
        "No inventory found for the specified show and product"
      );
    }

    return showInventory;
  }

  // Get all adjustments for a show
  async getAllByShow(showId) {
    return await this.Adjustment.findAll({
      include: [
        {
          model: this.ShowInventory,
          where: { showId },
          include: [
            { model: this.Product, attributes: ["id", "name", "price"] },
          ],
        },
        {
          model: this.User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      attributes: [
        "id",
        "quantity",
        "reason",
        "type",
        "discountValue",
        "discountType",
      ],
    });
  }

  // Get all adjustments for a product
  async getByProduct(showId, productId) {
    const showInventory = await this.getShowInventory(showId, productId);

    return await this.Adjustment.findAll({
      where: { showInventoryId: showInventory.id },
      include: [
        {
          model: this.ShowInventory,
          where: { showId },
          include: [
            { model: this.Product, attributes: ["id", "name", "price"] },
          ],
        },
        {
          model: this.User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });
  }

  // Get adjustment by ID
  async getById(adjustmentId) {
    const adjustment = await this.Adjustment.findByPk(adjustmentId);
    if (!adjustment) throw createError(404, "Adjustment not found");
    return adjustment;
  }

  // Create a new adjustment
  async create(showId, productId, userId, data) {
    const { quantity, reason, type, discountValue, discountType } = data;
    const showInventory = await this.getShowInventory(showId, productId);

    return await this.Adjustment.create({
      showInventoryId: showInventory.id,
      userId,
      quantity,
      reason,
      type,
      discountValue,
      discountType,
    });
  }

  // Update an existing adjustment
  async update(adjustmentId, data) {
    const adjustment = await this.getById(adjustmentId);

    if (isSameData(adjustment, data)) {
      return { noChanges: true, data: adjustment };
    }

    await adjustment.update(data);
    return adjustment;
  }

  // Delete an adjustment
  async delete(adjustmentId) {
    const adjustment = await this.getById(adjustmentId);
    await adjustment.destroy();
    return adjustment;
  }
}

module.exports = AdjustmentService;

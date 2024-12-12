class AdjustmentService {
  constructor(db) {
    this.Adjustment = db.Adjustment;
    this.ShowInventory = db.ShowInventory;
    this.Product = db.Product;
    this.User = db.User;
  }

  // Get ShowInventory based on showId and productId
  async getShowInventory(showId, productId) {
    const showInventory = await this.ShowInventory.findOne({
      where: { showId, productId },
    });

    if (!showInventory) {
      throw new Error("No inventory found for the specified show and product.");
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

  // Get adjustments for a product
  async getByProduct(showId, productId) {
    const showInventory = await this.getShowInventory(showId, productId);
    return await this.Adjustment.findAll({
      where: { showInventoryId: showInventory.id },

      include: [
        {
          model: this.ShowInventory,
          attributes: ["id"],
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

  // Create new adjustment
  async create(showId, productId, userId, data) {
    const { quantity, reason, type, discountValue, discountType } = data;
    // Check if show inventory exists
    const showInventory = await this.getShowInventory(showId, productId);
    if (!showInventory)
      throw new Error("No inventory found for the specified show and product.");

    if (quantity <= 0) throw new Error("Quantity must be a positive number.");

    return await this.Adjustment.create({
      showInventoryId: showInventory.id,
      quantity,
      reason,
      type,
      discountValue,
      discountType,
      userId,
    });
  }

  // Update adjustment
  async update(adjustmentId, data) {
    const adjustment = await this.Adjustment.findByPk(adjustmentId);

    if (!adjustment) {
      throw new Error("Adjustment not found");
    }

    const rowsUpdated = await adjustment.update(data);

    if (!rowsUpdated[0]) return null;

    return await this.Adjustment.findByPk(adjustmentId);
  }

  // Delete adjustment
  async delete(adjustmentId) {
    const rowsDeleted = await this.Adjustment.destroy({
      where: { id: adjustmentId },
    });
    return rowsDeleted > 0;
  }
}

module.exports = AdjustmentService;

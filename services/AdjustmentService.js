const createError = require("http-errors");
const { isSameData } = require("../utils/checks");

class AdjustmentService {
  constructor(db) {
    this.Adjustment = db.Adjustment;
    this.ShowInventory = db.ShowInventory;
    this.Product = db.Product;
    this.User = db.User;
    this.Show = db.Show;

    this.defaultInclude = [
      {
        model: this.Category,
        attributes: ["id", "name"],
      },
      {
        model: this.Artist,
        attributes: ["id", "name"],
      },
    ];
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
          attributes: ["id", "showId"],
          include: [
            {
              model: this.Product,
              attributes: ["id", "name", "price"],
            },
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
          attributes: ["id", "showId"],
          include: [
            {
              model: this.Product,
              attributes: ["id", "name", "price"],
            },
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
  async update(adjustment, data) {
    if (isSameData(adjustment, data)) {
      return { noChanges: true, data: adjustment };
    }

    // Prevent discountType or discountValue updates if type is not discount
    if (adjustment.type !== "discount") {
      if (data.discountValue !== undefined || data.discountType !== undefined) {
        throw createError(
          400,
          "Cannot update discountValue or discountType unless type is 'discount'"
        );
      }
    }

    // Check if discount type is being changed
    if (adjustment.type === "discount" && data.type !== "discount") {
      data.discountValue = null;
      data.discountType = null;
    }

    await adjustment.update(data);
    return adjustment;
  }

  // Delete an adjustment
  async delete(adjustment) {
    await adjustment.destroy();
    return adjustment;
  }
}

module.exports = AdjustmentService;

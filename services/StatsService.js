const createError = require("http-errors");
const {
  summarizeAdjustments,
  calculateAdjustments,
} = require("../utils/calculation");

class StatsService {
  constructor(db) {
    this.Show = db.Show;
    this.ShowInventory = db.ShowInventory;
    this.Adjustment = db.Adjustment;
    this.Product = db.Product;
  }

  // Get statistics for a single show
  async getShowStats(showId) {
    const inventories = await this.ShowInventory.findAll({
      where: { showId },
      include: [{ model: this.Product, attributes: ["id", "name", "price"] }],
    });

    const productStats = await Promise.all(
      inventories.map(async (inventory) => {
        const adjustments = await this.Adjustment.findAll({
          where: { showInventoryId: inventory.id },
        });

        const price = parseFloat(inventory.Product.price);
        const { restock, giveaway, loss, discount, totalDiscount } =
          summarizeAdjustments(adjustments, price);

        // Calculate sold
        const endInventory = inventory.endInventory ?? 0;
        const adjustedStart =
          inventory.startInventory + restock - giveaway - loss;
        const sold = adjustedStart - endInventory;

        // Calculate revenues
        const revenue = sold * price;
        const netRevenue = revenue - totalDiscount;

        return {
          productId: inventory.productId,
          productName: inventory.Product.name,
          startInventory: inventory.startInventory,
          endInventory: inventory.endInventory,
          sold,
          adjustments: {
            restock,
            giveaway,
            loss,
            discount,
          },
          revenue: parseFloat(revenue.toFixed(2)),
          totalDiscount: parseFloat(totalDiscount.toFixed(2)),
          netRevenue: parseFloat(netRevenue.toFixed(2)),
        };
      })
    );

    // Calculate totals
    const totalSold = productStats.reduce((acc, stat) => acc + stat.sold, 0);
    const totalRevenue = productStats.reduce(
      (acc, stat) => acc + stat.revenue,
      0
    );
    const totalDiscountAmt = productStats.reduce(
      (acc, stat) => acc + stat.totalDiscount,
      0
    );
    const totalNetRevenue = productStats.reduce(
      (acc, stat) => acc + stat.netRevenue,
      0
    );

    const totalRestock = productStats.reduce(
      (acc, stat) => acc + stat.adjustments.restock,
      0
    );
    const totalGiveaway = productStats.reduce(
      (acc, stat) => acc + stat.adjustments.giveaway,
      0
    );
    const totalLoss = productStats.reduce(
      (acc, stat) => acc + stat.adjustments.loss,
      0
    );
    const totalDiscountQty = productStats.reduce(
      (acc, stat) => acc + stat.adjustments.discount,
      0
    );

    return {
      products: productStats,
      totals: {
        sold: totalSold,
        revenue: parseFloat(totalRevenue.toFixed(2)),
        totalDiscount: parseFloat(totalDiscountAmt.toFixed(2)),
        netRevenue: parseFloat(totalNetRevenue.toFixed(2)),
        adjustments: {
          restock: totalRestock,
          giveaway: totalGiveaway,
          loss: totalLoss,
          discount: totalDiscountQty,
        },
      },
    };
  }

  //Get statistics for all shows in a tour
  async getTourStats(tourId) {
    const shows = await this.Show.findAll({ where: { tourId } });

    let grandTotalSold = 0;
    let grandTotalRevenue = 0;

    for (const show of shows) {
      const { totals } = await this.getShowStats(show.id);
      grandTotalSold += totals.sold;
      grandTotalRevenue += totals.revenue;
    }

    return {
      tourId,
      sold: grandTotalSold,
      revenue: parseFloat(grandTotalRevenue.toFixed(2)),
    };
  }

  // Get total sales for a specific product across all shows in a tour
  async getProductStatsForTour(productId, tourId) {
    // Check if product exists
    const product = await this.Product.findByPk(productId);
    if (!product) throw createError(404, "Product not found");

    const shows = await this.Show.findAll({ where: { tourId } });
    let totalSold = 0;
    let totalRevenue = 0;
    let productName = null;

    for (const show of shows) {
      // Get inventories for this product in the show
      const inventories = await this.ShowInventory.findAll({
        where: { showId: show.id, productId },
        include: [{ model: this.Product, attributes: ["id", "name", "price"] }],
      });

      for (const inventory of inventories) {
        const adjustments = await this.Adjustment.findAll({
          where: { showInventoryId: inventory.id },
        });

        const netAdjustment = calculateAdjustments(adjustments);

        const endInventory = inventory.endInventory ?? 0;
        const sold = inventory.startInventory + netAdjustment - endInventory;
        const revenue = sold * parseFloat(inventory.Product.price);

        totalSold += sold;
        totalRevenue += revenue;
        if (!productName) {
          productName = inventory.Product.name;
        }
      }
    }

    return { productId, productName, tourId, totalSold, totalRevenue };
  }
}

module.exports = StatsService;

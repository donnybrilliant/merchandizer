const { Op } = require("sequelize");
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
    this.Artist = db.Artist;
    this.Category = db.Category;
  }

  // Get statistics for a single show
  async getShowStats(showId) {
    const inventories = await this.ShowInventory.findAll({
      where: { showId },
      include: [{ model: this.Product, attributes: ["id", "name", "price"] }],
    });

    // Check if any `endInventory` is null
    const hasNullEndInventory = inventories.some(
      (inventory) => inventory.endInventory === null
    );

    if (hasNullEndInventory) {
      throw createError(
        400,
        "Cannot calculate stats for this show: at least one endInventory is null"
      );
    }

    const productStats = await Promise.all(
      inventories.map(async (inventory) => {
        const adjustments = await this.Adjustment.findAll({
          where: { showInventoryId: inventory.id },
        });

        const price = parseFloat(inventory.Product.price);
        const { restock, giveaway, loss, discount, totalDiscount } =
          summarizeAdjustments(adjustments, price);

        const endInventory = parseFloat(inventory.endInventory);
        const startInventory = parseFloat(inventory.startInventory);
        const adjustedStart = startInventory + restock - giveaway - loss;
        const sold = adjustedStart - endInventory;

        const revenue = sold * price;
        const netRevenue = revenue - totalDiscount;

        return {
          productId: inventory.productId,
          productName: inventory.Product.name,
          startInventory,
          endInventory,
          sold,
          adjustments: { restock, giveaway, loss, discount },
          revenue: parseFloat(revenue.toFixed(2)),
          totalDiscount: parseFloat(totalDiscount.toFixed(2)),
          netRevenue: parseFloat(netRevenue.toFixed(2)),
        };
      })
    );

    const totals = this.aggregateStats(productStats);
    return { products: productStats, totals };
  }

  // Aggregate totals from product stats
  aggregateStats(productStats) {
    return productStats.reduce(
      (acc, stat) => {
        acc.sold += stat.sold;
        acc.revenue += stat.revenue;
        acc.totalDiscount += stat.totalDiscount;
        acc.netRevenue += stat.netRevenue;
        acc.adjustments.restock += stat.adjustments.restock;
        acc.adjustments.giveaway += stat.adjustments.giveaway;
        acc.adjustments.loss += stat.adjustments.loss;
        acc.adjustments.discount += stat.adjustments.discount;
        return acc;
      },
      {
        sold: 0,
        revenue: 0,
        totalDiscount: 0,
        netRevenue: 0,
        adjustments: { restock: 0, giveaway: 0, loss: 0, discount: 0 },
      }
    );
  }

  // Get stats for all shows in a tour
  async getTourStats(tourId) {
    const shows = await this.Show.findAll({ where: { tourId } });

    const allStats = await Promise.all(
      shows.map(async (show) => {
        try {
          return await this.getShowStats(show.id);
        } catch (error) {
          // Skip shows with null endInventory
          if (error.status === 400) return null;
          throw error; // Re-throw unexpected errors
        }
      })
    );

    const validStats = allStats.filter(Boolean); // Exclude null results

    const grandTotals = validStats.reduce(
      (acc, stat) => {
        acc.sold += stat.totals.sold;
        acc.revenue += stat.totals.revenue;
        acc.totalDiscount += stat.totals.totalDiscount;
        acc.netRevenue += stat.totals.netRevenue;
        acc.adjustments.restock += stat.totals.adjustments.restock;
        acc.adjustments.giveaway += stat.totals.adjustments.giveaway;
        acc.adjustments.loss += stat.totals.adjustments.loss;
        acc.adjustments.discount += stat.totals.adjustments.discount;
        return acc;
      },
      {
        sold: 0,
        revenue: 0,
        totalDiscount: 0,
        netRevenue: 0,
        adjustments: { restock: 0, giveaway: 0, loss: 0, discount: 0 },
      }
    );

    return { tourId, totals: grandTotals };
  }

  // Get stats for a product in a tour
  async getProductStatsForTour(productId, tourId) {
    const shows = await this.Show.findAll({ where: { tourId } });

    // Fetch product details once
    const product = await this.Product.findOne({
      where: { id: productId },
      attributes: ["id", "name", "price", "size", "color"],
      include: [
        { model: this.Artist, attributes: ["id", "name"] },
        { model: this.Category, attributes: ["id", "name"] },
      ],
    });

    const productStats = [];

    for (const show of shows) {
      const inventories = await this.ShowInventory.findAll({
        where: { showId: show.id, productId, endInventory: { [Op.not]: null } },
        include: [{ model: this.Product, attributes: ["id", "name", "price"] }],
      });

      for (const inventory of inventories) {
        const adjustments = await this.Adjustment.findAll({
          where: { showInventoryId: inventory.id },
        });

        const price = parseFloat(inventory.Product.price);
        const netAdjustment = calculateAdjustments(adjustments);
        const endInventory = parseFloat(inventory.endInventory);
        const startInventory = parseFloat(inventory.startInventory);
        const sold = startInventory + netAdjustment - endInventory;
        const revenue = sold * price;

        productStats.push({
          sold,
          revenue,
          productName: inventory.Product.name,
        });
      }
    }

    const totalSold = productStats.reduce((acc, stat) => acc + stat.sold, 0);
    const totalRevenue = productStats.reduce(
      (acc, stat) => acc + stat.revenue,
      0
    );

    return {
      Product: product, // Return all product details
      tourId,
      totalSold,
      totalRevenue,
    };
  }
}

module.exports = StatsService;

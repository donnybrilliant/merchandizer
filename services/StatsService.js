const { Op } = require("sequelize");
const createError = require("http-errors");
const {
  processInventory,
  mergeStats,
  formatTotals,
} = require("../utils/calculation");

class StatsService {
  constructor(db) {
    this.Show = db.Show;
    this.ShowInventory = db.ShowInventory;
    this.Adjustment = db.Adjustment;
    this.Product = db.Product;
    this.Tour = db.Tour;
    this.Artist = db.Artist;

    // Default includes
    this.productInclude = {
      model: this.Product,
      attributes: ["id", "name", "price", "size", "color"],
    };

    this.tourInclude = {
      model: this.Tour,
      attributes: ["id", "name", "startDate", "endDate"],
      include: [
        {
          model: this.Artist,
          attributes: ["id", "name"],
        },
      ],
    };

    this.showInclude = {
      model: this.Show,
      attributes: ["id", "date", "venue", "city", "country"],
      include: [this.tourInclude],
    };
  }

  // Fetch inventories with optional filtering
  async fetchInventories(
    showId,
    productId = null,
    skipNullEndInventory = false
  ) {
    const where = { showId };
    if (productId) where.productId = productId;
    if (skipNullEndInventory) where.endInventory = { [Op.not]: null };

    return await this.ShowInventory.findAll({
      where,
      include: [this.productInclude, this.showInclude],
    });
  }

  // Process inventories
  async processInventories(inventories) {
    return await Promise.all(
      inventories.map(async (inventory) => {
        const adjustments = await this.Adjustment.findAll({
          where: { showInventoryId: inventory.id },
        });
        return processInventory(inventory, adjustments);
      })
    );
  }

  // Get stats for a single show
  async getShowStats(showId) {
    const inventories = await this.fetchInventories(showId);

    // Check if endInventory is null for any inventory
    if (inventories.some((inventory) => inventory.endInventory === null)) {
      throw createError(
        400,
        "Cannot calculate stats for this show because at least one endInventory is null"
      );
    }

    // Process inventories and calculate totals
    const productStats = await this.processInventories(inventories);
    const totals = mergeStats(productStats);

    return {
      Show: inventories[0].Show,
      products: productStats,
      totals: formatTotals(totals),
    };
  }

  // Get stats for all shows in a tour
  async getTourStats(tourId) {
    const shows = await this.Show.findAll({
      where: { tourId },
      include: [this.tourInclude],
    });

    const allStats = await Promise.all(
      shows.map(async (show) => {
        const inventories = await this.fetchInventories(show.id, null, true);

        // Skip shows without endInventory
        if (inventories.length === 0) return null;

        // Process inventories and calculate totals for the show
        const productStats = await this.processInventories(inventories);
        const totals = mergeStats(productStats);

        return { Show: show, totals };
      })
    );

    // Filter out null stats and merge totals across all valid stats
    const validStats = allStats.filter(Boolean);
    const grandTotals = mergeStats(validStats.map((stat) => stat.totals));

    return {
      Tour: shows[0].Tour,
      totals: formatTotals(grandTotals),
    };
  }

  // Get stats for a product in a tour
  async getProductStatsForTour(productId, tourId) {
    const shows = await this.Show.findAll({
      where: { tourId },
      include: [this.tourInclude],
    });

    const productStats = [];
    let productDetails;

    for (const show of shows) {
      const inventories = await this.fetchInventories(show.id, productId, true);

      // Process inventories and add product stats
      const processedInventories = await this.processInventories(inventories);
      productStats.push(...processedInventories);

      // Set product details
      productDetails = { ...inventories[0].Product.dataValues };
    }

    // Calculate totals
    const totals = mergeStats(productStats);

    return {
      Tour: shows[0].Tour,
      Product: productDetails,
      totals: formatTotals(totals),
    };
  }
}

module.exports = StatsService;

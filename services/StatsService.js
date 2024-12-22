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
  }

  // Fetch inventories with optional filtering for null endInventory
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
      include: [
        {
          model: this.Product,
          attributes: ["id", "name", "price", "size", "color"],
        },
      ],
    });
  }

  // Process inventories
  async processInventories(inventories) {
    return await Promise.all(
      inventories.map(async (inventory) => {
        // Fetch and process adjustments related to the inventory
        const adjustments = await this.Adjustment.findAll({
          where: { showInventoryId: inventory.id },
        });
        return processInventory(inventory, adjustments);
      })
    );
  }

  // Get stats for a single show
  async getShowStats(showId) {
    const show = await this.Show.findByPk(showId, {
      attributes: ["id", "date", "venue", "city", "country"],
      include: {
        model: this.Tour,
        attributes: { exclude: ["artistId", "createdBy"] },
        include: {
          model: this.Artist,
        },
      },
    });

    const inventories = await this.fetchInventories(showId);

    if (!inventories.length) {
      throw createError(404, "No inventories found for the show");
    }

    if (inventories.some((inventory) => inventory.endInventory === null)) {
      throw createError(
        400,
        "Cannot calculate stats for this show, because at least one endInventory is null"
      );
    }
    // Process inventories and calculate totals
    const productStats = await this.processInventories(inventories);
    const totals = mergeStats(productStats);

    return {
      Show: show,
      products: productStats,
      totals: formatTotals(totals),
    };
  }

  // Get stats for all shows in a tour
  async getTourStats(tourId) {
    const tour = await this.Tour.findByPk(tourId, {
      attributes: { exclude: ["artistId", "createdBy"] },
      include: {
        model: this.Artist,
      },
    });

    const shows = await this.Show.findAll({
      where: { tourId },
    });

    if (!shows.length) {
      throw createError(404, "No shows found for the tour");
    }

    // Process inventories and calculate totals for each show
    const allStats = await Promise.all(
      shows.map(async (show) => {
        const inventories = await this.fetchInventories(show.id, null, true);

        // Skip if no inventories found
        if (inventories.length === 0) return null;

        // Process inventories and calculate totals
        const productStats = await this.processInventories(inventories);
        const totals = mergeStats(productStats);

        return { Show: show, totals };
      })
    );

    // Filter out null stats and calculate grand totals
    const validStats = allStats.filter(Boolean);
    const grandTotals = mergeStats(validStats.map((stat) => stat.totals));

    return {
      Tour: {
        ...tour.toJSON(),
        numberOfShows: shows.length,
      },
      totals: formatTotals(grandTotals),
    };
  }

  // Get stats for a product in a tour
  async getProductStatsForTour(productId, tourId) {
    const tour = await this.Tour.findByPk(tourId, {
      attributes: { exclude: ["artistId", "createdBy"] },
      include: {
        model: this.Artist,
      },
    });

    const product = await this.Product.findByPk(productId, {
      attributes: ["id", "name", "price", "size", "color"],
    });

    const shows = await this.Show.findAll({
      where: { tourId },
    });

    if (!shows.length) {
      throw createError(404, "No shows found for the tour");
    }
    // Process each show to calculate product stats
    const allStats = await Promise.all(
      shows.map(async (show) => {
        const inventories = await this.fetchInventories(
          show.id,
          productId,
          true
        );

        // Skip shows with no valid inventories
        if (!inventories.length) return null;

        // Process inventories and return product stats
        const productStats = await this.processInventories(inventories);
        return productStats;
      })
    );

    // Filter out null stats
    const validStats = allStats.flat().filter(Boolean);

    // If no valid inventories exist for this product
    if (!validStats.length) {
      throw createError(
        404,
        "No inventories exist for this product in the tour or all endInventory are null"
      );
    }

    // Calculate totals for the product
    const totals = mergeStats(validStats);

    return {
      Tour: {
        ...tour.toJSON(),
        numberOfShows: shows.length,
      },
      Product: product,
      totals: formatTotals(totals),
    };
  }
}

module.exports = StatsService;

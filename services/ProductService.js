const { Op } = require("sequelize");
const createError = require("http-errors");
const { isSameData } = require("../utils/checks");

class ProductService {
  constructor(db) {
    this.Product = db.Product;
    this.Category = db.Category;
    this.Artist = db.Artist;
    this.ShowInventory = db.ShowInventory;

    // Default includes and excludes
    this.defaultInclude = [
      {
        model: this.Category,
      },
      {
        model: this.Artist,
      },
    ];
    this.defaultExclude = ["artistId", "categoryId"];
  }

  // Find all products or search with query
  async getAllByQuery(query = {}) {
    const whereConditions = {};

    // Apply filters dynamically
    ["name", "description", "color", "size"].forEach((field) => {
      if (query[field]) {
        whereConditions[field] = { [Op.like]: `%${query[field]}%` };
      }
    });

    if (query.minPrice || query.maxPrice) {
      whereConditions.price = {};
      if (query.minPrice)
        whereConditions.price[Op.gte] = parseFloat(query.minPrice);
      if (query.maxPrice)
        whereConditions.price[Op.lte] = parseFloat(query.maxPrice);
    }

    if (query.category) {
      whereConditions["$Category.name$"] = { [Op.like]: `%${query.category}%` };
    }

    if (query.artist) {
      whereConditions["$Artist.name$"] = { [Op.like]: `%${query.artist}%` };
    }

    return await this.Product.findAll({
      where: whereConditions,
      include: this.defaultInclude,
      attributes: { exclude: this.defaultExclude },
    });
  }

  // Get product by id
  async getById(id) {
    const product = await this.Product.findByPk(id, {
      include: this.defaultInclude,
      attributes: { exclude: this.defaultExclude },
    });
    if (!product) throw createError(404, "Product not found");
    return product;
  }

  // Create product
  async create(data) {
    // Check if artist exists
    const artist = await this.Artist.findByPk(data.artistId);
    if (!artist)
      throw createError(404, "Artist not found. Cannot create product");

    // Check if category exists

    const category = await this.Category.findByPk(data.categoryId);
    if (!category)
      throw createError(404, "Category not found. Cannot create product");

    return await this.Product.create(data);
  }

  // Update product
  async update(product, data) {
    // Check if no changes were made
    if (data.artistId && data.artistId !== product.artistId) {
      const showCount = await this.ShowInventory.count({
        where: { productId: product.id },
      });
      if (showCount > 0) {
        throw createError(
          400,
          "Cannot change the artistId of a product that is referenced by existing show inventories"
        );
      }
    }
    if (isSameData(product, data)) {
      return { noChanges: true, data: product };
    }

    return await product.update(data);
  }

  // Delete product
  async delete(product) {
    await product.destroy();
    return product;
  }
}

module.exports = ProductService;

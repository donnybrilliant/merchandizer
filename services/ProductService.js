const { Op } = require("sequelize");
const createError = require("http-errors");
const { isSameData } = require("../utils/checks");

class ProductService {
  constructor(db) {
    this.Product = db.Product;
    this.Category = db.Category;
    this.Artist = db.Artist;

    // Default includes
    this.defaultInclude = [
      {
        model: this.Category,
        attributes: ["name"],
      },
      {
        model: this.Artist,
        attributes: ["name"],
      },
    ];
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
    });
  }

  // Get product by id
  async getById(id) {
    const product = await this.Product.findByPk(id, {
      include: this.defaultInclude,
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
    if (data.categoryId) {
      const category = await this.Category.findByPk(data.categoryId);
      if (!category) throw createError(404, "Category not found");
    }

    return await this.Product.create(data);
  }

  // Update product
  async update(id, data) {
    // Check if product exists
    const product = await this.getById(id);

    // Check if no changes were made
    if (isSameData(product, data)) {
      return { noChanges: true, data: product };
    }

    return await product.update(data);
  }

  // Delete product
  async delete(id) {
    // Check if product exists
    const product = await this.getById(id);
    await product.destroy();
    return product;
  }
}

module.exports = ProductService;

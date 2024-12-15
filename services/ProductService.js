const { Op } = require("sequelize");
const createError = require("http-errors");
const { isSameData } = require("../utils/checks");

class ProductService {
  constructor(db) {
    this.Product = db.Product;
    this.Category = db.Category;
    this.Artist = db.Artist;
  }

  // Get all products
  async getAll() {
    return await this.Product.findAll({
      include: [
        {
          model: this.Category,
          attributes: ["id", "name"],
        },
        {
          model: this.Artist,
          attributes: ["name"],
        },
      ],
    });
  }

  // Get product by id
  async getById(id) {
    const product = await this.Product.findByPk(id, {
      include: [
        {
          model: this.Category,
          attributes: ["id", "name"],
        },
        {
          model: this.Artist,
          attributes: ["name"],
        },
      ],
    });
    if (!product) throw createError(404, "Product not found");
    return product;
  }

  // Search & filter products
  async search(query) {
    const whereConditions = {};
    const includeConditions = [];

    // Dynamic query
    const productFields = ["name", "description", "color", "size"];
    productFields.forEach((field) => {
      if (query[field]) {
        whereConditions[field] = { [Op.like]: `%${query[field]}%` };
      }
    });

    // Filter by price range
    if (query.minPrice || query.maxPrice) {
      whereConditions.price = {};
      if (query.minPrice) {
        whereConditions.price[Op.gte] = parseFloat(query.minPrice);
      }
      if (query.maxPrice) {
        whereConditions.price[Op.lte] = parseFloat(query.maxPrice);
      }
    }

    // Include Category filtering
    if (query.category) {
      includeConditions.push({
        model: this.Category,
        attributes: ["id", "name"],
        where: { name: { [Op.like]: `%${query.category}%` } },
      });
    }

    // Include Artist filtering
    if (query.artist) {
      includeConditions.push({
        model: this.Artist,
        attributes: ["id", "name"],
        where: { name: { [Op.like]: `%${query.artist}%` } },
      });
    }

    return await this.Product.findAll({
      where: whereConditions,
      include: includeConditions,
    });
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

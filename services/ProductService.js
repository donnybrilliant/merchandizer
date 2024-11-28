const { Op } = require("sequelize");

class ProductService {
  constructor(db) {
    this.client = db.sequelize;
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
          model: this.Artist,
          attributes: ["name"],
        },
      ],
      attributes: { exclude: ["image"] },
    });
  }

  // Get product by id
  async getById(id) {
    return await this.Product.findByPk(id, {
      include: [
        {
          model: this.Category,
          attributes: ["id", "name"],
          model: this.Artist,
          attributes: ["name"],
        },
      ],
    });
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
    return await this.Product.create(data);
  }

  // Update product
  async update(id, data) {
    const rowsUpdated = await this.Product.update(data, { where: { id } });
    if (!rowsUpdated[0]) return null;
    return await this.getById(id);
  }

  // Delete product
  async delete(id) {
    return await this.Product.destroy({ where: { id } });
  }
}

module.exports = ProductService;

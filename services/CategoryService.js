const { Op } = require("sequelize");
const createError = require("http-errors");
const { isSameData } = require("../utils/checks");

class CategoryService {
  constructor(db) {
    this.Category = db.Category;
  }

  // Find all categories or search by name
  async getAllByQuery(query = {}) {
    const whereConditions = {};

    // Apply search filter
    if (query.name) {
      whereConditions.name = { [Op.like]: `%${query.name}%` };
    }

    return await this.Category.findAll({
      where: whereConditions,
    });
  }

  // Get category by id
  async getById(id) {
    const category = await this.Category.findByPk(id);
    if (!category) throw createError(404, "Category not found");
    return category;
  }

  // Check if category name already exists
  async checkName(name) {
    const existingCategory = await this.Category.findOne({ where: { name } });
    if (existingCategory) {
      throw createError(409, `Category ${name} already exists`);
    }
  }

  // Search for category by name
  async search(name) {
    return await this.Category.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`,
        },
      },
    });
  }

  // Create category
  async create(data) {
    await this.checkName(data.name);
    return await this.Category.create(data);
  }

  // Update category
  async update(category, data) {
    // Check if category is in use
    const productCount = await this.Product.count({
      where: { categoryId: category.id },
    });
    if (productCount > 0) {
      throw createError(
        400,
        "Category cannot be updated as it is referenced by products"
      );
    }

    // Check if the data is the same as the category
    if (isSameData(category, data)) {
      return { noChanges: true, data: category };
    }

    // Check if the name exists
    await this.checkName(data.name);

    return await category.update(data);
  }

  // Delete category
  async delete(category) {
    await category.destroy();
    return category;
  }
}

module.exports = CategoryService;

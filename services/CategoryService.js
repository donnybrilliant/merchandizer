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
    // Check if category exists
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
  async update(id, data) {
    // Check if category exists
    const category = await this.getById(id);

    // Check if the data is the same as the category
    if (isSameData(category, data)) {
      return { noChanges: true, data: category };
    }

    // Check if the name exists
    await this.checkName(data.name);

    return await category.update(data);
  }

  // Delete category
  async delete(id) {
    // Check if category exists
    const category = await this.getById(id);
    await category.destroy();
    return category;
  }
}

module.exports = CategoryService;

const { Op } = require("sequelize");

class CategoryService {
  constructor(db) {
    this.client = db.sequelize;
    this.Category = db.Category;
  }

  // Get all categories
  async getAll() {
    return await this.Category.findAll();
  }

  // Get category by id
  async getById(id) {
    return await this.Category.findByPk(id);
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
    return await this.Category.create(data);
  }

  // Update category
  async update(id, data) {
    const rowsUpdated = await this.Category.update(data, { where: { id } });
    if (!rowsUpdated[0]) return null;
    return await this.getById(id);
  }

  // Delete category
  async delete(id) {
    return await this.Category.destroy({ where: { id } });
  }
}

module.exports = CategoryService;

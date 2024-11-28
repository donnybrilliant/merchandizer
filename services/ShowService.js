const { Op } = require("sequelize");

class ShowService {
  constructor(db) {
    this.client = db.sequelize;
    this.Show = db.Show;
  }

  // Get all shows
  async getAll() {
    return await this.Show.findAll();
  }

  // Get show by id
  async getById(id) {
    return await this.Show.findByPk(id);
  }

  // Search for shows by city or venue
  async search(query) {
    return await this.Show.findAll({
      where: {
        [Op.or]: [
          { city: { [Op.like]: `%${query}%` } },
          { venue: { [Op.like]: `%${query}%` } },
        ],
      },
    });
  }

  // Create new show
  async create(data) {
    return await this.Show.create(data);
  }

  // Update show
  async update(id, data) {
    const rowsUpdated = await this.Show.update(data, { where: { id } });
    if (!rowsUpdated[0]) return null;
    return await this.getById(id);
  }

  // Delete show
  async delete(id) {
    return await this.Show.destroy({ where: { id } });
  }
}

module.exports = ShowService;

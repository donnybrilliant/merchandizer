const { Op } = require("sequelize");

class ShowService {
  constructor(db) {
    this.client = db.sequelize;
    this.Show = db.Show;
    this.Artist = db.Artist;
  }

  // Get all shows
  async getAll() {
    return await this.Show.findAll();
  }

  // Get show by id
  async getById(id) {
    return await this.Show.findByPk(id);
  }

  // Search for shows by city, venue, date, country or artist
  async search(query) {
    const whereConditions = {};
    const includeConditions = [
      {
        model: this.Artist,
        attributes: ["id", "name"],
        where: query.artist
          ? { name: { [Op.like]: `%${query.artist}%` } }
          : undefined,
      },
    ];

    // Dynamic query
    const showFields = ["city", "venue", "date", "country"];
    showFields.forEach((field) => {
      if (query[field]) {
        whereConditions[field] = { [Op.like]: `%${query[field]}%` };
      }
    });

    return await this.Show.findAll({
      where: whereConditions,
      include: includeConditions,
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

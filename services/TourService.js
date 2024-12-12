class TourService {
  constructor(db) {
    this.client = db.sequelize;
    this.Tour = db.Tour;
    this.Artist = db.Artist;
  }

  // Get all tours
  async getAll() {
    return await this.Tour.findAll({
      include: [{ model: this.Artist, attributes: ["id", "name"] }],
    });
  }

  // Get tours for user
  async getAllForUser(userId) {
    return await this.Tour.findAll({
      include: [
        { model: this.Artist, attributes: ["id", "name"] },
        {
          model: this.User,
          attributes: [],
          through: {
            attributes: ["role"],
          },
          where: { id: userId },
          required: true,
        },
        {
          model: this.Show,
          attributes: ["id", "date", "venue", "city", "country"],
        },
      ],
    });
  }

  // Get tour by id
  async getById(id) {
    return await this.Tour.findByPk(id, {
      include: [{ model: this.Artist, attributes: ["id", "name"] }],
    });
  }

  // Create new tour
  async create(data) {
    return await this.Tour.create(data);
  }

  // Update tour
  async update(id, data) {
    const rowsUpdated = await this.Tour.update(data, {
      where: { id },
    });
    if (!rowsUpdated[0]) return null;
    return await this.getById(id);
  }

  // Delete tour
  async delete(id) {
    return await this.Tour.destroy({ where: { id } });
  }
}

module.exports = TourService;

class TourService {
  constructor(db) {
    this.Tour = db.Tour;
    this.Artist = db.Artist;
  }

  // Get all tours
  async getAll() {
    return await this.Tour.findAll({
      include: [{ model: this.Artist, attributes: ["id", "name"] }],
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

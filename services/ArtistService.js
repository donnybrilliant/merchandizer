const { Op } = require("sequelize");

class ArtistService {
  constructor(db) {
    this.client = db.sequelize;
    this.Artist = db.Artist;
  }

  // Get all artists
  async getAll() {
    return await this.Artist.findAll();
  }

  // Get artist by id
  async getById(id) {
    return await this.Artist.findByPk(id);
  }

  // Search artist by name
  async search(name) {
    return await this.Artist.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`,
        },
      },
    });
  }

  // Create new artist
  async create(artistData) {
    return await this.Artist.create(artistData);
  }

  // Delete artist
  async delete(id) {
    return await this.Artist.destroy({ where: { id } });
  }
}

module.exports = ArtistService;

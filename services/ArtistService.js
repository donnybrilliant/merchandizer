const { Op } = require("sequelize");
const { isSameData } = require("../utils/checks");
const createError = require("http-errors");

class ArtistService {
  constructor(db) {
    this.Artist = db.Artist;
    this.Product = db.Product;
    this.Tour = db.Tour;
    this.Show = db.Show;
  }

  // Find all artists or search by query
  async getAllByQuery(query = {}) {
    const whereConditions = {};

    // Apply search filter
    if (query.name) {
      whereConditions.name = { [Op.like]: `%${query.name}%` };
    }

    return await this.Artist.findAll({
      where: whereConditions,
    });
  }

  // Get artist by id
  async getById(id) {
    const artist = await this.Artist.findByPk(id);
    if (!artist) throw createError(404, "Artist not found");
    return artist;
  }

  // Check if artist name already exists
  async checkName(name) {
    const existingArtist = await this.Artist.findOne({ where: { name } });
    if (existingArtist) {
      throw createError(409, `Artist ${name} already exists`);
    }
  }

  // Create new artist
  async create(data) {
    // Check if the name is taken
    await this.checkName(data.name);
    return await this.Artist.create(data);
  }

  // Update artist
  async update(artist, data) {
    // Check if artist is in use
    const productCount = await this.Product.count({
      where: { artistId: artist.id },
    });
    const tourCount = await this.Tour.count({ where: { artistId: artist.id } });
    const showCount = await this.Show.count({ where: { artistId: artist.id } });

    if (productCount > 0 || tourCount > 0 || showCount > 0) {
      throw createError(
        400,
        "Cannot update artist as it is referenced by existing tours, shows, or products"
      );
    }
    // Check if the data is the same as the artist
    if (isSameData(artist, data)) {
      return { noChanges: true, data: artist };
    }

    // Check that the name is taken
    await this.checkName(data.name);

    return await artist.update(data);
  }

  // Delete artist
  async delete(artist) {
    await artist.destroy();
    return artist;
  }
}

module.exports = ArtistService;

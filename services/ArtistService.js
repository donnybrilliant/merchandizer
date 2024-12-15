const { Op } = require("sequelize");
const { isSameData } = require("../utils/checks");
const createError = require("http-errors");

class ArtistService {
  constructor(db) {
    this.Artist = db.Artist;
  }

  // Find all artists or search by query
  async getAllByQuery(query = {}) {
    const whereConditions = {};

    // Apply search filter
    if (query.name) {
      whereConditions.name = { [Op.like]: `%${query.name}%` };
    }

    const artists = await this.Artist.findAll({
      where: whereConditions,
    });

    if (!artists.length) {
      throw createError(
        404,
        query.length
          ? `No artists found matching the query: ${query.name}`
          : "No artists exist"
      );
    }

    return artists;
  }

  // Create new artist
  async create(data) {
    // Check if the name is taken
    await this.checkName(data.name);
    return await this.Artist.create(data);
  }

  // Update artist
  async update(id, data) {
    // Check if the artist exists
    const artist = await this.getById(id);

    // Check if the data is the same as the artist
    if (isSameData(artist, data)) {
      return { noChanges: true, data: artist };
    }

    // Check that the name is taken
    await this.checkName(data.name);

    return await artist.update(data);
  }

  // Delete artist
  async delete(id) {
    // Check if the artist exists
    const artist = await this.getById(id);
    await artist.destroy();
    return artist;
  }
}

module.exports = ArtistService;

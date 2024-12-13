const { Op } = require("sequelize");
const { isSameData } = require("../utils/checks");
const createError = require("http-errors");

class ArtistService {
  constructor(db) {
    this.Artist = db.Artist;
  }

  // Get all artists
  async getAll() {
    return await this.Artist.findAll();
  }

  // Get artist by id
  async getById(id) {
    const artist = await this.Artist.findByPk(id);
    if (!artist) throw createError(400, "Artist not found");
    return artist;
  }

  // Get artist by name
  async getByName(name) {
    return await this.Artist.findOne({
      where: { name },
    });
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
  async create(data) {
    const existingArtist = await this.getByName(data.name);
    if (existingArtist) {
      throw createError(
        409,
        `Artist with the name ${data.name} already exists`
      );
    }
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

    const existingArtist = await this.getByName(data.name);
    if (existingArtist) {
      throw createError(`Artist with the name ${data.name} already exists`);
    }

    return await artist.update(data);
  }

  // Delete artist
  async delete(id) {
    const artist = await this.getById(id);
    await artist.destroy();
    return artist;
  }
}

module.exports = ArtistService;

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
    // Check it the artist exists
    const artist = await this.Artist.findByPk(id);
    if (!artist) throw createError(400, "Artist not found");
    return artist;
  }

  // Check if artist name already exists
  async checkName(name) {
    const existingArtist = await this.Artist.findOne({ where: { name } });
    if (existingArtist) {
      throw createError(409, `Artist with the name ${name} already exists`);
    }
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

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

  // Get all shows on the tour
  async getAllByTour(tourId) {
    return await this.Show.findAll({
      where: { tourId },
      include: [
        {
          model: this.Artist,
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "date", "venue", "city", "country"],
    });
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

  // Find the previous show for the current show in the same tour
  async findPreviousShow(currentShowId) {
    const currentShow = await this.Show.findByPk(currentShowId);

    if (!currentShow) {
      throw new Error("Current show not found");
    }

    if (!currentShow.tourId) {
      throw new Error("Current show does not belong to a tour");
    }

    // Get all shows in the same tour, ordered by date
    const shows = await this.Show.findAll({
      where: { tourId: currentShow.tourId },
      order: [["date", "ASC"]],
    });

    // Find the index of the current show
    const showIndex = shows.findIndex(
      (show) => show.id === Number(currentShowId)
    );

    if (showIndex <= 0) {
      throw new Error("No previous show found for the tour");
    }

    return shows[showIndex - 1];
  }
}

module.exports = ShowService;

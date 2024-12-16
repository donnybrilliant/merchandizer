const { Op } = require("sequelize");
const createError = require("http-errors");
const { isSameData, checkDateRange } = require("../utils/checks");

class ShowService {
  constructor(db) {
    this.Show = db.Show;
    this.Artist = db.Artist;
    this.Tour = db.Tour;

    // Default includes
    this.defaultInclude = [
      {
        model: this.Artist,
        attributes: ["id", "name"],
      },
    ];
  }

  // Get all shows
  async getAll() {
    return await this.Show.findAll({
      include: this.defaultInclude,
    });
  }

  // Find all shows on the tour or search with query
  async getAllByTour(tourId, query = {}) {
    const whereConditions = { tourId };

    // Apply search filters
    ["city", "venue", "date", "country"].forEach((field) => {
      if (query[field]) {
        whereConditions[field] = { [Op.like]: `%${query[field]}%` };
      }
    });

    return await this.Show.findAll({
      where: whereConditions,
      include: this.defaultInclude,
    });
  }

  // Get show by id
  async getById(id) {
    const show = await this.Show.findByPk(id, {
      include: this.defaultInclude,
    });
    if (!show) throw createError(404, "Show not found");
    return show;
  }

  // Create new show
  async create(tourId, data) {
    // Validate the show date
    checkDateRange(data.date, tour.startDate, tour.endDate);

    // Check if artist exists
    const artist = await this.Artist.findByPk(data.artistId);
    if (!artist) throw createError(404, "Artist not found. Cannot create show");

    return await this.Show.create({ ...data, tourId });
  }

  // Create multiple shows
  async createMany(tourId, showsData) {
    // Validate and prepare shows data
    const newShows = [];
    for (const data of showsData) {
      // Validate the show date
      checkDateRange(data.date, tour.startDate, tour.endDate);

      // Check if artist exists
      const artist = await this.Artist.findByPk(data.artistId);
      if (!artist) {
        throw createError(
          404,
          `Artist not found for show with date ${data.date}. Cannot create show`
        );
      }

      newShows.push({ ...data, tourId });
    }

    // Bulk create all valid shows
    return await this.Show.bulkCreate(newShows);
  }

  // Update show
  async update(id, data) {
    const show = await this.getById(id);

    // Validate the new show date, if provided
    if (data.date) {
      checkDateRange(data.date, tour.startDate, tour.endDate);
    }

    // Check if no changes are made
    if (isSameData(show, data)) {
      return { noChanges: true, data: show };
    }

    await show.update(data);
    return show;
  }

  // Delete show
  async delete(id) {
    const show = await this.getById(id);
    await show.destroy();
    return show;
  }

  // Find the previous show for the current show in the same tour
  async findPreviousShow(currentShowId) {
    const currentShow = await this.Show.findByPk(currentShowId);

    if (!currentShow) {
      throw createError(404, "Current show not found");
    }

    if (!currentShow.tourId) {
      throw createError(400, "Current show does not belong to a tour");
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
      throw createError(404, "No previous show found for the tour");
    }

    return shows[showIndex - 1];
  }
}

module.exports = ShowService;

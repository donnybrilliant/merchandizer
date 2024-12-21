const { Op } = require("sequelize");
const createError = require("http-errors");
const { isSameData, checkDateRange } = require("../utils/checks");

class ShowService {
  constructor(db) {
    this.Show = db.Show;
    this.Artist = db.Artist;
    this.Tour = db.Tour;
    this.ShowInventory = db.ShowInventory;

    // Default includes and excludes
    this.defaultInclude = [
      {
        model: this.Artist,
      },
      {
        model: this.Tour,
        attributes: ["id", "name"],
      },
    ];
    this.defaultExclude = ["artistId", "tourId"];
    this.defaultOrder = [["date", "ASC"]];
  }

  // Get all shows
  async getAll() {
    return await this.Show.findAll({
      include: this.defaultInclude,
      attributes: { exclude: this.defaultExclude },
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
      attributes: { exclude: this.defaultExclude },
      order: this.defaultOrder,
    });
  }

  // Get show by id
  async getById(id) {
    const show = await this.Show.findByPk(id, {
      include: this.defaultInclude,
      attributes: { exclude: this.defaultExclude },
    });
    if (!show) throw createError(404, "Show not found");
    return show;
  }

  // Create new show
  async create(tourId, data) {
    const tour = await this.Tour.findByPk(tourId);

    // Validate the show date
    checkDateRange(data.date, tour.startDate, tour.endDate);

    // Check if artist exists
    const artist = await this.Artist.findByPk(data.artistId);
    if (!artist) throw createError(404, "Artist not found. Cannot create show");

    return await this.Show.create({ ...data, tourId });
  }

  // Create multiple shows
  async createMany(tourId, showsData) {
    // Check if tour exists once
    const tour = await this.Tour.findByPk(tourId);

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
  async update(show, data) {
    // Check if artistId or tourId is changing
    const changingArtist = data.artistId && data.artistId !== show.artistId;
    const changingTour = data.tourId && data.tourId !== show.tourId;

    if (changingArtist || changingTour) {
      // Count show inventories
      const inventoryCount = await this.ShowInventory.count({
        where: { showId: show.id },
      });
      if (inventoryCount > 0) {
        throw createError(
          400,
          "Cannot update artistId or tourId for a show that has existing inventory"
        );
      }
    }

    // Validate the new show date, if provided
    if (data.date) {
      const tour = await this.Tour.findByPk(show.Tour.id);

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
  async delete(show) {
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
    const showIndex = shows.findIndex((show) => show.id === currentShowId);

    if (showIndex <= 0) {
      throw createError(404, "No previous show found for the tour");
    }

    return shows[showIndex - 1];
  }
}

module.exports = ShowService;

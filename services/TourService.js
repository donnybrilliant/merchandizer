const createError = require("http-errors");
const { isSameData } = require("../utils/checks");

class TourService {
  constructor(db) {
    this.Tour = db.Tour;
    this.Artist = db.Artist;
    this.UserRoleTour = db.UserRoleTour;
    this.User = db.User;
    this.Show = db.Show;

    // Define default includes and excludes
    this.defaultInclude = [
      { model: this.Artist },
      {
        model: this.Show,
        attributes: ["id", "date", "venue", "city", "country"],
      },
    ];
    this.defaultExclude = ["artistId"];
    this.defaultOrder = [
      ["startDate", "ASC"],
      [this.Show, "date", "ASC"],
    ];
  }

  // Get all tours
  async getAll() {
    return await this.Tour.findAll({
      attributes: { exclude: this.defaultExclude },
      include: this.defaultInclude,
    });
  }

  // Get tours for user
  async getAllForUser(userId) {
    return await this.Tour.findAll({
      attributes: { exclude: [...this.defaultExclude, "createdBy"] },
      include: [
        ...this.defaultInclude,
        {
          model: this.User,
          attributes: [],
          through: {
            attributes: ["role"],
          },
          where: { id: userId },
          required: true,
        },
      ],
      order: this.defaultOrder,
    });
  }

  // Get tour by id
  async getById(id) {
    // Check if tour exists
    const tour = await this.Tour.findByPk(id, {
      attributes: { exclude: [...this.defaultExclude, "createdBy"] },
      include: this.defaultInclude,
      order: this.defaultOrder,
    });
    if (!tour) throw createError(404, "Tour not found");
    return tour;
  }

  // Create new tour
  async create(data, userId) {
    // Check if artist exists
    const artist = await this.Artist.findByPk(data.artistId);
    if (!artist) {
      throw createError(404, "Artist not found. Cannot create tour");
    }
    const newTour = await this.Tour.create({
      ...data,
      createdBy: userId,
    });

    // Assign the user as the manager
    await this.UserRoleTour.create({
      userId,
      tourId: newTour.id,
      role: "manager",
    });

    return newTour;
  }

  // Update tour
  async update(tour, data) {
    // Check if the tour has any shows
    if (data.artistId && data.artistId !== tour.artistId) {
      const showCount = await this.Show.count({ where: { tourId: tour.id } });
      if (showCount > 0) {
        throw createError(
          400,
          "Cannot change the artistId of a tour that already has shows"
        );
      }
    }

    // Check if no changes are made
    if (isSameData(tour, data)) {
      return { noChanges: true, data: tour };
    }

    await tour.update(data);
    return tour;
  }

  // Delete tour
  async delete(tour) {
    await tour.destroy();
    return tour;
  }
}

module.exports = TourService;

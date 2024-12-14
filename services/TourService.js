const createError = require("http-errors");
const { isSameData } = require("../utils/checks");

class TourService {
  constructor(db) {
    this.Tour = db.Tour;
    this.Artist = db.Artist;
    this.UserRoleTour = db.UserRoleTour;
    this.User = db.User;
    this.Show = db.Show;
  }

  // Get all tours
  async getAll() {
    return await this.Tour.findAll({
      include: [{ model: this.Artist, attributes: ["id", "name"] }],
    });
  }

  // Get tours for user
  async getAllForUser(userId) {
    return await this.Tour.findAll({
      include: [
        { model: this.Artist, attributes: ["id", "name"] },
        {
          model: this.User,
          attributes: [],
          through: {
            attributes: ["role"],
          },
          where: { id: userId },
          required: true,
        },
        {
          model: this.Show,
          attributes: ["id", "date", "venue", "city", "country"],
        },
      ],
    });
  }

  // Get tour by id
  async getById(id) {
    // Check if tour exists
    const tour = await this.Tour.findByPk(id, {
      include: [{ model: this.Artist, attributes: ["id", "name"] }],
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
  async update(id, data) {
    // Check if tour exists
    const tour = await this.getById(id);

    // Check if no changes are made
    if (isSameData(tour, data)) {
      return { noChanges: true, data: tour };
    }

    await tour.update(data);
    return tour;
  }

  // Delete tour
  async delete(id) {
    // Check if tour exists
    const tour = await this.getById(id);
    await tour.destroy();
    return tour;
  }
}

module.exports = TourService;

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
    return await this.Tour.findByPk(id, {
      include: [{ model: this.Artist, attributes: ["id", "name"] }],
    });
  }

  // Create new tour
  async create(data, userId) {
    // Check if artist exists
    const artist = await this.Artist.findByPk(data.artistId);
    if (!artist) {
      throw new Error("Artist not found. Cannot create tour.");
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
    const rowsUpdated = await this.Tour.update(data, {
      where: { id },
    });
    if (!rowsUpdated[0]) return null;
    return await this.getById(id);
  }

  // Delete tour
  async delete(id) {
    return await this.Tour.destroy({ where: { id } });
  }
}

module.exports = TourService;

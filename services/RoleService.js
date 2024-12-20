const createError = require("http-errors");
class RoleService {
  constructor(db) {
    this.Tour = db.Tour;
    this.UserRoleTour = db.UserRoleTour;
    this.User = db.User;
  }

  // Check role for user on tour for middleware auth
  async checkUserRoleTour(userId, tourId) {
    return await this.UserRoleTour.findOne({
      where: { userId, tourId },
    });
  }

  // Add user to tour
  async addUserToTour(tourId, userId, role, email) {
    let user;

    // If userId is not provided, find the user by email
    if (!userId && email) {
      user = await this.User.findOne({ where: { email } });
      if (!user) throw createError(404, "User not found by email");
      userId = user.id; // Set userId for further operations
    } else {
      // Check if the user to be added exists
      user = await this.User.findByPk(userId);
      if (!user) throw createError(404, "User not found by ID");
    }

    // Check if the user is already assigned a role for this tour
    const existing = await this.UserRoleTour.findOne({
      where: { userId, tourId },
    });
    if (existing) throw createError(400, "User already assigned to this tour");

    // Create the user-tour association
    return await this.UserRoleTour.create({
      userId,
      tourId,
      role,
    });
  }

  // Get users associated with tour
  async getUsersForTour(tourId) {
    // Fetch users and their roles for the specified tour
    const userRoles = await this.UserRoleTour.findAll({
      where: { tourId },
      attributes: ["role"],
      include: [
        {
          model: this.User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    return userRoles;
  }

  // Update user role for tour
  async updateUserRole(tourId, userId, newRole) {
    // Check if the user to be added exists
    const user = await this.User.findByPk(userId);
    if (!user) throw createError(404, "User not found");

    // Find the tour
    const tour = await this.Tour.findByPk(tourId);

    // Prevent changing roles of the first manager
    if (tour.createdBy === userId) {
      throw createError(
        400,
        "The first manager cannot be downgraded or updated"
      );
    }

    // Find the UserRoleTour entry
    const userRoleTour = await this.UserRoleTour.findOne({
      where: { tourId, userId },
    });

    if (!userRoleTour) {
      throw createError(400, "User is not assigned to this tour");
    }

    // Check if the role is the same
    if (userRoleTour.role === newRole) {
      return { noChanges: true, data: userRoleTour };
    }

    userRoleTour.role = newRole;
    return await userRoleTour.save();
  }

  // Delete user from tour
  async deleteUserFromTour(tourId, userId) {
    const tour = await this.Tour.findByPk(tourId);

    // Prevent deleting the first manager
    if (tour.createdBy === userId) {
      throw createError(
        400,
        "The first manager cannot be removed from the tour"
      );
    }

    // Find the UserRoleTour entry
    const userRoleTour = await this.UserRoleTour.findOne({
      where: { tourId, userId },
    });
    if (!userRoleTour) {
      throw createError(404, "User not found in this tour");
    }
    await userRoleTour.destroy();
    return userRoleTour;
  }
}

module.exports = RoleService;

class RoleService {
  constructor(db) {
    this.client = db.sequelize;
    this.Tour = db.Tour;
    this.UserRoleTour = db.UserRoleTour;
    this.User = db.User;
  }

  // Check role for user on tour for middleware auth
  async checkUserRoleTour(userId, tourId) {
    return await db.UserRoleTour.findOne({
      where: { userId, tourId },
    });
  }

  // Add user to tour
  async addUserToTour(tourId, userId, role) {
    // Check if the user to be added exists
    const user = await this.User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // Check if the tour exists
    const tour = await this.Tour.findByPk(tourId);
    if (!tour) throw new Error("Tour not found");

    // Validate the role
    const validRoles = ["manager", "sales", "viewer"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role");
    }

    // Check if the user is already assigned a role for this tour
    const existing = await this.UserRoleTour.findOne({
      where: { userId, tourId },
    });
    if (existing) throw new Error("User already assigned to this tour");

    // Create the user-tour association
    await this.UserRoleTour.create({
      userId,
      tourId,
      role,
    });

    return { success: true, message: "User added to tour successfully" };
  }

  // Get users associated with tour
  async getUsersForTour(tourId) {
    // Verify that the tour exists - this might not be neccesary as it is stopped by middleware
    const tour = await this.Tour.findByPk(tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    // Fetch users and their roles for the specified tour
    const userRoles = await this.UserRoleTour.findAll({
      where: { tourId },
      attributes: ["role"],
      include: [
        {
          model: this.User,
          attributes: ["id", "firstName", "lastName", "email"], // Include user fields
        },
      ],
    });

    return userRoles;
    // Map the response to include user details and role
    /*   return userRoles.map((userRole) => ({
      id: userRole.User.id,
      firstName: userRole.User.firstName,
      lastName: userRole.User.lastName,
      email: userRole.User.email,
      role: userRole.role, // Role from UserRoleTour
    })); */
  }

  // Update user role for tour
  async updateUserRole(tourId, userId, newRole) {
    // Validate the new role
    const validRoles = ["manager", "sales", "viewer"];
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role");
    }

    // Find the tour
    const tour = await this.Tour.findByPk(tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    // Prevent changing roles of the first manager
    if (tour.createdBy !== userId) {
      throw new Error("The first manager cannot be downgraded or updated");
    }

    // Find the UserRoleTour entry
    const userRoleTour = await this.UserRoleTour.findOne({
      where: { tourId, userId },
    });

    if (!userRoleTour) {
      throw new Error("User is not assigned to this tour");
    }

    // Update the role
    userRoleTour.role = newRole;
    await userRoleTour.save();

    return {
      success: true,
      message: "User role updated successfully",
      role: newRole,
    };
  }

  // Delete user from tour
  async deleteUserFromTour(tourId, userId) {
    // Find the tour
    const tour = await this.Tour.findByPk(tourId);
    if (!tour) {
      throw new Error("Tour not found");
    }

    // Prevent deleting the first manager
    if (tour.createdBy !== userId) {
      throw new Error("The first manager cannot be removed from the tour");
    }

    // Find and delete the UserRoleTour entry
    const rowsDeleted = await this.UserRoleTour.destroy({
      where: { tourId, userId },
    });

    if (rowsDeleted === 0) {
      throw new Error("User not found in this tour");
    }

    return { success: true, message: "User removed from the tour" };
  }
}

module.exports = RoleService;

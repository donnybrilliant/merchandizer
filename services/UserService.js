const { isSameData } = require("../utils/checks");

class UserService {
  constructor(db) {
    this.User = db.User;
  }

  // Get user by email
  async getByEmail(email) {
    const user = await this.User.findOne({
      where: { email },
    });
    if (!user) throw createError(404, "User not found");
    return user;
  }

  // Get user by id
  async getById(id) {
    const user = await this.User.findByPk(id, {
      attributes: { exclude: ["encryptedPassword", "salt"] },
    });
    if (!user) throw createError(404, "User not found");
    return user;
  }

  // Get all users
  async getAll() {
    return await this.User.findAll({
      attributes: { exclude: ["encryptedPassword", "salt", "avatar"] },
    });
  }

  // Create user
  async create(user) {
    const { firstName, lastName, email, encryptedPassword, salt } = user;

    return await this.User.create({
      firstName,
      lastName,
      email,
      encryptedPassword,
      salt,
    });
  }

  // Update user
  async update(id, data) {
    const user = await this.getById(id);

    // Check if the data is the same as the user
    if (isSameData(user, data)) {
      return { noChanges: true, data: user };
    }

    await user.update(data);
    return user;
  }

  // Delete user
  async delete(id) {
    const user = await this.getById(id);
    await user.destroy();
    return user;
  }

  // Change password
  async changePassword(id, newHashedPassword, salt) {
    return await this.User.update(
      { encryptedPassword: newHashedPassword, salt },
      { where: { id } }
    );
  }
}

module.exports = UserService;

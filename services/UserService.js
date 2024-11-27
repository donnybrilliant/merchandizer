class UserService {
  constructor(db) {
    this.client = db.sequelize;
    this.User = db.User;
  }

  // Get user by email
  async getByEmail(email) {
    return await this.User.findOne({
      where: { email },
    });
  }

  // Get user by id
  async getById(id) {
    return await this.User.findByPk(id, {
      attributes: { exclude: ["encryptedPassword", "salt"] },
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
    const rowsUpdated = await this.User.update(data, {
      where: { id },
    });

    if (rowsUpdated[0] === 0) return null;

    return await this.getById(id);
  }

  // Delete user
  async delete(id) {
    return await this.User.destroy({ where: { id } });
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

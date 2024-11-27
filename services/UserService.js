class UserService {
  constructor(db) {
    this.client = db.sequelize;
    this.User = db.User;
  }

  // Get user by email
  async getOne(email) {
    return await this.User.findOne({
      where: { email },
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

}

module.exports = UserService;

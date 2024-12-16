const createError = require("http-errors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

class AuthService {
  constructor(db) {
    this.User = db.User;
  }

  // Generate JWT token
  generateToken(user) {
    const { id, role } = user;
    return jwt.sign({ id, role }, process.env.TOKEN_SECRET, {
      expiresIn: "2h",
    });
  }

  // Method for password hashing
  async hashPassword(password, salt = crypto.randomBytes(16)) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        310000,
        32,
        "sha256",
        (err, hashedPassword) => {
          if (err) return reject(err);
          resolve({ hashedPassword, salt });
        }
      );
    });
  }

  // Get user by email
  async getByEmail(email) {
    return await this.User.findOne({
      where: { email },
    });
  }

  // Login
  async login(email, password) {
    const user = await this.getByEmail(email);
    if (!user) {
      throw createError(401, "Incorrect email or password");
    }

    // Hash the provided password with the users salt
    const { hashedPassword } = await this.hashPassword(password, user.salt);

    // Verify the hashed password
    if (!crypto.timingSafeEqual(user.encryptedPassword, hashedPassword)) {
      throw createError(401, "Incorrect email or password");
    }
    const token = this.generateToken(user);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };
  }

  // Register new user
  async register(data) {
    const { firstName, lastName, email, password } = data;
    const existingUser = await this.getByEmail(email);
    if (existingUser) {
      throw createError(409, "Email is already in use");
    }

    // Hash the new password and generate a salt
    const { hashedPassword, salt } = await this.hashPassword(password);

    return await this.User.create({
      firstName,
      lastName,
      email,
      encryptedPassword: hashedPassword,
      salt,
    });
  }

  // Change users password
  async changePassword(id, oldPassword, newPassword) {
    const user = await this.User.findByPk(id);

    // Verify old password
    const { hashedPassword: oldHashedPassword } = await this.hashPassword(
      oldPassword,
      user.salt
    );
    if (!crypto.timingSafeEqual(user.encryptedPassword, oldHashedPassword)) {
      throw createError(400, "Incorrect old password");
    }

    // Hash the new password
    const { hashedPassword: newHashedPassword, salt: newSalt } =
      await this.hashPassword(newPassword);

    // Update the password in the database
    return await this.User.update(
      { encryptedPassword: newHashedPassword, salt: newSalt },
      { where: { id } }
    );
  }
}

module.exports = AuthService;

const crypto = require("crypto");

// Utility to hash password
const hashPassword = (password, salt = crypto.randomBytes(16)) => {
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
};

module.exports = { hashPassword };

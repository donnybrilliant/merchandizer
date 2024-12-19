const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const logging = process.env.NODE_ENV !== "test";
const connection = {
  database: process.env.DATABASE_NAME,
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  port: process.env.DATABASE_PORT,
  host: process.env.HOST,
  dialect: process.env.DIALECT,
  define: {
    timestamps: false,
  },
  logging: logging,
};

const sequelize = new Sequelize(connection);
const db = {};

// Load models
db.sequelize = sequelize;
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize);
    db[model.name] = model;
  });

// Create associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("User", {
    firstName: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: Sequelize.DataTypes.STRING,
    },
    avatar: {
      type: Sequelize.DataTypes.BLOB("medium"),
    },
    encryptedPassword: {
      type: Sequelize.DataTypes.BLOB,
      allowNull: false,
    },
    salt: {
      type: Sequelize.DataTypes.BLOB,
      allowNull: false,
    },
    role: {
      type: Sequelize.DataTypes.ENUM("admin", "user"),
      allowNull: false,
      defaultValue: "user",
    },
  });

  User.associate = function (models) {
    User.belongsToMany(models.Tour, {
      through: models.UserRoleTour,
      foreignKey: "userId",
    });
  };

  return User;
};

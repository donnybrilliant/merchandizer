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
  });

  User.associate = function (models) {
    User.belongsTo(models.Role, {
      foreignKey: {
        name: "roleId",
      },
    });
    User.belongsToMany(models.Tour, {
      through: "UserTour",
      foreignKey: "userId",
    });
  };

  return User;
};

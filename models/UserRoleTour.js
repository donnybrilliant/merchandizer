module.exports = (sequelize, Sequelize) => {
  const UserRoleTour = sequelize.define("UserRoleTour", {
    role: {
      type: Sequelize.DataTypes.ENUM("manager", "sales", "viewer"),
      allowNull: false,
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    tourId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Tours",
        key: "id",
      },
    },
  });

  UserRoleTour.associate = function (models) {
    UserRoleTour.belongsTo(models.User, { foreignKey: "userId" });
    UserRoleTour.belongsTo(models.Tour, { foreignKey: "tourId" });
  };

  return UserRoleTour;
};

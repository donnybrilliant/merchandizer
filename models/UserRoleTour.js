module.exports = (sequelize, Sequelize) => {
  const UserRoleTour = sequelize.define("UserRoleTour", {
    roleId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Roles",
        key: "id",
      },
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
    UserRoleTour.belongsTo(models.Role, { foreignKey: "roleId" });
    UserRoleTour.belongsTo(models.Tour, { foreignKey: "tourId" });
  };

  return UserRoleTour;
};

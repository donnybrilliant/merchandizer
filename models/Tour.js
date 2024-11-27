module.exports = (sequelize, Sequelize) => {
  const Tour = sequelize.define("Tour", {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    },
  });

  Tour.associate = function (models) {
    Tour.belongsTo(models.Artist, {
      foreignKey: {
        name: "artistId",
        allowNull: false,
      },
    });
    Tour.hasMany(models.Show, {
      foreignKey: {
        name: "tourId",
        allowNull: false,
      },
    });
    Tour.belongsToMany(models.Product, {
      through: models.TourInventory,
      foreignKey: "tourId",
    });
    Tour.belongsToMany(models.User, {
      through: models.UserRoleTour,
      foreignKey: "tourId",
    });
    Tour.belongsToMany(models.Role, {
      through: models.UserRoleTour,
      foreignKey: "tourId",
    });
  };

  return Tour;
};

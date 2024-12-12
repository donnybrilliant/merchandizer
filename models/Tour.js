module.exports = (sequelize, Sequelize) => {
  const Tour = sequelize.define("Tour", {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: Sequelize.DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: Sequelize.DataTypes.DATEONLY,
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
    Tour.belongsToMany(models.User, {
      through: models.UserRoleTour,
      foreignKey: "tourId",
    });
    Tour.belongsTo(models.User, {
      as: "creator",
      foreignKey: "createdBy",
    });
  };

  return Tour;
};

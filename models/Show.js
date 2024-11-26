module.exports = (sequelize, Sequelize) => {
  const Show = sequelize.define("Show", {
    date: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
    },
    venue: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    getInTime: {
      type: Sequelize.DataTypes.TIME,
      allowNull: true,
    },
    loadOutTime: {
      type: Sequelize.DataTypes.TIME,
      allowNull: true,
    },
    doorsTime: {
      type: Sequelize.DataTypes.TIME,
      allowNull: true,
    },
    onStageTime: {
      type: Sequelize.DataTypes.TIME,
      allowNull: true,
    },
  });

  Show.associate = function (models) {
    Show.belongsTo(models.Artist, {
      foreignKey: {
        name: "artistId",
        allowNull: false,
      },
    });
    Show.belongsTo(models.Tour, {
      foreignKey: {
        name: "tourId",
        allowNull: true,
      },
    });
    Show.belongsToMany(models.Product, {
      through: models.ShowInventory,
      foreignKey: "showId",
    });
  };

  return Show;
};

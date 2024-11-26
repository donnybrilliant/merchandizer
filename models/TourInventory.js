module.exports = (sequelize, Sequelize) => {
  const TourInventory = sequelize.define("TourInventory", {
    startInventory: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    },
    endInventory: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    },
  });

  TourInventory.associate = function (models) {
    TourInventory.belongsTo(models.Tour, {
      foreignKey: {
        name: "tourId",
        allowNull: false,
      },
    });
    TourInventory.belongsTo(models.Product, {
      foreignKey: {
        name: "productId",
        allowNull: false,
      },
    });
  };

  return TourInventory;
};

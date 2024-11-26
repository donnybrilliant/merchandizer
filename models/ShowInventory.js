module.exports = (sequelize, Sequelize) => {
  const ShowInventory = sequelize.define("ShowInventory", {
    startInventory: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    },
    endInventory: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    },
  });

  ShowInventory.associate = function (models) {
    ShowInventory.belongsTo(models.Show, {
      foreignKey: {
        name: "showId",
        allowNull: false,
      },
    });
    ShowInventory.belongsTo(models.Product, {
      foreignKey: {
        name: "productId",
        allowNull: false,
      },
    });
    /*     ShowInventory.hasMany(models.Adjustment, {
      foreignKey: {
        name: "showInventoryId",
        allowNull: false,
      },
    }); */
  };

  return ShowInventory;
};

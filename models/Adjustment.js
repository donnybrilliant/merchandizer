module.exports = (sequelize, Sequelize) => {
  const Adjustment = sequelize.define("Adjustment", {
    quantity: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.DataTypes.ENUM("giveaway", "discount", "loss", "restock"),
      allowNull: false,
    },
    discountValue: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discountType: {
      type: Sequelize.DataTypes.ENUM("fixed", "percentage"),
      allowNull: true,
    },
  });

  Adjustment.associate = function (models) {
    Adjustment.belongsTo(models.ShowInventory, {
      foreignKey: {
        name: "showInventoryId",
        allowNull: false,
      },
    });
    Adjustment.belongsTo(models.User, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
    });
  };

  return Adjustment;
};

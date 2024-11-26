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
      type: Sequelize.DataTypes.ENUM("giveaway", "discount", "loss", "other"),
      allowNull: false,
    },
  });

  Adjustment.associate = function (models) {
    Adjustment.belongsTo(models.Show, {
      foreignKey: {
        name: "showId",
        allowNull: false,
      },
    });
    Adjustment.belongsTo(models.Product, {
      foreignKey: {
        name: "productId",
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

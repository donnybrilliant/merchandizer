module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define("Product", {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.DataTypes.TEXT,
    },
    color: {
      type: Sequelize.DataTypes.STRING,
    },
    size: {
      type: Sequelize.DataTypes.STRING,
    },
    price: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: Sequelize.DataTypes.STRING,
    },
  });

  Product.associate = function (models) {
    Product.belongsTo(models.Category, {
      foreignKey: "categoryId",
      allowNull: true,
      //as: "category",
    });
    Product.belongsTo(models.Artist, {
      foreignKey: {
        name: "artistId",
        //as: "artist",
        allowNull: false,
      },
    });
    Product.belongsToMany(models.Show, {
      through: models.ShowInventory,
      foreignKey: "productId",
      allowNull: false,
    });
  };

  return Product;
};

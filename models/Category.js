module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define("Category", {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  Category.associate = function (models) {
    Category.hasMany(models.Product, {
      foreignKey: "categoryId",
    });
  };

  return Category;
};

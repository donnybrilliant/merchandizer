module.exports = (sequelize, Sequelize) => {
  const Artist = sequelize.define("Artist", {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  Artist.associate = function (models) {
    Artist.hasMany(models.Product, {
      foreignKey: { name: "artistId", allowNull: false },
    });
    Artist.hasMany(models.Tour, {
      foreignKey: {
        name: "artistId",
        allowNull: false,
      },
    });
    Artist.hasMany(models.Show, {
      foreignKey: {
        name: "artistId",
        allowNull: false,
      },
    });
  };

  return Artist;
};

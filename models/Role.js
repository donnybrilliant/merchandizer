module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("Role", {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  Role.associate = function (models) {
    Role.belongsToMany(models.User, {
      through: models.UserRoleTour,
      foreignKey: "roleId",
    });
    Role.belongsToMany(models.Tour, {
      through: models.UserRoleTour,
      foreignKey: "roleId",
    });
  };

  return Role;
};

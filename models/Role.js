module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define("Role", {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  Role.associate = function (models) {
    Role.hasMany(models.User, {
      foreignKey: {
        name: "roleId",
        allowNull: false,
      },
    });
  };

  return Role;
};

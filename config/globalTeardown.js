const db = require("../models");

module.exports = async () => {
  try {
    await db.User.destroy({ where: { id: global.testUser.id } });
    await db.Artist.destroy({ where: { id: global.artistId } });
    await db.Category.destroy({ where: { id: global.categoryId } });
    await db.Tour.destroy({ where: { id: global.tourId } });
    // Close database connection
    await db.sequelize.close();
    console.log("Global teardown completed");
  } catch (error) {
    console.error("Global teardown failed:", error);
  }
};

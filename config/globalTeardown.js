const db = require("../models");

module.exports = async () => {
  try {
    await db.ShowInventory.destroy({
      where: { showId: global.showId, productId: global.productId },
    });
    await db.Show.destroy({ where: { id: global.showId } });
    await db.Tour.destroy({ where: { id: global.tourId } });
    await db.Category.destroy({ where: { id: global.categoryId } });
    await db.Product.destroy({ where: { id: global.productId } });
    await db.Artist.destroy({ where: { id: global.artistId } });
    await db.User.destroy({ where: { id: global.testUser.id } });
    // Close database connection
    await db.sequelize.close();
    console.log("Global teardown completed");
  } catch (error) {
    console.error("Global teardown failed:", error);
  }
};

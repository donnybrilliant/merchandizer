const request = require("supertest");
const app = require("../app"); // Import your app instance
const db = require("../models");
module.exports = async () => {
  global.testUser = {
    firstName: "Global",
    lastName: "User",
    email: "global@test.com",
    password: "password",
  };

  try {
    await db.sequelize.sync({ force: false });
    // Register the test user
    await request(app).post("/register").send(testUser);

    // Log in the user and retrieve the token
    const loginRes = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    if (!loginRes.body || !loginRes.body.data) {
      throw new Error("Login response is missing data");
    }

    global.authToken = loginRes.body.data.token;
    global.testUser.id = loginRes.body.data.id;

    // Create an artist
    const artistRes = await request(app)
      .post("/artists")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Global Artist" });

    if (!artistRes.body || !artistRes.body.data) {
      throw new Error("Artist response is missing data");
    }

    global.artistId = artistRes.body.data.id;
    global.artistName = artistRes.body.data.name;

    // Create a category
    const categoryRes = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Global Category" });

    if (!categoryRes.body || !categoryRes.body.data) {
      throw new Error("Category response is missing data");
    }

    global.categoryId = categoryRes.body.data.id;
    global.categoryName = categoryRes.body.data.name;

    // Create a tour
    const tourRes = await request(app)
      .post("/tours")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Global Tour",
        startDate: "2025-01-01",
        endDate: "2025-01-10",
        artistId: global.artistId,
      });

    if (!tourRes.body || !tourRes.body.data) {
      throw new Error("Tour response is missing data");
    }

    global.tourId = tourRes.body.data.id;
    global.tourName = tourRes.body.data.name;

    // Create a show
    const showRes = await request(app)
      .post(`/tours/${tourId}/shows`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        date: "2025-01-01",
        venue: "Global Venue",
        city: "Global City",
        country: "Global Country",
        artistId: global.artistId,
      });

    if (!showRes.body || !showRes.body.data) {
      throw new Error("Show response is missing data");
    }

    global.showId = showRes.body.data.id;

    // Create a product
    const productRes = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Global Product",
        price: 10,
        categoryId: global.categoryId,
        artistId: global.artistId,
      });

    if (!productRes.body || !productRes.body.data) {
      throw new Error("Product response is missing data");
    }

    global.productId = productRes.body.data.id;

    // Create inventory
    const inventoryRes = await request(app)
      .post(`/tours/${tourId}/shows/${showId}/inventory/${productId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        productId: global.productId,
        startInventory: 100,
      });

    if (!inventoryRes.body || !inventoryRes.body.data) {
      throw new Error("Inventory response is missing data");
    }

    global.inventoryId = inventoryRes.body.data.id;

    console.log("Global setup completed");
  } catch (error) {
    console.error("Global setup failed:", error);
    throw error;
  }
};

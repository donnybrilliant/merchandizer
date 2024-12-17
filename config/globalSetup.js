const request = require("supertest");
const app = require("../app"); // Import your app instance

module.exports = async () => {
  global.testUser = {
    firstName: "Global",
    lastName: "User",
    email: "global@test.com",
    password: "password",
  };

  try {
    // Register the test user
    await request(app).post("/register").send(testUser);

    // Log in the user and retrieve the token
    const loginRes = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    global.authToken = loginRes.body.data.token;
    global.testUser.id = loginRes.body.data.id;

    // Create an artist
    const artistRes = await request(app)
      .post("/artists")
      .set("Authorization", `Bearer ${global.authToken}`)
      .send({ name: "Global Artist" });

    global.artistId = artistRes.body.data.id;
    global.artistName = artistRes.body.data.name;

    // Create a category
    const categoryRes = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${global.authToken}`)
      .send({ name: "Global Category" });

    global.categoryId = categoryRes.body.data.id;
    global.categoryName = categoryRes.body.data.name;

    // Create a tour
    const tourRes = await request(app)
      .post("/tours")
      .set("Authorization", `Bearer ${global.authToken}`)
      .send({
        name: "Global Tour",
        startDate: "2025-01-01",
        endDate: "2025-01-10",
        artistId: global.artistId,
      });

    global.tourId = tourRes.body.data.id;
    global.tourName = tourRes.body.data.name;

    console.log("Global setup completed");
  } catch (error) {
    console.error("Global setup failed:", error);
    throw error;
  }
};

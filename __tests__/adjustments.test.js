const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Adjustments Tests", () => {
  const testUser = {
    firstName: "Adjustment",
    lastName: "User",
    email: "adjustment@test.com",
    password: "password",
  };

  let authToken;
  let artistId;
  let categoryId;
  let productId;
  let showId;
  let tourId;
  let inventoryId;
  // Setup: Register and log in the test user
  beforeAll(async () => {
    // Register the test user
    await request(app).post("/register").send(testUser);

    // Log in and get the token
    const loginRes = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginRes.body.data.token;
    testUser.id = loginRes.body.data.id;

    // Create an artist
    const artistRes = await request(app)
      .post("/artists")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Adjustment Artist" });
    artistId = artistRes.body.data.id;

    // Create a tour
    const tourRes = await request(app)
      .post("/tours")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Adjustment Tour",
        startDate: "2025-01-01",
        endDate: "2025-01-10",
        artistId: artistId,
      });
    tourId = tourRes.body.data.id;

    // Create a show
    const showRes = await request(app)
      .post(`/tours/${tourId}/shows`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        date: "2025-01-01",
        venue: "Adjustment Venue",
        city: "Adjustment City",
        country: "Adjustment Country",
        artistId: artistId,
      });
    showId = showRes.body.data.id;

    // Create a category
    const categoryRes = await request(app)
      .post(`/categories`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Adjustment Category" });
    categoryId = categoryRes.body.data.id;

    // Create a product
    const productRes = await request(app)
      .post(`/products`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Adjustment Product",
        price: 10,
        categoryId: categoryId,
        artistId: artistId,
      });
    productId = productRes.body.data.id;

    // Create an inventory
    const inventoryRes = await request(app)
      .post(`/tours/${tourId}/shows/${showId}/inventory/${productId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        startInventory: 100,
      });
    inventoryId = inventoryRes.body.data.id;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await db.Adjustment.destroy({
      where: { showInventoryId: inventoryId },
    });
    await db.ShowInventory.destroy({
      where: { showId: showId, productId: productId },
    });
    await db.Show.destroy({ where: { id: showId } });
    await db.Tour.destroy({ where: { id: tourId } });
    await db.Product.destroy({ where: { id: productId } });
    await db.Category.destroy({ where: { id: categoryId } });
    await db.Artist.destroy({ where: { id: artistId } });
    await db.User.destroy({ where: { email: testUser.email } });
  });

  // Create an adjustment
  it("should create an adjustment", async () => {
    const res = await request(app)
      .post(`/tours/${tourId}/shows/${showId}/adjustments`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 1,
        type: "giveaway",
        reason: "Test Reason",
        productId: productId,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Adjustment created successfully");
    expect(res.body.data.quantity).toBe(1);
    expect(res.body.data.type).toBe("giveaway");
    expect(res.body.data.reason).toBe("Test Reason");
    expect(res.body.data.userId).toBe(testUser.id);
    expect(res.body.data.showInventoryId).toBe(inventoryId);
    adjustmentId = res.body.data.id;
  });

  // Get an adjustment by id
  it("should get an adjustment by id", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/shows/${showId}/adjustments/${adjustmentId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quantity).toBe(1);
    expect(res.body.data.type).toBe("giveaway");
    expect(res.body.data.reason).toBe("Test Reason");
  });

  // Get an adjustment by productId
  it("should get an adjustment by productId", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/shows/${showId}/adjustments/product/${productId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].quantity).toBe(1);
    expect(res.body.data[0].type).toBe("giveaway");
    expect(res.body.data[0].reason).toBe("Test Reason");
  });

  // Get all adjustments for a show
  it("should get all adjustments for a show", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/shows/${showId}/adjustments`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(1);
  });

  // Update an adjustment
  it("should update an adjustment", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}/shows/${showId}/adjustments/${adjustmentId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ quantity: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Adjustment updated successfully");
    expect(res.body.data.quantity).toBe(2);
  });

  // Delete an adjustment
  it("should delete an adjustment", async () => {
    const res = await request(app)
      .delete(`/tours/${tourId}/shows/${showId}/adjustments/${adjustmentId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Adjustment deleted successfully");
  });
});

const request = require("supertest");
const app = require("../app");

describe("Adjustments Tests", () => {
  // Setup
  beforeAll(async () => {
    authToken = global.authToken;
    testUser.id = global.testUser.id;
    artistId = global.artistId;
    categoryId = global.categoryId;
    productId = global.productId;
    showId = global.showId;
    tourId = global.tourId;
    inventoryId = global.inventoryId;
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

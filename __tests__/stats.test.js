const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Stats Tests", () => {
  // Setup
  beforeAll(() => {
    authToken = global.authToken;
    tourId = global.tourId;
    showId = global.showId;
    productId = global.productId;
  });

  // Test
  it("should get tour stats", async () => {
    const res = await request(app)
      .get(`/stats/tours/${tourId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty("Tour");
    expect(res.body.data).toHaveProperty("totals");
  });

  it("should get show stats", async () => {
    const res = await request(app)
      .get(`/stats/tours/${tourId}/shows/${showId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty("Show");
    expect(res.body.data).toHaveProperty("products");
    expect(res.body.data).toHaveProperty("totals");
  });

  it("should get product stats for tour", async () => {
    const res = await request(app)
      .get(`/stats/tours/${tourId}/products/${productId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Object);
    expect(res.body.data).toHaveProperty("Tour");
    expect(res.body.data).toHaveProperty("Product");
    expect(res.body.data).toHaveProperty("totals");
  });
});

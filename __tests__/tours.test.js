const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Tours Tests", () => {
  const testUser = {
    firstName: "Tour",
    lastName: "User",
    email: "tour@test.com",
    password: "password",
  };

  let authToken;
  let artistId;
  let artistName = "Test Artist";
  let tourId;
  let tourName = "Test Tour";
  let tourData = {
    name: tourName,
    startDate: "2025-01-01",
    endDate: "2025-01-10",
  };

  // Setup
  beforeAll(async () => {
    // Register the test user
    await request(app).post("/register").send(testUser);

    // Log in and get the token
    const loginRes = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginRes.body.data.token;

    // Create an artist
    const artistRes = await request(app)
      .post("/artists")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: artistName });
    artistId = artistRes.body.data.id;

    tourData.artistId = artistId;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await db.User.destroy({ where: { email: testUser.email } });
    await db.Artist.destroy({ where: { id: artistId } });
    await db.Tour.destroy({ where: { id: tourId } });
  });

  // Create a tour
  it("should create a tour successfully", async () => {
    const res = await request(app)
      .post("/tours")
      .set("Authorization", `Bearer ${authToken}`)
      .send(tourData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tour created successfully");
    expect(res.body.data).toMatchObject(tourData);
    tourId = res.body.data.id;
  });

  // Get a tour created by the current user
  it("should get a tour successfully", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: tourId,
      name: tourName,
      startDate: tourData.startDate,
      endDate: tourData.endDate,
      Artist: {
        id: artistId,
        name: artistName,
      },
      Shows: [],
    });
  });

  // Get all tours for current user
  it("should get all tours for current user", async () => {
    const res = await request(app)
      .get("/tours")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Get all tours without admin access
  it("should not get all tours without admin access", async () => {
    const res = await request(app)
      .get("/tours/all")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Admin access required");
  });

  // Update a tour
  it("should update a tour successfully", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Updated Tour" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tour updated successfully");
    expect(res.body.data.name).toBe("Updated Tour");
  });

  // No changes made to tour
  it("should not update a tour if no changes are made", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Updated Tour" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("No changes made to tour");
  });

  // Delete a tour
  it("should delete a tour successfully", async () => {
    const res = await request(app)
      .delete(`/tours/${tourId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Tour deleted successfully");
  });
});

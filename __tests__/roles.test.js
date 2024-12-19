const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Roles Tests", () => {
  const testUser = {
    firstName: "Role",
    lastName: "User",
    email: "role@test.com",
    password: "password",
  };

  const testUser2 = {
    firstName: "Role2",
    lastName: "User2",
    email: "role2@test.com",
    password: "password",
  };

  let authToken;
  let authToken2;
  let artistId;
  let tourId;

  // Setup
  beforeAll(async () => {
    // Register the test users
    await request(app).post("/register").send(testUser);
    await request(app).post("/register").send(testUser2);
    // Log in and get the token
    const loginRes = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginRes.body.data.token;
    testUser.id = loginRes.body.data.id;

    const loginRes2 = await request(app).post("/login").send({
      email: testUser2.email,
      password: testUser2.password,
    });
    authToken2 = loginRes2.body.data.token;
    testUser2.id = loginRes2.body.data.id;

    // Create an artist
    const artistRes = await request(app)
      .post("/artists")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Role Artist" });
    artistId = artistRes.body.data.id;

    // Create a tour
    const tourRes = await request(app)
      .post("/tours")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Role Tour",
        startDate: "2025-01-01",
        endDate: "2025-01-10",
        artistId,
      });
    tourId = tourRes.body.data.id;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await db.Tour.destroy({ where: { id: tourId } });
    await db.Artist.destroy({ where: { id: artistId } });
    await db.User.destroy({ where: { email: testUser.email } });
    await db.User.destroy({ where: { email: testUser2.email } });
  });

  // Add a user to a tour
  it("should add a user to a tour", async () => {
    const res = await request(app)
      .post(`/tours/${tourId}/roles`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ userId: testUser2.id, role: "manager" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User added to tour successfully");
  });

  // Get all users in a tour
  it("should get all users in a tour", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/roles`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  // Should not downgrade the tour creator
  it("should not downgrade the tour creator", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}/roles/${testUser.id}`)
      .set("Authorization", `Bearer ${authToken2}`)
      .send({ role: "sales" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(
      "The first manager cannot be downgraded or updated"
    );
  });

  // Cant delete the tour creator
  it("should not delete the tour creator", async () => {
    const res = await request(app)
      .delete(`/tours/${tourId}/roles/${testUser.id}`)
      .set("Authorization", `Bearer ${authToken2}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(
      "The first manager cannot be removed from the tour"
    );
  });

  // Update a users role
  it("should update a user's role", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}/roles/${testUser2.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ role: "sales" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User role updated successfully");
  });

  // Delete a user from a tour
  it("should delete a user from a tour", async () => {
    const res = await request(app)
      .delete(`/tours/${tourId}/roles/${testUser2.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User removed from the tour");
  });
});

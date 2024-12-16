const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Artists Tests", () => {
  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: "test@test.com",
    password: "password",
  };

  let authToken;
  let artistId;
  let artistName = "Test Artist";

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
  });

  // Cleanup after all tests
  afterAll(async () => {
    await db.User.destroy({ where: { email: testUser.email } });
    await db.Artist.destroy({ where: { name: artistName } });
    await db.sequelize.close();
  });

  // Create an artist
  it("should create an artist successfully", async () => {
    const res = await request(app)
      .post("/artists")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: artistName });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Artist created successfully");
    artistId = res.body.data.id;
  });

  // Create a duplicate artist
  it("should not create a duplicate artist", async () => {
    const res = await request(app)
      .post("/artists")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: artistName });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(
      `Artist with the name ${artistName} already exists`
    );
  });

  // Fetch all artists
  it("should fetch all artists successfully", async () => {
    const res = await request(app)
      .get("/artists")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  // Fetch a specific artist
  it("should fetch a specific artist successfully", async () => {
    const res = await request(app)
      .get(`/artists/${artistId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("name");
    expect(res.body.data.name).toBe(artistName);
  });

  // Search for an artist
  it("should search for an artist successfully", async () => {
    const res = await request(app)
      .get("/artists?name=Test")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toBe(artistName);
  });

  // Update an artist
  it("should update an artist successfully", async () => {
    const updatedName = "Updated Artist";
    const res = await request(app)
      .put(`/artists/${artistId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: updatedName });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Artist updated successfully");
    expect(res.body.data.name).toBe(updatedName);
  });

  // Delete an artist
  it("should delete an artist successfully", async () => {
    const res = await request(app)
      .delete(`/artists/${artistId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Artist deleted successfully");
  });
});

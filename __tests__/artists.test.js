const request = require("supertest");
const app = require("../app");

describe("Artists Tests", () => {
  let artistId;
  const artistName = "Test Artist";

  // Global setup
  beforeAll(() => {
    authToken = global.authToken;
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
    expect(res.body.error).toBe(`Artist ${artistName} already exists`);
  });

  // Get all artists
  it("should get all artists successfully", async () => {
    const res = await request(app)
      .get("/artists")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  // Get a specific artist
  it("should get a specific artist successfully", async () => {
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

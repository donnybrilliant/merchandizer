const request = require("supertest");
const app = require("../app");

describe("Tours Tests", () => {
  let tourId;
  let tourName = "Test Tour";
  let tourData = {
    name: tourName,
    startDate: "2025-01-01",
    endDate: "2025-01-10",
  };

  // Global setup
  beforeAll(() => {
    authToken = global.authToken;
    artistId = global.artistId;
    artistName = global.artistName;
    tourData.artistId = artistId;
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

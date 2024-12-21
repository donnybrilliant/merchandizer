const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Shows Tests", () => {
  let showId;
  let bulkShowIds = [];
  let showData = {
    date: "2025-01-01",
    venue: "Test Venue",
    city: "Test City",
    country: "Test Country",
  };
  let showUpdate = {
    getInTime: "15:30",
    loadOutTime: "22:00",
    doorsTime: "19:00",
    onStageTime: "21:00",
  };

  // Setup
  beforeAll(() => {
    authToken = global.authToken;
    artistId = global.artistId;
    artistName = global.artistName;
    tourId = global.tourId;
    tourName = global.tourName;
    showData.artistId = artistId;
    showData.tourId = tourId;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await db.Show.destroy({ where: { id: bulkShowIds } });
  });

  // Create a show
  it("should create a show successfully", async () => {
    const res = await request(app)
      .post(`/tours/${tourId}/shows`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(showData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Show created successfully");
    expect(res.body.data).toMatchObject({
      ...showData,
      id: expect.any(Number),
      tourId: tourId,
      artistId: artistId,
    });
    showId = res.body.data.id;
  });

  // Get created show
  it("should get a specific show successfully", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/shows/${showId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: showId,
      date: showData.date,
      venue: showData.venue,
      city: showData.city,
      country: showData.country,
      Artist: {
        id: artistId,
        name: artistName,
      },
      Tour: {
        id: tourId,
        name: tourName,
      },
    });
  });

  // Bulk create shows - should i delete the shows after this test?
  it("should bulk create shows successfully", async () => {
    const showsData = [
      { ...showData, date: "2025-01-02" },
      { ...showData, date: "2025-01-03" },
    ];
    const res = await request(app)
      .post(`/tours/${tourId}/shows/bulk`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(showsData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Shows created successfully");
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(1);
    bulkShowIds = res.body.data.map((show) => show.id);
  });

  // Get all shows for a tour
  it("should get all shows for a tour successfully", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/shows`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(2);
  });

  // Get all shows without admin access
  it("should not get all shows without admin access", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/shows/all`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Admin access required");
  });

  // Update a show
  it("should update a show successfully", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}/shows/${showId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(showUpdate);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Show updated successfully");
    expect(res.body.data).toMatchObject({
      id: showId,
      date: showData.date,
      venue: showData.venue,
      city: showData.city,
      country: showData.country,
      Artist: {
        id: artistId,
        name: artistName,
      },
      Tour: {
        id: tourId,
        name: tourName,
      },
      ...showUpdate,
    });
  });

  // Update a show with no changes
  it("should not update a show with no changes", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}/shows/${showId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(showUpdate);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("No changes made to show");
  });

  // Delete a show
  it("should delete a show successfully", async () => {
    const res = await request(app)
      .delete(`/tours/${tourId}/shows/${showId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Show deleted successfully");
  });
});

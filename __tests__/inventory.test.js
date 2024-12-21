const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Inventory Tests", () => {
  let bulkProductIds = [];
  let bulkInventoryIds = [];
  let showId;
  let nextShowId;
  let tourId;
  let inventoryId;

  // Setup
  beforeAll(async () => {
    authToken = global.authToken;
    artistId = global.artistId;
    categoryId = global.categoryId;

    // Create a tour
    const tourRes = await request(app)
      .post("/tours")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Inventory Tour",
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
        venue: "Inventory Venue",
        city: "Inventory City",
        country: "Inventory Country",
        artistId: artistId,
      });
    showId = showRes.body.data.id;

    // Loop over product creation
    for (let i = 0; i < 3; i++) {
      const bulkProductRes = await request(app)
        .post(`/products`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: `Inventory Product ${i}`,
          price: 10,
          categoryId: categoryId,
          artistId: artistId,
        });

      bulkProductIds.push(bulkProductRes.body.data.id);
    }

    // Create a next show
    const nextShowRes = await request(app)
      .post(`/tours/${tourId}/shows`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        date: "2025-01-02",
        venue: "Inventory Venue",
        city: "Inventory City",
        country: "Inventory Country",
        artistId: artistId,
      });
    nextShowId = nextShowRes.body.data.id;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await db.ShowInventory.destroy({ where: { id: bulkInventoryIds } });
    await db.Product.destroy({ where: { id: bulkProductIds } });
    await db.Show.destroy({ where: { id: showId } });
    await db.Show.destroy({ where: { id: nextShowId } });
    await db.Tour.destroy({ where: { id: tourId } });
  });

  // Create an inventory
  it("should create an inventory successfully", async () => {
    const res = await request(app)
      .post(`/tours/${tourId}/shows/${showId}/inventory/${bulkProductIds[0]}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ startInventory: 100 });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Inventory created successfully");
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.productId).toEqual(bulkProductIds[0]);
    expect(res.body.data.startInventory).toBe(100);
    inventoryId = res.body.data.id;
  });

  // Get an inventory
  it("should get an inventory successfully", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/shows/${showId}/inventory/${bulkProductIds[0]}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(inventoryId);
    expect(res.body.data.startInventory).toBe(100); // variable?
  });

  // Update an inventory
  it("should update an inventory successfully", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}/shows/${showId}/inventory/${bulkProductIds[0]}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ endInventory: 50 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Inventory updated successfully");
    expect(res.body.data.id).toBe(inventoryId);
    expect(res.body.data.startInventory).toBe(100);
    expect(res.body.data.endInventory).toBe(50);
  });

  // Bulk create inventory
  it("should bulk create inventory successfully", async () => {
    const res = await request(app)
      .post(`/tours/${tourId}/shows/${showId}/inventory`)
      .set("Authorization", `Bearer ${authToken}`)
      .send([
        { productId: bulkProductIds[1], startInventory: 100 },
        { productId: bulkProductIds[2], startInventory: 100 },
      ]);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Inventory created successfully");
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(1);
    bulkInventoryIds = res.body.data.map((inventory) => inventory.id);
  });

  // Bulk update inventory
  it("should bulk update inventory successfully", async () => {
    const res = await request(app)
      .put(`/tours/${tourId}/shows/${showId}/inventory`)
      .set("Authorization", `Bearer ${authToken}`)
      .send([
        { productId: bulkProductIds[1], endInventory: 50 },
        { productId: bulkProductIds[2], endInventory: 50 },
      ]);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Inventory update processed");
    expect(res.body.data.updated).toBeInstanceOf(Array);
    expect(res.body.data.updated.length).toBeGreaterThan(1);
    expect(res.body.data.updated[0].message).toBe("Inventory updated");
    expect(res.body.data.updated[0].data.endInventory).toBe(50);
    expect(res.body.data.updated[1].message).toBe("Inventory updated");
    expect(res.body.data.updated[1].data.endInventory).toBe(50);
  });

  // Get all inventory for a show
  it("should get all inventory for a show successfully", async () => {
    const res = await request(app)
      .get(`/tours/${tourId}/shows/${showId}/inventory`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(2);
  });

  // Copy inventory from previous show
  it("should copy inventory from previous show successfully", async () => {
    const res = await request(app)
      .post(`/tours/${tourId}/shows/${nextShowId}/inventory/copy`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Inventory copy processed");
    expect(res.body.data.updated[0].message).toBe("Inventory copied");
    expect(res.body.data.updated[0].data.productId).toBe(bulkProductIds[0]);
    expect(res.body.data.updated[0].data.startInventory).toBe(50);
  });

  // Delete an inventory
  it("should delete an inventory successfully", async () => {
    const res = await request(app)
      .delete(`/tours/${tourId}/shows/${showId}/inventory/${bulkProductIds[0]}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Inventory deleted successfully");
  });
});

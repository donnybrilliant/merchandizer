const request = require("supertest");
const app = require("../app");

describe("Categories Tests", () => {
  let categoryId;
  let categoryName = "Test Category";
  let updatedName = "Updated Category";

  // Setup
  beforeAll(() => {
    authToken = global.authToken;
  });

  // Create an category
  it("should create an category successfully", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: categoryName });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category created successfully");
    categoryId = res.body.data.id;
  });

  // Create a duplicate category
  it("should not create a duplicate category", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: categoryName });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe(`Category ${categoryName} already exists`);
  });

  // Get all categories
  it("should get all categories successfully", async () => {
    const res = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  // Get a specific category
  it("should get a specific category successfully", async () => {
    const res = await request(app)
      .get(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("name");
    expect(res.body.data.name).toBe(categoryName);
  });

  // Search for a category
  it("should search for a category successfully", async () => {
    const res = await request(app)
      .get("/categories?name=Test")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toBe(categoryName);
  });

  // Update a category
  it("should update a category successfully", async () => {
    const res = await request(app)
      .put(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: updatedName });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category updated successfully");
    expect(res.body.data.name).toBe(updatedName);
  });

  // No change to category name
  it("should not update a category with the same name", async () => {
    const res = await request(app)
      .put(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: updatedName });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("No changes made to category");
  });

  // Delete a category
  it("should delete a category successfully", async () => {
    const res = await request(app)
      .delete(`/categories/${categoryId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Category deleted successfully");
  });
});

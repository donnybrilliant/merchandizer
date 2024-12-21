const request = require("supertest");
const app = require("../app");

describe("Products Tests", () => {
  let productId;
  let productName = "Test Product";
  let productData = {
    name: productName,
    description: "Test Description",
    color: "red",
    size: "M",
    price: 10,
  };
  let productUpdate = {
    name: "Updated Product",
    description: "Updated Description",
    color: "blue",
    size: "L",
    price: 15,
  };

  // Setup
  beforeAll(() => {
    authToken = global.authToken;
    categoryId = global.categoryId;
    categoryName = global.categoryName;
    artistId = global.artistId;
    artistName = global.artistName;
    productData.artistId = artistId;
    productData.categoryId = categoryId;
  });

  // Create an product
  it("should create an product successfully", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${authToken}`)
      .send(productData);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product created successfully");
    productId = res.body.data.id;
  });

  // Get all products
  it("should get all products successfully", async () => {
    const res = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  // Get a specific product
  it("should get a specific product successfully", async () => {
    const res = await request(app)
      .get(`/products/${productId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject(productData);
  });

  // Search for a product
  it("should search for a product successfully", async () => {
    const res = await request(app)
      .get("/products?name=Test")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toBe(productName);
  });

  // Update a product
  it("should update a product successfully", async () => {
    const res = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(productUpdate);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product updated successfully");
    expect(res.body.data).toMatchObject(productUpdate);
  });

  // No changes made to the product
  it("should not update a product with no changes", async () => {
    const res = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(productUpdate);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("No changes made to product");
  });

  // Upload image
  it("should not upload an image with no file", async () => {
    const res = await request(app)
      .put(`/products/${productId}/image`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ image: "test.jpg" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation Error");
    expect(res.body.details).toBeInstanceOf(Array);
    expect(res.body.details[0]).toBe("No image file provided");
  });

  // Delete a product
  it("should delete a product successfully", async () => {
    const res = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Product deleted successfully");
  });
});

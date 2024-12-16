const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Users Tests", () => {
  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: "test@test.com",
    password: "password",
  };

  let authToken;
  let userId;

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
    userId = loginRes.body.data.id;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await db.User.destroy({ where: { email: testUser.email } });
    await db.sequelize.close();
  });

  // Get the current user
  it("should fetch the current user details", async () => {
    const res = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id", userId);
    expect(res.body.data).toHaveProperty("email", testUser.email);
    expect(res.body.data).toHaveProperty("firstName", testUser.firstName);
    expect(res.body.data).toHaveProperty("lastName", testUser.lastName);
    expect(res.body.data).toHaveProperty("phone", null);
    expect(res.body.data).toHaveProperty("avatar", null);
    expect(res.body.data).not.toHaveProperty("encryptedPassword");
    expect(res.body.data).not.toHaveProperty("salt");
    expect(res.body.data).not.toHaveProperty("role");
  });

  // Get all users without admin access
  it("should not get all users without admin access", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Admin access required");
  });

  // Update the user
  it("should update user details successfully", async () => {
    const updatedData = { phone: "1234567890" };

    const res = await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile updated successfully");
    expect(res.body.data.phone).toBe(updatedData.phone);
  });

  // No changes made to profile
  it("should not update user details if no changes are made", async () => {
    const updatedData = { phone: "1234567890" };
    const res = await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatedData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("No changes made to profile");
  });

  // Change password
  it("should change password successfully", async () => {
    const res = await request(app)
      .put("/users/me/password")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ oldPassword: testUser.password, newPassword: "newPassword" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Password changed successfully");
  });

  // Upload avatar
  it("should not upload avatar", async () => {
    const res = await request(app)
      .put("/users/me/avatar")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ avatar: "avatar.jpg" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation Error");
    expect(res.body.details).toBeInstanceOf(Array);
    expect(res.body.details[0]).toBe("No avatar file provided");
  });

  // Delete the user
  it("should delete the user successfully", async () => {
    const res = await request(app)
      .delete("/users/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Account deleted successfully");

    // Verify user is deleted
    const fetchRes = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(fetchRes.statusCode).toBe(404);
    expect(fetchRes.body.success).toBe(false);
    expect(fetchRes.body.error).toBe("User not found");
  });
});

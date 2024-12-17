const request = require("supertest");
const app = require("../app");
const db = require("../models");

describe("Auth Tests", () => {
  const testUser = {
    firstName: "Auth",
    lastName: "User",
    email: "auth@test.com",
    password: "password",
  };

  // Cleanup after all tests
  afterAll(async () => {
    await db.User.destroy({ where: { email: testUser.email } });
  });

  // Test Registration
  it("should register a user successfully", async () => {
    const res = await request(app).post("/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Account created successfully");
  });

  // Failure Scenarios
  it("should fail registration with duplicate email", async () => {
    const res = await request(app).post("/register").send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Email is already in use");
  });

  // Test Login
  it("should login successfully and return a token", async () => {
    const res = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.email).toBe(testUser.email);
  });

  // Failure Scenarios
  it("should fail login with incorrect password", async () => {
    const res = await request(app).post("/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Incorrect email or password");
  });
});

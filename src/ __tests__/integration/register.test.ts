import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("POST /api/auth/register", () => {
  const testUser = {
    username: "testuser",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    fullName: "Test User",
  };

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
      ],
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
      ],
    });
  });

  test("should register a new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("email", testUser.email);
  });

  test("should not register with duplicate email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("success", false);
  });

  test("should not register with missing fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "incomplete@test.com" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });
});

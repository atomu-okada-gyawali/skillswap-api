import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("POST /api/auth/login", () => {
  const testUser = {
    username: "logintestuser",
    email: "logintest@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    fullName: "Login Test User",
  };

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
      ],
    });

    await request(app).post("/api/auth/register").send(testUser);
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
      ],
    });
  });

  test("should login an existing user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("token");
  });

  test("should not login with incorrect password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "WrongPassword!" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });

  test("should not login with non-existent email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@test.com", password: "Password123!" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("success", false);
  });
});

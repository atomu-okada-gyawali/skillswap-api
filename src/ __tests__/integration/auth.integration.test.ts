import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { sendEmail } from "../../config/email";

jest.mock("../../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("Auth API Integration Tests", () => {
  const testUser = {
    username: "authtestuser",
    email: "authtest@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    fullName: "Auth Test User",
  };

  let authToken = "";

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
      ],
    });

    await request(app).post("/api/auth/register").send(testUser);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: testUser.email },
        { username: testUser.username },
      ],
    });
  });

  describe("POST /api/auth/register", () => {
    test("should register a new user successfully", async () => {
      const newUser = {
        username: "newuser" + Date.now(),
        email: "newuser" + Date.now() + "@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        fullName: "New User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("email", newUser.email);

      await UserModel.deleteOne({ email: newUser.email });
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

  describe("POST /api/auth/login", () => {
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

  describe("POST /api/auth/request-password-reset", () => {
    test("should send password reset for valid email", async () => {
      const response = await request(app)
        .post("/api/auth/request-password-reset")
        .send({ email: testUser.email });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    test("should return success for non-existent email (security)", async () => {
      const response = await request(app)
        .post("/api/auth/request-password-reset")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });
  });

  describe("POST /api/auth/reset-password/:token", () => {
    test("should not reset password with invalid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password/invalidtoken")
        .send({ newPassword: "NewPassword123!" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("PUT /api/auth/update-profile", () => {
    test("should update user profile with valid token", async () => {
      const response = await request(app)
        .put("/api/auth/update-profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ fullName: "Updated Name" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
    });

    test("should not update profile without token", async () => {
      const response = await request(app)
        .put("/api/auth/update-profile")
        .send({ fullName: "Updated Name" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/auth/profile-image/:filename", () => {
    test("should return 404 for non-existent image", async () => {
      const response = await request(app).get(
        "/api/auth/profile-image/nonexistent-image.jpg"
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
    });
  });
});

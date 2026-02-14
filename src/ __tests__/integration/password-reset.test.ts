import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { sendEmail } from "../../config/email";

jest.mock("../../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

describe("POST /api/auth/password-reset", () => {
  const testUser = {
    username: "passresetuser",
    email: "passreset@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    fullName: "Password Reset User",
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
});

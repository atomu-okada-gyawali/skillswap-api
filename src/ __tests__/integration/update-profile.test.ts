import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("PUT /api/auth/update-profile", () => {
  const testUser = {
    username: "updateproftuser",
    email: "updateproft@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    fullName: "Update Profile User",
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

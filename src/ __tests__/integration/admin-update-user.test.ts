import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import bcryptjs from "bcryptjs";

describe("PUT /api/admin/users/:id", () => {
  const adminUser = {
    username: "adminupdateuser",
    email: "adminupdateuser@example.com",
    password: "AdminPassword123!",
    confirmPassword: "AdminPassword123!",
    fullName: "Admin User",
  };

  const regularUser = {
    username: "reguserupdate",
    email: "reguserupdate@example.com",
    password: "UserPassword123!",
    confirmPassword: "UserPassword123!",
    fullName: "Regular User",
  };

  let adminToken = "";
  let regularUserToken = "";

  beforeAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: adminUser.email },
        { email: regularUser.email },
        { username: adminUser.username },
        { username: regularUser.username },
      ],
    });

    const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
    await UserModel.create({ ...adminUser, password: hashedPassword, role: "admin" });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;

    await request(app).post("/api/auth/register").send(regularUser);
    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: regularUser.email, password: regularUser.password });
    regularUserToken = userLogin.body.token;
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      $or: [
        { email: adminUser.email },
        { email: regularUser.email },
        { username: adminUser.username },
        { username: regularUser.username },
      ],
    });
  });

  test("should update user as admin", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: regularUser.email, password: regularUser.password });
    const userId = loginRes.body.data._id;

    const response = await request(app)
      .put(`/api/admin/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fullName: "Updated Full Name" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
  });

  test("should not update user without admin token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: regularUser.email, password: regularUser.password });
    const userId = loginRes.body.data._id;

    const response = await request(app)
      .put(`/api/admin/users/${userId}`)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ fullName: "Updated Name" });

    expect(response.status).toBe(403);
  });
});

import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import bcryptjs from "bcryptjs";

describe("DELETE /api/admin/users/:id", () => {
  const adminUser = {
    username: "admindeleteuser",
    email: "admindeleteuser@example.com",
    password: "AdminPassword123!",
    confirmPassword: "AdminPassword123!",
    fullName: "Admin User",
  };

  const regularUser = {
    username: "reguserdelete",
    email: "reguserdelete@example.com",
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

  test("should delete user as admin", async () => {
    const tempUser = await request(app)
      .post("/api/auth/register")
      .send({
        username: "usertobedeleted",
        email: "delete@test.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        fullName: "Delete Me",
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "delete@test.com", password: "Password123!" });
    const userToDeleteId = loginRes.body.data._id;

    const response = await request(app)
      .delete(`/api/admin/users/${userToDeleteId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
  });

  test("should not delete user without admin token", async () => {
    const tempUser = await request(app)
      .post("/api/auth/register")
      .send({
        username: "usertobedeleted2",
        email: "delete2@test.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        fullName: "Delete Me 2",
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "delete2@test.com", password: "Password123!" });
    const userId = loginRes.body.data._id;

    const response = await request(app)
      .delete(`/api/admin/users/${userId}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(response.status).toBe(403);
  });
});

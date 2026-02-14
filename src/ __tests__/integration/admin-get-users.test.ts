import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import bcryptjs from "bcryptjs";

describe("GET /api/admin/users", () => {
  const adminUser = {
    username: "admingetusers",
    email: "admingetusers@example.com",
    password: "AdminPassword123!",
    confirmPassword: "AdminPassword123!",
    fullName: "Admin User",
  };

  const regularUser = {
    username: "reguserget",
    email: "reguserget@example.com",
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

  test("should get all users as admin", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("should not get users without admin token", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("success", false);
  });

  test("should not get users without token", async () => {
    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(401);
  });
});

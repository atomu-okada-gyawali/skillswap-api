import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import bcryptjs from "bcryptjs";

describe("POST /api/admin/users", () => {
  const adminUser = {
    username: "admincreateuser",
    email: "admincreate@example.com",
    password: "AdminPassword123!",
    confirmPassword: "AdminPassword123!",
    fullName: "Admin User",
  };

  const regularUser = {
    username: "regusercreate",
    email: "regusercreate@example.com",
    password: "UserPassword123!",
    confirmPassword: "UserPassword123!",
    fullName: "Regular User",
  };

  let adminToken = "";
  let regularUserToken = "";
  let createdUserId = "";

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
    const deleteFilter: Record<string, any>[] = [
      { email: adminUser.email },
      { email: regularUser.email },
      { username: adminUser.username },
      { username: regularUser.username },
    ];
    if (createdUserId) {
      deleteFilter.push({ _id: createdUserId });
    }
    await UserModel.deleteMany({ $or: deleteFilter });
  });

  test("should create new user as admin", async () => {
    const newUser = {
      username: "newadminuser",
      email: "newadmin@test.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "New Admin User",
    };

    const response = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    createdUserId = response.body.data._id;
  });

  test("should not create user without admin token", async () => {
    const newUser = {
      username: "someuser",
      email: "some@test.com",
      password: "Password123!",
      fullName: "Some User",
    };

    const response = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send(newUser);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("success", false);
  });
});

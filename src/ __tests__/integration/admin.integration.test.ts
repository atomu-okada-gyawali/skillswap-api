import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import bcryptjs from "bcryptjs";

describe("Admin API Integration Tests", () => {
  const adminUser = {
    username: "adminuser",
    email: "adminuser@example.com",
    password: "AdminPassword123!",
    confirmPassword: "AdminPassword123!",
    fullName: "Admin User",
  };

  const regularUser = {
    username: "reguser",
    email: "reguser@example.com",
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
        { email: "newadmin@test.com" },
        { email: "some@test.com" },
        { email: "delete@test.com" },
        { email: "delete2@test.com" },
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
      { email: "newadmin@test.com" },
      { email: "some@test.com" },
      { email: "delete@test.com" },
      { email: "delete2@test.com" },
    ];
    if (createdUserId) {
      deleteFilter.push({ _id: createdUserId as any });
    }
    await UserModel.deleteMany({ $or: deleteFilter });
  });

  describe("GET /api/admin/users", () => {
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

  describe("GET /api/admin/users/:id", () => {
    test("should get user by id as admin", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: regularUser.email, password: regularUser.password });
      const userId = loginRes.body.data._id;

      const response = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("email", regularUser.email);
    });

    test("should not get user without admin token", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: regularUser.email, password: regularUser.password });
      const userId = loginRes.body.data._id;

      const response = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set("Authorization", `Bearer ${regularUserToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /api/admin/users", () => {
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

  describe("PUT /api/admin/users/:id", () => {
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

  describe("DELETE /api/admin/users/:id", () => {
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
});

import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { PostModel } from "../../models/post.model";

describe("Post Integration Tests", () => {
  let userToken = "";
  let userId = "";
  let postId = "";

  beforeAll(async () => {
    // Setup: Register and login a user
    await UserModel.deleteMany({ email: "posttest@example.com" });
    const user = {
      username: "posttester",
      email: "posttest@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
      fullName: "Post Tester",
    };
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: user.password,
    });
    userToken = loginRes.body.token;
    userId = loginRes.body.data._id;
  });

  afterAll(async () => {
    await PostModel.deleteMany({ userId });
    await UserModel.deleteMany({ _id: userId });
  });

  test("POST /api/posts - should create a post", async () => {
    const response = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${userToken}`)
      .field("title", "Integration Test Post")
      .field("description", "This is an integration test post description.")
      .field("locationType", "remote")
      .field("availability", "flexible");

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    postId = response.body.data._id;
  });

  test("GET /api/posts - should get all posts", async () => {
    const response = await request(app)
      .get("/api/posts")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /api/posts/:id - should get post by id", async () => {
    const response = await request(app)
      .get(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data._id).toBe(postId);
  });

  test("PUT /api/posts/:id - should update post", async () => {
    const response = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .field("title", "Updated Integration Test Post");

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Updated Integration Test Post");
  });

  test("DELETE /api/posts/:id - should delete post", async () => {
    const response = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Post Deleted");
  });
});

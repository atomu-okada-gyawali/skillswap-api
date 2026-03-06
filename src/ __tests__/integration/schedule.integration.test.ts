import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { PostModel } from "../../models/post.model";
import { ProposalModel } from "../../models/proposal.model";
import { ScheduleModel } from "../../models/schedule.model";

describe("Schedule Integration Tests", () => {
  let userToken = "";
  let userId = "";
  let proposalId = "";
  let scheduleId = "";

  beforeAll(async () => {
    // 1. Setup User
    const user = { username: "scheduletest", email: "schedule@test.com", password: "Password123!", confirmPassword: "Password123!", fullName: "Schedule Tester" };
    await UserModel.deleteMany({ email: user.email });
    await request(app).post("/api/auth/register").send(user);
    const loginRes = await request(app).post("/api/auth/login").send({ email: user.email, password: user.password });
    userToken = loginRes.body.token;
    userId = loginRes.body.data._id;

    // 2. Setup Post and Proposal
    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${userToken}`)
      .field("title", "Post for Schedule")
      .field("description", "Content description")
      .field("locationType", "hybrid")
      .field("availability", "flexible");
    const postId = postRes.body.data?._id;

    const propRes = await request(app)
      .post("/api/proposals")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        receiverId: userId, // for test simplicity, sender and receiver are same for now
        postId,
        offeredSkill: postId,
        message: "Test proposal"
      });
    proposalId = propRes.body.data._id;
  });

  afterAll(async () => {
    await ScheduleModel.deleteMany({ proposalId });
    await ProposalModel.deleteMany({ _id: proposalId });
    await PostModel.deleteMany({ userId });
    await UserModel.deleteMany({ _id: userId });
  });

  test("POST /api/schedules - should create a schedule", async () => {
    const response = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        proposalId,
        proposedDate: new Date().toISOString(),
        proposedTime: "11:00 AM",
        durationMinutes: 45
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    scheduleId = response.body.data._id;
  });

  test("GET /api/schedules - should get all schedules", async () => {
    const response = await request(app)
      .get("/api/schedules")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /api/schedules/:id - should get schedule by id", async () => {
    const response = await request(app)
      .get(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data._id).toBe(scheduleId);
  });

  test("PUT /api/schedules/:id - should update schedule", async () => {
    const response = await request(app)
      .put(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ durationMinutes: 90 });

    expect(response.status).toBe(200);
    expect(response.body.data.durationMinutes).toBe(90);
  });

  test("DELETE /api/schedules/:id - should delete schedule", async () => {
    const response = await request(app)
      .delete(`/api/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Schedule Deleted");
  });
});

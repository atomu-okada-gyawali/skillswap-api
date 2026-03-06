import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { PostModel } from "../../models/post.model";
import { ProposalModel } from "../../models/proposal.model";

describe("Proposal Integration Tests", () => {
  let senderToken = "";
  let senderId = "";
  let receiverId = "";
  let postId = "";
  let offeredSkillId = "";
  let proposalId = "";

  beforeAll(async () => {
    // 1. Create Sender and Receiver
    const sender = { username: "sender", email: "sender@test.com", password: "Password123!", confirmPassword: "Password123!", fullName: "Sender User" };
    const receiver = { username: "receiver", email: "receiver@test.com", password: "Password123!", confirmPassword: "Password123!", fullName: "Receiver User" };

    await UserModel.deleteMany({ email: { $in: [sender.email, receiver.email] } });

    await request(app).post("/api/auth/register").send(sender);
    await request(app).post("/api/auth/register").send(receiver);

    const senderLogin = await request(app).post("/api/auth/login").send({ email: sender.email, password: sender.password });
    senderToken = senderLogin.body.token;
    senderId = senderLogin.body.data._id;

    const receiverLogin = await request(app).post("/api/auth/login").send({ email: receiver.email, password: receiver.password });
    receiverId = receiverLogin.body.data._id;

    // 2. Create Posts (Needed for Proposal)
    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${senderToken}`)
      .field("title", "Post for Proposal")
      .field("description", "Need help with Flutter")
      .field("locationType", "remote")
      .field("availability", "part-time");
    postId = postRes.body.data?._id;

    const skillRes = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${senderToken}`)
      .field("title", "Offered Skill Post")
      .field("description", "I am good at React")
      .field("locationType", "on-site")
      .field("availability", "weekends");
    offeredSkillId = skillRes.body.data?._id;
  });

  afterAll(async () => {
    await ProposalModel.deleteMany({ senderId });
    await PostModel.deleteMany({ userId: senderId });
    await UserModel.deleteMany({ _id: { $in: [senderId, receiverId] } });
  });

  test("POST /api/proposals - should create a proposal", async () => {
    const response = await request(app)
      .post("/api/proposals")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        receiverId,
        postId,
        offeredSkill: offeredSkillId,
        message: "Hey, let's swap skills!"
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    proposalId = response.body.data._id;
  });

  test("GET /api/proposals - should get all proposals for user", async () => {
    const response = await request(app)
      .get("/api/proposals")
      .set("Authorization", `Bearer ${senderToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /api/proposals/:id - should get proposal by id", async () => {
    const response = await request(app)
      .get(`/api/proposals/${proposalId}`)
      .set("Authorization", `Bearer ${senderToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data._id).toBe(proposalId);
  });

  test("PATCH /api/proposals/:id/status - should update proposal status", async () => {
    const response = await request(app)
      .patch(`/api/proposals/${proposalId}/status`)
      .set("Authorization", `Bearer ${senderToken}`)
      .send({ status: "accepted" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("accepted");
  });

  test("POST /api/proposals/submit-complete - should create proposal, schedule and chat", async () => {
    const response = await request(app)
      .post("/api/proposals/submit-complete")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        receiverId,
        postId,
        offeredSkill: offeredSkillId,
        message: "Complete proposal test",
        proposedDate: "2026-03-10",
        proposedTime: "10:00 AM",
        durationMinutes: 60
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  test("DELETE /api/proposals/:id - should delete proposal", async () => {
    const response = await request(app)
      .delete(`/api/proposals/${proposalId}`)
      .set("Authorization", `Bearer ${senderToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Proposal Deleted");
  });
});

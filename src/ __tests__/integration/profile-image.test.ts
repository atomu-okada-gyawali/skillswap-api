import request from "supertest";
import app from "../../app";

describe("GET /api/auth/profile-image/:filename", () => {
  test("should return 404 for non-existent image", async () => {
    const response = await request(app).get(
      "/api/auth/profile-image/nonexistent-image.jpg"
    );

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
  });
});

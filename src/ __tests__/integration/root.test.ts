import request from "supertest";
import app from "../../app";

describe("Root Endpoint Tests", () => {
  describe("GET /", () => {
    test("should return welcome message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", "true");
    });
  });
});

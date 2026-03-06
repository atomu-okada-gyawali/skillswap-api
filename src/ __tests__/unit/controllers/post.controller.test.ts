import { PostController } from "../../../controllers/post.controller";
import { PostService } from "../../../services/post.service";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

jest.mock("../../../services/post.service");

describe("PostController", () => {
  let controller: PostController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new PostController();
    req = {
      body: {},
      query: {},
      params: {},
      user: { _id: new mongoose.Types.ObjectId() } as any,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createPost", () => {
    it("should return 400 if validation fails", async () => {
      req.body = {}; // invalid data based on DTO

      await controller.createPost(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it("should return 201 on success", async () => {
      req.body = {
        title: "Valid Title",
        description: "Valid Description",
        locationType: "remote",
        availability: "flexible",
      }; // Minimum valid payload
      const mockPost = { _id: "post1", title: "Valid Title" };
      (PostService.prototype.createPost as jest.Mock).mockResolvedValue(mockPost);

      await controller.createPost(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockPost }));
    });
  });

  describe("getPostById", () => {
    it("should return 400 if post id format is invalid", async () => {
      req.params = { id: "invalidObjectId" };

      await controller.getPostById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: "Invalid post id format" }));
    });

    it("should return 200 with data if successful", async () => {
      const validObjectId = new mongoose.Types.ObjectId().toHexString();
      req.params = { id: validObjectId };
      const mockPost = { _id: validObjectId, title: "Title" };
      (PostService.prototype.getPostById as jest.Mock).mockResolvedValue(mockPost);

      await controller.getPostById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockPost }));
    });
  });

  describe("deletePost", () => {
    it("should return 400 if id format is invalid", async () => {
      req.params = { id: "invalidObjectId" };

      await controller.deletePost(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if post is not deleted (not found)", async () => {
      const validObjectId = new mongoose.Types.ObjectId().toHexString();
      req.params = { id: validObjectId };
      (PostService.prototype.deletePost as jest.Mock).mockResolvedValue(false);

      await controller.deletePost(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it("should return 200 if successfully deleted", async () => {
      const validObjectId = new mongoose.Types.ObjectId().toHexString();
      req.params = { id: validObjectId };
      (PostService.prototype.deletePost as jest.Mock).mockResolvedValue(true);

      await controller.deletePost(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });
});

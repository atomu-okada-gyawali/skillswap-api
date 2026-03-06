import { PostService } from "../../../services/post.service";
import { PostRepository } from "../../../repository/post.repository";
import { UserModel } from "../../../models/user.model";
import { HttpError } from "../../../errors/http-error";

jest.mock("../../../repository/post.repository");
jest.mock("../../../models/user.model", () => ({
  UserModel: {
    exists: jest.fn(),
  },
}));

describe("PostService", () => {
  let service: PostService;

  beforeEach(() => {
    service = new PostService();
    jest.clearAllMocks();
  });

  describe("createPost", () => {
    it("should throw HttpError if user does not exist", async () => {
      (UserModel.exists as jest.Mock).mockResolvedValue(null);

      await expect(service.createPost({ userId: "invalid" } as any)).rejects.toThrow(HttpError);
      await expect(service.createPost({ userId: "invalid" } as any)).rejects.toThrow("User not found");
    });

    it("should create a post successfully if user exists", async () => {
      (UserModel.exists as jest.Mock).mockResolvedValue(true);
      const mockPost = { _id: "post1", title: "Title" };
      (PostRepository.prototype.createPost as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.createPost({ userId: "validUser", title: "Title" } as any);

      expect(UserModel.exists).toHaveBeenCalled();
      expect(PostRepository.prototype.createPost).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });
  });

  describe("getPostById", () => {
    it("should return a post from repository", async () => {
      const mockPost = { _id: "post1", title: "Title" };
      (PostRepository.prototype.getPostById as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.getPostById("post1");

      expect(result).toEqual(mockPost);
    });
  });

  describe("deletePost", () => {
    it("should throw HttpError if post not found", async () => {
      (PostRepository.prototype.getPostById as jest.Mock).mockResolvedValue(null);

      await expect(service.deletePost("invalid")).rejects.toThrow(HttpError);
    });

    it("should delete post if it exists", async () => {
      (PostRepository.prototype.getPostById as jest.Mock).mockResolvedValue({ _id: "post1" });
      (PostRepository.prototype.deletePost as jest.Mock).mockResolvedValue(true);

      const result = await service.deletePost("post1");

      expect(result).toBe(true);
    });
  });
});

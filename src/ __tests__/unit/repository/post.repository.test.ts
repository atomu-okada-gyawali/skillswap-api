import { PostRepository } from "../../../repository/post.repository";
import { PostModel } from "../../../models/post.model";

const mockPopulate = jest.fn().mockReturnThis();
const mockSkip = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockLean = jest.fn().mockReturnThis();
const mockExec = jest.fn();

const mockQuery: any = {
  populate: mockPopulate,
  skip: mockSkip,
  limit: mockLimit,
  lean: mockLean,
  exec: mockExec,
  then: jest.fn(function (this: any, resolve: any) {
    return Promise.resolve(this.exec()).then(resolve);
  }),
  catch: jest.fn(),
};

jest.mock("../../../models/post.model", () => ({
  PostModel: {
    create: jest.fn(),
    findById: jest.fn(() => mockQuery),
    find: jest.fn(() => mockQuery),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe("PostRepository", () => {
  let repository: PostRepository;

  beforeEach(() => {
    repository = new PostRepository();
    jest.clearAllMocks();
  });

  describe("createPost", () => {
    it("should create a new post", async () => {
      const mockPost = { _id: "post123", title: "Test Post" };
      (PostModel.create as jest.Mock).mockResolvedValue(mockPost as any);

      const result = await repository.createPost({
        userId: "user123",
        title: "Test Post",
        description: "Test Description",
        locationType: "remote",
        availability: "flexible",
      } as any);

      expect(PostModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });
  });

  describe("getPostById", () => {
    it("should return a post if found", async () => {
      const mockPost = { _id: "post123", title: "Test Post" };
      mockPopulate.mockResolvedValue(mockPost);

      const result = await repository.getPostById("post123");

      expect(PostModel.findById).toHaveBeenCalledWith("post123");
      expect(mockPopulate).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    it("should return null if not found", async () => {
      mockPopulate.mockResolvedValue(null);

      const result = await repository.getPostById("invalidId");

      expect(PostModel.findById).toHaveBeenCalledWith("invalidId");
      expect(result).toBeNull();
    });
  });

  describe("deletePost", () => {
    it("should delete a post and return true", async () => {
      (PostModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: "post123" });

      const result = await repository.deletePost("post123");

      expect(PostModel.findByIdAndDelete).toHaveBeenCalledWith("post123");
      expect(result).toBe(true);
    });
  });
});

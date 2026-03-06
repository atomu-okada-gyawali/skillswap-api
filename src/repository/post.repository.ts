import { QueryFilter, Types } from "mongoose";
import { PostModel, IPostModel } from "../models/post.model";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/post.dto";

export interface IPostRepository {
  createPost(data: CreatePostDTO): Promise<IPostModel>;
  getPostById(id: string): Promise<IPostModel | null>;
  getAllPosts(
    page: number,
    size: number,
    search?: string,
    excludeUserId?: string,
  ): Promise<{ posts: IPostModel[]; total: number }>;
  getMyPosts(
    userId: string,
    page: number,
    size: number,
    search?: string,
  ): Promise<{ posts: IPostModel[]; total: number }>;
  updatePost(id: string, data: UpdatePostDTO): Promise<IPostModel | null>;
  deletePost(id: string): Promise<boolean>;
}

export class PostRepository implements IPostRepository {
  async createPost(data: CreatePostDTO): Promise<IPostModel> {
    return PostModel.create(data);
  }

  async getPostById(id: string): Promise<IPostModel | null> {
    return PostModel.findById(id).populate([
      { path: "userId", select: "username fullName profilePicture" },
      { path: "tag", select: "name" },
    ]);
  }

  async getAllPosts(
    page: number,
    size: number,
    search?: string,
    excludeUserId?: string,
  ): Promise<{ posts: IPostModel[]; total: number }> {
    const filter: QueryFilter<IPostModel> = {};

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    if (excludeUserId) {
      filter.userId = { $ne: new Types.ObjectId(excludeUserId) };
    }

    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .populate([
          { path: "userId", select: "username fullName profilePicture" },
          { path: "tag", select: "name" },
        ])
        .skip((page - 1) * size)
        .limit(size)
        .lean(),
      PostModel.countDocuments(filter),
    ]);

    return { posts, total };
  }

  async getMyPosts(
    userId: string,
    page: number,
    size: number,
    search?: string,
  ): Promise<{ posts: IPostModel[]; total: number }> {
    const filter: QueryFilter<IPostModel> = {
      userId: new Types.ObjectId(userId),
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .populate([
          { path: "userId", select: "username fullName profilePicture" },
          { path: "tag", select: "name" },
        ])
        .skip((page - 1) * size)
        .limit(size)
        .lean(),
      PostModel.countDocuments(filter),
    ]);

    return { posts, total };
  }

  async updatePost(
    id: string,
    data: UpdatePostDTO,
  ): Promise<IPostModel | null> {
    const updateData: Record<string, unknown> = { ...data };
    if (typeof data.userId === "string" && data.userId.length > 0) {
      updateData.userId = new Types.ObjectId(data.userId);
    }
    return PostModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deletePost(id: string): Promise<boolean> {
    return !!(await PostModel.findByIdAndDelete(id));
  }
}

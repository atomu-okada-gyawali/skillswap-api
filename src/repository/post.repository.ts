import { QueryFilter, Types } from "mongoose";
import { PostModel, IPostModel } from "../models/post.model";
import { UserModel } from "../models/user.model";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/post.dto";
import { HttpError } from "../errors/http-error";

export interface IPostRepository {
  createPost(data: CreatePostDTO): Promise<IPostModel>;
  getPostById(id: string): Promise<IPostModel | null>;
  getAllPosts(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ posts: IPostModel[]; total: number }>;
  updatePost(id: string, data: UpdatePostDTO): Promise<IPostModel | null>;
  deletePost(id: string): Promise<boolean>;
}

export class PostRepository implements IPostRepository {
  async createPost(data: CreatePostDTO): Promise<IPostModel> {
    const userExists = await UserModel.exists({ _id: data.userId });
    if (!userExists) {
      throw new HttpError(404, "User not found");
    }
    return PostModel.create({
      ...data,
      userId: new Types.ObjectId(data.userId),
    });
  }

  async getPostById(id: string): Promise<IPostModel | null> {
    return PostModel.findById(id).populate("userId", "username fullName");
  }

  async getAllPosts(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ posts: IPostModel[]; total: number }> {
    const filter: QueryFilter<IPostModel> = {};

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .populate("userId", "username fullName")
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
      const userExists = await UserModel.exists({ _id: data.userId });
      if (!userExists) {
        throw new HttpError(404, "User not found");
      }
      updateData.userId = new Types.ObjectId(data.userId);
    }
    return PostModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deletePost(id: string): Promise<boolean> {
    return !!(await PostModel.findByIdAndDelete(id));
  }
}

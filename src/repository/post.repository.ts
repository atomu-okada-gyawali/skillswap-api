import { QueryFilter } from "mongoose";
import { IPost, PostModel } from "../models/post.model";

export interface IPostRepository {
  createPost(postData: Partial<IPost>): Promise<IPost>;
  getPostById(id: string): Promise<IPost | null>;
  getAllPosts(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ posts: IPost[]; total: number }>;
  updatePost(id: string, updateData: Partial<IPost>): Promise<IPost | null>;
  deletePost(id: string): Promise<boolean>;
}
export class PostRepository implements IPostRepository {
  async createPost(postData: Partial<IPost>): Promise<IPost> {
    const post = new PostModel(postData);
    return await post.save();
  }
  async getPostById(id: string): Promise<IPost | null> {
    const post = PostModel.findById(id);
    return await post;
  }
  async getAllPosts(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ posts: IPost[]; total: number }> {
    const filter: QueryFilter<IPost> = {};
    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }];
    }
    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .skip((page - 1) * size)
        .limit(size),
      PostModel.countDocuments(filter),
    ]);

    return { posts, total };
  }
  async updatePost(
    id: string,
    updateData: Partial<IPost>,
  ): Promise<IPost | null> {
    const updatedPost = await PostModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return updatedPost;
  }
  async deletePost(id: string): Promise<boolean> {
    const result = await PostModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}

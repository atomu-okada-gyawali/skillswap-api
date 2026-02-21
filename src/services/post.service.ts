import { CreatePostDTO, UpdatePostDTO } from "../dtos/post.dto";

import { PostRepository } from "../repository/post.repository";
import { UserModel } from "../models/user.model";

import { HttpError } from "../errors/http-error";

let postRepository = new PostRepository();

export class PostService {
  async createPost(data: CreatePostDTO) {
    const userExists = await UserModel.exists({ _id: data.userId });
    if (!userExists) {
      throw new HttpError(404, "User not found");
    }
    const newPost = await postRepository.createPost(data);
    return newPost;
  }

  async updatePost(postId: string, data: UpdatePostDTO) {
    const post = await postRepository.getPostById(postId);
    if (!post) {
      throw new HttpError(404, "Post not found");
    }
    if (typeof data.userId === "string" && data.userId.length > 0) {
      const userExists = await UserModel.exists({ _id: data.userId });
      if (!userExists) {
        throw new HttpError(404, "User not found");
      }
    }
    const updatedPost = await postRepository.updatePost(postId, data);
    return updatedPost;
  }

  async getPostById(id: string) {
    const post = await postRepository.getPostById(id);
    return post;
  }

  async getAllPosts(page?: string, size?: string, search?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;
    const { posts, total } = await postRepository.getAllPosts(
      pageNumber,
      pageSize,
      search,
    );
    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };
    return { posts, pagination };
  }
  async deletePost(id: string) {
    const post = await postRepository.getPostById(id);
    if (!post) {
      throw new HttpError(404, "Post not found");
    }
    const deleted = await postRepository.deletePost(id);
    return deleted;
  }
}

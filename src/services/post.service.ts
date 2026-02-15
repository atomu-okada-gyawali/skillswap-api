import { CreatePostDTO, UpdatePostDTO } from "../dtos/post.dto";

import { PostRepository } from "../repository/post.repository";

import { HttpError } from "../errors/http-error";

import z from "zod";

let postRepository = new PostRepository();

export class PostService {
  async createPost(data: CreatePostDTO) {
    const newPost = await postRepository.createPost(data);
    return newPost;
  }

  async updatePost(postId: string, data: UpdatePostDTO) {
    const post = await postRepository.getPostById(postId);
    if (!post) {
      throw new HttpError(404, "Post not found");
    }
    const updatedPost = await postRepository.updatePost(postId, data);
    return updatedPost;
  }

  async getPostById(id: string) {
    const post = await postRepository.getPostById(id);
    return post;
  }
}

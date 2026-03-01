import z from "zod";
import { CreatePostDTO, UpdatePostDTO } from "../dtos/post.dto";

import { Request, Response, NextFunction } from "express";
import { QueryParams } from "../types/query.type";
import mongoose from "mongoose";
import { PostService } from "../services/post.service";
let postService = new PostService();

export class PostController {
  async createPost(req: Request, res: Response, next: NextFunction) {

    try {
      const userId = req.user?._id?.toString(); // attached from middleware
      req.body.userId = userId; // add userId into authorIds
      const parsedData = CreatePostDTO.safeParse(req.body); // validate request body
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      if (req.file) {
        parsedData.data.postPhoto = `/uploads/${req.file.filename}`;
      }
      const postData: CreatePostDTO = parsedData.data;

      const newPost = await postService.createPost(postData);
      return res
        .status(201)
        .json({ success: true, message: "Post Created", data: newPost });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, size, search, excludeUserId }: QueryParams = req.query;
      const { posts, pagination } = await postService.getAllPosts(
        page,
        size,
        search,
        excludeUserId,
      );
      return res.status(200).json({
        success: true,
        data: posts,
        pagination: pagination,
        message: "All Posts Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMyPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const { page, size, search }: QueryParams = req.query;
      const { posts, pagination } = await postService.getMyPosts(
        userId,
        page,
        size,
        search,
      );
      return res.status(200).json({
        success: true,
        data: posts,
        pagination: pagination,
        message: "My Posts Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid post id format" });
      }
      const parsedData = UpdatePostDTO.safeParse(req.body); // validate request body
      if (!parsedData.success) {
        // validation failed
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      if (req.file) {
        parsedData.data.postPhoto = `/uploads/${req.file.filename}`;
      }
      const updateData: UpdatePostDTO = parsedData.data;
      const updatedPost = await postService.updatePost(postId, updateData);
      return res
        .status(200)
        .json({ success: true, message: "Post Updated", data: updatedPost });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid post id format" });
      }
      const deleted = await postService.deletePost(postId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }
      return res.status(200).json({ success: true, message: "Post Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid post id format" });
      }
      const post = await postService.getPostById(postId);
      return res
        .status(200)
        .json({ success: true, data: post, message: "Single Post Retrieved" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

import { Request, Response } from "express";
import mongoose from "mongoose";
import { FavoriteService } from "../services/favorite.service";
import { QueryParams } from "../types/query.type";

let favoriteService = new FavoriteService();

export class FavoriteController {
  async createFavorite(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { postId } = req.body;
      if (!postId) {
        return res
          .status(400)
          .json({ success: false, message: "Post ID is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid post ID format" });
      }

      const favorite = await favoriteService.createFavorite(userId, postId);
      return res
        .status(201)
        .json({ success: true, message: "Post favorited", data: favorite });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteFavorite(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const postId = req.params.postId;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid post ID format" });
      }

      await favoriteService.deleteFavorite(userId, postId);
      return res
        .status(200)
        .json({ success: true, message: "Favorite removed" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getFavorites(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { page, size }: QueryParams = req.query;
      const { posts, pagination } = await favoriteService.getFavoritesByUser(
        userId,
        page,
        size,
      );

      return res.status(200).json({
        success: true,
        data: posts,
        pagination,
        message: "Favorites retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async checkFavorite(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const postId = req.params.postId;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid post ID format" });
      }

      const isFavorited = await favoriteService.isFavorited(userId, postId);
      return res.status(200).json({
        success: true,
        data: { isFavorited },
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserFavoritePostIds(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const postIds = await favoriteService.getUserFavoritePostIds(userId);
      return res.status(200).json({
        success: true,
        data: postIds,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

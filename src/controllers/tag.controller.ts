import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { TagService } from "../services/tag.service";
import { QueryParams } from "../types/query.type";

let tagService = new TagService();

export class TagController {
  async getAllTags(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, size, search }: QueryParams = req.query;
      const { tags, pagination } = await tagService.getAllTags(
        page,
        size,
        search,
      );
      return res.status(200).json({
        success: true,
        data: tags,
        pagination: pagination,
        message: "All Tags Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getTagById(req: Request, res: Response, next: NextFunction) {
    try {
      const tagId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        return res.status(400).json({ success: false, message: "Invalid tag id format" });
      }

      const tag = await tagService.getTagById(tagId);
      if (!tag) {
        return res.status(404).json({ success: false, message: "Tag not found" });
      }
      return res
        .status(200)
        .json({ success: true, data: tag, message: "Tag Retrieved" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

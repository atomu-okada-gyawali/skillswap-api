import { CreateTagDTO, UpdateTagDTOSchema, UpdateTagDTO } from "../../dtos/tag.dto";
import { Request, Response, NextFunction } from "express";
import z from "zod";
import mongoose from "mongoose";
import { AdminTagService } from "../../services/admin/tag.service";
import { QueryParams } from "../../types/query.type";

let adminTagService = new AdminTagService();

export class AdminTagController {
  async createTag(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateTagDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      if (req.file) {
        parsedData.data.tagImage = `/uploads/${req.file.filename}`;
      }

      const tagData: CreateTagDTO = parsedData.data;
      const newTag = await adminTagService.createTag(tagData);
      return res
        .status(201)
        .json({ success: true, message: "Tag Created", data: newTag });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllTags(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, size, search }: QueryParams = req.query;
      const { tags, pagination } = await adminTagService.getAllTags(
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

  async updateTag(req: Request, res: Response, next: NextFunction) {
    try {
      const tagId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        return res.status(400).json({ success: false, message: "Invalid tag id format" });
      }

      const parsedData = UpdateTagDTOSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      if (req.file) {
        parsedData.data.tagImage = `/uploads/${req.file.filename}`;
      }

      const updateData: UpdateTagDTO = parsedData.data;
      const updatedTag = await adminTagService.updateTag(tagId, updateData);
      return res
        .status(200)
        .json({ success: true, message: "Tag Updated", data: updatedTag });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      const tagId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(tagId)) {
        return res.status(400).json({ success: false, message: "Invalid tag id format" });
      }

      const deleted = await adminTagService.deleteTag(tagId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Tag not found" });
      }
      return res.status(200).json({ success: true, message: "Tag Deleted" });
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

      const tag = await adminTagService.getTagById(tagId);
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

import z from "zod";
import { CreateMessageDTO } from "../dtos/message.dto";

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { MessageService } from "../services/message.service";
let messageService = new MessageService();

export class MessageController {
  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const parsedData = CreateMessageDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const messageData: CreateMessageDTO = parsedData.data;
      const newMessage = await messageService.createMessage(messageData, userId);
      return res
        .status(201)
        .json({ success: true, message: "Message Created", data: newMessage });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMessagesByChatId(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.chatId as string;
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid chat id format" });
      }
      const messages = await messageService.getMessagesByChatId(chatId);
      return res.status(200).json({
        success: true,
        data: messages,
        message: "Messages Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getMessageById(req: Request, res: Response, next: NextFunction) {
    try {
      const messageId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid message id format" });
      }
      const message = await messageService.getMessageById(messageId);
      return res
        .status(200)
        .json({ success: true, data: message, message: "Message Retrieved" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const messageId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid message id format" });
      }
      const deleted = await messageService.deleteMessage(messageId);
      return res.status(200).json({ success: true, message: "Message Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

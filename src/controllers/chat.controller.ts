import z from "zod";
import { CreateChatDTO } from "../dtos/chat.dto";

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ChatService } from "../services/chat.service";
let chatService = new ChatService();

export class ChatController {
  async createChat(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateChatDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const chatData: CreateChatDTO = parsedData.data;
      const newChat = await chatService.createChat(chatData);
      return res
        .status(201)
        .json({ success: true, message: "Chat Created", data: newChat });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllChats(req: Request, res: Response, next: NextFunction) {
    try {
      const chats = await chatService.getAllChats();
      return res.status(200).json({
        success: true,
        data: chats,
        message: "All Chats Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getChatById(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid chat id format" });
      }
      const chat = await chatService.getChatById(chatId);
      return res
        .status(200)
        .json({ success: true, data: chat, message: "Chat Retrieved" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getChatByProposalId(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = req.params.proposalId as string;
      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid proposal id format" });
      }
      const chat = await chatService.getChatByProposalId(proposalId);
      if (!chat) {
        return res
          .status(404)
          .json({ success: false, message: "Chat not found" });
      }
      return res
        .status(200)
        .json({ success: true, data: chat, message: "Chat Retrieved" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteChat(req: Request, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid chat id format" });
      }
      const deleted = await chatService.deleteChat(chatId);
      return res.status(200).json({ success: true, message: "Chat Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

import { QueryFilter } from "mongoose";
import { ChatModel, IChat } from "../models/chat.model";
import { CreateChatDTO } from "../dtos/chat.dto";

export interface IChatRepository {
  createChat(data: CreateChatDTO): Promise<IChat>;
  getChatById(id: string): Promise<IChat | null>;
  getChatByProposalId(proposalId: string): Promise<IChat | null>;
  getAllChats(): Promise<IChat[]>;
  deleteChat(id: string): Promise<boolean>;
}

export class ChatRepository implements IChatRepository {
  async createChat(data: CreateChatDTO): Promise<IChat> {
    return ChatModel.create(data);
  }

  async getChatById(id: string): Promise<IChat | null> {
    return ChatModel.findById(id).populate("proposalId");
  }

  async getChatByProposalId(proposalId: string): Promise<IChat | null> {
    return ChatModel.findOne({ proposalId }).populate("proposalId");
  }

  async getAllChats(): Promise<IChat[]> {
    return ChatModel.find().populate("proposalId").lean();
  }

  async deleteChat(id: string): Promise<boolean> {
    return !!(await ChatModel.findByIdAndDelete(id));
  }
}

import { CreateChatDTO } from "../dtos/chat.dto";
import { ChatRepository } from "../repository/chat.repository";
import { ProposalModel } from "../models/proposal.model";
import { ScheduleModel } from "../models/schedule.model";
import { HttpError } from "../errors/http-error";

let chatRepository = new ChatRepository();

export class ChatService {
  async createChat(data: CreateChatDTO) {
    const proposalExists = await ProposalModel.exists({ _id: data.proposalId });
    if (!proposalExists) {
      throw new HttpError(404, "Proposal not found");
    }
    const scheduleExists = await ScheduleModel.exists({ proposalId: data.proposalId });
    if (!scheduleExists) {
      throw new HttpError(400, "Schedule must be created before chat can be started");
    }
    const existingChat = await chatRepository.getChatByProposalId(data.proposalId);
    if (existingChat) {
      return existingChat;
    }
    const newChat = await chatRepository.createChat(data);
    return newChat;
  }

  async getChatById(id: string) {
    const chat = await chatRepository.getChatById(id);
    if (!chat) {
      throw new HttpError(404, "Chat not found");
    }
    return chat;
  }

  async getChatByProposalId(proposalId: string) {
    const chat = await chatRepository.getChatByProposalId(proposalId);
    return chat;
  }

  async getAllChats(userId?: string) {
    return chatRepository.getAllChats(userId);
  }

  async deleteChat(id: string) {
    const chat = await chatRepository.getChatById(id);
    if (!chat) {
      throw new HttpError(404, "Chat not found");
    }
    return chatRepository.deleteChat(id);
  }
}

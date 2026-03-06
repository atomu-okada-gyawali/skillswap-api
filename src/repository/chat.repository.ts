import { ChatModel, IChat } from "../models/chat.model";
import { CreateChatDTO } from "../dtos/chat.dto";

const proposalPopulate = {
  path: "proposalId",
  populate: [
    { path: "senderId", select: "username profilePicture fullName" },
    { path: "receiverId", select: "username profilePicture fullName" },
    { path: "postId", select: "title" },
  ],
};

export interface IChatRepository {
  createChat(data: CreateChatDTO): Promise<IChat>;
  getChatById(id: string): Promise<IChat | null>;
  getChatByProposalId(proposalId: string): Promise<IChat | null>;
  getAllChats(userId?: string): Promise<IChat[]>;
  deleteChat(id: string): Promise<boolean>;
}

export class ChatRepository implements IChatRepository {
  async createChat(data: CreateChatDTO): Promise<IChat> {
    return ChatModel.create(data);
  }

  async getChatById(id: string): Promise<IChat | null> {
    return ChatModel.findById(id).populate(proposalPopulate).lean();
  }

  async getChatByProposalId(proposalId: string): Promise<IChat | null> {
    return ChatModel.findOne({ proposalId }).populate(proposalPopulate).lean();
  }

  async getAllChats(userId?: string): Promise<IChat[]> {
    // First get all chats populated, then filter by userId if provided
    if (userId) {
      // Use aggregation to filter chats where user is sender or receiver in the proposal
      const allChats = await ChatModel.find().populate(proposalPopulate).lean();
      return allChats.filter((chat: any) => {
        const proposal = chat.proposalId;
        if (!proposal) return false;
        const senderId = proposal.senderId?._id?.toString() ?? proposal.senderId?.toString();
        const receiverId = proposal.receiverId?._id?.toString() ?? proposal.receiverId?.toString();
        return senderId === userId || receiverId === userId;
      });
    }
    return ChatModel.find().populate(proposalPopulate).lean();
  }

  async deleteChat(id: string): Promise<boolean> {
    return !!(await ChatModel.findByIdAndDelete(id));
  }
}

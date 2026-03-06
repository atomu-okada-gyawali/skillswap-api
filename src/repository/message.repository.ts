import { MessageModel, IMessage } from "../models/message.model";
import { CreateMessageDTO } from "../dtos/message.dto";

export interface IMessageRepository {
  createMessage(data: CreateMessageDTO, senderId: string): Promise<IMessage>;
  getMessageById(id: string): Promise<IMessage | null>;
  getMessagesByChatId(chatId: string): Promise<IMessage[]>;
  deleteMessage(id: string): Promise<boolean>;
}

export class MessageRepository implements IMessageRepository {
  async createMessage(data: CreateMessageDTO, senderId: string): Promise<IMessage> {
    return MessageModel.create({
      ...data,
      senderId,
    });
  }

  async getMessageById(id: string): Promise<IMessage | null> {
    return MessageModel.findById(id)
      .populate("senderId", "username fullName profilePicture")
      .populate("chatId");
  }

  async getMessagesByChatId(chatId: string): Promise<IMessage[]> {
    return MessageModel.find({ chatId })
      .sort({ createdAt: 1 })
      .lean();
  }

  async deleteMessage(id: string): Promise<boolean> {
    return !!(await MessageModel.findByIdAndDelete(id));
  }
}

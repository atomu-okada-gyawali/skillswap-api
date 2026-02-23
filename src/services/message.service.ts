import { CreateMessageDTO } from "../dtos/message.dto";
import { MessageRepository } from "../repository/message.repository";
import { ChatRepository } from "../repository/chat.repository";
import { HttpError } from "../errors/http-error";

let messageRepository = new MessageRepository();
let chatRepository = new ChatRepository();

export class MessageService {
  async createMessage(data: CreateMessageDTO, senderId: string) {
    const chat = await chatRepository.getChatById(data.chatId);
    if (!chat) {
      throw new HttpError(404, "Chat not found");
    }
    const newMessage = await messageRepository.createMessage(data, senderId);
    return newMessage;
  }

  async getMessageById(id: string) {
    const message = await messageRepository.getMessageById(id);
    if (!message) {
      throw new HttpError(404, "Message not found");
    }
    return message;
  }

  async getMessagesByChatId(chatId: string) {
    const chat = await chatRepository.getChatById(chatId);
    if (!chat) {
      throw new HttpError(404, "Chat not found");
    }
    return messageRepository.getMessagesByChatId(chatId);
  }

  async deleteMessage(id: string) {
    const message = await messageRepository.getMessageById(id);
    if (!message) {
      throw new HttpError(404, "Message not found");
    }
    return messageRepository.deleteMessage(id);
  }
}

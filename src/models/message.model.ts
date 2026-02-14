import mongoose, { Document, Schema } from "mongoose";
import { MessageType } from "../types/message.type";

const MessageSchema: Schema = new Schema<MessageType>(
  {
    chatId: { type: String, required: true, ref: "Chat" },
    senderId: { type: String, required: true, ref: "User" },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export interface IMessage extends MessageType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
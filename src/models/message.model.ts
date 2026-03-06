import mongoose, { Document, Schema, Types } from "mongoose";
import { MessageType } from "../types/message.type";

export interface IMessageModel extends Omit<MessageType, "chatId" | "senderId"> {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
}

const MessageSchema: Schema = new Schema<IMessageModel>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export interface IMessage extends IMessageModel, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
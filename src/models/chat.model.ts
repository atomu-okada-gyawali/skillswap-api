import mongoose, { Document, Schema } from "mongoose";
import { ChatType } from "../types/chat.type";

const ChatSchema: Schema = new Schema<ChatType>(
  {
    proposalId: { type: String, required: true, ref: "Proposal" },
  },
  {
    timestamps: true,
  },
);

export interface IChat extends ChatType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
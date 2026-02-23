import mongoose, { Document, Schema, Types } from "mongoose";
import { ChatType } from "../types/chat.type";

export interface IChatModel extends Omit<ChatType, "proposalId"> {
  proposalId: Types.ObjectId;
}

const ChatSchema: Schema = new Schema<IChatModel>(
  {
    proposalId: { type: Schema.Types.ObjectId, ref: "Proposal", required: true },
  },
  {
    timestamps: true,
  },
);

export interface IChat extends IChatModel, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
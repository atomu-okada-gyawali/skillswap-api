import mongoose, { Document, Schema, Types } from "mongoose";
import { ProposalType } from "../types/proposal.type";

export interface IProposal extends Omit<ProposalType, "senderId" | "receiverId" | "postId"> {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  postId: Types.ObjectId;
}

const ProposalSchema: Schema = new Schema<IProposal>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    offeredSkill: { type: String, required: true },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["pending", "accepted", "rejected", "cancelled"], 
      default: "pending" 
    },
  },
  {
    timestamps: true,
  },
);

export const ProposalModel = mongoose.model<IProposal>("Proposal", ProposalSchema);
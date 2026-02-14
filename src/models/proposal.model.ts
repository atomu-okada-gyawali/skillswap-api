import mongoose, { Document, Schema } from "mongoose";
import { ProposalType } from "../types/proposal.type";

const ProposalSchema: Schema = new Schema<ProposalType>(
  {
    senderId: { type: String, required: true, ref: "User" },
    receiverId: { type: String, required: true, ref: "User" },
    postId: { type: String, required: true, ref: "Post" },
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

export interface IProposal extends ProposalType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ProposalModel = mongoose.model<IProposal>("Proposal", ProposalSchema);
import mongoose, { Document, Schema } from "mongoose";
import { ProposalType } from "../types/proposal.type";

export interface IProposal extends Omit<
  ProposalType,
  "senderId" | "receiverId" | "postId"
> {
  senderId: string;
  receiverId: string;
  postId: string;
}

const ProposalSchema: Schema = new Schema<IProposal>(
  {
    senderId: { type: String, ref: "User", required: true },
    receiverId: { type: String, ref: "User", required: true },
    postId: { type: String, ref: "Post", required: true },
    offeredSkill: { type: String, ref: "Post", required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export const ProposalModel = mongoose.model<IProposal>(
  "Proposal",
  ProposalSchema,
);

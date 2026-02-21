import z from "zod";
import { ProposalSchema } from "../types/proposal.type";

export const CreateProposalDTO = ProposalSchema.pick({
  senderId: true,
  receiverId: true,
  postId: true,
  offeredSkill: true,
  message: true,
});

export type CreateProposalDTO = z.infer<typeof CreateProposalDTO>;

export const UpdateProposalDTO = CreateProposalDTO.partial().extend({
  status: z.enum(["pending", "accepted", "rejected", "cancelled"]).optional(),
});
export type UpdateProposalDTO = z.infer<typeof UpdateProposalDTO>;

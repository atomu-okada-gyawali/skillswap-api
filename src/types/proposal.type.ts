import z from "zod";

export const ProposalSchema = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  postId: z.string(),
  offeredSkill: z.string(),
  message: z.string(),
  status: z.enum(["pending", "accepted", "rejected", "cancelled"]).default("pending"),
});

export type ProposalType = z.infer<typeof ProposalSchema>;
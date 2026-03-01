import z from "zod";

export const ProposalSchema = z.object({
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  postId: z.string().min(1),
  offeredSkill: z.string().min(1),
  message: z.string(),
  status: z.enum(["pending", "accepted", "rejected", "cancelled"]).default("pending"),
});

export type ProposalType = z.infer<typeof ProposalSchema>;
import z from "zod";

export const ProposalSchema = z.object({
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  postId: z.string().uuid(),
  offeredSkill: z.string().min(1),
  message: z.string(),
  status: z.enum(["pending", "accepted", "rejected", "cancelled"]).default("pending"),
});

export type ProposalType = z.infer<typeof ProposalSchema>;
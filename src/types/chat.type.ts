import z from "zod";

export const ChatSchema = z.object({
  proposalId: z.string().uuid(),
});

export type ChatType = z.infer<typeof ChatSchema>;
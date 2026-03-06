import z from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const ChatSchema = z.object({
  proposalId: z.string().regex(objectIdRegex),
});

export type ChatType = z.infer<typeof ChatSchema>;
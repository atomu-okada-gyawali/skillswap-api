import z from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const MessageSchema = z.object({
  chatId: z.string().regex(objectIdRegex),
  senderId: z.string().regex(objectIdRegex),
  content: z.string().min(1),
});

export type MessageType = z.infer<typeof MessageSchema>;
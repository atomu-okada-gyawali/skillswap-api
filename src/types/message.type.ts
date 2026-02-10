import z from "zod";

export const MessageSchema = z.object({
  chatId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1),
});

export type MessageType = z.infer<typeof MessageSchema>;
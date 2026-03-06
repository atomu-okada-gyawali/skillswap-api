import z from "zod";
import { MessageSchema } from "../types/message.type";

export const CreateMessageDTO = MessageSchema.pick({
  chatId: true,
  content: true,
});
export type CreateMessageDTO = z.infer<typeof CreateMessageDTO>;

import z from "zod";
import { ChatSchema } from "../types/chat.type";

export const CreateChatDTO = ChatSchema.pick({
  proposalId: true,
});
export type CreateChatDTO = z.infer<typeof CreateChatDTO>;

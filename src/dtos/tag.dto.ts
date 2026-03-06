import z from "zod";
import { TagSchema } from "../types/tag.type";

export const CreateTagDTO = TagSchema.pick({
  name: true,
  tagImage: true,
});
export type CreateTagDTO = z.infer<typeof CreateTagDTO>;
const UpdateTagDTO = CreateTagDTO.partial();
export const UpdateTagDTOSchema = UpdateTagDTO;
export type UpdateTagDTO = z.infer<typeof UpdateTagDTO>;

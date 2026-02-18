import z from "zod";
import { PostZodSchema } from "../types/post.type";
// re-use UserSchema from types
export const CreatePostDTO = PostZodSchema.pick({
  userId: true,
  title: true,
  description: true,
  locationType: true,
  availability: true,
  postPhoto: true,
});
export type CreatePostDTO = z.infer<typeof CreatePostDTO>;

export const UpdatePostDTO = PostZodSchema.partial();
export type UpdatePostDTO = z.infer<typeof UpdatePostDTO>;

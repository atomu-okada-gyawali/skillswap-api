import z from "zod";
import { PostSchema } from "../types/post.type";
// re-use UserSchema from types
export const CreatePostDTO = PostSchema.pick({
  userId: true,
  title: true,
  description: true,
  locationType: true,
  availability: true,
  postPhoto: true,
  requirements: true,
  tag: true,
  duration: true,
});
export type CreatePostDTO = z.infer<typeof CreatePostDTO>;

export const UpdatePostDTO = PostSchema.partial();
export type UpdatePostDTO = z.infer<typeof UpdatePostDTO>;

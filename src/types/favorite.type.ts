import z from "zod";

export const FavoriteSchema = z.object({
  userId: z.string(),
  postId: z.string(),
});

export type FavoriteType = z.infer<typeof FavoriteSchema>;

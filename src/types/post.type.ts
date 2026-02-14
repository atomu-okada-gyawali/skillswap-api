import z from "zod";

export const PostSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  locationType: z.enum(["online", "offline", "hybrid"]),
  availability: z.enum(["available", "busy", "unavailable"]),
});

export type PostType = z.infer<typeof PostSchema>;
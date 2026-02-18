import z from "zod";

export const PostZodSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  postPhoto: z.string().optional(),
  locationType: z.enum(["online", "offline", "hybrid"]),
  availability: z.enum(["available", "busy", "unavailable"]),
});

export type PostType = z.infer<typeof PostZodSchema>;

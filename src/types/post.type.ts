import z from "zod";

export const PostSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  postPhoto: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  locationType: z.enum(["remote", "on-site", "hybrid"]),
  availability: z.enum(["full-time", "part-time", "flexible", "weekends"]),
  duration: z.string().optional(),
  tag: z.union([z.string(), z.object({ _id: z.string(), name: z.string() })]).optional(),
});

export type PostType = z.infer<typeof PostSchema>;

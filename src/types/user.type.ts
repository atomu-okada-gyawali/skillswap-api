import z from "zod";

export const UserSchema = z.object({
  username: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
  fullName: z.string().min(1),
  profilePicture: z.string().optional(),
  phoneNumber: z.string().length(10).optional(),
});

export type UserType = z.infer<typeof UserSchema>;

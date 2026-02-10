import z from "zod";

export const ScheduleSchema = z.object({
  proposalId: z.string().uuid(),
  proposedDate: z.date(),
  proposedTime: z.string(),
  durationMinutes: z.number().min(1),
  accepted: z.boolean().default(false),
});

export type ScheduleType = z.infer<typeof ScheduleSchema>;
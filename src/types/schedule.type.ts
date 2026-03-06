import z from "zod";

export const ScheduleSchema = z.object({
  proposalId: z.string().min(1),
  proposedDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date(),
  ),
  proposedTime: z.string().min(1),
  durationMinutes: z.coerce.number().min(1),
  accepted: z.boolean().default(false),
});

export type ScheduleType = z.infer<typeof ScheduleSchema>;

import z from "zod";
import { ScheduleSchema } from "../types/schedule.type";

export const CreateScheduleDTO = ScheduleSchema.pick({
  proposalId: true,
  proposedDate: true,
  proposedTime: true,
  durationMinutes: true,
});

export type CreateScheduleDTO = z.infer<typeof CreateScheduleDTO>;

export const UpdateScheduleDTO = CreateScheduleDTO.partial().extend({
  accepted: z.boolean().optional(),
});

export type UpdateScheduleDTO = z.infer<typeof UpdateScheduleDTO>;

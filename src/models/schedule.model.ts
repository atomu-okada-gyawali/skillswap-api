import mongoose, { Document, Schema } from "mongoose";
import { ScheduleType } from "../types/schedule.type";

const ScheduleSchema: Schema = new Schema<ScheduleType>(
  {
    proposalId: { type: String, required: true, ref: "Proposal" },
    proposedDate: { type: Date, required: true },
    proposedTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    accepted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export interface ISchedule extends ScheduleType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ScheduleModel = mongoose.model<ISchedule>("Schedule", ScheduleSchema);
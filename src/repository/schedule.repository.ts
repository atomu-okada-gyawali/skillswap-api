import { ISchedule, ScheduleModel } from "../models/schedule.model";
import { CreateScheduleDTO, UpdateScheduleDTO } from "../dtos/schedule.dto";

export interface IScheduleRepository {
  createSchedule(data: CreateScheduleDTO): Promise<ISchedule>;
  getScheduleById(id: string): Promise<ISchedule | null>;
  getSchedulesByProposalId(proposalId: string): Promise<ISchedule[]>;
  getAllSchedules(page: number, size: number): Promise<{ schedules: ISchedule[]; total: number }>;
  updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ISchedule | null>;
  deleteSchedule(id: string): Promise<boolean>;
}

export class ScheduleRepository implements IScheduleRepository {
  async createSchedule(data: CreateScheduleDTO): Promise<ISchedule> {
    return ScheduleModel.create(data);
  }

  async getScheduleById(id: string): Promise<ISchedule | null> {
    return ScheduleModel.findById(id).populate("proposalId", "title senderId receiverId");
  }

  async getSchedulesByProposalId(proposalId: string): Promise<ISchedule[]> {
    return ScheduleModel.find({ proposalId }).lean();
  }

  async getAllSchedules(page: number, size: number): Promise<{ schedules: ISchedule[]; total: number }> {
    const skip = (page - 1) * size;
    const [schedules, total] = await Promise.all([
      ScheduleModel.find()
        .populate("proposalId", "title senderId receiverId")
        .skip(skip)
        .limit(size)
        .lean(),
      ScheduleModel.countDocuments(),
    ]);
    return { schedules, total };
  }

  async updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ISchedule | null> {
    return ScheduleModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const result = await ScheduleModel.findByIdAndDelete(id);
    return !!result;
  }
}

import { CreateScheduleDTO, UpdateScheduleDTO } from "../dtos/schedule.dto";
import { ScheduleRepository } from "../repository/schedule.repository";
import { HttpError } from "../errors/http-error";
import { ProposalModel } from "../models/proposal.model";

let scheduleRepository = new ScheduleRepository();

export class ScheduleService {
  async createSchedule(data: CreateScheduleDTO) {
    const proposalExists = await ProposalModel.exists({ _id: data.proposalId });
    if (!proposalExists) {
      throw new HttpError(404, "Proposal not found");
    }
    const newSchedule = await scheduleRepository.createSchedule(data);
    return newSchedule;
  }

  async updateSchedule(scheduleId: string, data: UpdateScheduleDTO) {
    const schedule = await scheduleRepository.getScheduleById(scheduleId);
    if (!schedule) {
      throw new HttpError(404, "Schedule not found");
    }
    const updatedSchedule = await scheduleRepository.updateSchedule(scheduleId, data);
    return updatedSchedule;
  }

  async getScheduleById(id: string) {
    const schedule = await scheduleRepository.getScheduleById(id);
    if (!schedule) {
      throw new HttpError(404, "Schedule not found");
    }
    return schedule;
  }

  async getAllSchedules(page?: string, size?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;
    const { schedules, total } = await scheduleRepository.getAllSchedules(pageNumber, pageSize);
    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };
    return { schedules, pagination };
  }

  async deleteSchedule(id: string) {
    const schedule = await scheduleRepository.getScheduleById(id);
    if (!schedule) {
      throw new HttpError(404, "Schedule not found");
    }
    const deleted = await scheduleRepository.deleteSchedule(id);
    return deleted;
  }
}

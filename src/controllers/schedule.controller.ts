import z from "zod";
import { CreateScheduleDTO, UpdateScheduleDTO } from "../dtos/schedule.dto";
import { Request, Response, NextFunction } from "express";
import { QueryParams } from "../types/query.type";
import mongoose from "mongoose";
import { ScheduleService } from "../services/schedule.service";

let scheduleService = new ScheduleService();

export class ScheduleController {
  async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateScheduleDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const scheduleData: CreateScheduleDTO = parsedData.data;
      const newSchedule = await scheduleService.createSchedule(scheduleData);
      return res
        .status(201)
        .json({ success: true, message: "Schedule Created", data: newSchedule });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, size }: QueryParams = req.query;
      const { schedules, pagination } = await scheduleService.getAllSchedules(page, size);
      return res.status(200).json({
        success: true,
        data: schedules,
        pagination: pagination,
        message: "All Schedules Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getScheduleById(req: Request, res: Response, next: NextFunction) {
    try {
      const scheduleId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid schedule id format" });
      }
      const schedule = await scheduleService.getScheduleById(scheduleId);
      return res
        .status(200)
        .json({ success: true, data: schedule, message: "Schedule Retrieved" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const scheduleId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid schedule id format" });
      }
      const parsedData = UpdateScheduleDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const updateData: UpdateScheduleDTO = parsedData.data;
      const updatedSchedule = await scheduleService.updateSchedule(scheduleId, updateData);
      return res
        .status(200)
        .json({ success: true, message: "Schedule Updated", data: updatedSchedule });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const scheduleId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid schedule id format" });
      }
      const deleted = await scheduleService.deleteSchedule(scheduleId);
      return res.status(200).json({ success: true, message: "Schedule Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

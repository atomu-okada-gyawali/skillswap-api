import { ScheduleController } from "../../../controllers/schedule.controller";
import { ScheduleService } from "../../../services/schedule.service";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

jest.mock("../../../services/schedule.service");

describe("ScheduleController", () => {
  let controller: ScheduleController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new ScheduleController();
    req = { body: {}, params: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createSchedule", () => {
    it("should return 201 on success", async () => {
      req.body = { proposalId: "p1", proposedDate: new Date(), proposedTime: "10:00 AM", durationMinutes: 60 };
      const mock = { _id: "s1" };
      (ScheduleService.prototype.createSchedule as jest.Mock).mockResolvedValue(mock);

      await controller.createSchedule(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mock }));
    });

    it("should return 400 on fail", async () => {
      req.body = {};
      await controller.createSchedule(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteSchedule", () => {
    it("should return 200 on success", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      req.params = { id };
      (ScheduleService.prototype.deleteSchedule as jest.Mock).mockResolvedValue(true);

      await controller.deleteSchedule(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

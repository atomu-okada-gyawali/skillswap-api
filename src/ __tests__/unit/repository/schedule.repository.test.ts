import { ScheduleRepository } from "../../../repository/schedule.repository";
import { ScheduleModel } from "../../../models/schedule.model";

jest.mock("../../../models/schedule.model", () => ({
  ScheduleModel: {
    create: jest.fn(),
    findById: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe("ScheduleRepository", () => {
  let repository: ScheduleRepository;

  beforeEach(() => {
    repository = new ScheduleRepository();
    jest.clearAllMocks();
  });

  describe("createSchedule", () => {
    it("should create schedule", async () => {
      const data = { proposalId: "p1", proposedDate: new Date(), durationMinutes: 60 };
      (ScheduleModel.create as jest.Mock).mockResolvedValue(data as any);
      const result = await repository.createSchedule(data as any);
      expect(ScheduleModel.create).toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  });

  describe("getScheduleById", () => {
    it("should return schedule", async () => {
      const mock = { _id: "s1" };
      (ScheduleModel.populate as jest.Mock).mockResolvedValue(mock);
      const result = await repository.getScheduleById("s1");
      expect(ScheduleModel.findById).toHaveBeenCalledWith("s1");
      expect(result).toEqual(mock);
    });
  });

  describe("deleteSchedule", () => {
    it("should delete schedule", async () => {
      (ScheduleModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: "s1" });
      const result = await repository.deleteSchedule("s1");
      expect(result).toBe(true);
    });
  });
});

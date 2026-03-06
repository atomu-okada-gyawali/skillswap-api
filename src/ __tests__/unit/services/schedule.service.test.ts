import { ScheduleService } from "../../../services/schedule.service";
import { ScheduleRepository } from "../../../repository/schedule.repository";
import { ProposalModel } from "../../../models/proposal.model";
import { HttpError } from "../../../errors/http-error";

jest.mock("../../../repository/schedule.repository");
jest.mock("../../../models/proposal.model", () => ({ ProposalModel: { exists: jest.fn() } }));

describe("ScheduleService", () => {
  let service: ScheduleService;

  beforeEach(() => {
    service = new ScheduleService();
    jest.clearAllMocks();
  });

  describe("createSchedule", () => {
    it("should throw if proposal not found", async () => {
      (ProposalModel.exists as jest.Mock).mockResolvedValue(false);
      await expect(service.createSchedule({ proposalId: "p1" } as any)).rejects.toThrow("Proposal not found");
    });

    it("should create schedule", async () => {
      (ProposalModel.exists as jest.Mock).mockResolvedValue(true);
      const mock = { _id: "s1" };
      (ScheduleRepository.prototype.createSchedule as jest.Mock).mockResolvedValue(mock);
      const result = await service.createSchedule({ proposalId: "p1" } as any);
      expect(result).toEqual(mock);
    });
  });

  describe("getScheduleById", () => {
    it("should return schedule", async () => {
      const mock = { _id: "s1" };
      (ScheduleRepository.prototype.getScheduleById as jest.Mock).mockResolvedValue(mock);
      const result = await service.getScheduleById("s1");
      expect(result).toEqual(mock);
    });
  });
});

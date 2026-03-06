import { ProposalRepository } from "../../../repository/proposal.repository";
import { ProposalModel } from "../../../models/proposal.model";
import { ScheduleModel } from "../../../models/schedule.model";

const mockPopulate = jest.fn().mockReturnThis();
const mockSkip = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockLean = jest.fn().mockReturnThis();
const mockExec = jest.fn();

const mockQuery: any = {
  populate: mockPopulate,
  skip: mockSkip,
  limit: mockLimit,
  lean: mockLean,
  exec: mockExec,
  then: jest.fn(function (this: any, resolve: any) {
    return Promise.resolve(this.exec()).then(resolve);
  }),
  catch: jest.fn(),
};

jest.mock("../../../models/proposal.model", () => ({
  ProposalModel: {
    create: jest.fn(),
    findById: jest.fn(() => mockQuery),
    find: jest.fn(() => mockQuery),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.mock("../../../models/schedule.model", () => ({
  ScheduleModel: {
    find: jest.fn(() => ({
      lean: jest.fn().mockResolvedValue([]),
    })),
    lean: jest.fn(),
  },
}));

describe("ProposalRepository", () => {
  let repository: ProposalRepository;

  beforeEach(() => {
    repository = new ProposalRepository();
    jest.clearAllMocks();
  });

  describe("createProposal", () => {
    it("should create a proposal", async () => {
      const mockData = { senderId: "s1", receiverId: "r1", postId: "p1", offeredSkill: "o1", message: "hi" };
      (ProposalModel.create as jest.Mock).mockResolvedValue(mockData as any);
      const result = await repository.createProposal(mockData as any);
      expect(ProposalModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe("getProposalById", () => {
    it("should return proposal by id", async () => {
      const mockProposal = { _id: "prop1", message: "test" };
      mockExec.mockResolvedValue(mockProposal);
      const result = await repository.getProposalById("prop1");
      expect(ProposalModel.findById).toHaveBeenCalledWith("prop1");
      expect(result).toEqual({ ...mockProposal, schedules: [] });
    });
  });

  describe("updateProposal", () => {
    it("should update a proposal", async () => {
      const id = "prop1";
      const updateData = { status: "accepted" };
      (ProposalModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: id, ...updateData });
      const result = await repository.updateProposal(id, updateData as any);
      expect(ProposalModel.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
      expect(result?.status).toBe("accepted");
    });
  });

  describe("getAllProposals", () => {
    it("should return proposals and total count", async () => {
      const mockProposals = [{ _id: "p1" }];
      mockExec.mockResolvedValue(mockProposals);
      (ProposalModel.countDocuments as jest.Mock).mockResolvedValue(1);
      
      const result = await repository.getAllProposals("u1", 1, 10);
      expect(result.proposals).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe("deleteProposal", () => {
    it("should delete proposal", async () => {
      (ProposalModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: "prop1" });
      const result = await repository.deleteProposal("prop1");
      expect(result).toBe(true);
    });
  });
});

import { ProposalService } from "../../../services/proposal.service";
import { ProposalRepository } from "../../../repository/proposal.repository";
import { UserModel } from "../../../models/user.model";
import { PostModel } from "../../../models/post.model";
import { ProposalModel } from "../../../models/proposal.model";
import { ScheduleModel } from "../../../models/schedule.model";
import { ChatModel } from "../../../models/chat.model";
import { HttpError } from "../../../errors/http-error";
import mongoose from "mongoose";

jest.mock("../../../repository/proposal.repository");
jest.mock("../../../models/user.model");
jest.mock("../../../models/post.model");
jest.mock("../../../models/proposal.model");
jest.mock("../../../models/schedule.model");
jest.mock("../../../models/chat.model");
jest.mock("../../../utils/db.utils", () => ({
  runInTransaction: jest.fn().mockImplementation((fn) => fn(null)),
}));

describe("ProposalService", () => {
  let service: ProposalService;
  let mockSession: any;

  beforeEach(() => {
    service = new ProposalService();
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    jest.spyOn(mongoose, "startSession").mockResolvedValue(mockSession as any);
    jest.clearAllMocks();
  });

  describe("createProposal", () => {
    it("should throw error if sender not found", async () => {
      (UserModel.exists as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.createProposal({ senderId: "s1" } as any)).rejects.toThrow("Sender not found");
    });

    it("should create proposal successfully", async () => {
      (UserModel.exists as jest.Mock).mockResolvedValue(true);
      (PostModel.exists as jest.Mock).mockResolvedValue(true);
      const mockProp = { _id: "p1" };
      (ProposalRepository.prototype.createProposal as jest.Mock).mockResolvedValue(mockProp);
      
      const result = await service.createProposal({ senderId: "s1", receiverId: "r1", postId: "p1", offeredSkill: "o1" } as any);
      expect(result).toEqual(mockProp);
    });
  });

  describe("updateProposal", () => {
    it("should update proposal successfully", async () => {
      const mockProp = { _id: "p1" };
      (ProposalRepository.prototype.getProposalById as jest.Mock).mockResolvedValue(mockProp);
      (ProposalRepository.prototype.updateProposal as jest.Mock).mockResolvedValue({ ...mockProp, status: "accepted" });

      const result = await service.updateProposal("p1", { status: "accepted" });
      expect(result?.status).toBe("accepted");
    });

    it("should throw error if proposal not found", async () => {
      (ProposalRepository.prototype.getProposalById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateProposal("p1", {})).rejects.toThrow("Proposal not found");
    });
  });

  describe("getProposalById", () => {
    it("should return proposal", async () => {
      const mockProp = { _id: "p1" };
      (ProposalRepository.prototype.getProposalById as jest.Mock).mockResolvedValue(mockProp);
      const result = await service.getProposalById("p1");
      expect(result).toEqual(mockProp);
    });

    it("should throw if not found", async () => {
      (ProposalRepository.prototype.getProposalById as jest.Mock).mockResolvedValue(null);
      await expect(service.getProposalById("p1")).rejects.toThrow("Proposal not found");
    });
  });

  describe("getAllProposals", () => {
    it("should return proposals and pagination", async () => {
      (ProposalModel.exists as jest.Mock).mockResolvedValue(true);
      const mockData = { proposals: [{ _id: "p1" }], total: 1 };
      (ProposalRepository.prototype.getAllProposals as jest.Mock).mockResolvedValue(mockData);

      const result = await service.getAllProposals("u1");
      expect(result.proposals).toHaveLength(1);
      expect(result.pagination.totalItems).toBe(1);
    });

    it("should throw error if no proposals found", async () => {
      (ProposalModel.exists as jest.Mock).mockResolvedValue(false);
      await expect(service.getAllProposals("u1")).rejects.toThrow("No proposals found for this user");
    });
  });

  describe("deleteProposal", () => {
    it("should delete proposal successfully", async () => {
      (ProposalRepository.prototype.getProposalById as jest.Mock).mockResolvedValue({ _id: "p1" });
      (ProposalRepository.prototype.deleteProposal as jest.Mock).mockResolvedValue(true);

      const result = await service.deleteProposal("p1");
      expect(result).toBe(true);
    });
  });

  describe("submitCompleteProposal", () => {
    const validData = {
      senderId: "s1",
      receiverId: "r1",
      postId: "p1",
      offeredSkill: "o1",
      message: "msg",
      proposedDate: new Date(),
      proposedTime: "10:00",
      durationMinutes: 60
    };

    it("should submit complete proposal successfully", async () => {
      const { runInTransaction } = require("../../../utils/db.utils");
      (runInTransaction as jest.Mock).mockImplementationOnce(async (fn) => {
        const res = await fn(mockSession);
        await mockSession.commitTransaction();
        return res;
      });

      (UserModel.exists as jest.Mock).mockResolvedValue(true);
      (PostModel.exists as jest.Mock).mockResolvedValue(true);
      
      const mockProp = { _id: "prop1" };
      const mockChat = { _id: "chat1" };
      (ProposalModel.create as jest.Mock).mockResolvedValue([mockProp]);
      (ScheduleModel.create as jest.Mock).mockResolvedValue([{}]);
      (ChatModel.create as jest.Mock).mockResolvedValue([mockChat]);

      const result = await service.submitCompleteProposal(validData as any);
      
      expect(result.proposal).toEqual(mockProp);
      expect(result.chat).toEqual(mockChat);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it("should abort transaction on error", async () => {
      const { runInTransaction } = require("../../../utils/db.utils");
      (runInTransaction as jest.Mock).mockImplementationOnce(async (fn) => {
        try {
          await fn(mockSession);
          await mockSession.commitTransaction();
        } catch (error) {
          await mockSession.abortTransaction();
          throw error;
        } finally {
          await mockSession.endSession();
        }
      });

      (UserModel.exists as jest.Mock).mockResolvedValue(true);
      (PostModel.exists as jest.Mock).mockResolvedValue(true);
      (ProposalModel.create as jest.Mock).mockRejectedValue(new Error("DB Error"));

      await expect(service.submitCompleteProposal(validData as any)).rejects.toThrow("DB Error");
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });
});

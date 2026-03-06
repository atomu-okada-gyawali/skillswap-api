import { ProposalController } from "../../../controllers/proposal.controller";
import { ProposalService } from "../../../services/proposal.service";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

jest.mock("../../../services/proposal.service");

describe("ProposalController", () => {
  let controller: ProposalController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    controller = new ProposalController();
    req = { user: { _id: new mongoose.Types.ObjectId() } as any, body: {}, params: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("createProposal", () => {
    it("should return 201 on success", async () => {
      req.body = { receiverId: new mongoose.Types.ObjectId().toHexString(), postId: new mongoose.Types.ObjectId().toHexString(), offeredSkill: new mongoose.Types.ObjectId().toHexString(), message: "hi" };
      const mockResult = { _id: "prop1" };
      (ProposalService.prototype.createProposal as jest.Mock).mockResolvedValue(mockResult);

      await controller.createProposal(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockResult }));
    });

    it("should return 400 on validation fail", async () => {
      req.body = {};
      await controller.createProposal(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getAllProposals", () => {
    it("should return 200 on success", async () => {
      const mockProposals = [{ _id: "p1" }];
      const mockPagination = { total: 1 };
      (ProposalService.prototype.getAllProposals as jest.Mock).mockResolvedValue({ proposals: mockProposals, pagination: mockPagination });

      await controller.getAllProposals(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockProposals }));
    });
  });

  describe("updateProposal", () => {
    it("should return 200 on success", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      req.params = { id };
      req.body = { status: "accepted" };
      const mockUpdated = { _id: id, status: "accepted" };
      (ProposalService.prototype.updateProposal as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.updateProposal(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockUpdated }));
    });

    it("should return 400 for invalid id", async () => {
      req.params = { id: "invalid-id" };
      await controller.updateProposal(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateProposalStatus", () => {
    it("should return 200 on success", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      req.params = { id };
      req.body = { status: "rejected" };
      const mockUpdated = { _id: id, status: "rejected" };
      (ProposalService.prototype.updateProposal as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.updateProposalStatus(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: "Proposal Status Updated" }));
    });
  });

  describe("deleteProposal", () => {
    it("should return 200 on success", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      req.params = { id };
      (ProposalService.prototype.deleteProposal as jest.Mock).mockResolvedValue(true);

      await controller.deleteProposal(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: "Proposal Deleted" }));
    });

    it("should return 404 if not found", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      req.params = { id };
      (ProposalService.prototype.deleteProposal as jest.Mock).mockResolvedValue(false);

      await controller.deleteProposal(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getProposalById", () => {
    it("should return 200 on success", async () => {
      const id = new mongoose.Types.ObjectId().toHexString();
      req.params = { id };
      const mockProp = { _id: id };
      (ProposalService.prototype.getProposalById as jest.Mock).mockResolvedValue(mockProp);

      await controller.getProposalById(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockProp }));
    });
  });

  describe("submitCompleteProposal", () => {
    it("should return 201 on success", async () => {
      req.body = {
        receiverId: new mongoose.Types.ObjectId().toHexString(),
        postId: new mongoose.Types.ObjectId().toHexString(),
        offeredSkill: new mongoose.Types.ObjectId().toHexString(),
        message: "complete",
        proposedDate: "2026-03-10",
        proposedTime: "10:00 AM",
        durationMinutes: 60
      };
      const mockResult = { proposal: { _id: "prop1" } };
      (ProposalService.prototype.submitCompleteProposal as jest.Mock).mockResolvedValue(mockResult);

      await controller.submitCompleteProposal(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockResult.proposal }));
    });

    it("should return 400 on validation fail", async () => {
      req.body = {};
      await controller.submitCompleteProposal(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

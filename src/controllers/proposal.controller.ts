import z from "zod";
import { CreateCompleteProposalDTO, CreateProposalDTO, UpdateProposalDTO } from "../dtos/proposal.dto";
import { Request, Response, NextFunction } from "express";
import { QueryParams } from "../types/query.type";
import mongoose from "mongoose";
import { ProposalService } from "../services/proposal.service";

let proposalService = new ProposalService();

export class ProposalController {
  async createProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = req.user?._id?.toString();
      req.body.senderId = senderId;
      const parsedData = CreateProposalDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const proposalData: CreateProposalDTO = parsedData.data;
      const newProposal = await proposalService.createProposal(proposalData);
      return res.status(201).json({
        success: true,
        message: "Proposal Created",
        data: newProposal,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllProposals(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?._id?.toString();
      const { page, size }: QueryParams = req.query;
      const { proposals, pagination } = await proposalService.getAllProposals(
        userId,
        page,
        size,
      );
      return res.status(200).json({
        success: true,
        data: proposals,
        pagination: pagination,
        message: "All Proposals Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid proposal id format" });
      }
      const parsedData = UpdateProposalDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const updateData: UpdateProposalDTO = parsedData.data;
      const updatedProposal = await proposalService.updateProposal(
        proposalId,
        updateData,
      );
      return res.status(200).json({
        success: true,
        message: "Proposal Updated",
        data: updatedProposal,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateProposalStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid proposal id format" });
      }
      const parsedData = UpdateProposalDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const updateData: UpdateProposalDTO = parsedData.data;
      const updatedProposal = await proposalService.updateProposal(
        proposalId,
        updateData,
      );
      return res.status(200).json({
        success: true,
        message: "Proposal Status Updated",
        data: updatedProposal,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid proposal id format" });
      }
      const deleted = await proposalService.deleteProposal(proposalId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Proposal not found" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Proposal Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getProposalById(req: Request, res: Response, next: NextFunction) {
    try {
      const proposalId = req.params.id as string;
      if (!mongoose.Types.ObjectId.isValid(proposalId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid proposal id format" });
      }
      const proposal = await proposalService.getProposalById(proposalId);
      return res.status(200).json({
        success: true,
        data: proposal,
        message: "Single Proposal Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async submitCompleteProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = req.user?._id?.toString();
      req.body.senderId = senderId;
      const parsedData = CreateCompleteProposalDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }

      const result = await proposalService.submitCompleteProposal(parsedData.data);
      return res.status(201).json({
        success: true,
        message: "Proposal, Schedule and Chat Created",
        data: result.proposal,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

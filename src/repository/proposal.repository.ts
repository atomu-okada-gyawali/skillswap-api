import { QueryFilter, Types } from "mongoose";
import { IProposal, ProposalModel } from "../models/proposal.model";
import { CreateProposalDTO, UpdateProposalDTO } from "../dtos/proposal.dto";

export interface IProposalRepository {
  createProposal(data: CreateProposalDTO): Promise<IProposal>;
  getProposalById(id: string): Promise<IProposal | null>;
  getAllProposals(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ proposals: IProposal[]; total: number }>;
  updateProposal(
    id: string,
    data: UpdateProposalDTO,
  ): Promise<IProposal | null>;
  deleteProposal(id: string): Promise<boolean>;
}

export class ProposalRepository implements IProposalRepository {
  async createProposal(data: CreateProposalDTO): Promise<IProposal> {
    return ProposalModel.create({
      ...data,
      senderId: new Types.ObjectId(data.senderId),
      receiverId: new Types.ObjectId(data.receiverId),
      postId: new Types.ObjectId(data.postId),
    });
  }
  async getProposalById(id: string): Promise<IProposal | null> {
    return await ProposalModel.findById(id)
      .populate("senderId", "username fullName")
      .populate("postId", "title");
  }
  async getAllProposals(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ proposals: IProposal[]; total: number }> {
    const filter: QueryFilter<IProposal> = {};

    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    const [proposals, total] = await Promise.all([
      ProposalModel.find(filter)
        .populate("senderId", "username fullName")
        .populate("postId", "title")
        .skip((page - 1) * size)
        .limit(size)
        .lean(),
      ProposalModel.countDocuments(filter),
    ]);

    return { proposals, total };
  }
  async updateProposal(
    id: string,
    data: UpdateProposalDTO,
  ): Promise<IProposal | null> {
    return ProposalModel.findByIdAndUpdate(id, data, { new: true });
  }
  async deleteProposal(id: string): Promise<boolean> {
    return !!(await ProposalModel.findByIdAndDelete(id));
  }
}

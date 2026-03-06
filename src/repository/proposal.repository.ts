import { QueryFilter } from "mongoose";
import { IProposal, ProposalModel } from "../models/proposal.model";
import { CreateProposalDTO, UpdateProposalDTO } from "../dtos/proposal.dto";
import { ScheduleModel } from "../models/schedule.model";

export interface IProposalRepository {
  createProposal(data: CreateProposalDTO): Promise<IProposal>;
  getProposalById(id: string): Promise<IProposal | null>;
  getAllProposals(
    userId: string,
    page: number,
    size: number,
  ): Promise<{ proposals: (IProposal & { schedules?: any[] })[]; total: number }>;
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
    });
  }
  async getProposalById(id: string): Promise<(IProposal & { schedules?: any[] }) | null> {
    const proposal = await ProposalModel.findById(id)
      .populate([
        { path: "senderId", select: "username profilePicture fullName" },
        { path: "receiverId", select: "username profilePicture fullName" },
        { path: "postId", select: "title" },
        { path: "offeredSkill" },
      ])
      .lean();

    if (!proposal) return null;

    const schedules = await ScheduleModel.find({ proposalId: id }).lean();
    return { ...proposal, schedules };
  }

  async getAllProposals(
    userId: string,
    page: number,
    size: number,
  ): Promise<{ proposals: (IProposal & { schedules?: any[] })[]; total: number }> {
    const filter: QueryFilter<IProposal> = {
      $or: [{ receiverId: userId }, { senderId: userId }],
    };

    const [proposals, total] = await Promise.all([
      ProposalModel.find(filter)
        .populate([
          { path: "senderId", select: "username profilePicture fullName" },
          { path: "receiverId", select: "username profilePicture fullName" },
          { path: "postId", select: "title" },
          { path: "offeredSkill" },
        ])
        .skip((page - 1) * size)
        .limit(size)
        .lean(),
      ProposalModel.countDocuments(filter),
    ]);
 
    const proposalIds = proposals.map((p) => p._id.toString());
    const schedules = await ScheduleModel.find({
      proposalId: { $in: proposalIds },
    }).lean();

    const schedulesByProposal = schedules.reduce((acc, schedule) => {
      const pid = schedule.proposalId.toString();
      if (!acc[pid]) acc[pid] = [];
      acc[pid].push(schedule);
      return acc;
    }, {} as Record<string, any[]>);

    const proposalsWithSchedules = proposals.map((proposal) => ({
      ...proposal,
      schedules: schedulesByProposal[proposal._id.toString()] || [],
    }));

    return { proposals: proposalsWithSchedules, total };
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

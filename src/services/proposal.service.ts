import { CreateCompleteProposalDTO, CreateProposalDTO, UpdateProposalDTO } from "../dtos/proposal.dto";
import { ProposalRepository } from "../repository/proposal.repository";
import { HttpError } from "../errors/http-error";
import { UserModel } from "../models/user.model";
import { PostModel } from "../models/post.model";
import { ProposalModel } from "../models/proposal.model";
import { ScheduleModel } from "../models/schedule.model";
import { ChatModel } from "../models/chat.model";
import mongoose from "mongoose";
import { runInTransaction } from "../utils/db.utils";

let proposalRepository = new ProposalRepository();

export class ProposalService {
  async createProposal(data: CreateProposalDTO) {
    const [senderExists, receiverExists, postExists, offeredSkillExists] = await Promise.all([
      UserModel.exists({ _id: data.senderId }),
      UserModel.exists({ _id: data.receiverId }),
      PostModel.exists({ _id: data.postId }),
      PostModel.exists({ _id: data.offeredSkill }),
    ]);
    if (!senderExists) {
      throw new HttpError(404, "Sender not found");
    }
    if (!receiverExists) {
      throw new HttpError(404, "Receiver not found");
    }
    if (!postExists) {
      throw new HttpError(404, "Post not found");
    }
    if (!offeredSkillExists) {
      throw new HttpError(404, "Offered skill post not found");
    }
    const newProposal = await proposalRepository.createProposal(data);
    return newProposal;
  }

  async updateProposal(proposalId: string, data: UpdateProposalDTO) {
    const proposal = await proposalRepository.getProposalById(proposalId);
    if (!proposal) {
      throw new HttpError(404, "Proposal not found");
    }
    const updatedProposal = await proposalRepository.updateProposal(
      proposalId,
      data,
    );
    return updatedProposal;
  }

  async getProposalById(id: string) {
    const proposal = await proposalRepository.getProposalById(id);

    if (!proposal) {
      throw new HttpError(404, "Proposal not found");
    }
    return proposal;
  }

  async getAllProposals(userId: string, page?: string, size?: string) {
    const proposalExists =
      (await ProposalModel.exists({ receiverId: userId })) ||
      (await ProposalModel.exists({ senderId: userId }));
    if (!proposalExists) {
      throw new HttpError(404, "No proposals found for this user");
    }
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;
    const { proposals, total } = await proposalRepository.getAllProposals(
      userId,
      pageNumber,
      pageSize,
    );
    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };
    return { proposals, pagination };
  }

  async deleteProposal(id: string) {
    const proposal = await proposalRepository.getProposalById(id);
    if (!proposal) {
      throw new HttpError(404, "Proposal not found");
    }
    const deleted = await proposalRepository.deleteProposal(id);
    return deleted;
  }

  async submitCompleteProposal(data: CreateCompleteProposalDTO) {
    const [senderExists, receiverExists, postExists, offeredSkillExists] =
      await Promise.all([
        UserModel.exists({ _id: data.senderId }),
        UserModel.exists({ _id: data.receiverId }),
        PostModel.exists({ _id: data.postId }),
        PostModel.exists({ _id: data.offeredSkill }),
      ]);

    if (!senderExists) throw new HttpError(404, "Sender not found");
    if (!receiverExists) throw new HttpError(404, "Receiver not found");
    if (!postExists) throw new HttpError(404, "Post not found");
    if (!offeredSkillExists) throw new HttpError(404, "Offered skill not found");

    return await runInTransaction(async (session) => {
      const options = session ? { session } : {};

      // 1. Create Proposal
      const proposal = await ProposalModel.create(
        [
          {
            senderId: data.senderId,
            receiverId: data.receiverId,
            postId: data.postId,
            offeredSkill: data.offeredSkill,
            message: data.message,
          },
        ],
        options,
      );

      const proposalId = (proposal[0] as any)._id;

      // 2. Create Schedule
      const schedule = await ScheduleModel.create(
        [
          {
            proposalId,
            proposedDate: data.proposedDate,
            proposedTime: data.proposedTime,
            durationMinutes: data.durationMinutes,
          },
        ],
        options,
      );

      // 3. Create Chat
      const chat = await ChatModel.create(
        [
          {
            proposalId,
          },
        ],
        options,
      );

      return {
        proposal: proposal[0],
        schedule: schedule[0],
        chat: chat[0],
      };
    });
  }
}

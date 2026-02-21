import { CreateProposalDTO, UpdateProposalDTO } from "../dtos/proposal.dto";
import { ProposalRepository } from "../repository/proposal.repository";
import { HttpError } from "../errors/http-error";
import { UserModel } from "../models/user.model";
import { PostModel } from "../models/post.model";

let proposalRepository = new ProposalRepository();

export class ProposalService {
  async createProposal(data: CreateProposalDTO) {
    const [senderExists, receiverExists, postExists] = await Promise.all([
      UserModel.exists({ _id: data.senderId }),
      UserModel.exists({ _id: data.receiverId }),
      PostModel.exists({ _id: data.postId }),
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
    const newProposal = await proposalRepository.createProposal(data);
    return newProposal;
  }

  async updateProposal(proposalId: string, data: UpdateProposalDTO) {
    const proposal = await proposalRepository.getProposalById(proposalId);
    if (!proposal) {
      throw new HttpError(404, "Proposal not found");
    }
    const updatedProposal = await proposalRepository.updateProposal(proposalId, data);
    return updatedProposal;
  }

  async getProposalById(id: string) {
    const proposal = await proposalRepository.getProposalById(id);
    if (!proposal) {
      throw new HttpError(404, "Proposal not found");
    }
    return proposal;
  }

  async getAllProposals(page?: string, size?: string, search?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;
    const { proposals, total } = await proposalRepository.getAllProposals(
      pageNumber,
      pageSize,
      search,
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
}

import { PostModel } from "../models/post.model";
import { ProposalModel } from "../models/proposal.model";
import { ChatModel } from "../models/chat.model";
import { UserModel } from "../models/user.model";
import { TagModel } from "../models/tag.model";

export class AnalyticsService {

  async getAdminAnalytics() {
    const [totalUsers, totalPosts, totalProposals, totalChats, totalTags] =
      await Promise.all([
        UserModel.countDocuments(),
        PostModel.countDocuments(),
        ProposalModel.countDocuments(),
        ChatModel.countDocuments(),
        TagModel.countDocuments(),
      ]);

    const proposalStatus = await ProposalModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusBreakdown = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
    };

    proposalStatus.forEach((item) => {
      if (item._id in statusBreakdown) {
        statusBreakdown[item._id as keyof typeof statusBreakdown] = item.count;
      }
    });

    return {
      totalUsers,
      totalPosts,
      totalProposals,
      totalChats,
      totalTags,
      statusBreakdown,
    };
  }
}

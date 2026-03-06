import { Types } from "mongoose";
import { FavoriteModel, IFavoriteModel } from "../models/favorite.model";
import { PostModel, IPostModel } from "../models/post.model";

export interface IFavoriteRepository {
  createFavorite(userId: string, postId: string): Promise<IFavoriteModel>;
  deleteFavorite(userId: string, postId: string): Promise<boolean>;
  getFavoritesByUser(
    userId: string,
    page: number,
    size: number,
  ): Promise<{ posts: IPostModel[]; total: number }>;
  isFavorited(userId: string, postId: string): Promise<boolean>;
  getUserFavoritePostIds(userId: string): Promise<string[]>;
}

export class FavoriteRepository implements IFavoriteRepository {
  async createFavorite(
    userId: string,
    postId: string,
  ): Promise<IFavoriteModel> {
    return FavoriteModel.create({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });
  }

  async deleteFavorite(userId: string, postId: string): Promise<boolean> {
    const result = await FavoriteModel.deleteOne({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });
    return result.deletedCount > 0;
  }

  async getFavoritesByUser(
    userId: string,
    page: number,
    size: number,
  ): Promise<{ posts: IPostModel[]; total: number }> {
    const filter = { userId: new Types.ObjectId(userId) };

    const [favorites, total] = await Promise.all([
      FavoriteModel.find(filter)
        .populate({
          path: "postId",
          populate: {
            path: "userId",
            select: "username fullName profilePicture",
          },
        })
        .skip((page - 1) * size)
        .limit(size)
        .lean(),
      FavoriteModel.countDocuments(filter),
    ]);

    const posts = favorites
      .filter((f) => f.postId)
      .map((f) => f.postId as unknown as IPostModel);

    return { posts, total };
  }

  async isFavorited(userId: string, postId: string): Promise<boolean> {
    const favorite = await FavoriteModel.findOne({
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(postId),
    });
    return !!favorite;
  }

  async getUserFavoritePostIds(userId: string): Promise<string[]> {
    const favorites = await FavoriteModel.find({
      userId: new Types.ObjectId(userId),
    }).lean();
    return favorites.map((f) => f.postId.toString());
  }
}

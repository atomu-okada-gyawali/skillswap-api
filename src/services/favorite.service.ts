import { FavoriteRepository } from "../repository/favorite.repository";
import { PostModel } from "../models/post.model";
import { HttpError } from "../errors/http-error";

let favoriteRepository = new FavoriteRepository();

export class FavoriteService {
  async createFavorite(userId: string, postId: string) {
    const postExists = await PostModel.exists({ _id: postId });
    if (!postExists) {
      throw new HttpError(404, "Post not found");
    }

    const alreadyFavorited = await favoriteRepository.isFavorited(userId, postId);
    if (alreadyFavorited) {
      throw new HttpError(400, "Post already favorited");
    }

    const favorite = await favoriteRepository.createFavorite(userId, postId);
    return favorite;
  }

  async deleteFavorite(userId: string, postId: string) {
    const deleted = await favoriteRepository.deleteFavorite(userId, postId);
    if (!deleted) {
      throw new HttpError(404, "Favorite not found");
    }
    return deleted;
  }

  async getFavoritesByUser(userId: string, page?: string, size?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;

    const { posts, total } = await favoriteRepository.getFavoritesByUser(
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

    return { posts, pagination };
  }

  async isFavorited(userId: string, postId: string) {
    return favoriteRepository.isFavorited(userId, postId);
  }

  async getUserFavoritePostIds(userId: string) {
    return favoriteRepository.getUserFavoritePostIds(userId);
  }
}

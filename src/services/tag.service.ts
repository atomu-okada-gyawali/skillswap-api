import { TagRepository } from "../repository/tag.repository";

let tagRepository = new TagRepository();

export class TagService {
  async getAllTags(page?: string, size?: string, search?: string) {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;
    const { tags, total } = await tagRepository.getAllTags(
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
    return { tags, pagination };
  }

  async getTagById(id: string) {
    const tag = await tagRepository.getTagById(id);
    if (!tag) {
      return null;
    }
    return tag;
  }
}

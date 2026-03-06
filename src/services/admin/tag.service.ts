import { HttpError } from "./../../errors/http-error";
import { CreateTagDTO, UpdateTagDTO } from "./../../dtos/tag.dto";
import { TagRepository } from "../../repository/tag.repository";

let tagRepository = new TagRepository();

export class AdminTagService {
  async createTag(data: CreateTagDTO) {
    const nameCheck = await tagRepository.getTagByName(data.name);
    if (nameCheck) {
      throw new HttpError(403, "Tag name already exists");
    }

    const newTag = await tagRepository.createTag(data);
    return newTag;
  }

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

  async deleteTag(id: string) {
    const tag = await tagRepository.getTagById(id);
    if (!tag) {
      throw new HttpError(404, "Tag not found");
    }
    const deleted = await tagRepository.deleteTag(id);
    return deleted;
  }

  async updateTag(id: string, updateData: UpdateTagDTO) {
    const tag = await tagRepository.getTagById(id);
    if (!tag) {
      throw new HttpError(404, "Tag not found");
    }

    if (updateData.name && updateData.name !== tag.name) {
      const nameCheck = await tagRepository.getTagByName(updateData.name);
      if (nameCheck) {
        throw new HttpError(403, "Tag name already exists");
      }
    }

    const updatedTag = await tagRepository.updateTag(id, updateData);
    return updatedTag;
  }

  async getTagById(id: string) {
    const tag = await tagRepository.getTagById(id);
    if (!tag) {
      throw new HttpError(404, "Tag not found");
    }
    return tag;
  }
}

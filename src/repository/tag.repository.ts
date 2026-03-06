import { ITag, TagModel } from "../models/tag.model";

export interface ITagRepository {
  createTag(tagData: Partial<ITag>): Promise<ITag>;
  getTagById(id: string): Promise<ITag | null>;
  getTagByName(name: string): Promise<ITag | null>;
  getAllTags(page: number, size: number, search?: string): Promise<{ tags: ITag[]; total: number }>;
  updateTag(id: string, updateData: Partial<ITag>): Promise<ITag | null>;
  deleteTag(id: string): Promise<boolean>;
}

export class TagRepository implements ITagRepository {
  async createTag(tagData: Partial<ITag>): Promise<ITag> {
    const tag = new TagModel(tagData);
    return await tag.save();
  }

  async getTagById(id: string): Promise<ITag | null> {
    const tag = await TagModel.findById(id);
    return tag;
  }

  async getTagByName(name: string): Promise<ITag | null> {
    const tag = await TagModel.findOne({ name });
    return tag;
  }

  async getAllTags(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ tags: ITag[]; total: number }> {
    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const [tags, total] = await Promise.all([
      TagModel.find(filter)
        .skip((page - 1) * size)
        .limit(size),
      TagModel.countDocuments(filter),
    ]);

    return { tags, total };
  }

  async updateTag(
    id: string,
    updateData: Partial<ITag>,
  ): Promise<ITag | null> {
    const updatedTag = await TagModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );
    return updatedTag;
  }

  async deleteTag(id: string): Promise<boolean> {
    const result = await TagModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}

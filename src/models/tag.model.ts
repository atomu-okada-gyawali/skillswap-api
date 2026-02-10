import mongoose, { Document, Schema } from "mongoose";
import { TagType } from "../types/tag.type";

const TagSchema: Schema = new Schema<TagType>(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

export interface ITag extends TagType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const TagModel = mongoose.model<ITag>("Tag", TagSchema);
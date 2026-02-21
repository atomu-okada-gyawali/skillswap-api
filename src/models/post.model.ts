import mongoose, { Document, Schema, Types } from "mongoose";
import { PostType } from "../types/post.type";

export interface IPostModel extends Omit<PostType, "userId"> {
  userId: Types.ObjectId;
}
const PostMongoSchema = new Schema<IPostModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    postPhoto: { type: String },
    Requirements: { type: [String] },
    locationType: { type: String, required: true },
    availability: { type: String, required: true },
    duration: { type: String },
  },
  { timestamps: true },
);

export const PostModel = mongoose.model<IPostModel>("Post", PostMongoSchema);

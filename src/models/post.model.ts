import mongoose, { Document, Schema } from "mongoose";
import { PostType } from "../types/post.type";

const PostSchema: Schema = new Schema<PostType>(
  {
    userId: { type: String, required: true, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    locationType: { 
      type: String, 
      enum: ["online", "offline", "hybrid"], 
      required: true 
    },
    availability: { 
      type: String, 
      enum: ["available", "busy", "unavailable"], 
      required: true 
    },
  },
  {
    timestamps: true,
  },
);

export interface IPost extends PostType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const PostModel = mongoose.model<IPost>("Post", PostSchema);
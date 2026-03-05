import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFavoriteModel {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
}

const FavoriteMongoSchema = new Schema<IFavoriteModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true },
);

FavoriteMongoSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const FavoriteModel = mongoose.model<IFavoriteModel>(
  "Favorite",
  FavoriteMongoSchema,
);

import z from "zod";
import { FavoriteSchema } from "../types/favorite.type";

export const CreateFavoriteDTO = FavoriteSchema;
export type CreateFavoriteDTO = z.infer<typeof CreateFavoriteDTO>;

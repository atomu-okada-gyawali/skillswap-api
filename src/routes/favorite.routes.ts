import { FavoriteController } from "./../controllers/favorite.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const favoriteController = new FavoriteController();

router.use(authorizedMiddleware);

router.post("/", favoriteController.createFavorite);
router.delete("/:postId", favoriteController.deleteFavorite);
router.get("/", favoriteController.getFavorites);
router.get("/check/:postId", favoriteController.checkFavorite);
router.get("/post-ids", favoriteController.getUserFavoritePostIds);

export default router;

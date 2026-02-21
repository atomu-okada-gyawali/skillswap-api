import { PostController } from './../controllers/post.controller';
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();
const postController = new PostController();
router.use(authorizedMiddleware); // apply all with middleware

router.post(
  "/",
  uploads.single("postPhoto"),
postController.createPost,
);
router.get("/", postController.getAllPosts);

router.put(
  "/:id",
  uploads.single("postPhoto"),
  postController.updatePost,
);
router.delete("/:id", postController.deletePost);
router.get("/:id", postController.getPostById);

export default router;

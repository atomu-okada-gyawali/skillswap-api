import { Router } from "express";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../../middlewares/authorization.middleware";
import { AdminTagController } from "../../controllers/admin/tag.controller";
import { uploads } from "../../middlewares/upload.middleware";

const router = Router();
const adminTagController = new AdminTagController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.post(
  "/",
  uploads.single("tagImage"),
  adminTagController.createTag,
);
router.get("/", adminTagController.getAllTags);
router.get("/:id", adminTagController.getTagById);
router.put(
  "/:id",
  uploads.single("tagImage"),
  adminTagController.updateTag,
);
router.delete("/:id", adminTagController.deleteTag);

export default router;

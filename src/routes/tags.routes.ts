import { TagController } from './../controllers/tag.controller';
import { Router } from "express";

const router = Router();
const tagController = new TagController();

router.get("/", tagController.getAllTags);
router.get("/:id", tagController.getTagById);

export default router;

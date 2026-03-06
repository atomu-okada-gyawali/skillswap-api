import { ChatController } from './../controllers/chat.controller';
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const chatController = new ChatController();

router.post("/", authorizedMiddleware, chatController.createChat);
router.get("/", authorizedMiddleware, chatController.getAllChats);
router.get("/proposal/:proposalId", authorizedMiddleware, chatController.getChatByProposalId);
router.get("/:id", authorizedMiddleware, chatController.getChatById);
router.delete("/:id", authorizedMiddleware, chatController.deleteChat);

export default router;

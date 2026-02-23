import { MessageController } from './../controllers/message.controller';
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const messageController = new MessageController();

router.post("/", authorizedMiddleware, messageController.createMessage);
router.get("/chat/:chatId", authorizedMiddleware, messageController.getMessagesByChatId);
router.get("/:id", authorizedMiddleware, messageController.getMessageById);
router.delete("/:id", authorizedMiddleware, messageController.deleteMessage);

export default router;

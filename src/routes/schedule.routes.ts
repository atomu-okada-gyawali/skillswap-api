import { ScheduleController } from './../controllers/schedule.controller';
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const scheduleController = new ScheduleController();
router.use(authorizedMiddleware);

router.post("/", scheduleController.createSchedule);
router.get("/", scheduleController.getAllSchedules);
router.get("/:id", scheduleController.getScheduleById);
router.put("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

export default router;

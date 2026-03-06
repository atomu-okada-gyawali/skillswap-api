import { AnalyticsController } from "./../controllers/analytics.controller";
import { Router } from "express";
import { adminMiddleware } from "../middlewares/authorization.middleware";

const router = Router();
const analyticsController = new AnalyticsController();

router.get("/admin", adminMiddleware, analyticsController.getAdminAnalytics);

export default router;

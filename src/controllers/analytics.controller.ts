import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service";

let analyticsService = new AnalyticsService();

export class AnalyticsController {

  async getAdminAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await analyticsService.getAdminAnalytics();
      return res.status(200).json({
        success: true,
        data: analytics,
        message: "Admin Global Analytics Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

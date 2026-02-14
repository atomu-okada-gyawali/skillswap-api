import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

import { uploads } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  authController.updateProfile,
);

// Serve profile image by filename (searches uploads and public/profile_pictures)
router.get("/profile-image/:filename", authController.getProfileImage);
// Serve profile image for a user by user id
router.get("/user/:id/profile-image", authController.getUserProfileImage);
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);
export default router;

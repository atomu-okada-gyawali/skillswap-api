import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import upload from "../middlewares/uploads";
import { uploads } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authorization.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("image"), // "image" - field name from frontend/client
  authController.updateProfile,
);
router.post(
  "/upload",
  upload.single("profilePicture"),
  authController.uploadProfilePicture,
);

// Serve profile image by filename (searches uploads and public/profile_pictures)
router.get("/profile-image/:filename", authController.getProfileImage);
// Serve profile image for a user by user id
router.get("/user/:id/profile-image", authController.getUserProfileImage);

export default router;

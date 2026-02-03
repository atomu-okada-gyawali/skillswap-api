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
  uploads.single("profilePicture"), // accept both "image" and "profilePicture"
  authController.updateProfile,
);


// Serve profile image by filename (searches uploads and public/profile_pictures)
router.get("/profile-image/:filename", authController.getProfileImage);
// Serve profile image for a user by user id
router.get("/user/:id/profile-image", authController.getUserProfileImage);

export default router;

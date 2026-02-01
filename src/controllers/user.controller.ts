import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDto } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";
let userService = new UserService();
export class AuthController {
  async register(req: Request, res: Response) {
    // validation of request body through dto
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        // validation failed
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const userData: CreateUserDTO = parsedData.data;
      const newUser = await userService.createUser(userData);
      return res
        .status(201)
        .json({ success: true, message: "User Created", data: newUser });
    } catch (error: Error | any) {
      // exception handling
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      const loginData: LoginUserDTO = parsedData.data;
      const { token, user } = await userService.loginUser(loginData);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: user,
        token,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  uploadProfilePicture = async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).send({ message: "Please upload a file" });
      return;
    }

    // Check for the file size and send an error message
    const maxFileUpload = parseInt(
      process.env.MAX_FILE_UPLOAD || "5000000",
      10,
    );
    if (req.file.size > maxFileUpload) {
      res.status(400).send({
        message: `Please upload an image less than ${maxFileUpload} bytes`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: req.file.filename,
    });
  };

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User Id Not found" });
      }
      const parsedData = UpdateUserDto.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(400)
          .json({ success: false, message: z.prettifyError(parsedData.error) });
      }
      if (req.file) {
        parsedData.data.profilePicture = `/uploads/${req.file.filename}`;
      }
      const updatedUser = await userService.updateUser(userId, parsedData.data);
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User profile updated successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // GET /profile-image/:filename
  async getProfileImage(req: Request, res: Response) {
    try {
      const { filename } = req.params;
      const fs = await import("fs/promises");
      const path = await import("path");

      const uploadsPath = path.join(__dirname, "../../uploads", filename);
      const publicPath = path.join(
        __dirname,
        "../../public/profile_pictures",
        filename,
      );

      // Check uploads folder first
      try {
        await fs.access(uploadsPath);
        return res.sendFile(uploadsPath, {
          headers: { "Cache-Control": "public, max-age=86400" },
        });
      } catch (e) {
        // not in uploads
      }

      // Check public/profile_pictures
      try {
        await fs.access(publicPath);
        return res.sendFile(publicPath, {
          headers: { "Cache-Control": "public, max-age=86400" },
        });
      } catch (e) {
        // not found
      }

      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }

  // GET /user/:id/profile-image
  async getUserProfileImage(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User id is required" });
      }
      const user = await userService.getUserById(userId);
      if (!user || !user.profilePicture) {
        return res
          .status(404)
          .json({
            success: false,
            message: "User or profile picture not found",
          });
      }

      // If profilePicture is a path like /uploads/xxx or /profile-pictures/xxx, redirect to it (static middleware will handle)
      if (user.profilePicture.startsWith("/")) {
        return res.redirect(user.profilePicture);
      }

      // Otherwise, assume it's a filename and try to serve it
      const filename = user.profilePicture;
      // Reuse getProfileImage logic by delegating
      req.params.filename = filename;
      return this.getProfileImage(req, res);
    } catch (error: any) {
      return res
        .status(error.statusCode || 500)
        .json({
          success: false,
          message: error.message || "Internal Server Error",
        });
    }
  }
}

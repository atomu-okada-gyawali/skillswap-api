import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";

import { UserRepository } from "../repository/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";
import { CLIENT_URL, JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";
import z from "zod";

let userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    // business logic before creating user
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }
    const usernameCheck = await userRepository.getUserByUsername(data.username);
    if (usernameCheck) {
      throw new HttpError(403, "Username already in use");
    }
    // hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
    data.password = hashedPassword;

    // create user
    const newUser = await userRepository.createUser(data);
    return newUser;
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }
    // compare password
    const validPassword = await bcryptjs.compare(data.password, user.password);
    // plaintext, hashed
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }
    // generate jwt
    const payload = {
      // user identifier
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
    return { token, user };
  }

  async updateUser(userId: string, data: UpdateUserDTO) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    if (user.email !== data.email) {
      const emailExists = await userRepository.getUserByEmail(data.email!);
      if (emailExists) {
        throw new HttpError(403, "Email already in use");
      }
    }
    if (user.username !== data.username) {
      const usernameExists = await userRepository.getUserByUsername(
        data.username!,
      );
      if (usernameExists) {
        throw new HttpError(403, "Username already in use");
      }
    }
    if (data.password) {
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      data.password = hashedPassword;
    }
    const updatedUser = await userRepository.updateUser(userId, data);
    return updatedUser;
  }

  // Added to support profile image retrieval
  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    return user;
  }

  async sendResetPasswordEmail(email?: string) {
    if (!email) {
      throw new HttpError(400, "Email is required");
    }
    const emailSchema = z.object({ email: z.email() });
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      throw new HttpError(400, "Invalid email format");
    }
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      return null;
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `${CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
    await sendEmail(user.email, "Password Reset", html);
    return user;
  }

  async resetPassword(token?: string, newPassword?: string) {
    try {
      if (!token || !newPassword) {
        throw new HttpError(400, "Token and new password are required");
      }
      console.log("Received token:", token);
      console.log("JWT_SECRET:", JWT_SECRET);
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token decoded successfully:", decoded);
      } catch (err: any) {
        console.log("Token verification error:", err.message);
        if (err.name === "TokenExpiredError") {
          throw new HttpError(400, "Token has expired");
        } else if (err.name === "JsonWebTokenError") {
          throw new HttpError(400, "Invalid token");
        } else {
          throw new HttpError(400, "Invalid or expired token");
        }
      }
      const userId = decoded.id;
      const user = await userRepository.getUserById(userId);
      if (!user) {
        throw new HttpError(404, "User not found");
      }
      const hashedPassword = await bcryptjs.hash(newPassword, 10);
      await userRepository.updateUser(userId, { password: hashedPassword });
      return user;
    } catch (error) {
      throw new HttpError(400, "Invalid or expired token");
    }
  }
}

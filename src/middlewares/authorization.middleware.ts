import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repository/user.repository";
import { IUser } from "../models/user.model";

//global augmentation for express request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any> | IUser;
    }
  }
}
let userRepository = new UserRepository();

export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Unauthorized, header malformed");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new HttpError(401, "Unauthorized, token missing");
    }

    const decodeToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;
    if (!decodeToken || !decodeToken.id) {
      throw new HttpError(401, "Unauthorized, token invalid");
    }

    const user = await userRepository.getUserById(decodeToken.id);
    if (!user) {
      throw new HttpError(401, "Unauthorized, user not found");
    }

    req.user = user;
    return next(); // ✅ SINGLE next(), and RETURN
  } catch (error: Error | any) {
    return res
      .status(error.statusCode || 401)
      .json({ success: false, message: error.message || "unauthorized" });
  }
};

export const adminOnlyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      throw new HttpError(403, "Forbidden, admins only");
    }
  } catch (error: Error | any) {
    return res
      .status(error.statusCode || 403)
      .json({ success: false, message: error.message || "forbidden" });
  }
};

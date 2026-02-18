import { PORT } from "./config/index";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { connectDatabase } from "./database/mongodb";
import authRoutes from "./routes/auth.routes";
import adminUserRoutes from "./routes/admin/user.routes";
import postRoutes from "./routes/posts.routes";
import path from "path";
import cors from "cors";

const app: Application = express();

let corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3003"],
  //which url can access backend
  //put your frontend domain/url here
};
//origin:"*", // yo le sabai url lai access dincha

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads/")));
// Serve profile pictures stored in public/profile_pictures

app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/posts", postRoutes);
app.get("/", (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ success: "true", message: "Welcome to the API" });
});
export default app;

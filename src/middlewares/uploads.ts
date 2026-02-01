import multer, { StorageEngine, FileFilterCallback, Multer } from "multer";
import path from "path";
import { Request } from "express";

const maxSize = 5 * 1024 * 1024; // 5MB for images
const maxVideoSize = 50 * 1024 * 1024; // 50MB for videos

const storage: StorageEngine = multer.diskStorage({
  destination: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    if (file.fieldname === "profilePicture") {
      cb(null, path.join("public", "profile_pictures"));
    } else {
      cb(new Error("Invalid field name for upload."), "");
    }
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const ext = path.extname(file.originalname);
    let prefix = "file";
    if (file.fieldname === "profilePicture") {
      prefix = "pro-pic";
    }
    cb(null, `${prefix}-${Date.now()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (file.fieldname === "itemVideo") {
    if (!file.originalname.match(/\.(mp4|avi|mov|wmv)$/i)) {
      cb(new Error("Video format not supported."));
      return;
    }
    cb(null, true);
    return;
  } else if (
    file.fieldname === "profilePicture" ||
    file.fieldname === "itemPhoto"
  ) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      cb(new Error("Image format not supported."));
      return;
    }
    cb(null, true);
    return;
  } else {
    cb(new Error("Invalid field name for upload."));
    return;
  }
};

// For images (profile pictures and item photos)
export const uploadImage: Multer = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxSize },
});

// For videos (item videos)
export const uploadVideo: Multer = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxVideoSize },
});

// Export single upload for backward compatibility
const upload = uploadImage;

export default upload;

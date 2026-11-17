import multer from "multer";
import { HttpError } from "../utils/httpError.js";
import {
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES
} from "../config/uploadConfig.js";

// Configure image uploads
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
    fields: 0,
    parts: 2
  },

  fileFilter(request, file, callback) {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return callback(
        new HttpError(
          400,
          "upload image",
          "only JPEG, PNG and WebP images are allowed"
        )
      );
    }

    callback(null, true);
  }
});

// Handle a single image upload
export function uploadListingImage(request, response, next) {
  upload.single("image")(request, response, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(
          new HttpError(
            413,
            "upload image",
            "image cannot exceed 5 MB"
          )
        );
      }

      return next(
        new HttpError(
          400,
          "upload image",
          "invalid image upload"
        )
      );
    }

    if (error) {
      return next(error);
    }

    next();
  });
}
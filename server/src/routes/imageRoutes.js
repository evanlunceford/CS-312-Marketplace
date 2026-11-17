import { Router } from "express";
import * as imageController from "../controllers/imageController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadListingImage } from "../middleware/uploadMiddleware.js";

export const imageRoutes = Router();

// Upload or replace a listing image
imageRoutes.post(
  "/:id/image",
  requireAuth,
  uploadListingImage,
  imageController.uploadImage
);
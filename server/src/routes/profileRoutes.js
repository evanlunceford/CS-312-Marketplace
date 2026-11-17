import { Router } from "express";
import * as profileController from "../controllers/profileController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const profileRoutes = Router();

// Retrieve the signed-in user's profile
profileRoutes.get(
  "/me",
  requireAuth,
  profileController.getOwnProfile
);

// Update the signed-in user's profile
profileRoutes.patch(
  "/me",
  requireAuth,
  profileController.updateOwnProfile
);

// Retrieve another user's profile
profileRoutes.get(
  "/:userId",
  requireAuth,
  profileController.getProfile
);
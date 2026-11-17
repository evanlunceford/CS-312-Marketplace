import { Router } from "express";
import * as commentController from "../controllers/commentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const commentRoutes = Router();

// Retrieve comments for a listing
commentRoutes.get(
  "/:id/comments",
  requireAuth,
  commentController.getComments
);

// Post a new comment
commentRoutes.post(
  "/:id/comments",
  requireAuth,
  commentController.createComment
);
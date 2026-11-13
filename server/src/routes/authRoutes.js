import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const authRoutes = Router();

authRoutes.post("/signup", authController.signUp);
authRoutes.post("/signin", authController.signIn);
authRoutes.post("/signout", authController.signOut);
authRoutes.get("/me", requireAuth, authController.getCurrentUser);

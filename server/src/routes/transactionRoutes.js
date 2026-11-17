import { Router } from "express";
import * as transactionController from "../controllers/transactionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const transactionRoutes = Router();

// Record a transaction
transactionRoutes.post(
  "/",
  requireAuth,
  transactionController.createTransaction
);

// Retrieve the signed-in user's transactions
transactionRoutes.get(
  "/me",
  requireAuth,
  transactionController.getOwnTransactions
);

// Retrieve a specific transaction
transactionRoutes.get(
  "/:id",
  requireAuth,
  transactionController.getTransaction
);
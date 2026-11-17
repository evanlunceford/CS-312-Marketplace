import { Router } from "express";
import { healthRoutes } from "./healthRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { profileRoutes } from "./profileRoutes.js";
import { transactionRoutes } from "./transactionRoutes.js";
import { imageRoutes } from "./imageRoutes.js";
import { commentRoutes } from "./commentRoutes.js";

import listingRoutes from "./listingRoutes.js";

export const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/listings", listingRoutes);
apiRoutes.use("/profiles", profileRoutes);
apiRoutes.use("/transactions", transactionRoutes);
apiRoutes.use("/listings", imageRoutes);
apiRoutes.use("/listings", commentRoutes);
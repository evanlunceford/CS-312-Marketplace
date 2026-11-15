import { Router } from "express";
import { healthRoutes } from "./healthRoutes.js";
import { authRoutes } from "./authRoutes.js";

// Mount each feature router here, for example: apiRoutes.use("/listings", listingRoutes);
export const apiRoutes = Router();

apiRoutes.use(healthRoutes);
apiRoutes.use("/auth", authRoutes);

const listingRoutes = require('./listingRoutes');
// ... inside your router configuration:
router.use('/listings', listingRoutes);

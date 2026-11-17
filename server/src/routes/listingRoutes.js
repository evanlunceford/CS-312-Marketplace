import { Router } from "express";
import * as listingController from "../controllers/listingController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const listingRoutes = Router();
listingRoutes.get("/", listingController.getAll);
listingRoutes.get("/:id", listingController.getById);
listingRoutes.post("/", requireAuth, listingController.create);
listingRoutes.put("/:id", requireAuth, listingController.update);
listingRoutes.delete("/:id", requireAuth, listingController.remove);
export default listingRoutes;
